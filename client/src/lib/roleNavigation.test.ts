import { describe, expect, it } from "vitest";
import { isRoleActionAllowed, isRoleNavigationAllowed, roleActions, roleNavigation } from "./roleNavigation";

describe("role navigation matrix", () => {
  it("keeps every role scoped to an explicit navigation allow-list", () => {
    const roles = ["restaurant_admin", "waiter", "kitchen", "cashier", "customer", "driver"] as const;
    for (const role of roles) {
      expect(roleNavigation[role].length).toBeGreaterThan(0);
      expect(isRoleNavigationAllowed(role, "overview")).toBe(true);
      expect(isRoleNavigationAllowed(role, "admin")).toBe(role === "restaurant_admin");
    }
  });

  it("keeps action-level permissions aligned with operational roles", () => {
    const roles = ["restaurant_admin", "waiter", "kitchen", "cashier", "customer", "driver"] as const;
    for (const role of roles) expect(roleActions[role]).toBeDefined();
    expect(isRoleActionAllowed("restaurant_admin", "inventory.manage")).toBe(true);
    expect(isRoleActionAllowed("waiter", "orders.create")).toBe(true);
    expect(isRoleActionAllowed("cashier", "orders.create")).toBe(true);
    expect(isRoleActionAllowed("kitchen", "orders.create")).toBe(false);
    expect(isRoleActionAllowed("customer", "orders.create")).toBe(false);
    expect(isRoleActionAllowed("driver", "orders.create")).toBe(false);
  });

  it("denies unknown or missing roles by default", () => {
    expect(isRoleNavigationAllowed(undefined, "orders")).toBe(false);
    expect(isRoleNavigationAllowed("waiter", "inventory")).toBe(false);
    expect(isRoleNavigationAllowed("customer", "marketing")).toBe(false);
  });
});
