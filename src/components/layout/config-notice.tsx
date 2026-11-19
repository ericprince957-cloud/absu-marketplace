import { isSupabaseConfigured } from "@/lib/env";

/**
 * Visible only while the Supabase environment variables are missing, so a
 * half-configured deployment is obvious instead of silently showing empty pages.
 */
export function ConfigNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <div role="alert" className="bg-amber-100 px-4 py-2 text-center text-xs font-medium text-amber-900">
      Backend not connected: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Pages will look empty until then.
    </div>
  );
}
