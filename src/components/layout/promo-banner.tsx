import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { promoBannerCampaign, promoBannerEnabled } from "@/flags";

const campaigns = {
  "marketplace-awareness": {
    title: "ABSU Trade brings campus buying and selling together.",
    action: "Explore marketplace",
    href: "/marketplace",
  },
  "seller-recruitment": {
    title: "Got something to sell? Put it in front of students across ABSU.",
    action: "Start selling",
    href: "/seller/apply",
  },
  "seasonal-promotion": {
    title: "Campus deals are waiting. Discover special offers around ABSU.",
    action: "Discover deals",
    href: "/marketplace",
  },
  "campus-challenge-2026": {
    title: "ABSU TRADE CAMPUS CHALLENGE — 5 days. One campus. Three winners. Starts 29 November.",
    action: "View challenge",
    href: "/challenge",
  },
} as const;

type Campaign = keyof typeof campaigns;

export async function PromoBanner() {
  const [enabled, selectedCampaign] = await Promise.all([
    promoBannerEnabled(),
    promoBannerCampaign(),
  ]);

  if (!enabled) return null;

  const campaign: Campaign = selectedCampaign in campaigns
    ? (selectedCampaign as Campaign)
    : "marketplace-awareness";
  const content = campaigns[campaign];
  const isChallenge = campaign === "campus-challenge-2026";

  return (
    <Link
      href={content.href}
      aria-label={`${content.title} ${content.action}`}
      className={isChallenge
        ? "group block bg-brand-950 text-white transition hover:bg-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
        : "group block bg-gold-400 text-brand-950 transition hover:bg-gold-300"}
    >
      <aside aria-label="ABSU Trade promotion" className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-3 text-center sm:flex-row sm:gap-4 sm:px-6 sm:py-3">
        <p className="flex items-center justify-center gap-2 text-xs font-bold sm:text-sm">
          {isChallenge ? <Trophy className="size-4 shrink-0 text-gold-400" aria-hidden /> : null}
          <span>{content.title}</span>
        </p>
        <span className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full bg-gold-400 px-3.5 py-1.5 text-xs font-bold text-brand-950 transition group-hover:bg-gold-300">
          {content.action} <ArrowRight className="size-3.5" aria-hidden />
        </span>
      </aside>
    </Link>
  );
}
