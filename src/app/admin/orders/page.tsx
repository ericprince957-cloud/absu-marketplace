import type { Metadata } from "next";
import { PageHeader, TableWrap, Td, Th } from "@/components/ui/card";
import { EmptyState, StatusBadge } from "@/components/ui/feedback";
import { Pagination } from "@/components/ui/pagination";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatNaira, pageNumber } from "@/lib/utils";
import type { Order } from "@/types";

export const metadata: Metadata = { title: "Orders" };
const SIZE = 25;

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const page = pageNumber((await searchParams).page);
  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("orders")
    .select(
      "*, order_items(id,order_id,product_id,title,unit_price,quantity), buyer:profiles!orders_buyer_id_fkey(full_name), seller:profiles!orders_seller_id_fkey(full_name)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * SIZE, page * SIZE - 1);
  if (error) console.error("[admin] orders failed:", error.message);
  const orders = (data ?? []) as unknown as Order[];

  return (
    <>
      <PageHeader title="Orders" description="All orders across the marketplace (read only)." />
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" />
      ) : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>Order</Th>
                <Th>Buyer</Th>
                <Th>Seller</Th>
                <Th>Items</Th>
                <Th>Total</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <Td>
                    <p className="font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-stone-500">{formatDateTime(o.created_at)}</p>
                  </Td>
                  <Td>{o.buyer?.full_name ?? "-"}</Td>
                  <Td>{o.seller?.full_name ?? "-"}</Td>
                  <Td>{(o.order_items ?? []).map((i) => `${i.title} ×${i.quantity}`).join(", ")}</Td>
                  <Td>{formatNaira(o.total)}</Td>
                  <Td><StatusBadge status={o.status} /></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <Pagination page={page} pageSize={SIZE} total={count ?? 0} basePath="/admin/orders" />
        </>
      )}
    </>
  );
}
