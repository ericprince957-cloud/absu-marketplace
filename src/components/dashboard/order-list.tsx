import Link from "next/link";
import { updateOrderStatus } from "@/app/dashboard/actions";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatDateTime, formatNaira } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

function StatusForm({ orderId, status, label, variant }: { orderId: string; status: OrderStatus; label: string; variant: "primary" | "outline" | "danger" }) {
  return (
    <form action={updateOrderStatus}>
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="status" value={status} />
      <SubmitButton size="sm" variant={variant} pendingText="Updating...">{label}</SubmitButton>
    </form>
  );
}

/** Orders as readable cards. `as` decides who is looking and which buttons they get. */
export function OrderList({ orders, as }: { orders: Order[]; as: "buyer" | "seller" }) {
  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o.id}>
          <Card className="space-y-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-stone-500">Order #{o.id.slice(0, 8).toUpperCase()} · {formatDateTime(o.created_at)}</p>
                <p className="mt-0.5 text-sm font-medium text-stone-800">
                  {as === "buyer" ? "Seller" : "Buyer"}: {(as === "buyer" ? o.seller?.full_name : o.buyer?.full_name) ?? "ABSU student"}
                </p>
              </div>
              <StatusBadge status={o.status} />
            </div>

            <ul className="divide-y divide-stone-100 rounded-xl border border-stone-100">
              {(o.order_items ?? []).map((it) => (
                <li key={it.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm">
                  <span className="min-w-0">
                    {it.product_id ? (
                      <Link href={`/product/${it.product_id}`} className="font-medium text-stone-900 hover:text-brand-700 hover:underline">{it.title}</Link>
                    ) : (
                      <span className="font-medium text-stone-900">{it.title}</span>
                    )}
                    <span className="text-stone-500"> × {it.quantity}</span>
                  </span>
                  <span className="shrink-0 text-stone-700">{formatNaira(it.unit_price * it.quantity)}</span>
                </li>
              ))}
            </ul>

            {o.delivery_address ? <p className="rounded-xl bg-stone-50 p-3 text-sm text-stone-700"><span className="font-medium">Delivery / pickup address:</span> {o.delivery_address}</p> : null}\n            {o.note ? <p className="rounded-xl bg-stone-50 p-3 text-sm text-stone-700"><span className="font-medium">Note:</span> {o.note}</p> : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-display text-lg font-bold">Total {formatNaira(o.total)}</p>
              <div className="flex flex-wrap gap-2">
                {as === "buyer" && o.status === "pending" ? <StatusForm orderId={o.id} status="cancelled" label="Cancel order" variant="outline" /> : null}
                {as === "seller" && o.status === "pending" ? (
                  <>
                    <StatusForm orderId={o.id} status="confirmed" label="Confirm" variant="primary" />
                    <StatusForm orderId={o.id} status="cancelled" label="Decline" variant="outline" />
                  </>
                ) : null}
                {as === "seller" && o.status === "confirmed" ? (
                  <>
                    <StatusForm orderId={o.id} status="completed" label="Mark completed" variant="primary" />
                    <StatusForm orderId={o.id} status="cancelled" label="Cancel" variant="outline" />
                  </>
                ) : null}
              </div>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
