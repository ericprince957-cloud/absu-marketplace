import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/types";

const ORDER_SELECT =
  "*, order_items(id,order_id,product_id,title,unit_price,quantity), buyer:profiles!orders_buyer_id_fkey(full_name), seller:profiles!orders_seller_id_fkey(full_name)";

export async function listBuyerOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[data] listBuyerOrders failed:", error.message);
    return [];
  }
  return (data ?? []) as unknown as Order[];
}

export async function listSellerOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[data] listSellerOrders failed:", error.message);
    return [];
  }
  return (data ?? []) as unknown as Order[];
}
