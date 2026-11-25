import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

export function CampusChallengeBanner() {
  return (
    <section aria-label="ABSU Trade Campus Challenge">
      <Link
        href="/challenge"
        className="group relative block overflow-hidden rounded-3xl border border-[#D4AF37]/40 bg-[#0A0A0A] px-5 py-6 text-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#D4AF37] hover:shadow-lg sm:px-8 sm:py-8"
      >
        <div aria-hidden className="absolute -right-20 -top-20 size-56 rounded-full bg-[#D4AF37]/10 blur-2xl" />
        <div aria-hidden className="absolute -bottom-24 -left-16 size-52 rounded-full bg-white/5 blur-2xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#E5C76B]">
              <Trophy className="size-3.5" aria-hidden />
              Every 6 months
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-4xl">
              ABSU Trade Campus Challenge
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-300 sm:text-base">
              5 days. Earn verified points. Compete for 1st, 2nd and 3rd place.
              <span className="font-semibold text-white"> Starts 29 November 2026.</span>
            </p>

            <p className="mt-2 text-xs font-medium text-stone-400">
              Joining is free. Click to see how the challenge works.
            </p>
          </div>

          <span className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 text-sm font-bold text-black transition group-hover:bg-[#E5C76B]">
            View challenge
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </Link>
    </section>
  );
}
