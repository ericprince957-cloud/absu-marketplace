import type { Metadata } from "next";
import { ReceiptText } from "lucide-react";
import { OrderList } from "@/components/dashboard/order-list";
import { LinkButton } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { requireUser } from "@/lib/auth";
import { listBuyerOrders } from "@/lib/data/orders";

export const metadata: Metadata = { title: "My orders" };

export default async function OrdersPage() {
  const user = await requireUser("/dashboard/orders");
  const orders = await listBuyerOrders(user.id);

  return (
    <>
      <PageHeader title="My orders" description="Orders you have placed with sellers. You pay the seller directly when you meet." />
      {orders.length === 0 ? (
        <EmptyState
          icon={<ReceiptText className="size-10" aria-hidden />}
          title="No orders yet"
          description="When you place an order it will show up here so you can track it."
          action={<LinkButton href="/marketplace">Browse marketplace</LinkButton>}
        />
      ) : (
        <OrderList orders={orders} as="buyer" />
      )}
    </>
  );
}
