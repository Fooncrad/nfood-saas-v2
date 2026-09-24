import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { requireMerchantOnboarding } from "./registrationRouterBoundary";

describe("registration router boundary", () => {
  it.each(["restaurant", "automotive", "real-estate", "grocery", "laundry", "perfumes"])(
    "allows %s onboarding without marketplace catalogue activation",
    (sector) => {
      expect(
        requireMerchantOnboarding({
          sector,
          marketplaceSectorExists: false,
          marketplaceSectorActive: false,
          submittedEmail: " New@Example.COM ",
        }),
      ).toEqual({ allowed: true, normalizedEmail: "new@example.com", account: { action: "create" } });
    },
  );

  it("returns the existing verified identity for safe linking", () => {
    expect(
      requireMerchantOnboarding({
        sector: "grocery",
        submittedEmail: "OWNER@example.com",
        existingUser: { id: 42, email: "owner@example.com", emailVerified: true },
        authenticatedUser: { id: 42, email: "owner@example.com", emailVerified: true },
      }),
    ).toEqual({ allowed: true, normalizedEmail: "owner@example.com", account: { action: "link", userId: 42 } });
  });

  it("rejects silent claiming of an existing email", () => {
    expect(() =>
      requireMerchantOnboarding({
        sector: "restaurant",
        submittedEmail: "owner@example.com",
        existingUser: { id: 42, email: "owner@example.com", emailVerified: true },
      }),
    ).toThrow(TRPCError);

    try {
      requireMerchantOnboarding({
        sector: "restaurant",
        submittedEmail: "owner@example.com",
        existingUser: { id: 42, email: "owner@example.com", emailVerified: true },
      });
    } catch (error) {
      expect(error).toMatchObject({ code: "CONFLICT" });
    }
  });

  it("rejects linking an unverified identity", () => {
    expect(() =>
      requireMerchantOnboarding({
        sector: "automotive",
        submittedEmail: "owner@example.com",
        existingUser: { id: 42, email: "owner@example.com", emailVerified: false },
        authenticatedUser: { id: 42, email: "owner@example.com", emailVerified: false },
      }),
    ).toThrowError(/تأكيد البريد الإلكتروني/);
  });
});
