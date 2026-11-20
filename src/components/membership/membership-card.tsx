import { Crown, ShieldCheck, TimerReset } from "lucide-react";
import { PayButton } from "@/components/membership/pay-button";
import { Card } from "@/components/ui/card";
import { Alert, Badge } from "@/components/ui/feedback";
import { membership } from "@/config/site";
import { formatDate, formatNaira } from "@/lib/utils";
import type { MembershipInfo } from "@/types";
export function MembershipCard({ info, slotsRemaining }: { info: MembershipInfo; slotsRemaining: number | null }) {
  if (info.state === "free_lifetime") return (
    <Card className="min-w-0 border-brand-200 bg-brand-50">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-700 text-white sm:size-12"><Crown className="size-6" aria-hidden /></span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2"><h2 className="min-w-0 text-lg font-bold leading-tight sm:text-xl">Free lifetime member</h2><Badge tone="green">active</Badge></div>
          <p className="break-words text-sm leading-relaxed text-stone-700">{info.freeSlotNumber ? `You are founding member #${info.freeSlotNumber} of ${membership.freeSlotLimit}. ` : ""}Your membership is free forever. You will never be charged.</p>
        </div>
      </div>
    </Card>
  );
  if (info.state === "active") {
    const canRenew = info.canRenew;
    return <Card className="min-w-0 space-y-4">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-800 sm:size-12"><ShieldCheck className="size-6" aria-hidden /></span>
        <div className="min-w-0 flex-1 space-y-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold sm:text-xl">Monthly membership</h2><Badge tone="green">active</Badge></div><p className="break-words text-sm text-stone-700">Active until <strong>{formatDate(info.paidUntil)}</strong>.</p></div>
      </div>
      {canRenew ? <><Alert tone="warning">Your membership ends soon. Renew now to keep selling and ordering. Time left is added, not lost.</Alert><PayButton label={`Renew for ${formatNaira(membership.priceNaira)}`} /></> : <p className="text-sm text-stone-600">You can renew during the last {membership.renewWindowDays} days before expiry.</p>}
    </Card>;
  }
  const expired = info.state === "expired";
  return <Card className="min-w-0 space-y-4">
    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-800 sm:size-12"><TimerReset className="size-6" aria-hidden /></span>
      <div className="min-w-0 flex-1 space-y-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold sm:text-xl">{expired ? "Membership expired" : "Activate your membership"}</h2><Badge tone={expired ? "red" : "amber"}>{expired ? "expired" : "not active"}</Badge></div><p className="break-words text-sm leading-relaxed text-stone-700">{expired && info.paidUntil ? `Your access ended on ${formatDate(info.paidUntil)}. ` : ""}Membership is {formatNaira(membership.priceNaira)} per month. It lets you list products, place orders and contact sellers.</p></div>
    </div>
    {slotsRemaining !== null && slotsRemaining > 0 && info.state === "none" ? <Alert tone="info">{slotsRemaining} free lifetime spots are still open. They are given automatically after email verification, so if you just verified, refresh this page in a moment before paying.</Alert> : null}
    <PayButton />
  </Card>;
}
