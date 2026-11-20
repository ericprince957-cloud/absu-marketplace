import type { Metadata } from "next";
import Link from "next/link";
import { Bell, Heart, ReceiptText } from "lucide-react";
import { MembershipCard } from "@/components/membership/membership-card";
import { Alert } from "@/components/ui/feedback";
import { Card, PageHeader, Stat } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { getMembership, getProfile, requireUser } from "@/lib/auth";
import { countMyOrders, countMySaved, countUnreadNotifications } from "@/lib/data/counts";
import { getFreeSlotsRemaining } from "@/lib/data/membership";
import { first } from "@/lib/utils";
export const metadata: Metadata = { title: "Overview" };
export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser("/dashboard");
  const sp = await searchParams;
  const [profile, info, orders, saved, unread, slots] = await Promise.all([getProfile(user.id), getMembership(user.id), countMyOrders(user.id), countMySaved(user.id), countUnreadNotifications(user.id), getFreeSlotsRemaining()]);
  const name = profile?.full_name?.split(" ")[0] ?? "there";
  const profileIncomplete = !profile?.phone && !profile?.whatsapp;
  return <>
    <PageHeader title={`Hi, ${name}`} description="Your account at a glance." />
    <div className="min-w-0 space-y-5 sm:space-y-6">
      {first(sp.verified) ? <Alert tone="success" title="Email verified">Your account is active. Welcome to ABSU Marketplace.</Alert> : null}
      {profileIncomplete ? <Alert tone="info" title="Add your phone number">Sellers and buyers contact each other by WhatsApp or phone. <Link href="/dashboard/profile" className="font-semibold underline">Complete your profile</Link>.</Alert> : null}
      <MembershipCard info={info} slotsRemaining={slots} />
      <div className="grid min-w-0 grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:gap-4">
        <Stat label="Orders" value={orders} /><Stat label="Saved" value={saved} /><Stat label="Unread" value={unread} />
      </div>
      <Card className="grid min-w-0 gap-2 sm:grid-cols-3 sm:gap-3">
        <LinkButton href="/dashboard/orders" variant="outline" className="w-full min-w-0 whitespace-normal"><ReceiptText className="size-4 shrink-0" aria-hidden /> My orders</LinkButton>
        <LinkButton href="/dashboard/saved" variant="outline" className="w-full min-w-0 whitespace-normal"><Heart className="size-4 shrink-0" aria-hidden /> Saved products</LinkButton>
        <LinkButton href="/dashboard/notifications" variant="outline" className="w-full min-w-0 whitespace-normal"><Bell className="size-4 shrink-0" aria-hidden /> Notifications</LinkButton>
      </Card>
    </div>
  </>;
}
