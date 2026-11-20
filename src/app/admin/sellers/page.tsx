import type { Metadata } from "next";
import { reviewSellerApplication } from "@/app/admin/actions";
import { Card, PageHeader } from "@/components/ui/card";
import { EmptyState, StatusBadge } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import type { SellerApplication } from "@/types";

export const metadata: Metadata = { title: "Seller applications" };

export default async function AdminSellersPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("seller_applications")
    .select("*, profiles:profiles!seller_applications_user_id_fkey(full_name,email,phone,whatsapp)")
    .order("created_at", { ascending: false }).limit(100);
  if (error) console.error("[admin] applications failed:", error.message);
  const apps = (data ?? []) as unknown as (SellerApplication & { location?: string | null; profiles?: { full_name: string | null; email?: string | null; phone?: string | null; whatsapp?: string | null } | null })[];
  const pending = apps.filter((a) => a.status === "pending");
  const done = apps.filter((a) => a.status !== "pending");
  return (
    <>
      <PageHeader title="Seller applications" description="Review basic identity, contact and pickup details. Applicants do not need to be ABSU students." />
      <section className="space-y-4">
        <h2 className="text-lg font-bold">Waiting for review ({pending.length})</h2>
        {pending.length === 0 ? <EmptyState title="No applications waiting" /> : pending.map((a) => (
          <Card key={a.id} className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div><p className="font-semibold">{a.profiles?.full_name ?? "Name not provided"}</p><p className="text-xs text-stone-500">{a.profiles?.email ?? "No email"} · applied {formatDateTime(a.created_at)}</p></div>
              <StatusBadge status={a.status} />
            </div>
            <div className="grid gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm sm:grid-cols-2">
              <p><span className="text-stone-500">Shop:</span> <strong>{a.business_name}</strong></p>
              <p><span className="text-stone-500">Phone:</span> <strong>{a.phone}</strong></p>
              <p><span className="text-stone-500">WhatsApp:</span> <strong>{a.profiles?.whatsapp ?? a.phone}</strong></p>
              <p><span className="text-stone-500">Pickup area:</span> <strong>{a.location ?? "Not provided"}</strong></p>
              <p className="sm:col-span-2"><span className="text-stone-500">Account email:</span> <strong>{a.profiles?.email ?? "Not available"}</strong></p>
            </div>
            <p className="whitespace-pre-line text-sm text-stone-700">{a.description}</p>
            {a.categories_text ? <p className="text-xs text-stone-500">Category: {a.categories_text}</p> : null}
            <form action={reviewSellerApplication} className="space-y-3 border-t border-stone-100 pt-3">
              <input type="hidden" name="application_id" value={a.id} />
              <input name="note" maxLength={300} placeholder="Reason or note (required when rejecting)" className="h-10 w-full rounded-xl border border-stone-300 px-3 text-sm" />
              <div className="flex flex-wrap gap-2">
                <SubmitButton name="decision" value="approve" size="sm" pendingText="Saving...">Approve seller</SubmitButton>
                <SubmitButton name="decision" value="reject" size="sm" variant="danger" pendingText="Saving...">Reject</SubmitButton>
              </div>
            </form>
          </Card>
        ))}
      </section>
      {done.length > 0 ? <section className="mt-10 space-y-3"><h2 className="text-lg font-bold">Reviewed</h2>{done.map((a) => <div key={a.id} className="flex justify-between rounded-xl border border-stone-200 bg-white p-3 text-sm"><span>{a.business_name} · {a.profiles?.full_name}</span><StatusBadge status={a.status} /></div>)}</section> : null}
    </>
  );
}
