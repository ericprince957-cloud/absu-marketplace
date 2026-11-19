import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTransaction } from "@/lib/paystack/client";
import { evaluateTransaction } from "@/lib/paystack/evaluate";

export type ProcessOutcome =
  | "applied" // membership extended just now
  | "duplicate" // already processed earlier (callback and webhook both arrived)
  | "failed"
  | "abandoned"
  | "pending" // customer has not finished paying yet
  | "rejected" // success on Paystack but amount/currency/reference did not match: needs manual review
  | "error"; // temporary problem: safe to retry

/**
 * THE single place where a membership payment turns into access.
 *
 * Both the browser callback and the webhook call this. It:
 *  1. asks Paystack's server for the real transaction status (never trusts the caller),
 *  2. checks amount and currency,
 *  3. calls a database function that is idempotent per reference, so running it
 *     twice can never extend membership twice.
 */
export async function processMembershipPayment(reference: string): Promise<ProcessOutcome> {
  let tx;
  try {
    tx = await verifyTransaction(reference);
  } catch (err) {
    console.error("[paystack] verify failed:", err instanceof Error ? err.message : err);
    return "error";
  }

  // The reference in Paystack's answer must be the one we asked about.
  if (tx.reference !== reference) {
    console.error("[paystack] reference mismatch", { asked: reference, got: tx.reference });
    return "rejected";
  }

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (err) {
    console.error("[paystack] cannot record payment:", err instanceof Error ? err.message : err);
    return "error";
  }
  const evaluation = evaluateTransaction(tx);

  if (evaluation.decision === "wait") return "pending";

  if (evaluation.decision === "failed" || evaluation.decision === "abandoned") {
    const status = evaluation.decision;
    const { error } = await supabase.rpc("mark_payment_status", { p_reference: reference, p_status: status, p_raw: tx });
    if (error) {
      console.error("[paystack] mark_payment_status failed:", error.message);
      return "error";
    }
    return status;
  }

  if (evaluation.decision === "reject") {
    console.error("[paystack] PAYMENT NEEDS REVIEW:", reference, evaluation.reason);
    const { error } = await supabase.rpc("mark_payment_status", {
      p_reference: reference,
      p_status: "failed",
      p_raw: { ...tx, absu_review_reason: evaluation.reason },
    });
    if (error) console.error("[paystack] mark_payment_status failed:", error.message);
    return "rejected";
  }

  // decision === "grant"
  const { data, error } = await supabase.rpc("apply_membership_payment", {
    p_reference: reference,
    p_amount_kobo: tx.amount,
    p_currency: tx.currency,
    p_paystack_transaction_id: String(tx.id),
    p_paid_at: tx.paid_at ?? new Date().toISOString(),
    p_metadata_user_id: tx.metadata?.user_id ?? null,
    p_raw: tx,
  });

  if (error) {
    if (error.message.includes("unknown_reference") || error.message.includes("user_mismatch")) {
      console.error("[paystack] PAYMENT NEEDS REVIEW:", reference, error.message);
      return "rejected";
    }
    console.error("[paystack] apply_membership_payment failed:", error.message);
    return "error";
  }

  const result = (Array.isArray(data) ? data[0] : data) as { duplicate?: boolean } | null;
  return result?.duplicate ? "duplicate" : "applied";
}
