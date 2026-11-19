import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const verifyTransaction = vi.fn();
const rpc = vi.fn();
vi.mock("@/lib/paystack/client", () => ({ verifyTransaction: (...a: unknown[]) => verifyTransaction(...a) }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc: (...a: unknown[]) => rpc(...a) }) }));

import { processMembershipPayment } from "./process";

const REF = "ABSU-3f2b1c4e-9a7d-4c1e-8b2a-1234567890ab";
const tx = (over: Record<string, unknown> = {}) => ({
  id: 99,
  status: "success",
  reference: REF,
  amount: 150000,
  currency: "NGN",
  paid_at: "2026-11-18T10:00:00Z",
  metadata: { user_id: "u1" },
  ...over,
});

beforeEach(() => {
  verifyTransaction.mockReset();
  rpc.mockReset();
});

describe("processMembershipPayment", () => {
  it("grants access for a correct successful payment", async () => {
    verifyTransaction.mockResolvedValue(tx());
    rpc.mockResolvedValue({ data: { duplicate: false }, error: null });

    expect(await processMembershipPayment(REF)).toBe("applied");
    expect(rpc).toHaveBeenCalledWith(
      "apply_membership_payment",
      expect.objectContaining({ p_reference: REF, p_amount_kobo: 150000, p_currency: "NGN", p_metadata_user_id: "u1" }),
    );
  });

  it("reports duplicates when the database says it already processed this reference", async () => {
    verifyTransaction.mockResolvedValue(tx());
    rpc.mockResolvedValue({ data: { duplicate: true }, error: null });
    expect(await processMembershipPayment(REF)).toBe("duplicate");
  });

  it("NEVER grants when the amount is wrong, even if Paystack says success", async () => {
    verifyTransaction.mockResolvedValue(tx({ amount: 5000 }));
    rpc.mockResolvedValue({ data: null, error: null });

    expect(await processMembershipPayment(REF)).toBe("rejected");
    const called = rpc.mock.calls.map((c) => c[0]);
    expect(called).not.toContain("apply_membership_payment");
    expect(called).toContain("mark_payment_status");
  });

  it("rejects when Paystack answers for a different reference", async () => {
    verifyTransaction.mockResolvedValue(tx({ reference: "ABSU-other" }));
    expect(await processMembershipPayment(REF)).toBe("rejected");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("records failed and abandoned payments without granting", async () => {
    verifyTransaction.mockResolvedValue(tx({ status: "failed" }));
    rpc.mockResolvedValue({ data: null, error: null });
    expect(await processMembershipPayment(REF)).toBe("failed");

    verifyTransaction.mockResolvedValue(tx({ status: "abandoned" }));
    expect(await processMembershipPayment(REF)).toBe("abandoned");
    expect(rpc.mock.calls.every((c) => c[0] === "mark_payment_status")).toBe(true);
  });

  it("does nothing while the customer is still paying", async () => {
    verifyTransaction.mockResolvedValue(tx({ status: "ongoing" }));
    expect(await processMembershipPayment(REF)).toBe("pending");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns a retryable error when Paystack is unreachable", async () => {
    verifyTransaction.mockRejectedValue(new Error("network down"));
    expect(await processMembershipPayment(REF)).toBe("error");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns a retryable error when the database call fails", async () => {
    verifyTransaction.mockResolvedValue(tx());
    rpc.mockResolvedValue({ data: null, error: { message: "connection reset" } });
    expect(await processMembershipPayment(REF)).toBe("error");
  });

  it("flags unknown references for manual review instead of retrying forever", async () => {
    verifyTransaction.mockResolvedValue(tx());
    rpc.mockResolvedValue({ data: null, error: { message: "unknown_reference" } });
    expect(await processMembershipPayment(REF)).toBe("rejected");
  });
});
