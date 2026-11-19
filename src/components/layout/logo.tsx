import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`} aria-label={`${siteConfig.name} home`}>
      <span className="grid size-9 place-items-center rounded-xl bg-brand-700 text-white shadow-sm">
        <ShoppingBag className="size-5" aria-hidden />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-stone-900">
        ABSU<span className="text-brand-700">Market</span>
      </span>
    </Link>
  );
}
