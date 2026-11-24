export const siteConfig = {
  name: "ABSU Trade",
  shortName: "ABSU Trade",
  description:
    "Buy and sell around Abia State University in Uturu. Discover student-listed textbooks, gadgets, fashion, food, hostel essentials and local services on ABSU Trade.",
  url: "https://www.absutrade.com.ng",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "",
} as const;

/**
 * Membership rules. These are the ONLY source of truth in the frontend.
 * The database enforces the same rules; the browser never decides eligibility.
 */
export const membership = {
  /** The first N approved sellers get lifetime-free seller access. Buyers never use these slots. */
  freeSlotLimit: 50,
  /** Monthly price in naira (display) and kobo (what Paystack charges). */
  priceNaira: 1500,
  priceKobo: 150_000,
  /** Each successful payment extends access by this many days. */
  periodDays: 30,
  /** Paid members may renew during the last N days before expiry (prevents accidental double payment). */
  renewWindowDays: 7,
  currency: "NGN",
} as const;

export const STORAGE_BUCKET = "product-images";
export const MAX_IMAGES_PER_PRODUCT = 5;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB after compression
export const PAGE_SIZE = 12;

export const PRODUCT_CONDITIONS = [
  { value: "new", label: "Brand new" },
  { value: "like_new", label: "Like new" },
  { value: "used", label: "Used" },
] as const;

export const ORDER_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
export const PRODUCT_STATUSES = ["pending", "approved", "rejected", "sold", "archived"] as const;
