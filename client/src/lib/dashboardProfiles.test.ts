import { describe, expect, it } from "vitest";
import { dashboardProfiles } from "./dashboardProfiles";

describe("role dashboard profiles", () => {
  it("keeps central administration out of operational role profiles", () => {
    const operationalRoles = ["waiter", "kitchen", "cashier", "customer", "driver"] as const;
    for (const role of operationalRoles) {
      expect(dashboardProfiles[role].target).not.toBe("admin");
      expect(dashboardProfiles[role].secondary.some((item) => item.target === "admin")).toBe(false);
    }
    expect(dashboardProfiles.restaurant_admin.target).toBe("admin");
  });

  it("defines a distinct profile for every operational role", () => {
    const roles = ["restaurant_admin", "waiter", "kitchen", "cashier", "customer", "driver"] as const;
    const titles = roles.map((role) => dashboardProfiles[role].title);
    expect(new Set(titles).size).toBe(roles.length);
    for (const role of roles) {
      expect(dashboardProfiles[role].secondary).toHaveLength(2);
      expect(dashboardProfiles[role].target).toBeTruthy();
    }
  });
});
