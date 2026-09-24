import { describe, expect, it } from "vitest";
import {
  canCreateTenantForSector,
  isSameRegistrationAccount,
  normalizeRegistrationEmail,
  resolveRegistrationAccount,
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

  it("creates a new identity when the email is not already registered", () => {
    expect(resolveRegistrationAccount({ submittedEmail: "new@example.com" })).toEqual({ action: "create" });
  });

  it("requires sign-in before an existing email can be linked", () => {
    expect(resolveRegistrationAccount({
      submittedEmail: "owner@example.com",
      existingUser: { id: 7, email: "owner@example.com", emailVerified: true },
    })).toEqual({ action: "reject", reason: "sign_in_required" });
  });

  it("links only the same authenticated and verified existing account", () => {
    expect(resolveRegistrationAccount({
      submittedEmail: " OWNER@EXAMPLE.COM ",
      existingUser: { id: 7, email: "owner@example.com", emailVerified: true },
      authenticatedUser: { id: 7, email: "Owner@Example.com", emailVerified: true },
    })).toEqual({ action: "link", userId: 7 });
  });

  it("rejects an authenticated different user even when an existing email is known", () => {
    expect(resolveRegistrationAccount({
      submittedEmail: "owner@example.com",
      existingUser: { id: 7, email: "owner@example.com", emailVerified: true },
      authenticatedUser: { id: 8, email: "other@example.com", emailVerified: true },
    })).toEqual({ action: "reject", reason: "email_mismatch" });
  });

  it("does not link an unverified existing identity", () => {
    expect(resolveRegistrationAccount({
      submittedEmail: "owner@example.com",
      existingUser: { id: 7, email: "owner@example.com", emailVerified: false },
      authenticatedUser: { id: 7, email: "owner@example.com", emailVerified: false },
    })).toEqual({ action: "reject", reason: "email_verification_required" });
  });
});
