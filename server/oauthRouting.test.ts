import { describe, expect, it } from "vitest";
import { oauthLandingPath } from "./oauthRouting";

describe("OAuth role landing", () => {
  it("routes every restaurant staff role directly to the restaurant area", () => {
    for (const accountRole of ["restaurant_admin", "waiter", "kitchen", "bar", "cashier", "driver", "accountant"]) {
      expect(oauthLandingPath({ role: "user", accountRole }, 7, "/customer-orders")).toBe("/restaurant/dashboard");
    }
    expect(oauthLandingPath({ role: "user", accountRole: "cashier" }, 7, "/restaurant/account")).toBe("/restaurant/account");
  });

  it("uses restaurant membership as a safe fallback for legacy staff rows", () => {
    expect(oauthLandingPath({ role: "user", accountRole: "customer" }, 7, "/customer-portal")).toBe("/restaurant/dashboard");
  });

  it("recognizes central administrators from role, accountRole, or testRole", () => {
    expect(oauthLandingPath({ role: "admin" }, null, "/customer-portal")).toBe("/admin");
    expect(oauthLandingPath({ role: "user", accountRole: "admin" }, null)).toBe("/admin");
    expect(oauthLandingPath({ role: "user", testRole: "admin" }, null, "/admin/account")).toBe("/admin/account");
  });

  it("keeps customers out of protected staff and admin paths", () => {
    const customer = { role: "user", accountRole: "customer" };
    expect(oauthLandingPath(customer, null, "/restaurant/dashboard")).toBe("/customer-portal");
    expect(oauthLandingPath(customer, null, "/admin")).toBe("/customer-portal");
    expect(oauthLandingPath(customer, null, "/store/nasser")).toBe("/store/nasser");
    expect(oauthLandingPath(customer, null, "/login", "/customer-portal?oauth=google")).toBe("/customer-portal?oauth=google");
  });
});
