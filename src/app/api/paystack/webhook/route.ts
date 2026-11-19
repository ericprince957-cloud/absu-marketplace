import { NextResponse, type NextRequest } from "next/server";
import { isPaystackConfigured, getPaystackSecret } from "@/lib/paystack/client";
import { isMembershipReference } from "@/lib/paystack/reference";
import { verifyWebhookSignature } from "@/lib/paystack/signature";
import { processMembershipPayment } from "@/lib/paystack/process";

export const dynamic = "force-dynamic";

/**
 * Paystack server-to-server notifications.
 * Set this URL in Paystack Dashboard > Settings > API Keys & Webhooks:
 *   https://YOUR-DOMAIN/api/paystack/webhook
 *
 * Status codes matter: Paystack retries on anything other than 2xx.
 *  - 401: bad signature (never retried successfully, never processed)
 *  - 200: handled, duplicate, or deliberately ignored
 *  - 500: temporary problem on our side, please retry
 */
export async function POST(request: NextRequest) {
  if (!isPaystackConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  // Must read the RAW body: the signature is computed over the exact bytes Paystack sent.
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature, getPaystackSecret())) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Only successful charges can grant access. Everything else is acknowledged and ignored.
  if (event.event !== "charge.success") return NextResponse.json({ received: true, ignored: event.event ?? "unknown" });

  const reference = event.data?.reference;
  // Ignore payments that did not come from this app (e.g. other projects on the same Paystack account).
  if (!isMembershipReference(reference)) return NextResponse.json({ received: true, ignored: "foreign_reference" });

  const outcome = await processMembershipPayment(reference);
  if (outcome === "error") return NextResponse.json({ error: "temporary_failure" }, { status: 500 });

  return NextResponse.json({ received: true, outcome });
}
