import { describe, expect, it } from "vitest";
import { resolveStoreOnboardingPublication } from "./storeOnboardingPolicy";

describe("store onboarding publication policy", () => {
  it.each(["restaurant", "automotive", "real-estate", "grocery", "laundry", "perfumes"])(
    "allows %s store creation when its marketplace sector is absent",
    () => {
      expect(
        resolveStoreOnboardingPublication({
          requestedActive: true,
          marketplaceSectorExists: false,
          marketplaceSectorActive: false,
        }),
      ).toEqual({
        canCreateStore: true,
        publishStorefront: false,
        publicationReason: "sector_unavailable",
      });
    },
  );

  it("keeps an inactive store private even when its marketplace sector is active", () => {
    expect(
      resolveStoreOnboardingPublication({
        requestedActive: false,
        marketplaceSectorExists: true,
        marketplaceSectorActive: true,
      }),
    ).toEqual({
      canCreateStore: true,
      publishStorefront: false,
      publicationReason: "store_inactive",
    });
  });

  it("publishes only an active store in an active marketplace sector", () => {
    expect(
      resolveStoreOnboardingPublication({
        requestedActive: true,
        marketplaceSectorExists: true,
        marketplaceSectorActive: true,
      }),
    ).toEqual({
      canCreateStore: true,
      publishStorefront: true,
      publicationReason: "published",
    });
  });
});
