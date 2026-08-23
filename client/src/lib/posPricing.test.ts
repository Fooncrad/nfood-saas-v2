import { describe, expect, it } from "vitest";
import { calculateCartCents, formatCents, parsePriceToCents } from "./posPricing";

describe("POS pricing", () => {
  it("normalizes decimal prices without floating point drift", () => {
    expect(parsePriceToCents("12.50")).toBe(1250);
    expect(parsePriceToCents("12,50")).toBe(1250);
    expect(calculateCartCents([{ price: "0.10", quantity: 3 }, { price: "0.20", quantity: 2 }])).toBe(70);
    expect(formatCents(70)).toBe("0.70");
  });

  it("does not allow negative or fractional quantities to change the total", () => {
    expect(calculateCartCents([{ price: 10, quantity: -2 }, { price: 5, quantity: 1.9 }])).toBe(500);
    expect(parsePriceToCents("not-a-price")).toBe(0);
  });
});
