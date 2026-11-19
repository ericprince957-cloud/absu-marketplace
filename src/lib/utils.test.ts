import { describe, expect, it } from "vitest";
import { safeNextPath, sanitizeSearch, toWhatsAppNumber, pageNumber } from "./utils";

describe("safeNextPath", () => {
  it("allows internal paths", () => {
    expect(safeNextPath("/dashboard/orders")).toBe("/dashboard/orders");
  });
  it("blocks absolute and protocol-relative URLs", () => {
    expect(safeNextPath("https://evil.com")).toBe("/dashboard");
    expect(safeNextPath("//evil.com")).toBe("/dashboard");
    expect(safeNextPath("/\\evil.com")).toBe("/dashboard");
  });
  it("uses the fallback for empty input", () => {
    expect(safeNextPath(null, "/x")).toBe("/x");
  });
});

describe("sanitizeSearch", () => {
  it("strips filter-breaking characters", () => {
    expect(sanitizeSearch("laptop,price.eq.1)")).toBe("laptop price.eq.1");
    expect(sanitizeSearch("100%_off")).toBe("100 off");
  });
  it("limits length", () => {
    expect(sanitizeSearch("a".repeat(500)).length).toBe(80);
  });
});

describe("toWhatsAppNumber", () => {
  it("converts local numbers", () => {
    expect(toWhatsAppNumber("0803 123 4567")).toBe("2348031234567");
    expect(toWhatsAppNumber("+234 803 123 4567")).toBe("2348031234567");
  });
  it("rejects short numbers", () => {
    expect(toWhatsAppNumber("123")).toBeNull();
  });
});

describe("pageNumber", () => {
  it("defaults to 1 for bad values", () => {
    expect(pageNumber(undefined)).toBe(1);
    expect(pageNumber("-4")).toBe(1);
    expect(pageNumber("abc")).toBe(1);
    expect(pageNumber("3")).toBe(3);
  });
});
