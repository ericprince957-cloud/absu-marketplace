import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { promoBannerEnabled } from "@/flags";

export async function PromoBanner() {
  const enabled = await promoBannerEnabled();

  if (!enabled) return null;

  return (
    <aside
      aria-label="ABSU Trade promotion"
      className="bg-gold-400 text-brand-950"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-3 text-center sm:flex-row sm:gap-4 sm:px-6 sm:py-2.5 sm:text-left">
        <p className="flex items-center justify-center gap-2 text-xs font-semibold sm:text-sm">
          <Megaphone className="size-4 shrink-0" aria-hidden />
          <span>
            Got something to sell? Put it in front of students across ABSU.
          </span>
        </p>
        <Link
          href="/seller/apply"
          className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full bg-brand-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
        >
          Start selling free <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
