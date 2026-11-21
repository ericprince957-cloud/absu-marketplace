import { Crown, ShieldCheck, TimerReset } from "lucide-react";
import { PayButton } from "@/components/membership/pay-button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { LinkButton } from "@/components/ui/button";
import { membership } from "@/config/site";
import { formatDate, formatNaira } from "@/lib/utils";
import type { MembershipInfo } from "@/types";

export function MembershipCard({ info, slotsRemaining }: { info: MembershipInfo; slotsRemaining: number | null }) {
  if (info.state === "free_lifetime") return (
    <Card className="min-w-0 border-brand-200 bg-brand-50">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-700 text-white sm:size-12"><Crown className="size-6" aria-hidden /></span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2"><h2 className="min-w-0 text-lg font-bold leading-tight sm:text-xl">Lifetime-free seller access</h2><span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">Active</span></div>
          <p className="break-words text-sm leading-relaxed text-stone-700">{info.freeSlotNumber ? `You are founding member #${info.freeSlotNumber} of ${membership.freeSlotLimit}. ` : ""}Your seller access is free forever. You will never be charged.</p>
        </div>
      </div>
    </Card>
  );

  if (info.state === "active") {
    const canRenew = info.canRenew;
    return <Card className="min-w-0 space-y-4">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-800 sm:size-12"><ShieldCheck className="size-6" aria-hidden /></span>
        <div className="min-w-0 flex-1 space-y-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold sm:text-xl">Monthly seller access</h2><span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">Active</span></div><p className="break-words text-sm text-stone-700">Active until <strong>{formatDate(info.paidUntil)}</strong>.</p></div>
      </div>
      {canRenew ? <><Alert tone="warning">Your seller access ends soon. Renew now to keep listing and managing products. Time left is added, not lost.</Alert><PayButton label={`Renew for ${formatNaira(membership.priceNaira)}`} /></> : <p className="text-sm text-stone-600">You can renew during the last {membership.renewWindowDays} days before expiry.</p>}
    </Card>;
  }

  const expired = info.state === "expired";
  const hasFreeSlots = slotsRemaining !== null && slotsRemaining > 0;
  return <Card className="min-w-0 space-y-4">
    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-800 sm:size-12"><TimerReset className="size-6" aria-hidden /></span>
      <div className="min-w-0 flex-1 space-y-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold sm:text-xl">{expired ? "Seller access expired" : "Seller access"}</h2><span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">{expired ? "Expired" : "Not active"}</span></div><p className="break-words text-sm leading-relaxed text-stone-700">{expired && info.paidUntil ? `Your access ended on ${formatDate(info.paidUntil)}. ` : ""}{hasFreeSlots ? "There is no payment required while lifetime-free seller spots remain." : `Seller access is ${formatNaira(membership.priceNaira)} every ${membership.periodDays} days. It lets you list and manage products.`}</p></div>
    </div>
    {hasFreeSlots ? (
      <>
        <Alert tone="info">{slotsRemaining} of {membership.freeSlotLimit} lifetime-free seller spots remain. Apply to become a seller; an admin will review your application, and approved sellers receive a free spot while available.</Alert>
        <LinkButton href="/seller/apply" size="lg" className="w-full">Apply for free seller access</LinkButton>
      </>
    ) : (
      <PayButton />
    )}
  </Card>;
}
