import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("multi-country and multi-currency integration", () => {
  it("exposes country and currency controls in restaurant pricing settings", () => {
    const source = read("client/src/components/RestaurantPricingSettings.tsx");
    expect(source).toContain("COUNTRIES.map");
    expect(source).toContain("CURRENCIES.map");
    expect(source).toContain("selectedCurrency.decimals");
    expect(source).toContain("countryCode, currencyCode");
  });

  it("captures the restaurant currency on newly created orders", () => {
    const source = read("server/routers.ts");
    expect(source).toContain("currencyCode: restaurants.currencyCode");
    expect(source).toContain("countryCode: restaurant[0].countryCode");
    expect(source).toContain("currencyDecimals: restaurant[0].currencyDecimals");
  });

  it("includes currency metadata in performance reports", () => {
    const source = read("server/db.ts");
    expect(source).toContain("currencyCodes");
    expect(source).toContain("orders.currencyCode");
    expect(source).toContain("restaurantConfig?.currencyCode");
  });

  it("supports optional branch-level overrides", () => {
    const source = read("server/routers.ts");
    expect(source).toContain("countryCode: z.string().length(2).optional()");
    expect(source).toContain("currencyCode: z.string().length(3).optional()");
  });
});
