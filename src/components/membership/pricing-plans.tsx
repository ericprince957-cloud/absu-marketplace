import { Check } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/feedback";
import { membership } from "@/config/site";
import { cn, formatNaira } from "@/lib/utils";

const features = [
  "Create and manage product listings",
  "Upload product photos",
  "Manage your seller storefront",
  "Receive buyer enquiries and order requests",
];

export function PricingPlans({ slotsRemaining, signedIn }: { slotsRemaining: number | null; signedIn: boolean }) {
  const soldOut = slotsRemaining === 0;
  const cta = signedIn ? "/seller/apply" : "/register";

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
        <strong>Buyers always use ABSU Marketplace for free.</strong> Browsing, searching, contacting sellers and buying products never require a subscription or buyer fee.
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className={cn("relative rounded-2xl border-2 bg-white p-6 shadow-sm sm:p-8", soldOut ? "border-stone-200 opacity-80" : "border-brand-700")}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Founding seller</h3>
            <Badge tone={soldOut ? "neutral" : "green"}>{soldOut ? "50 spots allocated" : "Limited"}</Badge>
          </div>
          <p className="mt-4 font-display text-5xl font-extrabold text-brand-800">Free</p>
          <p className="mt-1 text-sm font-medium text-stone-700">Lifetime seller access.</p>
          <p className="mt-3 text-sm text-stone-600">
            The first {membership.freeSlotLimit} approved sellers receive free access for life.
            {slotsRemaining !== null ? <> <strong className="text-stone-900">{soldOut ? "All spots are allocated." : `${slotsRemaining} seller spots remain.`}</strong></> : null}
          </p>
          <ul className="mt-5 space-y-2.5">
            {features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-stone-700"><Check className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden /> {f}</li>)}
          </ul>
          {!soldOut ? <LinkButton href={cta} size="lg" className="mt-6 w-full">{signedIn ? "Apply to become a seller" : "Create account to apply"}</LinkButton> : null}
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Seller plan</h3>
            <Badge tone="blue">After first 50</Badge>
          </div>
          <p className="mt-4 font-display text-5xl font-extrabold text-stone-900">{formatNaira(membership.priceNaira)}<span className="text-lg font-semibold text-stone-500"> / 30 days</span></p>
          <p className="mt-1 text-sm font-medium text-stone-700">Paid securely with Paystack.</p>
          <p className="mt-3 text-sm text-stone-600">Only approved sellers outside the first 50 pay. Each successful payment activates seller access for {membership.periodDays} days.</p>
          <ul className="mt-5 space-y-2.5">
            {features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-stone-700"><Check className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden /> {f}</li>)}
          </ul>
          <LinkButton href={cta} variant="outline" size="lg" className="mt-6 w-full">{signedIn ? "Apply to sell" : "Create seller account"}</LinkButton>
        </div>
      </div>
    </div>
  );
}
