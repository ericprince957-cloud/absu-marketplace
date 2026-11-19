import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Paystack signs every webhook with HMAC-SHA512 of the RAW request body, using
 * your secret key, and sends it in the `x-paystack-signature` header.
 *
 * The raw text must be used (not re-serialised JSON) or the hash will not match.
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null | undefined, secret: string): boolean {
  if (!signatureHeader || !secret) return false;

  const expected = createHmac("sha512", secret).update(rawBody, "utf8").digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signatureHeader.trim().toLowerCase(), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
