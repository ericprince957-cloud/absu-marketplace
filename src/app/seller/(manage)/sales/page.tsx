import type { Metadata } from "next";
import { Card, PageHeader, Stat, TableWrap, Td, Th } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { requireUser } from "@/lib/auth";
import { listSellerOrders } from "@/lib/data/orders";
import { formatNaira } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

export const metadata: Metadata = { title: "Sales" };

export default async function SalesPage() {
  const user = await requireUser("/seller/sales");
  const orders = await listSellerOrders(user.id);

  const completed = orders.filter((o) => o.status === "completed");
  const revenue = completed.reduce((s, o) => s + Number(o.total), 0);
  const open = orders.filter((o) => o.status === "pending" || o.status === "confirmed").length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;
  const units = completed.reduce((s, o) => s + (o.order_items ?? []).reduce((n, i) => n + i.quantity, 0), 0);

  // Best sellers from completed orders.
  const byProduct = new Map<string, { title: string; units: number; revenue: number }>();
  for (const o of completed) {
    for (const it of o.order_items ?? []) {
      const key = it.product_id ?? it.title;
      const row = byProduct.get(key) ?? { title: it.title, units: 0, revenue: 0 };
      row.units += it.quantity;
      row.revenue += it.quantity * Number(it.unit_price);
      byProduct.set(key, row);
    }
  }
  const top = [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  return (
    <>
      <PageHeader title="Sales" description="Based on orders you marked as completed." />
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Stat label="Revenue" value={formatNaira(revenue)} />
          <Stat label="Items sold" value={units} />
          <Stat label="Open orders" value={open} />
          <Stat label="Cancelled" value={cancelled} />
        </div>

        {top.length === 0 ? (
          <EmptyState icon={<BarChart3 className="size-10" aria-hidden />} title="No completed sales yet" description="Your best-selling products will show up here." />
        ) : (
          <Card className="p-0 sm:p-0">
            <h2 className="px-5 pt-5 text-lg font-bold">Best sellers</h2>
            <div className="mt-3">
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Product</Th>
                    <Th>Units</Th>
                    <Th>Revenue</Th>
                  </tr>
                </thead>
                <tbody>
                  {top.map((r) => (
                    <tr key={r.title}>
                      <Td>{r.title}</Td>
                      <Td>{r.units}</Td>
                      <Td>{formatNaira(r.revenue)}</Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
