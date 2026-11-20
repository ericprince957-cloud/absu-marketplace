import type { Metadata } from "next";
import Link from "next/link";
import { updateSellerReport } from "@/app/admin/actions";
import { Card, PageHeader } from "@/components/ui/card";
import { EmptyState, StatusBadge } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Seller reports" };
const reasonLabels: Record<string,string> = {
  scam_or_fraud: "Scam or fraud",
  fake_or_misleading_listing: "Fake or misleading listing",
  unsafe_or_abusive: "Unsafe behaviour or abuse",
  payment_issue: "Payment problem",
  unresponsive_seller: "Unresponsive seller",
  other: "Other",
};

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("seller_reports").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) console.error("[admin] seller reports failed:", error.message);
  const reports = data ?? [];
  const ids = [...new Set(reports.flatMap((r) => [r.reporter_id, r.seller_id]))];
  const productIds = [...new Set(reports.map((r) => r.product_id).filter(Boolean))] as string[];
  const [{ data: profiles }, { data: products }] = await Promise.all([
    ids.length ? supabase.from("profiles").select("id,full_name,email,phone,whatsapp").in("id", ids) : Promise.resolve({data:[]}),
    productIds.length ? supabase.from("products").select("id,title").in("id", productIds) : Promise.resolve({data:[]}),
  ]);
  const people = new Map((profiles ?? []).map((p) => [p.id,p]));
  const listings = new Map((products ?? []).map((p) => [p.id,p]));
  return (
    <>
      <PageHeader title="Seller reports" description="Reports are linked to the seller account and listing, so you can identify and contact the people involved." />
      {reports.length === 0 ? <EmptyState title="No reports yet" description="Reports submitted by marketplace users will appear here." /> : (
        <div className="space-y-4">
          {reports.map((r) => {
            const seller = people.get(r.seller_id);
            const reporter = people.get(r.reporter_id);
            const product = r.product_id ? listings.get(r.product_id) : null;
            return <Card key={r.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{reasonLabels[r.reason] ?? r.reason}</p><StatusBadge status={r.status} /></div>
              <p className="whitespace-pre-line text-sm text-stone-700">{r.details}</p>
              <div className="grid gap-3 rounded-xl bg-stone-50 p-3 text-sm sm:grid-cols-2">
                <div><p className="mb-1 text-xs font-semibold uppercase text-stone-500">Reported seller</p><p className="font-semibold">{seller?.full_name ?? "Account name unavailable"}</p><p>{seller?.email ?? "No email"}</p><p>{seller?.phone ?? "No phone"} · WhatsApp {seller?.whatsapp ?? "not set"}</p><p className="break-all text-xs text-stone-500">Account ID: {r.seller_id}</p></div>
                <div><p className="mb-1 text-xs font-semibold uppercase text-stone-500">Reported by</p><p className="font-semibold">{reporter?.full_name ?? "Unknown reporter"}</p><p>{reporter?.email ?? "No email"}</p><p>{reporter?.phone ?? "No phone"}</p><p className="break-all text-xs text-stone-500">Account ID: {r.reporter_id}</p></div>
              </div>
              {product ? <p className="text-sm">Listing: <Link className="font-semibold underline" href={`/product/${product.id}`}>{product.title}</Link></p> : null}
              <p className="text-xs text-stone-500">Reported {formatDateTime(r.created_at)}</p>
              <form action={updateSellerReport} className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3">
                <input type="hidden" name="report_id" value={r.id} />
                <select name="status" defaultValue={r.status} className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm">
                  <option value="open">Open</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option>
                </select>
                <input name="admin_note" defaultValue={r.admin_note ?? ""} maxLength={500} placeholder="Admin note" className="h-10 min-w-0 flex-1 rounded-xl border border-stone-300 px-3 text-sm" />
                <SubmitButton size="sm" pendingText="Saving...">Update report</SubmitButton>
              </form>
            </Card>;
          })}
        </div>
      )}
    </>
  );
}
