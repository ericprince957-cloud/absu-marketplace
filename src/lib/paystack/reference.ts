import { randomUUID } from "node:crypto";

const PREFIX = "ABSU-";
const REF_RE = /^ABSU-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Unique, unguessable payment reference created on the server for every checkout. */
export function generateReference(): string {
  return `${PREFIX}${randomUUID()}`;
}

/** True only for references this app generated (blocks other products on the same Paystack account). */
export function isMembershipReference(value: unknown): value is string {
  return typeof value === "string" && REF_RE.test(value);
}
