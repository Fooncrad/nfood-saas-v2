import { describe, expect, it } from "vitest";
import { buildAdminStoreRouterPlan } from "./adminStoreRouterPlan";

const base = {
  customerName: " Nasser Cafe ",
  email: " OWNER@EXAMPLE.COM ",
  countryCode: "sa",
  city: " Riyadh ",
  timezone: "Asia/Riyadh",
  currencyCode: "sar",
  primaryLanguage: "ar-SA",
  sector: "restaurants",
  plan: "Basic",
  taxId: " 123 ",
  status: true,
};

describe("buildAdminStoreRouterPlan", () => {
  it("creates an operational restaurant even when no marketplace sector exists", () => {
    const plan = buildAdminStoreRouterPlan(base, null);

    expect(plan.entity).toMatchObject({
      customerName: "Nasser Cafe",
      email: "owner@example.com",
      countryCode: "SA",
      currencyCode: "SAR",
      primaryLanguage: "ar",
      sector: "restaurant",
      status: true,
    });
    expect(plan.storefront.isPublished).toBe(false);
    expect(JSON.parse(plan.storefront.languagesJson)).toEqual(["ar", "en", "fr"]);
    expect(JSON.parse(plan.storefront.sectorConfigJson).modules).toContain("reservations");
  });

  it("keeps an inactive marketplace sector private without blocking creation", () => {
    const plan = buildAdminStoreRouterPlan(base, { id: 8, slug: "restaurant", isActive: false });
    expect(plan.marketplaceSectorId).toBe(8);
    expect(plan.storefront.isPublished).toBe(false);
  });

  it("publishes only when both store and marketplace sector are active", () => {
    const plan = buildAdminStoreRouterPlan(base, { id: 8, slug: "restaurant", isActive: true });
    expect(plan.storefront.isPublished).toBe(true);

    const disabled = buildAdminStoreRouterPlan({ ...base, status: false }, { id: 8, slug: "restaurant", isActive: true });
    expect(disabled.entity.status).toBe(false);
    expect(disabled.storefront.isPublished).toBe(false);
  });

  it("uses store modules for non-restaurant sectors", () => {
    const plan = buildAdminStoreRouterPlan({ ...base, sector: "cars", primaryLanguage: "fr-FR" }, undefined);
    expect(plan.entity.sector).toBe("automotive");
    expect(plan.entity.primaryLanguage).toBe("fr");
    expect(JSON.parse(plan.storefront.sectorConfigJson).modules).not.toContain("restaurant_tables");
  });
});
