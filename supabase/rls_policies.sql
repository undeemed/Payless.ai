-- Payless.ai RLS (Row Level Security) Policies
-- Run this after setup.sql to configure all security policies

-- ============================================
-- USERS TABLE RLS
-- ============================================
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
-- CREDIT LEDGER RLS
-- ============================================
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own ledger" ON public.credit_ledger;
DROP POLICY IF EXISTS "Service role can insert ledger" ON public.credit_ledger;

-- Users can read their own ledger entries
CREATE POLICY "Users can read own ledger" ON public.credit_ledger
  FOR SELECT USING (auth.uid() = user_id);

-- Service role (backend) can insert ledger entries
-- Note: Service role bypasses RLS, but this is for explicit clarity
CREATE POLICY "Service role can insert ledger" ON public.credit_ledger
  FOR INSERT WITH CHECK (true);

-- ============================================
-- AD SESSIONS RLS
-- ============================================
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

-- ============================================
-- PROVIDER USAGE RLS
-- ============================================
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

-- ============================================
-- REVENUE SNAPSHOTS RLS
-- ============================================
ALTER TABLE public.revenue_snapshots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role only for revenue" ON public.revenue_snapshots;

-- Only service role can access revenue snapshots (admin only)
-- This effectively blocks all anon/authenticated users
CREATE POLICY "Service role only for revenue" ON public.revenue_snapshots
  FOR ALL USING (false);

-- Note: Service role (backend) uses service key which bypasses RLS
-- So backend can still read/write revenue_snapshots

-- ============================================
-- VERIFY RLS IS ENABLED
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
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

