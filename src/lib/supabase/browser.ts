"use client";

import { createBrowserClient } from "@supabase/ssr";
import { FALLBACK_KEY, FALLBACK_URL, supabaseAnonKey, supabaseUrl } from "@/lib/env";

/** Browser client. Uses the public anon key only; every query is limited by Row Level Security. */
export function createClient() {
  return createBrowserClient(supabaseUrl || FALLBACK_URL, supabaseAnonKey || FALLBACK_KEY);
}
