import type { Metadata } from "next";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { markNotificationRead, markNotificationsRead } from "@/app/dashboard/actions";
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
        description="Open a notification to read the full message. It will then stop counting as unread."
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
          {items.map((n) => (
            <li key={n.id}>
              <details
                className="group"
                onToggle={undefined}
              >
                <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                  <Card className={cn("p-4 transition-colors group-open:rounded-b-none", !n.is_read && "border-brand-300 bg-brand-50/50")}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900">{n.title}</p>
                        <p className="mt-1 text-xs text-stone-500">{n.is_read ? "Read" : "Unread"} · Tap to view message</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <time className="text-xs text-stone-500" dateTime={n.created_at}>{formatDateTime(n.created_at)}</time>
                        {n.is_read ? <Check className="size-4 text-emerald-600" aria-label="Read" /> : <span className="size-2 rounded-full bg-brand-600" aria-label="Unread" />}
                      </div>
                    </div>
                  </Card>
                </summary>
                <div className={cn("rounded-b-xl border border-t-0 border-stone-200 bg-white p-4", !n.is_read && "border-brand-300")}>
                  {n.body ? <p className="whitespace-pre-wrap text-sm leading-6 text-stone-700">{n.body}</p> : <p className="text-sm text-stone-500">No additional message.</p>}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {!n.is_read ? (
                      <form action={markNotificationRead.bind(null, n.id)}>
                        <SubmitButton variant="outline" size="sm" pendingText="Saving...">Mark as read</SubmitButton>
                      </form>
                    ) : null}
                    {n.link && n.link.startsWith("/") && !n.link.startsWith("//") ? (
                      <Link className="text-sm font-semibold text-brand-700 underline underline-offset-4" href={n.link}>Open related page</Link>
                    ) : null}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
