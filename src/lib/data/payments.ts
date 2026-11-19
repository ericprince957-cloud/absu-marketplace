import { createClient } from "@/lib/supabase/server";
import type { Payment } from "@/types";

/** The logged-in user's own payments (RLS limits rows to auth.uid()). */
export async function listMyPayments(userId: string): Promise<Payment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id,user_id,reference,amount_kobo,currency,status,paid_at,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) {
    console.error("[data] listMyPayments failed:", error.message);
    return [];
  }
  return (data ?? []) as Payment[];
}
