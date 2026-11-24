import { flag } from "flags/next";
import { vercelAdapter } from "@flags-sdk/vercel";

/**
 * Master kill switch for the public ABSU Trade promotional banner.
 */
export const promoBannerEnabled = flag<boolean>({
  key: "promo-banner-enabled",
  description: "Controls whether the ABSU Trade promotional campaign banner is shown in the public marketplace.",
  defaultValue: false,
  adapter: vercelAdapter,
  options: [
    { value: false, label: "Hidden" },
    { value: true, label: "Shown" },
  ],
});

/**
 * Chooses the content of the single promotional banner.
 * Change the active campaign from Vercel → Project → Flags.
 */
export const promoBannerCampaign = flag<string>({
  key: "promo-banner-campaign",
  description: "Selects the ABSU Trade campaign displayed in the public promotional banner.",
  defaultValue: "marketplace-awareness",
  adapter: vercelAdapter,
  options: [
    { value: "marketplace-awareness", label: "Marketplace awareness" },
    { value: "seller-recruitment", label: "Seller recruitment" },
    { value: "seasonal-promotion", label: "Seasonal promotion" },
  ],
});

/**
 * Seller dashboard nudge encouraging sellers to publish their first listing.
 */
export const sellerActivationNudgeEnabled = flag<boolean>({
  key: "seller-activation-nudge-enabled",
  description: "Controls the seller dashboard prompt encouraging registered sellers to publish their first product or service listing.",
  defaultValue: false,
  adapter: vercelAdapter,
  options: [
    { value: false, label: "Hidden" },
    { value: true, label: "Shown" },
  ],
});
