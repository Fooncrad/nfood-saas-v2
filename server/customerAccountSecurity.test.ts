import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { TEAM_PERMISSION_CATALOG } from "../shared/rolePermissions";

describe("customer account security contract", () => {
  const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");

  it("exposes separate restaurant customer permissions", () => {
    expect(TEAM_PERMISSION_CATALOG.map((permission) => permission.key)).toEqual(expect.arrayContaining(["customers.read", "customers.password_reset"]));
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
