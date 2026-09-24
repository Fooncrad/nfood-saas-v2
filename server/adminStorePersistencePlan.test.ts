import { describe, expect, it } from "vitest";
import { buildAdminStorePersistencePlan } from "./adminStorePersistencePlan";

const base = {
  customerName: " Nasser Cafe ",
  email: " Owner@Example.COM ",
  countryCode: "sa",
  city: " Riyadh ",
  timezone: "Asia/Riyadh",
  currencyCode: "sar",
  plan: "Basic",
  taxId: " 12345 ",
  requestedActive: true,
  primaryLanguage: "AR-SA",
};

describe("admin store persistence plan", () => {
  it.each(["automotive", "real-estate", "grocery", "laundry", "perfumes"])(
    "persists %s without requiring a marketplace sector and keeps it private",
    (sector) => {
      const plan = buildAdminStorePersistencePlan({ ...base, sector, marketplaceSector: null });
      expect(plan.entity.email).toBe("owner@example.com");
      expect(plan.entity.countryCode).toBe("SA");
      expect(plan.entity.primaryLanguage).toBe("ar");
      expect(plan.entity.sector).toBe(sector);
      expect(plan.storefront.isPublished).toBe(false);
      expect(JSON.parse(plan.storefront.languagesJson)).toEqual(["ar", "en", "fr"]);
      expect(JSON.parse(plan.storefront.sectorConfigJson).modules).toContain("orders");
      expect(plan.publicationReason).toBe("sector_unavailable");
    },
  );

  it("creates a canonical primary branch plan with the tenant operational settings", () => {
    const plan = buildAdminStorePersistencePlan({ ...base, sector: "grocery", marketplaceSector: null });
    expect(plan.primaryBranch).toEqual({
      name: "Nasser Cafe",
      city: "Riyadh",
      timezone: "Asia/Riyadh",
      currencyCode: "SAR",
      isActive: true,
      isPrimary: true,
    });
  });

  it("canonicalizes restaurant aliases and persists restaurant operating modules", () => {
    const plan = buildAdminStorePersistencePlan({ ...base, sector: "restaurants", marketplaceSector: null });
    expect(plan.entity.sector).toBe("restaurant");
    expect(JSON.parse(plan.storefront.sectorConfigJson).modules).toEqual(
      expect.arrayContaining(["catalog", "orders", "reservations", "restaurant_tables", "kitchen", "inventory"]),
    );
    expect(plan.storefront.isPublished).toBe(false);
  });

  it("publishes only when the requested activity and its marketplace sector are active", () => {
    const plan = buildAdminStorePersistencePlan({
      ...base,
      sector: "restaurant",
      marketplaceSector: { id: 7, slug: "restaurant", isActive: true },
    });
    expect(plan.marketplaceSectorId).toBe(7);
    expect(plan.storefront.isPublished).toBe(true);
    expect(plan.publicationReason).toBe("published");
  });

  it("normalizes persistence values without introducing locale-specific digits", () => {
    const plan = buildAdminStorePersistencePlan({ ...base, sector: "grocery", marketplaceSector: null });
    expect(plan.entity).toMatchObject({
      customerName: "Nasser Cafe",
      email: "owner@example.com",
      city: "Riyadh",
      currencyCode: "SAR",
      taxId: "12345",
      licensingFee: "0.00",
    });
  });
});
