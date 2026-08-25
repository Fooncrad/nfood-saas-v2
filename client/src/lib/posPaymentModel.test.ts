import { describe, expect, it } from "vitest";
import {
  formatPaymentCents,
  getPaymentSplitRemainingCents,
  hasExactPaymentSplit,
  normalizePaymentSplits,
} from "./posPaymentModel";

describe("POS payment split model", () => {
  it("normalizes decimal amounts to integer cents and ignores invalid rows", () => {
    expect(
      normalizePaymentSplits([
        { method: "cash", amount: "12.34" },
        { method: "card", amount: "" },
        { method: "online", amount: "not-a-number" },
      ])
    ).toEqual([{ method: "cash", amountCents: 1234 }]);
  });

  it("returns the exact remaining amount and accepts only an exact split", () => {
    const splits = normalizePaymentSplits([
      { method: "cash", amount: "30" },
      { method: "card", amount: "20" },
    ]);

    expect(getPaymentSplitRemainingCents(6000, splits)).toBe(1000);
    expect(hasExactPaymentSplit(6000, splits)).toBe(false);
    expect(
      hasExactPaymentSplit(6000, [
        ...splits,
        { method: "online", amountCents: 1000 },
      ])
    ).toBe(true);
  });

  it("formats seeded split values without locale-specific numerals", () => {
    expect(formatPaymentCents(12345)).toBe("123.45");
  });
});
