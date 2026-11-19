import { Check } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/feedback";
import { membership } from "@/config/site";
import { cn, formatNaira } from "@/lib/utils";

const features = [
  "List products and manage your shop",
  "Place orders and track them",
  "See seller contact details (WhatsApp / phone)",
  "Save products you like",
  "Unlimited browsing and search",
];

export function PricingPlans({ slotsRemaining, signedIn }: { slotsRemaining: number | null; signedIn: boolean }) {
  const soldOut = slotsRemaining === 0;
  const cta = signedIn ? "/dashboard/membership" : "/register";

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className={cn("relative rounded-2xl border-2 bg-white p-6 shadow-sm sm:p-8", soldOut ? "border-stone-200 opacity-80" : "border-brand-700")}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Founding member</h3>
          <Badge tone={soldOut ? "neutral" : "green"}>{soldOut ? "Full" : "Limited"}</Badge>
        </div>
        <p className="mt-4 font-display text-5xl font-extrabold text-brand-800">Free</p>
        <p className="mt-1 text-sm font-medium text-stone-700">Forever. No monthly fee, ever.</p>
        <p className="mt-3 text-sm text-stone-600">
          The first {membership.freeSlotLimit} verified students keep full access for life.
          {slotsRemaining !== null ? (
            <>
              {" "}
              <strong className="text-stone-900">{soldOut ? "All spots are taken." : `${slotsRemaining} spots left.`}</strong>
            </>
          ) : null}
        </p>
        <ul className="mt-5 space-y-2.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-stone-700">
              <Check className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden /> {f}
            </li>
          ))}
        </ul>
        {!soldOut ? (
          <LinkButton href={cta} size="lg" className="mt-6 w-full">
            {signedIn ? "View my membership" : "Claim a free spot"}
          </LinkButton>
        ) : null}
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Monthly member</h3>
          <Badge tone="blue">Everyone else</Badge>
        </div>
        <p className="mt-4 font-display text-5xl font-extrabold text-stone-900">
          {formatNaira(membership.priceNaira)}
          <span className="text-lg font-semibold text-stone-500"> / month</span>
        </p>
        <p className="mt-1 text-sm font-medium text-stone-700">Paid securely with Paystack.</p>
        <p className="mt-3 text-sm text-stone-600">
          Each payment adds {membership.periodDays} days. Renew whenever you like; unused time is never lost.
        </p>
        <ul className="mt-5 space-y-2.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-stone-700">
              <Check className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden /> {f}
            </li>
          ))}
        </ul>
        <LinkButton href={cta} variant={soldOut ? "primary" : "outline"} size="lg" className="mt-6 w-full">
          {signedIn ? "Go to membership" : "Create account"}
        </LinkButton>
      </div>
    </div>
  );
}
