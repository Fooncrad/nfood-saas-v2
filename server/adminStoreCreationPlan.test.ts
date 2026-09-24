import { describe, expect, it } from "vitest";
import { buildAdminStoreCreationPlan } from "./adminStoreCreationPlan";

describe("admin store creation plan", () => {
  it.each(["automotive", "real-estate", "grocery", "laundry", "perfumes"])(
    "creates %s privately without an active marketplace sector",
    (sector) => {
      const plan = buildAdminStoreCreationPlan({
        requestedActive: true,
        marketplaceSector: null,
        primaryLanguage: "ar",
        sector,
      });
      expect(plan.canCreateStore).toBe(true);
      expect(plan.isPublished).toBe(false);
      expect(plan.publicationReason).toBe("sector_unavailable");
      expect(plan.languages).toEqual(["ar", "en", "fr"]);
      expect(plan.modules).toEqual(["catalog", "orders", "pos", "invoicing", "inventory"]);
    },
  );

  it("keeps restaurant operating modules while publishing only through an active marketplace sector", () => {
    const plan = buildAdminStoreCreationPlan({
      requestedActive: true,
      marketplaceSector: { id: 3, slug: "restaurant", isActive: true },
      primaryLanguage: "fr",
      sector: "restaurant",
    });
    expect(plan.isPublished).toBe(true);
    expect(plan.marketplaceSectorId).toBe(3);
    expect(plan.languages).toEqual(["fr", "ar", "en"]);
    expect(plan.modules).toContain("reservations");
    expect(plan.modules).toContain("restaurant_tables");
  });

  it("keeps an inactive activity private even when its marketplace sector is active", () => {
    const plan = buildAdminStoreCreationPlan({
      requestedActive: false,
      marketplaceSector: { id: 9, slug: "grocery", isActive: true },
      primaryLanguage: "en",
      sector: "grocery",
    });
    expect(plan.isPublished).toBe(false);
    expect(plan.publicationReason).toBe("store_inactive");
    expect(plan.languages).toEqual(["en", "ar", "fr"]);
  });
});
