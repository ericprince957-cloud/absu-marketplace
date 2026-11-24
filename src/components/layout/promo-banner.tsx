import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { promoBannerCampaign, promoBannerEnabled } from "@/flags";

const campaigns = {
  "marketplace-awareness": {
    message: "ABSU Trade brings campus buying and selling together. Find what you need, right here.",
    action: "Explore marketplace",
    href: "/marketplace",
  },
  "seller-recruitment": {
    message: "Got something to sell? Put it in front of students across ABSU.",
    action: "Start selling free",
    href: "/seller/apply",
  },
  "seasonal-promotion": {
    message: "Campus deals are waiting. Discover special offers from sellers around ABSU.",
    action: "Discover deals",
    href: "/marketplace",
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

  return (
    <aside aria-label="ABSU Trade promotion" className="bg-gold-400 text-brand-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-3 text-center sm:flex-row sm:gap-4 sm:px-6 sm:py-2.5 sm:text-left">
        <p className="flex items-center justify-center gap-2 text-xs font-semibold sm:text-sm">
          <Megaphone className="size-4 shrink-0" aria-hidden />
          <span>{content.message}</span>
        </p>
        <Link
          href={content.href}
          className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full bg-brand-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
        >
          {content.action} <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
