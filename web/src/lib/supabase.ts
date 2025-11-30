import { createBrowserClient } from '@supabase/ssr';

// Supabase project config (anon key is safe for client-side use)
export const supabaseUrl = "https://bycsqbjaergjhwzbulaa.supabase.co";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
