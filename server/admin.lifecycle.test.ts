import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { nanoid } from "nanoid";
import { getDb } from "./db";
import { branches, restaurantMembers, testAccounts } from "../drizzle/schema";
import { and, eq } from "drizzle-orm";

function adminContext(): TrpcContext {
  return {
    user: { id: 7, openId: "admin-lifecycle-test", name: "اختبار إداري", email: "admin@nfood.local", loginMethod: "test", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

function testRoleContext(testRole: "admin" | "restaurant_admin"): TrpcContext {
  return {
    user: { id: 8, openId: `test-${testRole}`, name: testRole, email: `${testRole}@nfood.local`, loginMethod: "test", role: "user", testRole, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  } as TrpcContext;
}

describe("admin lifecycle guards", () => {
  it("rejects deletion for a missing restaurant without writing", async () => {
    await expect(appRouter.createCaller(adminContext()).admin.deleteRestaurant({ id: 999999999 })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects cancellation for a missing subscription without writing", async () => {
    await expect(appRouter.createCaller(adminContext()).admin.cancelSubscription({ id: 999999999 })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("allows the central test admin to create a restaurant", async () => {
    const caller = appRouter.createCaller(testRoleContext("admin"));
    const email = `restaurant-${nanoid(8).toLowerCase()}@nfood.local`;
    const created = await caller.admin.createRestaurant({ name: "اختبار صلاحية NFOOD", slug: `permission-test-${nanoid(8).toLowerCase()}`, plan: "Growth", email, password: "123456" });
    expect(created).toEqual(expect.objectContaining({ success: true, barcode: expect.stringMatching(/^NFOOD-/), account: { email, temporaryPassword: "123456" } }));
    const db = await getDb();
    const account = db && (await db.select({ id: testAccounts.id, restaurantId: testAccounts.restaurantId }).from(testAccounts).where(eq(testAccounts.email, email)).limit(1))[0];
    const branch = db && account && (await db.select({ id: branches.id }).from(branches).where(eq(branches.restaurantId, created.id)).limit(1))[0];
    const member = db && account && branch && (await db.select({ id: restaurantMembers.id }).from(restaurantMembers).where(and(eq(restaurantMembers.restaurantId, created.id), eq(restaurantMembers.branchId, branch.id))).limit(1))[0];
    expect(account?.restaurantId).toBe(created.id);
    expect(member).toBeTruthy();
    await expect(caller.admin.deleteRestaurant({ id: created.id })).resolves.toEqual(expect.objectContaining({ success: true, id: created.id }));
    await expect(appRouter.createCaller(adminContext()).platform.restaurantById({ id: created.id })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects restaurant managers from creating a new restaurant", async () => {
    await expect(appRouter.createCaller(testRoleContext("restaurant_admin")).admin.createRestaurant({ name: "غير مسموح", slug: `blocked-${nanoid(8).toLowerCase()}`, plan: "Growth" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
