import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { evaluateTransaction, type PaystackTransaction } from "./evaluate";
import { isMembershipReference } from "./reference";
import { verifyWebhookSignature } from "./signature";

const secret = "sk_test_example_secret";
const body = JSON.stringify({ event: "charge.success", data: { reference: "ABSU-123" } });
const sign = (b: string, s = secret) => createHmac("sha512", s).update(b).digest("hex");

describe("verifyWebhookSignature", () => {
  it("accepts a correct signature", () => {
    expect(verifyWebhookSignature(body, sign(body), secret)).toBe(true);
  });
  it("rejects a signature made with another key", () => {
    expect(verifyWebhookSignature(body, sign(body, "sk_test_other"), secret)).toBe(false);
  });
  it("rejects a tampered body", () => {
    expect(verifyWebhookSignature(body + " ", sign(body), secret)).toBe(false);
  });
  it("rejects missing signature or secret", () => {
    expect(verifyWebhookSignature(body, null, secret)).toBe(false);
    expect(verifyWebhookSignature(body, sign(body), "")).toBe(false);
  });
  it("rejects wrong-length signatures without throwing", () => {
    expect(verifyWebhookSignature(body, "abc", secret)).toBe(false);
  });
});

const tx = (over: Partial<PaystackTransaction> = {}): PaystackTransaction => ({
  id: 1,
  status: "success",
  reference: "ABSU-x",
  amount: 150000,
  currency: "NGN",
  ...over,
});

describe("evaluateTransaction", () => {
  it("grants a correct successful payment", () => {
    expect(evaluateTransaction(tx())).toEqual({ decision: "grant" });
  });
  it("rejects wrong amount even when Paystack says success", () => {
    expect(evaluateTransaction(tx({ amount: 100 })).decision).toBe("reject");
  });
  it("rejects wrong currency", () => {
    expect(evaluateTransaction(tx({ currency: "USD" })).decision).toBe("reject");
  });
  it("maps failed, abandoned and in-progress states", () => {
    expect(evaluateTransaction(tx({ status: "failed" })).decision).toBe("failed");
    expect(evaluateTransaction(tx({ status: "abandoned" })).decision).toBe("abandoned");
    expect(evaluateTransaction(tx({ status: "ongoing" })).decision).toBe("wait");
  });
});

describe("isMembershipReference", () => {
  it("accepts our references only", () => {
    expect(isMembershipReference("ABSU-3f2b1c4e-9a7d-4c1e-8b2a-1234567890ab")).toBe(true);
    expect(isMembershipReference("OTHER-123")).toBe(false);
    expect(isMembershipReference("ABSU-../../etc")).toBe(false);
  });
});
