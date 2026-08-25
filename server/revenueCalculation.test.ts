import { describe, expect, it } from "vitest";
import { calculateRecognizedRevenue, isRecognizedRevenueOrder, parseRevenueMinorUnits } from "./db";

describe("recognized revenue calculation", () => {
  it("converts decimal money to minor units without multiplying the displayed amount", () => {
    expect(parseRevenueMinorUnits("123.45", 2)).toBe(12345);
    expect(parseRevenueMinorUnits("3,009.44", 2)).toBe(300944);
    expect(parseRevenueMinorUnits("123", 2) / 100).toBe(123);
  });

  it("recognizes only completed orders that are paid", () => {
    expect(isRecognizedRevenueOrder({ status: "completed", paymentStatus: "paid" })).toBe(true);
    expect(isRecognizedRevenueOrder({ status: "completed", paymentStatus: "unpaid" })).toBe(false);
    expect(isRecognizedRevenueOrder({ status: "cancelled", paymentStatus: "paid" })).toBe(false);
    expect(isRecognizedRevenueOrder({ status: "completed", paymentStatus: "refunded" })).toBe(false);
  });

  it("excludes cancelled, unpaid, and refunded orders from revenue", () => {
    const orders = [
      { total: "100.25", currencyDecimals: 2, status: "completed", paymentStatus: "paid" },
      { total: "9000.00", currencyDecimals: 2, status: "cancelled", paymentStatus: "paid" },
      { total: "8000.00", currencyDecimals: 2, status: "completed", paymentStatus: "unpaid" },
      { total: "50.00", currencyDecimals: 2, status: "completed", paymentStatus: "refunded" },
    ];
    expect(calculateRecognizedRevenue(orders)).toBe(100.25);
  });
});
