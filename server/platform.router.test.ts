import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { branches, menuItems, orderItems, orders, restaurants } from "../drizzle/schema";
import { eq } from "drizzle-orm";
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
    await expect(caller.platform.menuItems({})).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.platform.menuItems({ restaurantId: 1 })).resolves.toBeDefined();
    await expect(caller.platform.coupons({})).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.platform.auditLogs({})).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("scopes restaurant collection for operational roles while central admin remains broad", async () => {
    const waiterRestaurants = await appRouter.createCaller(context("user", "waiter")).platform.restaurants();
    expect(waiterRestaurants.every((restaurant) => restaurant.id === 1)).toBe(true);
    await expect(appRouter.createCaller(context("admin")).platform.restaurants()).resolves.toBeDefined();
  });

  it("allows central admin to read operational resources across restaurants", async () => {
    const admin = appRouter.createCaller(context("admin"));
    await expect(admin.platform.branches({ restaurantId: 2 })).resolves.toBeDefined();
    await expect(admin.platform.menuItems({ restaurantId: 2 })).resolves.toBeDefined();
    await expect(admin.platform.reservations({ restaurantId: 2 })).resolves.toBeDefined();
  });

  it("returns NOT_FOUND instead of undefined for a missing restaurant", async () => {
    const caller = appRouter.createCaller(context("admin"));
    await expect(caller.platform.restaurantById({ id: 999999 })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("blocks a test-role user from another restaurant tenant", async () => {
    const caller = appRouter.createCaller(context("user", "waiter"));
    await expect(caller.platform.restaurantById({ id: 2 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.platform.menuItems({ restaurantId: 2 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.platform.ordersByRestaurant({ restaurantId: 2 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.platform.attendanceByRestaurant({ restaurantId: 2 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("validates public restaurant slugs before querying data", async () => {
    const caller = appRouter.createCaller({ ...context(), user: null } as TrpcContext);
    await expect(caller.platform.publicRestaurantPage({ slug: "غير-صالح" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects unauthenticated access to protected platform procedures", async () => {
    const unauthenticated = { ...context(), user: null } as TrpcContext;
    const caller = appRouter.createCaller(unauthenticated);
    await expect(caller.platform.restaurants()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("covers allowed reads and cross-tenant denial for every operational role", async () => {
    const roles = ["restaurant_admin", "waiter", "kitchen", "cashier", "customer", "driver"] as const;
    for (const testRole of roles) {
      const caller = appRouter.createCaller(context("user", testRole));
      await expect(caller.platform.branches({ restaurantId: 1 })).resolves.toBeDefined();
      await expect(caller.platform.menuItems({ restaurantId: 1 })).resolves.toBeDefined();
      if (testRole === "restaurant_admin") await expect(caller.platform.ordersByRestaurant({ restaurantId: 2 })).resolves.toBeDefined();
      else await expect(caller.platform.ordersByRestaurant({ restaurantId: 2 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    }
  });

  it("enforces the action-role matrix before touching operational data", async () => {
    const cases = [
      ["createBranch", ["restaurant_admin"]], ["createMenuItem", ["restaurant_admin"]],
      ["createInventoryItem", ["restaurant_admin"]], ["createPurchase", ["restaurant_admin"]],
      ["createEmployee", ["restaurant_admin"]], ["createCampaign", ["restaurant_admin"]],
      ["createOrder", ["restaurant_admin", "waiter", "cashier"]],
      ["updateOrderStatus", ["restaurant_admin", "kitchen", "cashier"]],
      ["updateTableStatus", ["restaurant_admin", "waiter", "cashier"]],
    ] as const;
    const roles = ["restaurant_admin", "waiter", "kitchen", "cashier", "customer", "driver"] as const;
    for (const [procedure, allowedRoles] of cases) {
      for (const testRole of roles) {
        const caller = appRouter.createCaller(context("user", testRole));
        const action = (caller.platform as unknown as Record<string, (input: Record<string, never>) => Promise<unknown>>)[procedure];
        if (allowedRoles.includes(testRole)) await expect(action({})).rejects.not.toMatchObject({ code: "FORBIDDEN" });
        else await expect(action({})).rejects.toMatchObject({ code: "FORBIDDEN" });
      }
    }
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
    await expect(waiter.admin.saasMetrics()).rejects.toMatchObject({ code: "FORBIDDEN" });
    const admin = appRouter.createCaller(context("admin"));
    await expect(admin.admin.updateRestaurant({ id: 999999, name: "اختبار" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(admin.admin.updateSubscription({ id: 999999, status: "active" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    const metrics = await admin.admin.saasMetrics();
    expect(metrics).toEqual(expect.objectContaining({ currency: "SAR", mrr: expect.any(Number), arr: expect.any(Number), churnRate: expect.any(Number) }));
  });
  it("blocks waiter, cashier, and kitchen from central administration", async () => {
    for (const testRole of ["waiter", "cashier", "kitchen"] as const) {
      const caller = appRouter.createCaller(context("user", testRole));
      await expect(caller.admin.customers()).rejects.toMatchObject({ code: "FORBIDDEN" });
      await expect(caller.admin.saasMetrics()).rejects.toMatchObject({ code: "FORBIDDEN" });
    }
  });
  it("allows central admin to read the administration collections", async () => {
    const admin = appRouter.createCaller(context("admin"));
    await expect(admin.admin.restaurants()).resolves.toBeDefined();
    await expect(admin.admin.customers()).resolves.toBeDefined();
    await expect(admin.admin.roles({})).resolves.toBeDefined();
    await expect(admin.admin.permissions()).resolves.toBeDefined();
    await expect(admin.admin.subscriptions({})).resolves.toBeDefined();
    await expect(admin.admin.featureUsageMetrics()).resolves.toBeDefined();
    await expect(admin.admin.saasMetrics()).resolves.toBeDefined();
    for (const testRole of ["waiter", "cashier", "kitchen"] as const) {
      const caller = appRouter.createCaller(context("user", testRole));
      await expect(caller.admin.restaurants()).rejects.toMatchObject({ code: "FORBIDDEN" });
      await expect(caller.admin.subscriptions({})).rejects.toMatchObject({ code: "FORBIDDEN" });
    }
  });

  it("allows admin to read customers without sensitive fields", async () => {
    const customers = await appRouter.createCaller(context("admin")).admin.customers();
    expect(Array.isArray(customers)).toBe(true);
    if (customers[0]) {
      expect(customers[0]).not.toHaveProperty("passwordHash");
      expect(customers[0]).not.toHaveProperty("sessionToken");
    }
    await expect(appRouter.createCaller(context("user", "waiter")).admin.customers()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("allows admin to read feature usage metrics", async () => {
    const metrics = await appRouter.createCaller(context("admin")).admin.featureUsageMetrics();
    expect(Array.isArray(metrics)).toBe(true);
  });
  it("blocks waiter from reading feature usage metrics", async () => {
    await expect(appRouter.createCaller(context("user", "waiter")).admin.featureUsageMetrics()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("protects web push subscriptions from anonymous access and invalid endpoints", async () => {
    const unauthenticated = appRouter.createCaller({ ...context(), user: null } as TrpcContext);
    await expect(unauthenticated.notifications.pushSubscribe({ endpoint: "https://push.example.test/sub", keys: { p256dh: "1234567890123456", auth: "12345678" } })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    const caller = appRouter.createCaller(context());
    await expect(caller.notifications.pushSubscribe({ endpoint: "not-an-url", keys: { p256dh: "1234567890123456", auth: "12345678" } })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
  it("protects restaurant branding by tenant and role", async () => {
    const waiter = appRouter.createCaller(context("user", "waiter"));
    await expect(waiter.platform.branding({ restaurantId: 2 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(waiter.platform.updateBranding({ restaurantId: 1, brandName: "غير مصرح", brandColor: "#123456", brandLogoUrl: "", brandDescription: "" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const restaurantAdmin = appRouter.createCaller(context("user", "restaurant_admin"));
    const availableRestaurants = await restaurantAdmin.platform.restaurants();
    if (availableRestaurants[0]) {
      const restaurantId = availableRestaurants[0].id;
      const current = await restaurantAdmin.platform.branding({ restaurantId });
      await expect(restaurantAdmin.platform.updateBranding({ restaurantId, brandName: current.brandName, brandColor: current.brandColor, brandLogoUrl: current.brandLogoUrl, brandDescription: current.brandDescription })).resolves.toMatchObject({ success: true });
    }
  });
  it("rejects cross-restaurant branch and category references before writes", async () => {
    const admin = appRouter.createCaller(context("admin"));
    await expect(admin.platform.createOrder({ restaurantId: 2, branchId: 1, channel: "takeaway", paymentMethod: "cash", items: [{ menuItemId: 1, quantity: 1, unitPrice: "10.00" }], total: "10.00" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(admin.platform.createMenuItem({ restaurantId: 2, categoryId: 1, name: "صنف اختبار", price: "10.00" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects a missing POS/KDS order before changing status", async () => {
    const caller = appRouter.createCaller(context("admin"));
    await expect(caller.platform.updateOrderStatus({ restaurantId: 1, orderId: 999999, status: "ready" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const waiter = appRouter.createCaller(context("user", "waiter"));
    await expect(waiter.platform.updateOrderStatus({ restaurantId: 1, orderId: 999999, status: "ready" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("persists a POS order and reflects the KDS status update", async () => {
    const db = await getDb();
    if (!db) return;
    const restaurant = (await db.select({ id: restaurants.id }).from(restaurants).limit(1))[0];
    if (!restaurant) return;
    const branch = (await db.select({ id: branches.id }).from(branches).where(eq(branches.restaurantId, restaurant.id)).limit(1))[0];
    const menuItem = (await db.select({ id: menuItems.id, price: menuItems.price }).from(menuItems).where(eq(menuItems.restaurantId, restaurant.id)).limit(1))[0];
    if (!branch || !menuItem) return;
    const caller = appRouter.createCaller(context("admin"));
    const created = await caller.platform.createOrder({ restaurantId: restaurant.id, branchId: branch.id, channel: "takeaway", paymentMethod: "cash", items: [{ menuItemId: menuItem.id, quantity: 1, unitPrice: String(menuItem.price) }], total: String(menuItem.price) });
    try {
      const persisted = (await db.select({ id: orders.id, branchId: orders.branchId }).from(orders).where(eq(orders.id, created.id)).limit(1))[0];
      expect(persisted?.branchId).toBe(branch.id);
      const persistedItem = (await db.select({ orderId: orderItems.orderId }).from(orderItems).where(eq(orderItems.orderId, created.id)).limit(1))[0];
      expect(persistedItem?.orderId).toBe(created.id);
      await expect(caller.platform.updateOrderStatus({ restaurantId: restaurant.id, orderId: created.id, status: "ready" })).resolves.toMatchObject({ success: true, status: "ready" });
      const updated = (await db.select({ status: orders.status }).from(orders).where(eq(orders.id, created.id)).limit(1))[0];
      expect(updated?.status).toBe("ready");
    } finally {
      await db.delete(orderItems).where(eq(orderItems.orderId, created.id));
      await db.delete(orders).where(eq(orders.id, created.id));
    }
  });

  it("rejects cross-restaurant reservation branches before write", async () => {
    const admin = appRouter.createCaller(context("admin"));
    await expect(admin.platform.createReservation({ restaurantId: 2, branchId: 1, kind: "reservation", customerName: "اختبار عزل", partySize: 2, reservedFor: new Date("2026-09-01T18:00:00.000Z") })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("protects reservations by role and tenant", async () => {
    const kitchen = appRouter.createCaller(context("user", "kitchen"));
    await expect(kitchen.platform.createReservation({ restaurantId: 1, kind: "reservation", customerName: "عميل اختبار", partySize: 2, reservedFor: new Date("2026-08-21T18:00:00.000Z") })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const waiter = appRouter.createCaller(context("user", "waiter"));
    await expect(waiter.platform.reservations({ restaurantId: 2 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
