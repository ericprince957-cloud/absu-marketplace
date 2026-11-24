import { flag } from "flags/next";
import { vercelAdapter } from "@flags-sdk/vercel";

/**
 * Remote kill switch for the public ABSU Trade promotional banner.
 * Manage the value in Vercel → Project → Flags.
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
