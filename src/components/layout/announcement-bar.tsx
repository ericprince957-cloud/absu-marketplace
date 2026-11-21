import { BadgeCheck, HandCoins, ShieldCheck } from "lucide-react";

/** Thin brand strip above the header. Only states things that are true of the platform. */
export function AnnouncementBar() {
  return (
    <div className="bg-brand-900 text-white">
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-center gap-5 px-4 text-[11px] font-medium sm:gap-8 sm:text-xs">
        <span className="inline-flex items-center gap-1.5">
          <BadgeCheck className="size-3.5 text-gold-400" aria-hidden /> Free to browse
        </span>
        <span aria-hidden className="h-3 w-px bg-white/25" />
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-gold-400" aria-hidden /> Verified ABSU students
        </span>
        <span aria-hidden className="hidden h-3 w-px bg-white/25 sm:block" />
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <HandCoins className="size-3.5 text-gold-400" aria-hidden /> Pay the seller in person
        </span>
      </div>
    </div>
  );
}
