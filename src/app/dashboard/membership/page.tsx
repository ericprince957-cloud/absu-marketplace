import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MembershipCard } from "@/components/membership/membership-card";
import { Alert, EmptyState, StatusBadge } from "@/components/ui/feedback";
import { PageHeader, TableWrap, Td, Th } from "@/components/ui/card";
import { getMembership, getRoles, requireUser } from "@/lib/auth";
import { getFreeSlotsRemaining } from "@/lib/data/membership";
import { listMyPayments } from "@/lib/data/payments";
import { first, formatDateTime, formatNaira, koboToNaira } from "@/lib/utils";

export const metadata: Metadata = { title: "Membership" };

const banners: Record<string, { tone: "success" | "error" | "warning" | "info"; title: string; text: string }> = {
  success: { tone: "success", title: "Payment confirmed", text: "Thank you! Your seller access is active." },
  failed: { tone: "error", title: "Payment failed", text: "Your card was not charged. Please try again." },
  cancelled: { tone: "info", title: "Payment cancelled", text: "You closed the checkout. No money was taken." },
  pending: { tone: "warning", title: "We are confirming your payment", text: "This can take a minute. Refresh this page shortly. If money left your account, it will be applied automatically." },
  review: { tone: "warning", title: "Payment needs review", text: "We received a payment that did not match our records. Contact support with your reference and we will fix it quickly." },
  error: { tone: "error", title: "Something went wrong", text: "We could not read that payment. If you were charged, contact support with your reference." },
};

export default async function MembershipPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser("/dashboard/membership");
  const roles = await getRoles(user.id);
  if (!roles.includes("seller")) redirect("/seller/apply");
  const flag = first((await searchParams).payment);
  const banner = flag ? banners[flag] : undefined;

  const [info, slots, payments] = await Promise.all([getMembership(user.id), getFreeSlotsRemaining(), listMyPayments(user.id)]);

  return (
    <>
      <PageHeader title="Seller access" description="Your seller plan, renewal and payment history. Buyers never pay to use the marketplace." />
      <div className="space-y-6">
        {banner ? <Alert tone={banner.tone} title={banner.title}>{banner.text}</Alert> : null}
        <MembershipCard info={info} slotsRemaining={slots} />

        <section aria-labelledby="pay-history">
          <h2 id="pay-history" className="mb-3 text-lg font-bold">Payment history</h2>
          {payments.length === 0 ? (
            <EmptyState title="No payments yet" description="Payments you make for seller access will appear here." />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Reference</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <Td>{formatDateTime(p.paid_at ?? p.created_at)}</Td>
                    <Td className="font-mono text-xs">{p.reference}</Td>
                    <Td>{formatNaira(koboToNaira(p.amount_kobo))}</Td>
                    <Td><StatusBadge status={p.status} /></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </section>
      </div>
    </>
  );
}
