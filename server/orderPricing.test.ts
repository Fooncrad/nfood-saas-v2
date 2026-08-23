import { describe, expect, it } from "vitest";
import { calculateOrderPricing, centsToMoney } from "./orderPricing";

describe("central order pricing", () => {
  it("calculates discount then tax from the discounted subtotal", () => {
    const pricing = calculateOrderPricing([{ unitPrice: "100.00", quantity: 2 }, { unitPrice: "5.50", quantity: 1 }], 10, 15);
    expect(pricing.subtotalCents).toBe(20550);
    expect(pricing.discountCents).toBe(2055);
    expect(pricing.taxCents).toBe(2774);
    expect(pricing.totalCents).toBe(21269);
    expect(centsToMoney(pricing.totalCents)).toBe("212.69");
  });

  it("clamps invalid rates and quantities safely", () => {
    const pricing = calculateOrderPricing([{ unitPrice: "10.00", quantity: -2 }, { unitPrice: "4.99", quantity: 1.9 }], 150, -5);
    expect(pricing.subtotalCents).toBe(499);
    expect(pricing.discountCents).toBe(499);
    expect(pricing.taxCents).toBe(0);
    expect(pricing.totalCents).toBe(0);
  });
});
