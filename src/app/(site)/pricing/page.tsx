import type { Metadata } from "next";
import { PricingPlans } from "@/components/membership/pricing-plans";
import { PageHeader } from "@/components/ui/card";
import { membership } from "@/config/site";
import { getUser } from "@/lib/auth";
import { getFreeSlotsRemaining } from "@/lib/data/membership";
import { formatNaira } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Seller pricing",
  description: "Buyers use ABSU Marketplace for free. The first 50 approved sellers get lifetime-free access; other sellers pay ₦1,500 every 30 days.",
};

const faqs = [
  {
    q: "Is browsing free?",
    a: "Yes. Buyers can browse, search, contact sellers and buy products for free. No buyer account or subscription is required to contact a seller on WhatsApp.",
  },
  {
    q: "How do sellers get one of the 50 free lifetime spots?",
    a: `Apply to become a seller. The first ${membership.freeSlotLimit} seller applications approved by an administrator receive lifetime-free seller access. Buyers and ordinary account registrations never use these slots.`,
  },
  {
    q: "Will I ever be charged if I get a free spot?",
    a: "No. Founding sellers keep seller access for life and are never charged for it.",
  },
  {
    q: "How does seller payment work?",
    a: `Approved sellers who are not among the first ${membership.freeSlotLimit} pay ${formatNaira(membership.priceNaira)} through Paystack for ${membership.periodDays} days of seller access. We verify every payment with Paystack before activating access.`,
  },
  {
    q: "Is the membership fee the price of products?",
    a: "No. Buyers pay no platform fee or subscription. Product prices are agreed between buyer and seller, and payment goes directly to the seller.",
  },
];

export default async function PricingPage() {
  const [user, slots] = await Promise.all([getUser(), getFreeSlotsRemaining()]);

  return (
    <>
      <PageHeader title="Seller pricing" description="Buyers are always free. Only approved sellers pay to list and manage products." />
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
