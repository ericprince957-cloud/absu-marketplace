import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label={`${siteConfig.name} home`}>
      {/* Official ABSU crest */}
      <Image src="/absu-logo.png" alt="" width={32} height={40} priority className="h-10 w-auto shrink-0" />
      <span className="leading-none">
        <span className={cn("block font-display text-[22px] font-bold tracking-tight", light ? "text-white" : "text-brand-900")}>ABSU</span>
        <span className={cn("mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.22em]", light ? "text-brand-200" : "text-stone-500")}>
          Trade
        </span>
      </span>
    </Link>
  );
}
