import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { NotificationItem } from "@/components/notifications/notification-item";
import { PageHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
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
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) console.error("[data] notifications failed:", error.message);
  const items = (data ?? []) as Notification[];

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Unread notifications appear here. Once opened, they are marked as read and removed from this list."
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
