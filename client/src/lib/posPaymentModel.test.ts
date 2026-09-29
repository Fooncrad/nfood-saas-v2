import { describe, expect, it } from "vitest";
import {
  formatPaymentCents,
  getPaymentSplitRemainingCents,
  hasExactPaymentSplit,
  normalizePaymentSplits,
} from "./posPaymentModel";
import { shouldRetryPosOffline } from "./posOfflineStore";

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


describe("POS offline retry classification", () => {
  it.each(["BAD_REQUEST", "FORBIDDEN", "UNAUTHORIZED", "NOT_FOUND", "PRECONDITION_FAILED", "UNPROCESSABLE_CONTENT", "CONFLICT"])(
    "does not turn terminal %s errors into pending sync retries",
    (code) => {
      expect(shouldRetryPosOffline({ data: { code } })).toBe(false);
    },
  );

  it("reads terminal codes from nested TRPC error shapes", () => {
    expect(shouldRetryPosOffline({ shape: { data: { code: "FORBIDDEN" } } })).toBe(false);
  });

  it("retries network and temporary server failures", () => {
    expect(shouldRetryPosOffline(new Error("network unavailable"))).toBe(true);
    expect(shouldRetryPosOffline({ data: { code: "INTERNAL_SERVER_ERROR" } })).toBe(true);
    expect(shouldRetryPosOffline({ data: { code: "TIMEOUT" } })).toBe(true);
  });
});
