import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label={`${siteConfig.name} home`}>
      <span
        className={cn(
          "grid size-10 place-items-center rounded-xl border-2",
          light ? "border-white/70 text-white" : "border-brand-900 text-brand-900",
        )}
      >
        <ShoppingBag className="size-5" aria-hidden />
      </span>
      <span className="leading-none">
        <span className={cn("block font-display text-[22px] font-bold tracking-tight", light ? "text-white" : "text-brand-900")}>ABSU</span>
        <span className={cn("mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.22em]", light ? "text-brand-200" : "text-stone-500")}>
          Marketplace
        </span>
      </span>
    </Link>
  );
}
