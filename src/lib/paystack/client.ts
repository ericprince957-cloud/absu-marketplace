import "server-only";
import type { PaystackTransaction } from "@/lib/paystack/evaluate";

const BASE_URL = "https://api.paystack.co";

export class PaystackNotConfiguredError extends Error {
  constructor() {
    super("PAYSTACK_SECRET_KEY is not set.");
    this.name = "PaystackNotConfiguredError";
  }
}

export function getPaystackSecret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!key) throw new PaystackNotConfiguredError();
  return key;
}

export function isPaystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY?.trim());
}

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getPaystackSecret()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  const json = (await res.json().catch(() => null)) as { status?: boolean; message?: string; data?: T } | null;
  if (!res.ok || !json?.status || json.data === undefined) {
    throw new Error(`Paystack ${path} failed (${res.status}): ${json?.message ?? "no message"}`);
  }
  return json.data;
}

export interface InitializeInput {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  cancelUrl: string;
  userId: string;
}

export function initializeTransaction(input: InitializeInput) {
  return paystackFetch<{ authorization_url: string; access_code: string; reference: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: {
        user_id: input.userId,
        purpose: "membership",
        // Shown on the Paystack dashboard to help you recognise the payment.
        custom_fields: [{ display_name: "Purpose", variable_name: "purpose", value: "ABSU Marketplace monthly membership" }],
        // Paystack reads `cancel_action` from metadata: where to send the customer if they cancel.
        cancel_action: input.cancelUrl,
      },
    }),
  });
}

/** Ask Paystack directly for the real status of a payment. Never trust the browser or a redirect. */
export function verifyTransaction(reference: string) {
  return paystackFetch<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
}
