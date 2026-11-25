import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, Gift, Trophy, Users } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "ABSU Trade Campus Challenge",
  description: "Join the first five-day ABSU Trade Campus Challenge starting 29 November 2026. Free entry, verified points and prizes for the top three participants.",
};

const details = [
  { icon: CalendarDays, title: "Five days", text: "The first edition runs from 29 November to 3 December 2026." },
  { icon: Users, title: "Free to enter", text: "Any eligible ABSU Trade student account can take part. You do not need paid seller membership just to join the competition." },
  { icon: Trophy, title: "Three winners", text: "The top three participants with the highest verified scores will take the first, second and third positions." },
];

export default function CampusChallengePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> Back to ABSU Trade
      </Link>

      <section className="relative overflow-hidden rounded-3xl bg-brand-950 px-5 py-8 text-white sm:px-10 sm:py-12">
        <div aria-hidden className="absolute -right-12 -top-16 size-56 rounded-full bg-gold-400/15 blur-2xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
            <Trophy className="size-4" aria-hidden /> First edition · 2026
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            ABSU Trade <span className="text-gold-400">Campus Challenge</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
            Five days of campus activity. Earn verified points, climb the leaderboard and compete for one of the top three places.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-gold-400 px-4 py-2 text-sm font-bold text-brand-950">Starts 29 November 2026</span>
            <span className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white">Free entry</span>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Challenge details">
        {details.map((item) => (
          <article key={item.title} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <span className="grid size-11 place-items-center rounded-xl bg-sage text-brand-900">
              <item.icon className="size-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-bold text-brand-950">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
        <h2 className="text-xl font-bold text-brand-950">How the challenge works</h2>
        <ol className="mt-4 space-y-4 text-sm leading-6 text-stone-700">
          <li className="flex gap-3"><CheckCircle2 className="mt-1 size-5 shrink-0 text-brand-700" aria-hidden /><span><strong>Register or sign in.</strong> Participation is free for students with an ABSU Trade account.</span></li>
          <li className="flex gap-3"><CheckCircle2 className="mt-1 size-5 shrink-0 text-brand-700" aria-hidden /><span><strong>Complete the official challenge activities.</strong> Activities, point values and how to submit proof will be published before the competition opens.</span></li>
          <li className="flex gap-3"><CheckCircle2 className="mt-1 size-5 shrink-0 text-brand-700" aria-hidden /><span><strong>Earn verified points.</strong> Only genuine activities approved by the ABSU Trade team count towards your score.</span></li>
          <li className="flex gap-3"><CheckCircle2 className="mt-1 size-5 shrink-0 text-brand-700" aria-hidden /><span><strong>Finish among the top three.</strong> Scores are reviewed at the end of the five-day period before winners are confirmed.</span></li>
        </ol>
      </section>

      <section className="mt-5 rounded-2xl border border-gold-400/50 bg-gold-400/10 p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <Gift className="mt-1 size-6 shrink-0 text-brand-800" aria-hidden />
          <div>
            <h2 className="font-bold text-brand-950">Prizes and scoring guide</h2>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              The first, second and third-place rewards, exact point values and official activity limits will be announced before launch. Follow ABSU Trade announcements so you do not miss the final rules.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl bg-sage p-5 sm:p-7">
        <h2 className="text-xl font-bold text-brand-950">A challenge every six months</h2>
        <p className="mt-2 text-sm leading-6 text-stone-700">
          This is the first edition of a recurring ABSU Trade community challenge. We plan to bring it back every six months with a fresh competition period.
        </p>
        <p className="mt-3 text-sm leading-6 text-stone-700">
          Joining the challenge is free. Seller membership remains a separate paid service for students who want to publish product listings; the competition does not unlock seller privileges.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <LinkButton href="/register" size="lg">Create free account</LinkButton>
          <LinkButton href="/login" size="lg" variant="outline">I already have an account</LinkButton>
        </div>
      </section>
    </div>
  );
}
