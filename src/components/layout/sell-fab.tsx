import Link from "next/link";
import { Plus } from "lucide-react";

export function SellFab() {
  return (
    <Link
      href="/seller/apply"
      className="fixed bottom-24 right-4 z-30 inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-extrabold text-white shadow-xl shadow-emerald-900/20 transition hover:-translate-y-1 hover:bg-emerald-700 focus-visible:outline-offset-4 sm:bottom-7 sm:right-7"
      aria-label="Start selling on ABSU Marketplace"
    >
      <Plus className="size-5" strokeWidth={2.7} aria-hidden />
      Sell
    </Link>
  );
}
