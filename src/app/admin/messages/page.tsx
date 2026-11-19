import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import type { SupportMessage } from "@/types";

export const metadata: Metadata = { title: "Support inbox" };

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("support_messages").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) console.error("[admin] messages failed:", error.message);
  const messages = (data ?? []) as SupportMessage[];

  return (
    <>
      <PageHeader title="Support inbox" description="Messages sent from the contact page. Reply by email." />
      {messages.length === 0 ? (
        <EmptyState title="Inbox is empty" />
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id}>
              <Card className="space-y-2 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold">{m.subject}</p>
                  <time className="text-xs text-stone-500" dateTime={m.created_at}>{formatDateTime(m.created_at)}</time>
                </div>
                <p className="text-xs text-stone-500">
                  {m.name} · <a href={`mailto:${m.email}`} className="text-brand-700 hover:underline">{m.email}</a>
                </p>
                <p className="whitespace-pre-line text-sm text-stone-700">{m.message}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
