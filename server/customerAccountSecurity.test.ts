import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { TEAM_PERMISSION_CATALOG } from "../shared/rolePermissions";

describe("customer account security contract", () => {
  const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");

  it("exposes separate restaurant customer permissions", () => {
    expect(TEAM_PERMISSION_CATALOG.map((permission) => permission.key)).toEqual(expect.arrayContaining(["customers.read", "customers.password_reset"]));
  });

  it("exposes waiter calls, notifications, and studio permissions", async () => {
    const keys = TEAM_PERMISSION_CATALOG.map((permission) => permission.key);
    expect(keys).toEqual(expect.arrayContaining(["waiter_calls.read", "waiter_calls.update", "notifications.read", "studio.manage"]));
    const roles = await import("../shared/rolePermissions");
    expect(roles.DEFAULT_TEAM_ROLE_PERMISSIONS.waiter).toEqual(expect.arrayContaining(["waiter_calls.read", "waiter_calls.update", "notifications.read"]));
    expect(roles.DEFAULT_TEAM_ROLE_PERMISSIONS.restaurant_admin).toContain("studio.manage");
  });

  it("keeps password assignment separate from email changes", () => {
    expect(routerSource).toContain("setRestaurantCustomerPassword");
    expect(routerSource).toContain("emailChanged: false");
    expect(routerSource).toContain("بريد العميل محمي ولا يُعدّل من الإدارة");
  });

  it("does not provide administrative customer deletion", () => {
    expect(routerSource).toContain("حذف الحساب متاح للعميل من إعدادات حسابه فقط");
    expect(routerSource).toContain("deleteMyAccount");
    expect(routerSource).toContain('confirmation: z.literal("حذف حسابي")');
  });
});
