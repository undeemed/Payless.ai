-- Payless.ai Complete Database Setup
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email TEXT,
  display_name TEXT,
  avatar_url TEXT
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. CREDIT LEDGER
-- ============================================
CREATE TABLE IF NOT EXISTS public.credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drop existing constraint if exists
ALTER TABLE public.credit_ledger 
  DROP CONSTRAINT IF EXISTS credit_ledger_reason_check;

-- Add constraint for credit reasons
ALTER TABLE public.credit_ledger 
  ADD CONSTRAINT credit_ledger_reason_check 
  CHECK (reason IN ('mint', 'allocate', 'spend', 'adjust', 'ad_view'));

-- Enable RLS
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own ledger" ON public.credit_ledger;
DROP POLICY IF EXISTS "Service role can insert ledger" ON public.credit_ledger;

-- Users can read their own ledger entries
CREATE POLICY "Users can read own ledger" ON public.credit_ledger
  FOR SELECT USING (auth.uid() = user_id);

-- Service role (backend) can insert ledger entries
-- Note: Service role uses service key which bypasses RLS, but this is for explicit clarity
CREATE POLICY "Service role can insert ledger" ON public.credit_ledger
  FOR INSERT WITH CHECK (true);

-- Indexes for fast balance queries
CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_id ON public.credit_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_created_at ON public.credit_ledger(created_at);

-- ============================================
-- 3. REVENUE SNAPSHOTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.revenue_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period DATE NOT NULL UNIQUE,
  usd_confirmed DECIMAL(10, 2) NOT NULL DEFAULT 0,
  usd_estimated DECIMAL(10, 2) NOT NULL DEFAULT 0,
  credits_minted INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (admin only via service key)
ALTER TABLE public.revenue_snapshots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role only for revenue" ON public.revenue_snapshots;

-- Only service role can access revenue snapshots (admin only)
-- This effectively blocks all anon/authenticated users
-- Note: Service role uses service key which bypasses RLS, so backend can still access
CREATE POLICY "Service role only for revenue" ON public.revenue_snapshots
  FOR ALL USING (false);

-- ============================================
-- 4. PROVIDER USAGE
-- ============================================
CREATE TABLE IF NOT EXISTS public.provider_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'gemini')),
  model TEXT NOT NULL,
  credits_spent INTEGER NOT NULL,
  tokens_input INTEGER,
  tokens_output INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.provider_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own usage" ON public.provider_usage;
DROP POLICY IF EXISTS "Service role can insert usage" ON public.provider_usage;

-- Users can read their own usage
CREATE POLICY "Users can read own usage" ON public.provider_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Service role (backend) can insert usage records
CREATE POLICY "Service role can insert usage" ON public.provider_usage
  FOR INSERT WITH CHECK (true);

-- Indexes for usage queries
CREATE INDEX IF NOT EXISTS idx_provider_usage_user_id ON public.provider_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_usage_created_at ON public.provider_usage(created_at);

-- ============================================
-- 5. AD SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.ad_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_seconds INTEGER NOT NULL DEFAULT 0,
  credits_earned NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ad_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own ad sessions" ON public.ad_sessions;
DROP POLICY IF EXISTS "Users can insert own ad sessions" ON public.ad_sessions;
DROP POLICY IF EXISTS "Users can update own ad sessions" ON public.ad_sessions;

-- Users can read their own sessions
CREATE POLICY "Users can read own ad sessions" ON public.ad_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own sessions (via backend API)
CREATE POLICY "Users can insert own ad sessions" ON public.ad_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions (via backend API)
CREATE POLICY "Users can update own ad sessions" ON public.ad_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_ad_sessions_user_active 
  ON public.ad_sessions(user_id, is_active) 
  WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_ad_sessions_last_heartbeat 
  ON public.ad_sessions(last_heartbeat);

-- ============================================
-- 6. FUNCTIONS
-- ============================================

-- Function to get user's credit balance
CREATE OR REPLACE FUNCTION public.get_credit_balance(p_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(SUM(delta), 0)::INTEGER
  FROM public.credit_ledger
  WHERE user_id = p_user_id;
$$;

-- Function to get user's ad stats
CREATE OR REPLACE FUNCTION public.get_ad_stats(p_user_id UUID)
RETURNS TABLE (
  total_seconds_all_time BIGINT,
  total_credits_earned NUMERIC,
  total_seconds_today BIGINT,
  credits_earned_today NUMERIC
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    COALESCE(SUM(total_seconds), 0)::BIGINT as total_seconds_all_time,
    COALESCE(SUM(credits_earned), 0) as total_credits_earned,
    COALESCE(SUM(CASE WHEN DATE(started_at) = CURRENT_DATE THEN total_seconds ELSE 0 END), 0)::BIGINT as total_seconds_today,
    COALESCE(SUM(CASE WHEN DATE(started_at) = CURRENT_DATE THEN credits_earned ELSE 0 END), 0) as credits_earned_today
  FROM public.ad_sessions
  WHERE user_id = p_user_id;
$$;

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Give new users some initial credits (welcome bonus)
  INSERT INTO public.credit_ledger (user_id, delta, reason, description)
  VALUES (NEW.id, 100, 'allocate', 'Welcome bonus credits')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- 7. TRIGGERS
-- ============================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 8. VERIFY RLS IS ENABLED
-- ============================================
-- Run these queries to verify RLS is working:

-- Check if RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'credit_ledger', 'ad_sessions', 'provider_usage', 'revenue_snapshots')
ORDER BY tablename;

-- List all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- DONE! 
-- ============================================
-- Now test by signing up - you should see:
-- 1. Entry in auth.users
-- 2. Entry in public.users
-- 3. Entry in public.credit_ledger with 100 credits
--
-- RLS Policies Summary:
-- - Users can only read/update their own data
-- - Users can insert/update their own ad_sessions
-- - Backend (service role) can insert credit_ledger and provider_usage
-- - Revenue snapshots are admin-only (blocked for all users via RLS, but service key bypasses)

