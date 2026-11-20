import { NextResponse, type NextRequest } from "next/server";
import { membership } from "@/config/site";
import { getMembership, getRoles, getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { initializeTransaction, isPaystackConfigured } from "@/lib/paystack/client";
import { generateReference } from "@/lib/paystack/reference";

export const dynamic = "force-dynamic";

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** CSRF guard: the browser sends an Origin header on POST; it must match this site. */
function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients; still need a valid session cookie
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Starts a seller-access payment.
 * The amount is decided here on the server. The browser sends nothing about price.
 */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: "Forbidden." }, 403);

  const user = await getUser();
  if (!user || !user.email) return json({ error: "Please log in first." }, 401);
  if (!user.email_confirmed_at) return json({ error: "Verify your email before paying." }, 403);
  const roles = await getRoles(user.id);
  if (!roles.includes("seller")) return json({ error: "Seller approval is required before purchasing seller access." }, 403);

  if (!isPaystackConfigured()) {
    return json({ error: "Payments are not switched on yet. Please try again later." }, 503);
  }

  // Never charge permanent free members, and avoid accidental double payment.
  const current = await getMembership(user.id);
  if (current.state === "free_lifetime") {
    return json({ error: "You have lifetime-free seller access. You never need to pay." }, 409);
  }
  if (current.state === "active" && !current.canRenew) {
    return json({ error: `Your seller access is already active. You can renew within ${membership.renewWindowDays} days of expiry.` }, 409);
  }

  const reference = generateReference();

  // Record the pending payment first (as the user; the database function ties it to auth.uid()).
  const supabase = await createClient();
  const { error: pendingError } = await supabase.rpc("create_pending_payment", {
    p_reference: reference,
    p_amount_kobo: membership.priceKobo,
  });
  if (pendingError) {
    if (pendingError.message.includes("already_free")) return json({ error: "You have lifetime-free seller access." }, 409);
    console.error("[paystack] create_pending_payment failed:", pendingError.message);
    return json({ error: "We could not start your payment. Please try again." }, 500);
  }

  const siteUrl = await getSiteUrl();
  try {
    const init = await initializeTransaction({
      email: user.email,
      amountKobo: membership.priceKobo,
      reference,
      callbackUrl: `${siteUrl}/api/paystack/callback`,
      cancelUrl: `${siteUrl}/dashboard/membership?payment=cancelled`,
      userId: user.id,
    });
    return json({ authorization_url: init.authorization_url, reference });
  } catch (err) {
    console.error("[paystack] initialize failed:", err instanceof Error ? err.message : err);
    return json({ error: "Paystack is unavailable right now. Please try again in a moment." }, 502);
  }
}
