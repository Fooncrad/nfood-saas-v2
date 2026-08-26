import { describe, expect, it } from "vitest";
import { getVisibleNavigation, isRoleActionAllowed, isRoleNavigationAllowed, roleActions, roleNavigation } from "./roleNavigation";
import { navItems, navTranslationKeys } from "@/components/homeNavigation";

describe("role navigation matrix", () => {
  it("exposes the settings entry with a translated label contract", () => {
    expect(navItems.some(item => item.key === "settings")).toBe(true);
    expect(navTranslationKeys.settings).toBe("generalSettings");
  });

  it("keeps every role scoped to an explicit navigation allow-list", () => {
    const roles = ["restaurant_admin", "waiter", "kitchen", "bar", "cashier", "customer", "driver"] as const;
    for (const role of roles) {
      expect(roleNavigation[role].length).toBeGreaterThan(0);
      expect(isRoleNavigationAllowed(role, "overview")).toBe(true);
      expect(isRoleNavigationAllowed(role, "admin")).toBe(false);
    }
  });

  it("keeps action-level permissions aligned with operational roles", () => {
    const roles = ["restaurant_admin", "waiter", "kitchen", "bar", "cashier", "customer", "driver"] as const;
    for (const role of roles) expect(roleActions[role]).toBeDefined();
    expect(isRoleActionAllowed("restaurant_admin", "inventory.manage")).toBe(true);
    expect(isRoleActionAllowed("waiter", "orders.create")).toBe(true);
    expect(isRoleActionAllowed("cashier", "orders.create")).toBe(true);
    expect(isRoleActionAllowed("kitchen", "orders.create")).toBe(false);
    expect(isRoleActionAllowed("bar", "orders.status.update")).toBe(true);
    expect(isRoleActionAllowed("customer", "orders.create")).toBe(false);
    expect(isRoleActionAllowed("driver", "orders.create")).toBe(false);
  });

  it("keeps operational modules out of the central admin context", () => {
    const central = getVisibleNavigation("admin", true);
    expect(central).toEqual(["overview", "admin", "accounts", "settings", "languages", "files", "trend", "security", "health"]);
    expect(central).not.toContain("orders");
    expect(central).toContain("accounts");
    expect(central).toContain("languages");
    expect(getVisibleNavigation("restaurant_admin")).toContain("languages");
    expect(getVisibleNavigation("customer")).not.toContain("accounts");
    expect(central).not.toContain("pos");
    expect(getVisibleNavigation("restaurant_admin")).toContain("orders");
    expect(getVisibleNavigation("restaurant_admin")).toContain("settings");
    expect(getVisibleNavigation("restaurant_admin")).toContain("tables");
    expect(getVisibleNavigation("restaurant_admin")).not.toContain("qr");
    expect(central).not.toContain("qr");
    expect(getVisibleNavigation("waiter")).not.toContain("qr");
    expect(getVisibleNavigation("kitchen")).not.toContain("qr");
    expect(getVisibleNavigation("bar")).not.toContain("qr");
    expect(getVisibleNavigation("customer")).not.toContain("qr");
    expect(getVisibleNavigation("driver")).not.toContain("qr");
    expect(getVisibleNavigation("waiter")).not.toContain("settings");
    expect(getVisibleNavigation("restaurant_admin")).toContain("pos");
    expect(getVisibleNavigation("restaurant_admin")).not.toContain("admin");
    expect(getVisibleNavigation("restaurant_admin")).not.toContain("health");
    expect(getVisibleNavigation("cashier")).toContain("pos");
    expect(getVisibleNavigation("bar")).toEqual(["overview", "kds", "files", "trend", "security"]);
  });

  it("denies unknown or missing roles by default", () => {
    expect(isRoleNavigationAllowed(undefined, "orders")).toBe(false);
    expect(isRoleNavigationAllowed("waiter", "inventory")).toBe(false);
    expect(isRoleNavigationAllowed("customer", "marketing")).toBe(false);
    expect(getVisibleNavigation("customer")).not.toContain("admin");
    expect(getVisibleNavigation("customer")).not.toContain("health");
  });
});
