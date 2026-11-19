import { NextResponse, type NextRequest } from "next/server";
import { isPaystackConfigured } from "@/lib/paystack/client";
import { isMembershipReference } from "@/lib/paystack/reference";
import { processMembershipPayment, type ProcessOutcome } from "@/lib/paystack/process";

export const dynamic = "force-dynamic";

const OUTCOME_TO_FLAG: Record<ProcessOutcome, string> = {
  applied: "success",
  duplicate: "success",
  failed: "failed",
  abandoned: "cancelled",
  pending: "pending",
  rejected: "review",
  error: "pending",
};

/**
 * Where Paystack sends the customer after checkout (?reference=...&trxref=...).
 * Returning here proves NOTHING. We ask Paystack's server for the real result
 * before granting anything, then redirect to the membership page.
 */
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference") ?? request.nextUrl.searchParams.get("trxref");
  const to = (flag: string) => NextResponse.redirect(new URL(`/dashboard/membership?payment=${flag}`, request.nextUrl.origin));

  if (!isMembershipReference(reference) || !isPaystackConfigured()) return to("error");

  const outcome = await processMembershipPayment(reference);
  return to(OUTCOME_TO_FLAG[outcome]);
}
