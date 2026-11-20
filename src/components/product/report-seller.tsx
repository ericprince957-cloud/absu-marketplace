"use client";

import { useActionState, useState } from "react";
import { Flag } from "lucide-react";
import { submitSellerReport } from "@/app/admin/actions";
import { initialState } from "@/lib/action-state";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";

const reasons = [
  ["scam_or_fraud", "Scam or fraud"],
  ["fake_or_misleading_listing", "Fake or misleading listing"],
  ["unsafe_or_abusive", "Unsafe behaviour or abuse"],
  ["payment_issue", "Payment problem"],
  ["unresponsive_seller", "Seller is unresponsive"],
  ["other", "Other"],
];

export function ReportSeller({ sellerId, productId }: { sellerId: string; productId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(submitSellerReport, initialState);
  return (
    <section className="rounded-xl border border-stone-200 p-4">
      <button type="button" onClick={() => setOpen(!open)} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-stone-700 hover:text-stone-950">
        <Flag className="size-4" aria-hidden /> Report this seller
      </button>
      {open ? (
        <form action={action} className="mt-3 space-y-3">
          <input type="hidden" name="seller_id" value={sellerId} />
          <input type="hidden" name="product_id" value={productId} />
          <FormMessage state={state} />
          <label className="block space-y-1 text-sm font-medium">What happened?
            <select name="reason" required className="h-11 w-full rounded-xl border border-stone-300 bg-white px-3 font-normal">
              <option value="">Choose a reason</option>
              {reasons.map(([value,label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="block space-y-1 text-sm font-medium">Tell us what happened
            <textarea name="details" required minLength={10} maxLength={1000} rows={4} placeholder="Include useful details such as what happened and when..." className="w-full rounded-xl border border-stone-300 px-3 py-2 font-normal" />
          </label>
          <p className="text-xs text-stone-500">Your account is attached to the report so our admin team can follow up if needed. Do not include passwords or bank PINs.</p>
          <div className="flex flex-wrap gap-2">
            <SubmitButton size="sm" pendingText="Sending report...">Submit report</SubmitButton>
            <button type="button" onClick={() => setOpen(false)} className="min-h-10 rounded-xl border border-stone-300 px-4 text-sm">Cancel</button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
