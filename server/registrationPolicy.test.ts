import { describe, expect, it } from "vitest";
import {
  canCreateTenantForSector,
  isSameRegistrationAccount,
  normalizeRegistrationEmail,
} from "./registrationPolicy";

describe("registration onboarding policy", () => {
  it.each(["restaurant", "cars", "real-estate", "grocery", "laundry", "perfumes"])(
    "does not require marketplace catalogue activation for %s tenant creation",
    (sector) => {
      expect(
        canCreateTenantForSector({
          sector,
          marketplaceSectorExists: false,
          marketplaceSectorActive: false,
        }),
      ).toBe(true);
    },
  );

  it("normalizes email before existing-account comparison", () => {
    expect(normalizeRegistrationEmail("  Owner@Example.COM ")).toBe("owner@example.com");
    expect(isSameRegistrationAccount("owner@example.com", " OWNER@EXAMPLE.COM ")).toBe(true);
  });

  it("does not treat a different email as the same account", () => {
    expect(isSameRegistrationAccount("owner@example.com", "other@example.com")).toBe(false);
  });
});
