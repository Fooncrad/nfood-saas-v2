import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(role: "admin" | "user" = "user", testRole?: "restaurant_admin" | "waiter" | "kitchen" | "cashier" | "customer" | "driver"): TrpcContext {
  return {
    user: { id: 7, openId: "platform-test", name: "اختبار", email: "test@nfood.local", loginMethod: "test", role, testRole, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("platform procedures", () => {
  it("allows an authenticated user to read the platform collections", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.platform.restaurants()).resolves.toBeDefined();
    await expect(caller.platform.branches({ restaurantId: 1 })).resolves.toBeDefined();
    await expect(caller.platform.menuItems({})).resolves.toBeDefined();
  });

  it("blocks a test-role user from another restaurant tenant", async () => {
    const caller = appRouter.createCaller(context("user", "waiter"));
    await expect(caller.platform.restaurantById({ id: 2 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.platform.menuItems({ restaurantId: 2 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.platform.ordersByRestaurant({ restaurantId: 2 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects unauthenticated access to protected platform procedures", async () => {
    const unauthenticated = { ...context(), user: null } as TrpcContext;
    const caller = appRouter.createCaller(unauthenticated);
    await expect(caller.platform.restaurants()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("uses account-scoped summaries for customer and driver roles", async () => {
    const customerSummary = await appRouter.createCaller(context("user", "customer")).platform.roleSummary({ restaurantId: 1 });
    const driverSummary = await appRouter.createCaller(context("user", "driver")).platform.roleSummary({ restaurantId: 1 });
    expect(customerSummary.scope).toBe("customer");
    expect(driverSummary.scope).toBe("driver");
  });

  it("restricts inventory and purchase mutations to restaurant admins", async () => {
    const waiter = appRouter.createCaller(context("user", "waiter"));
    await expect(waiter.platform.createInventoryItem({ restaurantId: 1, name: "مادة اختبار", unit: "كجم", quantity: "1", minimumQuantity: "0" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(waiter.platform.createPurchase({ restaurantId: 1, supplier: "مورد اختبار", total: "10.00", status: "received" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(waiter.platform.createBranch({ restaurantId: 1, name: "فرع اختبار", city: "الرياض", status: "open" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(waiter.platform.createCampaign({ restaurantId: 1, name: "حملة اختبار", status: "draft" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(waiter.platform.recordAttendance({ restaurantId: 1, employeeId: 1, workDate: "2026-08-20", status: "present" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(waiter.platform.updateTableStatus({ restaurantId: 1, tableId: 999999, status: "occupied" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(waiter.platform.createTable({ restaurantId: 1, branchId: 1, name: "طاولة اختبار", seats: 2, status: "available" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(waiter.platform.deleteTable({ restaurantId: 1, tableId: 999999 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("restricts employee mutations to restaurant admins", async () => {
    const waiter = appRouter.createCaller(context("user", "waiter"));
    await expect(waiter.platform.createEmployee({ restaurantId: 1, name: "موظف اختبار", role: "كاشير", status: "active" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("restricts restaurant administration mutations to admin", async () => {
    const waiter = appRouter.createCaller(context("user", "waiter"));
    await expect(waiter.admin.updateRestaurant({ id: 1, name: "غير مصرح" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(waiter.admin.deleteRestaurant({ id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(waiter.admin.createSubscription({ restaurantId: 1, plan: "Growth", status: "trial" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(waiter.admin.updateSubscription({ id: 1, status: "active" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(waiter.admin.cancelSubscription({ id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("accepts the POS/KDS order lifecycle statuses", async () => {
    const caller = appRouter.createCaller(context("admin"));
    await expect(caller.platform.updateOrderStatus({ orderId: 999999, status: "ready" })).resolves.toMatchObject({ success: true, status: "ready" });
  });
});
