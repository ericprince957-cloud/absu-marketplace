export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True once the backend env vars have been added. */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// When the backend is not connected yet, clients point at an unreachable local
// address. Every call then returns an `error` object (it never throws) and the
// UI shows empty states plus a visible "backend not connected" notice.
export const FALLBACK_URL = "http://127.0.0.1:9";
export const FALLBACK_KEY = "backend-not-configured";
