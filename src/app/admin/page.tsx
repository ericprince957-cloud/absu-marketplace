import type { Metadata } from "next";
import { PageHeader, Stat } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { membership } from "@/config/site";
import { createClient } from "@/lib/supabase/server";
import { formatNaira, koboToNaira } from "@/lib/utils";
import type { AdminStats } from "@/types";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_stats");
  if (error) console.error("[admin] admin_stats failed:", error.message);
  const s = (Array.isArray(data) ? data[0] : data) as AdminStats | null;

  return (
    <>
      <PageHeader title="Platform statistics" description="Live numbers from the database." />
      {!s ? (
        <Alert tone="error" title="Statistics unavailable">Could not load statistics. Check that the admin_stats() database function exists.</Alert>
      ) : (
        <div className="space-y-8">
          {s.pending_applications > 0 || s.products_pending > 0 ? (
            <Alert tone="warning" title="Waiting for you">
              {s.pending_applications} seller application(s) and {s.products_pending} product(s) need review.
            </Alert>
          ) : null}

          <section>
            <h2 className="mb-3 text-lg font-bold">People</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <Stat label="Registered" value={s.users} />
              <Stat label="Verified" value={s.verified_users} />
              <Stat label="Sellers" value={s.sellers} />
              <Stat label="Free spots left" value={s.free_slots_remaining} hint={`of ${membership.freeSlotLimit}`} />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">Seller access revenue</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <Stat label="Lifetime-free sellers" value={s.free_members} />
              <Stat label="Paid sellers" value={s.paid_members} />
              <Stat label="Membership revenue" value={formatNaira(koboToNaira(s.revenue_kobo))} />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">Marketplace</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <Stat label="Products" value={s.products_total} />
              <Stat label="Awaiting review" value={s.products_pending} />
              <Stat label="Orders" value={s.orders_total} />
              <Stat label="Completed orders" value={s.orders_completed} />
            </div>
          </section>
        </div>
      )}
    </>
  );
}
