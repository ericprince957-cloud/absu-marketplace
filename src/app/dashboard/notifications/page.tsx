import type { Metadata } from "next";
import Link from "next/link";
import { Bell } from "lucide-react";
import { markNotificationsRead } from "@/app/dashboard/actions";
import { Card, PageHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cn, formatDateTime } from "@/lib/utils";
import type { Notification } from "@/types";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser("/dashboard/notifications");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) console.error("[data] notifications failed:", error.message);
  const items = (data ?? []) as Notification[];
  const unread = items.some((n) => !n.is_read);

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Updates about orders, listings and your membership."
        actions={
          unread ? (
            <form action={markNotificationsRead}>
              <SubmitButton variant="outline" size="sm" pendingText="Updating...">Mark all as read</SubmitButton>
            </form>
          ) : undefined
        }
      />
      {items.length === 0 ? (
        <EmptyState icon={<Bell className="size-10" aria-hidden />} title="You are all caught up" description="New notifications will appear here." />
      ) : (
        <ul className="space-y-3">
          {items.map((n) => {
            const body = (
              <Card className={cn("p-4", !n.is_read && "border-brand-300 bg-brand-50/50")}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-stone-900">{n.title}</p>
                  <time className="shrink-0 text-xs text-stone-500" dateTime={n.created_at}>{formatDateTime(n.created_at)}</time>
                </div>
                {n.body ? <p className="mt-1 text-sm text-stone-600">{n.body}</p> : null}
              </Card>
            );
            return (
              <li key={n.id}>
                {n.link && n.link.startsWith("/") && !n.link.startsWith("//") ? <Link href={n.link}>{body}</Link> : body}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
