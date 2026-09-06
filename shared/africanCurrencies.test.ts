import { describe, expect, it } from "vitest";
import { AFRICAN_CURRENCIES, AFRICAN_CURRENCY_CODES, getAfricanCurrency } from "./africanCurrencies";

describe("African currency catalog", () => {
  it("includes legacy SAR and representative African ISO currencies", () => {
    expect(AFRICAN_CURRENCY_CODES).toEqual(expect.arrayContaining(["SAR", "EGP", "NGN", "ZAR", "MAD", "XAF", "XOF"]));
    expect(AFRICAN_CURRENCIES.length).toBeGreaterThan(30);
  });

  it("preserves currency precision metadata", () => {
    expect(getAfricanCurrency("XAF")?.decimals).toBe(0);
    expect(getAfricanCurrency("LYD")?.decimals).toBe(3);
    expect(getAfricanCurrency("SAR")?.decimals).toBe(2);
  });
});
