import { describe, expect, it } from "vitest";
import { COUNTRIES, CURRENCIES, formatMoney, getCountry, getCurrency } from "@shared/currencies";

describe("country and currency catalog", () => {
  it("contains the default Saudi configuration", () => {
    expect(getCountry("SA")).toMatchObject({ currencyCode: "SAR", locale: "ar-SA" });
    expect(getCurrency("SAR")).toMatchObject({ decimals: 2, symbol: "ر.س" });
  });

  it("supports currencies with three decimal places", () => {
    expect(getCurrency("KWD").decimals).toBe(3);
    expect(formatMoney("12.345", "KWD", "en-US")).toContain("12.345");
  });

  it("normalizes malformed money strings without multiplying the amount", () => {
    expect(formatMoney("5000.00.000", "SAR", "en-US")).toBe("5,000.00");
    expect(formatMoney("3000", "SAR", "en-US")).toBe("3,000.00");
    expect(formatMoney("not-a-number", "SAR", "en-US")).toBe("0.00");
  });

  it("keeps country and currency catalogs non-empty and unique", () => {
    expect(new Set(COUNTRIES.map((country) => country.code)).size).toBe(COUNTRIES.length);
    expect(new Set(CURRENCIES.map((currency) => currency.code)).size).toBe(CURRENCIES.length);
    expect(COUNTRIES.every((country) => CURRENCIES.some((currency) => currency.code === country.currencyCode))).toBe(true);
  });
});
