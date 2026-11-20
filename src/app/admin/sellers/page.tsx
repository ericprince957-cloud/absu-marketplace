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
  const { data, error } = await supabase
    .from("seller_applications")
    .select("*, profiles:profiles!seller_applications_user_id_fkey(full_name,email)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) console.error("[admin] applications failed:", error.message);
  const apps = (data ?? []) as unknown as SellerApplication[];
  const pending = apps.filter((a) => a.status === "pending");
  const done = apps.filter((a) => a.status !== "pending");

  const evidence = await Promise.all(pending.map(async (application) => {
    if (!application.verification_document_path) return [application.id, null] as const;
    const { data: signed } = await supabase.storage.from("seller-verification").createSignedUrl(application.verification_document_path, 300);
    return [application.id, signed?.signedUrl ?? null] as const;
  }));
  const evidenceUrls = new Map(evidence);

  return (
    <>
      <PageHeader title="Seller verification" description="Check each applicant's ABSU details and private student evidence before approving seller access." />
      <section className="space-y-4" aria-labelledby="pending-h">
        <h2 id="pending-h" className="text-lg font-bold">Waiting for verification ({pending.length})</h2>
        {pending.length === 0 ? <EmptyState title="No applications waiting" /> : pending.map((a) => (
          <Card key={a.id} className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{a.profiles?.full_name ?? "Unknown applicant"}</p>
                <p className="text-xs text-stone-500">{a.profiles?.email ?? "No email"} · {a.phone} · {formatDateTime(a.created_at)}</p>
              </div>
              <StatusBadge status={a.status} />
            </div>
            <div className="grid gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm sm:grid-cols-2">
              <p><span className="text-stone-500">Matric number:</span> <strong>{a.matric_number || "Not provided"}</strong></p>
              <p><span className="text-stone-500">Faculty:</span> <strong>{a.faculty || "Not provided"}</strong></p>
              <p><span className="text-stone-500">Department:</span> <strong>{a.department || "Not provided"}</strong></p>
              <p><span className="text-stone-500">Level:</span> <strong>{a.level || "Not provided"}</strong></p>
            </div>
            <div>
              <p className="text-sm font-semibold">{a.business_name}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-stone-700">{a.description}</p>
              {a.categories_text ? <p className="mt-1 text-xs text-stone-500">Categories: {a.categories_text}</p> : null}
            </div>
            {evidenceUrls.get(a.id) ? (
              <a href={evidenceUrls.get(a.id)!} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-xl border border-stone-300 px-3 text-sm font-semibold text-stone-900 underline-offset-4 hover:underline">View private student evidence</a>
            ) : (
              <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">No verification document is attached. Do not approve until valid evidence is reviewed.</p>
            )}
            <form action={reviewSellerApplication} className="space-y-3 border-t border-stone-100 pt-3">
              <input type="hidden" name="application_id" value={a.id} />
              <label htmlFor={`note-${a.id}`} className="sr-only">Note to applicant</label>
              <input id={`note-${a.id}`} name="note" maxLength={300} placeholder="Reason or note (required when rejecting)" className="h-10 w-full rounded-xl border border-stone-300 px-3 text-sm" />
              <div className="flex flex-wrap gap-2">
                <SubmitButton name="decision" value="approve" size="sm" pendingText="Saving...">Approve verified seller</SubmitButton>
                <SubmitButton name="decision" value="reject" size="sm" variant="danger" pendingText="Saving...">Reject</SubmitButton>
              </div>
            </form>
          </Card>
        ))}
      </section>
      {done.length > 0 ? (
        <section className="mt-10 space-y-3" aria-labelledby="done-h">
          <h2 id="done-h" className="text-lg font-bold">Reviewed</h2>
          <ul className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
            {done.map((a) => <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm"><span><span className="font-medium">{a.business_name}</span><span className="text-stone-500"> · {a.profiles?.full_name ?? "Unknown"}</span></span><StatusBadge status={a.status} /></li>)}
          </ul>
        </section>
      ) : null}
    </>
  );
}
