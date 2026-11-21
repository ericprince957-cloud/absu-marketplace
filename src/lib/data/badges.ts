import { cache } from "react";
import { getUser } from "@/lib/auth";
import { countMySaved, countPendingSellerOrders, countUnreadNotifications } from "@/lib/data/counts";

export interface NavBadges {
  saved: number;
  notifications: number;
  /** Orders waiting for the seller to act on. */
  sellerOrders: number;
}

const EMPTY: NavBadges = { saved: 0, notifications: 0, sellerOrders: 0 };

/** Counters shown on navigation icons. Zero (hidden) when signed out. Cached per request. */
export const getNavBadges = cache(async (): Promise<NavBadges> => {
  const user = await getUser();
  if (!user) return EMPTY;
  const [saved, notifications, sellerOrders] = await Promise.all([
    countMySaved(user.id),
    countUnreadNotifications(user.id),
    countPendingSellerOrders(user.id),
  ]);
  return { saved, notifications, sellerOrders };
});

/** Which badge belongs to which nav link (dashboard / seller menus). */
export function badgeForHref(href: string, b: NavBadges): number {
  if (href === "/dashboard/notifications") return b.notifications;
  if (href === "/dashboard/saved") return b.saved;
  if (href === "/seller/orders") return b.sellerOrders;
  return 0;
}
