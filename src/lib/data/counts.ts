import { createClient } from "@/lib/supabase/server";

async function count(table: string, filters: Record<string, string | boolean>): Promise<number> {
  const supabase = await createClient();
  let req = supabase.from(table).select("*", { count: "exact", head: true });
  for (const [k, v] of Object.entries(filters)) req = req.eq(k, v);
  const { count: n, error } = await req;
  if (error) {
    console.error(`[data] count ${table} failed:`, error.message);
    return 0;
  }
  return n ?? 0;
}

export const countMyOrders = (userId: string) => count("orders", { buyer_id: userId });
export const countMySaved = (userId: string) => count("saved_products", { user_id: userId });
export const countUnreadNotifications = (userId: string) => count("notifications", { user_id: userId, is_read: false });
