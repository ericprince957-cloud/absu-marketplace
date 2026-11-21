"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { markNotificationRead } from "@/app/dashboard/actions";
import { Card } from "@/components/ui/card";
import { cn, formatDateTime } from "@/lib/utils";
import type { Notification } from "@/types";

export function NotificationItem({ notification }: { notification: Notification }) {
  const [open, setOpen] = useState(false);
  const [isRead, setIsRead] = useState(notification.is_read);
  const [isPending, startTransition] = useTransition();

  function toggleMessage() {
    const next = !open;
    setOpen(next);
    if (next && !isRead) {
      startTransition(async () => {
        await markNotificationRead(notification.id);
        setIsRead(true);
      });
    }
  }

  return (
    <li>
      <Card className={cn("overflow-hidden p-0 transition-colors", !isRead && "border-brand-300 bg-brand-50/50")}>
        <button type="button" onClick={toggleMessage} aria-expanded={open} className="w-full p-4 text-left">
          <span className="flex items-start justify-between gap-3">
            <span className="min-w-0">
              <span className="block font-semibold text-stone-900">{notification.title}</span>
              <span className="mt-1 block text-xs text-stone-500">{open ? "Tap to hide message" : "Tap to view message"}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <time className="text-xs text-stone-500" dateTime={notification.created_at}>{formatDateTime(notification.created_at)}</time>
              {isRead ? <Check className="size-4 text-emerald-600" aria-label="Read" /> : <span className="size-2 rounded-full bg-brand-600" aria-label="Unread" />}
            </span>
          </span>
        </button>
        {open ? (
          <div className="border-t border-stone-200 px-4 pb-4 pt-3">
            {notification.body ? <p className="whitespace-pre-wrap text-sm leading-6 text-stone-700">{notification.body}</p> : <p className="text-sm text-stone-500">No additional message.</p>}
            <div className="mt-3 flex items-center gap-2 text-xs text-stone-500">
              {isRead ? <><Check className="size-3 text-emerald-600" /> Read</> : isPending ? "Marking as read..." : "Opening message..."}
              {notification.link && notification.link.startsWith("/") && !notification.link.startsWith("//") ? (
                <Link className="ml-2 font-semibold text-brand-700 underline underline-offset-4" href={notification.link}>Open related page</Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </Card>
    </li>
  );
}
