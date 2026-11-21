import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { markNotificationsRead } from "@/app/dashboard/actions";
import { NotificationItem } from "@/components/notifications/notification-item";
import { PageHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
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
        description="Open any notification to read its message. Viewing it automatically marks it as read."
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
          {items.map((notification) => <NotificationItem key={notification.id} notification={notification} />)}
        </ul>
      )}
    </>
  );
}
