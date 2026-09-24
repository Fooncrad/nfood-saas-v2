import { describe, expect, it } from "vitest";
import { resolveAdminStoreOnboarding } from "./adminStoreOnboarding";

describe("admin store onboarding", () => {
  it.each(["restaurant", "automotive", "real-estate", "grocery", "laundry", "perfumes"])(
    "creates %s without a marketplace sector and keeps it private",
    () => {
      expect(resolveAdminStoreOnboarding({ requestedActive: true, marketplaceSector: null })).toEqual({
        canCreateStore: true,
        isPublished: false,
        publicationReason: "sector_unavailable",
        marketplaceSectorId: null,
      });
    },
  );

  it("creates a store for an inactive marketplace sector without publishing it", () => {
    expect(
      resolveAdminStoreOnboarding({
        requestedActive: true,
        marketplaceSector: { id: 12, slug: "grocery", isActive: false },
      }),
    ).toEqual({
      canCreateStore: true,
      isPublished: false,
      publicationReason: "sector_unavailable",
      marketplaceSectorId: 12,
    });
  });

  it("publishes only when both the store and marketplace sector are active", () => {
    expect(
      resolveAdminStoreOnboarding({
        requestedActive: true,
        marketplaceSector: { id: 3, slug: "restaurant", isActive: true },
      }),
    ).toEqual({
      canCreateStore: true,
      isPublished: true,
      publicationReason: "published",
      marketplaceSectorId: 3,
    });
  });

  it("keeps an inactive store private even in an active sector", () => {
    expect(
      resolveAdminStoreOnboarding({
        requestedActive: false,
        marketplaceSector: { id: 3, slug: "restaurant", isActive: true },
      }),
    ).toEqual({
      canCreateStore: true,
      isPublished: false,
      publicationReason: "store_inactive",
      marketplaceSectorId: 3,
    });
  });
});
