import type { Metadata } from "next";
import { PricingPlans } from "@/components/membership/pricing-plans";
import { PageHeader } from "@/components/ui/card";
import { membership } from "@/config/site";
import { getUser } from "@/lib/auth";
import { getFreeSlotsRemaining } from "@/lib/data/membership";
import { formatNaira } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing and membership",
  description: "The first 50 ABSU students get free lifetime membership. After that, membership is ₦1,500 per month.",
};

const faqs = [
  {
    q: "Is browsing free?",
    a: "Yes. Anyone can browse and search products without an account. Membership is needed to sell, order and see seller contacts.",
  },
  {
    q: "How do I get a free lifetime spot?",
    a: `Create an account and verify your email. Free spots are given in the order students verify, up to ${membership.freeSlotLimit}. The system assigns them automatically and safely, so two people can never take the same spot.`,
  },
  {
    q: "Will I ever be charged if I get a free spot?",
    a: "No. Free lifetime members are never charged and never asked to pay.",
  },
  {
    q: "How does monthly payment work?",
    a: `You pay ${formatNaira(membership.priceNaira)} through Paystack. Each payment adds ${membership.periodDays} days of access. We confirm every payment on our server with Paystack before activating your membership.`,
  },
  {
    q: "Is the membership fee the price of products?",
    a: "No. Membership is separate. Prices of items are agreed between buyer and seller, and you pay the seller directly.",
  },
];

export default async function PricingPage() {
  const [user, slots] = await Promise.all([getUser(), getFreeSlotsRemaining()]);

  return (
    <>
      <PageHeader title="Pricing and membership" description="Start free. Keep it free if you are among the first students in." />
      <PricingPlans slotsRemaining={slots} signedIn={Boolean(user)} />

      <section className="mt-14" aria-labelledby="faq">
        <h2 id="faq" className="mb-5 text-2xl font-bold">Questions</h2>
        <div className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
          {faqs.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="cursor-pointer list-none font-semibold text-stone-900 marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {f.q}
                  <span aria-hidden className="text-stone-400 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-2.5 text-sm leading-relaxed text-stone-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
