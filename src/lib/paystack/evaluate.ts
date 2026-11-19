import { membership } from "@/config/site";

/** The parts of Paystack's /transaction/verify response that we rely on. */
export interface PaystackTransaction {
  id: number | string;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string | null;
  metadata?: { user_id?: string; purpose?: string } | null;
}

export type Evaluation =
  | { decision: "grant" }
  | { decision: "reject"; reason: string }
  | { decision: "failed" }
  | { decision: "abandoned" }
  | { decision: "wait" };

/**
 * Decide what to do with a transaction that Paystack itself reported.
 * Never trust the amount or currency from the browser; only from Paystack's server.
 */
export function evaluateTransaction(tx: PaystackTransaction): Evaluation {
  switch (tx.status) {
    case "success": {
      if (tx.currency !== membership.currency) return { decision: "reject", reason: `unexpected currency ${tx.currency}` };
      if (tx.amount !== membership.priceKobo) {
        return { decision: "reject", reason: `amount ${tx.amount} does not match price ${membership.priceKobo}` };
      }
      return { decision: "grant" };
    }
    case "failed":
    case "reversed":
      return { decision: "failed" };
    case "abandoned":
      return { decision: "abandoned" };
    default:
      // ongoing, pending, processing, queued: the customer has not finished paying yet.
      return { decision: "wait" };
  }
}
