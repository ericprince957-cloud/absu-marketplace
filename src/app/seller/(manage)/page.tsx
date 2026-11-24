import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";
import { Card, PageHeader, Stat } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { getMembership, requireUser } from "@/lib/auth";
import { listSellerOrders } from "@/lib/data/orders";
import { listSellerProducts } from "@/lib/data/products";
import { formatNaira } from "@/lib/utils";
import { MembershipRequired } from "@/components/membership/membership-required";
import { sellerActivationNudgeEnabled } from "@/flags";

export const metadata: Metadata = { title: "Overview" };

export default async function SellerOverviewPage() {
  const user = await requireUser("/seller");
  const [products, orders, membership, showActivationNudge] = await Promise.all([
    listSellerProducts(user.id),
    listSellerOrders(user.id),
    getMembership(user.id),
    sellerActivationNudgeEnabled(),
  ]);

  const live = products.filter((p) => p.status === "approved").length;
  const pendingReview = products.filter((p) => p.status === "pending").length;
  const rejected = products.filter((p) => p.status === "rejected").length;
  const newOrders = orders.filter((o) => o.status === "pending").length;
  const revenue = orders.filter((o) => o.status === "completed").reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <>
      <PageHeader
        title="Seller overview"
        description="Your shop at a glance."
        actions={<LinkButton href="/seller/products/new">Add product</LinkButton>}
      />
      <div className="space-y-6">
        {!membership.hasAccess ? <MembershipRequired action="list products" /> : null}
        {showActivationNudge && membership.hasAccess && live === 0 && pendingReview === 0 ? (
          <Card className="flex flex-col gap-3 border border-gold-400/50 bg-gold-50 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-stone-950">Your shop is ready for its first listing.</p>
              <p className="text-sm text-stone-700">Students are already browsing ABSU Trade. Add your first product or service so they can discover what you offer.</p>
            </div>
            <LinkButton href="/seller/products/new">Publish first listing</LinkButton>
          </Card>
        ) : null}
        {rejected > 0 ? <Alert tone="error" title={`${rejected} listing${rejected > 1 ? "s were" : " was"} rejected`}>Open My products to read the moderator note and fix them.</Alert> : null}

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Stat label="Live products" value={live} />
          <Stat label="In review" value={pendingReview} />
          <Stat label="New orders" value={newOrders} />
          <Stat label="Completed sales" value={formatNaira(revenue)} />
        </div>

        <Card className="flex flex-wrap gap-3">
          <LinkButton href="/seller/products" variant="outline">Manage listings</LinkButton>
          <LinkButton href="/seller/orders" variant="outline">View orders</LinkButton>
          <LinkButton href="/seller/sales" variant="outline">Sales information</LinkButton>
        </Card>
      </div>
    </>
  );
}
