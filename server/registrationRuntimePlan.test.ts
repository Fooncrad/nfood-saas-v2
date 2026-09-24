import { describe, expect, it } from "vitest";
import { buildRegistrationRuntimePlan } from "./registrationRuntimePlan";

describe("registration runtime plan", () => {
  it("creates a new merchant identity for any sector without a marketplace row", () => {
    expect(buildRegistrationRuntimePlan({
      sector: "automotive",
      submittedEmail: " NEW@Example.COM ",
      marketplaceSectorExists: false,
      marketplaceSectorActive: false,
    })).toMatchObject({
      normalizedEmail: "new@example.com",
      account: { action: "create" },
    });
  });

  it("links an existing verified identity only to the same authenticated user", () => {
    expect(buildRegistrationRuntimePlan({
      sector: "laundry",
      submittedEmail: "owner@example.com",
      existingUser: { id: 41, email: "OWNER@example.com", emailVerified: true },
      authenticatedUser: { id: 41, email: "owner@example.com", emailVerified: true },
    })).toMatchObject({ account: { action: "link", userId: 41 } });
  });

  it("rejects reuse of an existing email without an authenticated matching identity", () => {
    expect(() => buildRegistrationRuntimePlan({
      sector: "restaurant",
      submittedEmail: "owner@example.com",
      existingUser: { id: 41, email: "owner@example.com", emailVerified: true },
    })).toThrow("سجّل الدخول بالحساب نفسه");
  });

  it("rejects linking when the authenticated identity has not verified its email", () => {
    expect(() => buildRegistrationRuntimePlan({
      sector: "fashion",
      submittedEmail: "owner@example.com",
      existingUser: { id: 41, email: "owner@example.com", emailVerified: true },
      authenticatedUser: { id: 41, email: "owner@example.com", emailVerified: false },
    })).toThrow("يجب تأكيد البريد الإلكتروني");
  });

  it("does not let an active marketplace sector weaken account ownership checks", () => {
    expect(() => buildRegistrationRuntimePlan({
      sector: "grocery",
      submittedEmail: "owner@example.com",
      existingUser: { id: 41, email: "owner@example.com", emailVerified: true },
      authenticatedUser: { id: 77, email: "other@example.com", emailVerified: true },
      marketplaceSectorExists: true,
      marketplaceSectorActive: true,
    })).toThrow("البريد لا يطابق الحساب المسجّل دخوله");
  });
});
