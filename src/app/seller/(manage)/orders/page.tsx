import type { Metadata } from "next";
import { ReceiptText } from "lucide-react";
import { OrderList } from "@/components/dashboard/order-list";
import { PageHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { requireUser } from "@/lib/auth";
import { listSellerOrders } from "@/lib/data/orders";

export const metadata: Metadata = { title: "Orders" };

export default async function SellerOrdersPage() {
  const user = await requireUser("/seller/orders");
  const orders = await listSellerOrders(user.id);

  return (
    <>
      <PageHeader title="Orders" description="Confirm requests, arrange pickup with the buyer, then mark orders completed." />
      {orders.length === 0 ? (
        <EmptyState icon={<ReceiptText className="size-10" aria-hidden />} title="No orders yet" description="When a student orders one of your products it will appear here." />
      ) : (
        <OrderList orders={orders} as="seller" />
      )}
    </>
  );
}
