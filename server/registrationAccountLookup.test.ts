import { describe, expect, it } from "vitest";
import { buildRegistrationAccountLookup } from "./registrationAccountLookup";
import { requireMerchantOnboarding } from "./registrationRouterBoundary";

describe("registration account lookup", () => {
  it("normalizes the submitted, stored and authenticated email consistently", () => {
    const lookup = buildRegistrationAccountLookup({
      submittedEmail: "  Owner@Example.COM ",
      existingUser: { id: 7, email: "owner@example.com", emailVerified: true },
      authenticatedUser: { id: 7, email: " OWNER@example.com ", emailVerified: true },
    });

    expect(lookup).toEqual({
      normalizedEmail: "owner@example.com",
      existingUser: { id: 7, email: "owner@example.com", emailVerified: true },
      authenticatedUser: { id: 7, email: "owner@example.com", emailVerified: true },
    });
  });

  it("keeps missing auth verification false instead of trusting the session implicitly", () => {
    const lookup = buildRegistrationAccountLookup({
      submittedEmail: "owner@example.com",
      existingUser: { id: 7, email: "owner@example.com", emailVerified: true },
      authenticatedUser: { id: 7, email: "owner@example.com" },
    });

    expect(lookup.authenticatedUser?.emailVerified).toBe(false);
  });

  it("feeds the unified policy for non-restaurant sectors without marketplace activation", () => {
    const lookup = buildRegistrationAccountLookup({
      submittedEmail: "owner@example.com",
      existingUser: { id: 7, email: "owner@example.com", emailVerified: true },
      authenticatedUser: { id: 7, email: "owner@example.com", emailVerified: true },
    });

    expect(requireMerchantOnboarding({
      sector: "laundry",
      marketplaceSectorExists: false,
      marketplaceSectorActive: false,
      submittedEmail: lookup.normalizedEmail,
      existingUser: lookup.existingUser,
      authenticatedUser: lookup.authenticatedUser,
    })).toMatchObject({ allowed: true, account: { action: "link", userId: 7 } });
  });

  it("does not turn an existing email into an implicit link for another session", () => {
    const lookup = buildRegistrationAccountLookup({
      submittedEmail: "owner@example.com",
      existingUser: { id: 7, email: "owner@example.com", emailVerified: true },
      authenticatedUser: { id: 9, email: "other@example.com", emailVerified: true },
    });

    expect(() => requireMerchantOnboarding({
      sector: "restaurant",
      marketplaceSectorExists: true,
      marketplaceSectorActive: true,
      submittedEmail: lookup.normalizedEmail,
      existingUser: lookup.existingUser,
      authenticatedUser: lookup.authenticatedUser,
    })).toThrow("البريد لا يطابق الحساب المسجّل دخوله");
  });
});
