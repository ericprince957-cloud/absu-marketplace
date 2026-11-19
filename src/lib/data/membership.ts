import { createClient } from "@/lib/supabase/server";

/**
 * How many of the free lifetime spots are left. Display-only: the database
 * assigns spots atomically and is the only source of truth.
 */
export async function getFreeSlotsRemaining(): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_free_slots_remaining");
  if (error || typeof data !== "number") {
    if (error) console.error("[data] getFreeSlotsRemaining failed:", error.message);
    return null;
  }
  return Math.max(0, data);
}
