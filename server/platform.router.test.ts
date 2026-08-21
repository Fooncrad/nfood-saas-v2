import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { getDb, getLoyaltyTier } from "./db";
import { branches, menuCategories, menuItems, menuItemAddons, orderItems, orders, reservations, restaurants, referralRecords, loyaltyTransactions, loyaltyAccounts, users, integrationSettings, driverApplications, kitchenSections, printerRoutingRules } from "../drizzle/schema";
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
  it("rejects enabling demo integration references at the API boundary", async () => { const admin = appRouter.createCaller(context("admin")); await expect(admin.platform.upsertIntegrationSetting({ scope: "platform", providerKey: "Google OAuth", category: "الهوية", status: "configured", keyReference: "DEMO_REPLACE_GOOGLE_CLIENT_ID" })).rejects.toMatchObject({ code: "BAD_REQUEST" }); });

  it("isolates menu item addons and protects their CRUD by restaurant role", async () => { const db = await getDb(); if (!db) return; const restaurant = (await db.select({ id: restaurants.id }).from(restaurants).limit(1))[0]; if (!restaurant) return; const item = (await db.select({ id: menuItems.id }).from(menuItems).where(eq(menuItems.restaurantId, restaurant.id)).limit(1))[0]; if (!item) return; const base = context("user", "restaurant_admin"); const admin = appRouter.createCaller({ ...base, user: { ...base.user, restaurantId: restaurant.id } }); const name = `إضافة اختبار ${Date.now()}`; const created = await admin.platform.createMenuItemAddon({ restaurantId: restaurant.id, menuItemId: item.id, name, price: "2.50", stockQuantity: 12 }); expect(created).toEqual(expect.objectContaining({ id: expect.any(Number), restaurantId: restaurant.id, menuItemId: item.id, name })); try { await expect(admin.platform.listMenuItemAddons({ restaurantId: restaurant.id })).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ id: created.id, name })])); await expect(admin.platform.updateMenuItemAddon({ restaurantId: restaurant.id, id: created.id, price: "3.00", isAvailable: false })).resolves.toEqual(expect.objectContaining({ id: created.id, price: "3.00", isAvailable: false })); await expect(admin.platform.listMenuItemAddons({ restaurantId: restaurant.id + 999999 })).rejects.toMatchObject({ code: "FORBIDDEN" }); await expect(appRouter.createCaller(context("user", "customer")).platform.updateMenuItemAddon({ restaurantId: restaurant.id, id: created.id, name: "غير مصرح" })).rejects.toMatchObject({ code: "FORBIDDEN" }); } finally { await admin.platform.deleteMenuItemAddon({ restaurantId: restaurant.id, id: created.id }); await db.delete(menuItemAddons).where(eq(menuItemAddons.id, created.id)); } });

  it("persists kitchen sections and isolates printer routing by restaurant", async () => {
    const db = await getDb();
    if (!db) return;
    const restaurant = (await db.select({ id: restaurants.id }).from(restaurants).limit(1))[0];
    if (!restaurant) return;
    const name = `قسم اختبار ${Date.now()}`;
    const admin = appRouter.createCaller({ ...context("user", "restaurant_admin"), user: { ...context("user", "restaurant_admin").user, restaurantId: restaurant.id } });
    const created = await admin.platform.createKitchenSection({ restaurantId: restaurant.id, name, printerType: "browser" });
    const section = (await db.select().from(kitchenSections).where(eq(kitchenSections.id, created.id)).limit(1))[0];
    expect(section).toEqual(expect.objectContaining({ id: created.id, restaurantId: restaurant.id, name, printerType: "browser" }));
    const rule = await admin.platform.createPrinterRoutingRule({ restaurantId: restaurant.id, kitchenSectionId: created.id, categoryId: null, menuItemId: null, priority: 2 });
    expect(rule).toEqual(expect.objectContaining({ success: true, id: expect.any(Number) }));
    await admin.platform.updatePrinterRoutingRule({ restaurantId: restaurant.id, id: rule.id, priority: 9, isEnabled: false });
    const updatedRule = (await db.select().from(printerRoutingRules).where(eq(printerRoutingRules.id, rule.id)).limit(1))[0];
    expect(updatedRule).toEqual(expect.objectContaining({ priority: 9, isEnabled: false }));
    const otherRestaurantId = restaurant.id + 999999;
    await expect(admin.platform.listKitchenSections({ restaurantId: otherRestaurantId })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(admin.platform.updatePrinterRoutingRule({ restaurantId: otherRestaurantId, id: rule.id, priority: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await admin.platform.deletePrinterRoutingRule({ restaurantId: restaurant.id, id: rule.id });
    await db.delete(kitchenSections).where(eq(kitchenSections.id, created.id));
  });
  it("protects kitchen ticket reads by restaurant and role", async () => {
    const kitchen = appRouter.createCaller({ ...context("user", "kitchen"), user: { ...context("user", "kitchen").user, restaurantId: 1 } });
    await expect(kitchen.platform.kitchenTickets({ restaurantId: 1, orderId: 999999 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(kitchen.platform.kitchenTickets({ restaurantId: 2, orderId: 999999 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("exposes system health only to central admin", async () => {
    const adminHealth = await appRouter.createCaller(context("admin")).admin.systemHealth();
    expect(["healthy", "degraded"]).toContain(adminHealth.status);
    expect(["ok", "error", "unavailable"]).toContain(adminHealth.database);
    expect(adminHealth.api).toBe("ok");
    await expect(appRouter.createCaller(context("user", "waiter")).admin.systemHealth()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("persists a driver application as pending review with vehicle documents", async () => {
    const db = await getDb();
    if (!db) return;
    const result = await db.insert(driverApplications).values({ fullName: "سائق اختبار", email: `driver-${Date.now()}@nfood.local`, phone: "0500000000", city: "الرياض", vehicleType: "car", identityDocumentUrl: "/manus-storage/identity-test", licenseDocumentUrl: "/manus-storage/license-test", vehicleFrontUrl: "/manus-storage/front-test", vehicleBackUrl: "/manus-storage/back-test", status: "pending_review" });
    const id = Number(result[0].insertId);
    const row = (await db.select().from(driverApplications).where(eq(driverApplications.id, id)).limit(1))[0];
    expect(row).toEqual(expect.objectContaining({ id, city: "الرياض", vehicleType: "car", status: "pending_review", identityDocumentUrl: "/manus-storage/identity-test" }));
    await db.delete(driverApplications).where(eq(driverApplications.id, id));
  });

  it("enforces driver delivery transitions and failure reasons", async () => {
    const db = await getDb();
    if (!db) return;
    const restaurant = (await db.select({ id: restaurants.id }).from(restaurants).limit(1))[0];
    if (!restaurant) return;
    const branch = (await db.select({ id: branches.id }).from(branches).where(eq(branches.restaurantId, restaurant.id)).limit(1))[0];
    if (!branch) return;
    const result = await db.insert(orders).values({ restaurantId: restaurant.id, branchId: branch.id, channel: "delivery", paymentMethod: "cash", paymentStatus: "unpaid", driverId: 7, total: "25.00", deliveryStatus: "assigned" });
    const orderId = Number(result[0].insertId);
    const driver = appRouter.createCaller({ ...context("user", "driver"), user: { ...context("user", "driver").user, restaurantId: restaurant.id } });
    await expect(driver.platform.updateDeliveryStatus({ restaurantId: restaurant.id, orderId, status: "out_for_delivery", etaMinutes: 15 })).resolves.toMatchObject({ deliveryStatus: "out_for_delivery" });
    await expect(driver.platform.updateDeliveryStatus({ restaurantId: restaurant.id, orderId, status: "failed" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(driver.platform.updateDeliveryStatus({ restaurantId: restaurant.id, orderId, status: "failed", failureReason: "عنوان غير صحيح" })).resolves.toMatchObject({ deliveryStatus: "failed" });
    await db.delete(orders).where(eq(orders.id, orderId));
  });

  it("derives loyalty tiers from balance and supports automatic demotion", () => {
    expect(getLoyaltyTier(0)).toBe("standard");
    expect(getLoyaltyTier(499)).toBe("standard");
    expect(getLoyaltyTier(500)).toBe("silver");
    expect(getLoyaltyTier(999)).toBe("silver");
    expect(getLoyaltyTier(1000)).toBe("gold");
    expect(getLoyaltyTier(700)).toBe("silver");
    expect(getLoyaltyTier(-10)).toBe("standard");
  });

  it("protects loyalty and referral procedures by role and customer existence", async () => {
    const admin = appRouter.createCaller(context("admin"));
    const waiter = appRouter.createCaller(context("user", "waiter"));
    await expect(admin.platform.loyaltySummary({ restaurantId: 1, customerId: 999999 })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(waiter.platform.loyaltySummary({ restaurantId: 1, customerId: 999999 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(admin.platform.createReferral({ restaurantId: 1, referrerCustomerId: 999999, code: "TEST-REFERRAL" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(waiter.platform.createReferral({ restaurantId: 1, referrerCustomerId: 999999, code: "TEST-REFERRAL-2" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("persists one referral reward after the first paid completed order and prevents a second reward", async () => {
    const db = await getDb(); if (!db) return;
    const restaurant = (await db.select({ id: restaurants.id }).from(restaurants).where(eq(restaurants.status, "active")).limit(1))[0]; if (!restaurant) return;
    const branch = (await db.select({ id: branches.id }).from(branches).where(eq(branches.restaurantId, restaurant.id)).limit(1))[0]; if (!branch) return;
    const customers = await db.select({ id: users.id }).from(users).limit(2); if (customers.length < 2) return;
    const code = `PERSIST-${Date.now()}`;
    const admin = appRouter.createCaller(context("admin"));
    const referral = await admin.platform.createReferral({ restaurantId: restaurant.id, referrerCustomerId: customers[0].id, referredCustomerId: customers[1].id, code });
    const orderResult = await db.insert(orders).values({ restaurantId: restaurant.id, branchId: branch.id, customerId: customers[1].id, channel: "takeaway", paymentMethod: "cash", paymentStatus: "paid", total: "20.00", status: "new" });
    const orderId = Number(orderResult[0].insertId);
    try {
      await expect(admin.platform.updateOrderStatus({ restaurantId: restaurant.id, orderId, status: "completed" })).resolves.toMatchObject({ success: true, referralRewarded: true });
      await expect(admin.platform.updateOrderStatus({ restaurantId: restaurant.id, orderId, status: "completed" })).resolves.toMatchObject({ success: true, referralRewarded: false });
      const savedReferral = (await db.select({ status: referralRecords.status, qualifyingOrderId: referralRecords.qualifyingOrderId }).from(referralRecords).where(eq(referralRecords.id, referral.id)).limit(1))[0];
      expect(savedReferral).toEqual({ status: "rewarded", qualifyingOrderId: orderId });
      const rewards = await db.select({ id: loyaltyTransactions.id }).from(loyaltyTransactions).where(eq(loyaltyTransactions.referenceId, `referral:${referral.id}`));
      expect(rewards).toHaveLength(2);
    } finally {
      await db.delete(loyaltyTransactions).where(eq(loyaltyTransactions.referenceId, `referral:${referral.id}`));
      await db.delete(loyaltyAccounts).where(eq(loyaltyAccounts.customerId, customers[0].id));
      await db.delete(loyaltyAccounts).where(eq(loyaltyAccounts.customerId, customers[1].id));
      await db.delete(referralRecords).where(eq(referralRecords.id, referral.id));
      await db.delete(orders).where(eq(orders.id, orderId));
    }
  });

  it("protects separated restaurant, driver, and product review procedures", async () => {
    const admin = appRouter.createCaller(context("admin"));
    const waiter = appRouter.createCaller(context("user", "waiter"));
    await expect(admin.platform.restaurantReviews({ restaurantId: 1 })).resolves.toBeDefined();
    await expect(waiter.platform.restaurantReviews({ restaurantId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(context("user", "customer")).platform.submitReview({ restaurantId: 1, orderId: 999999, targetType: "restaurant", rating: 5 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("creates a safe public guest checkout from server-side menu prices", async () => {
    const db = await getDb();
    if (!db) return;
    const restaurant = (await db.select({ id: restaurants.id, slug: restaurants.slug }).from(restaurants).where(eq(restaurants.status, "active")).limit(1))[0];
    if (!restaurant) return;
    const branch = (await db.select({ id: branches.id }).from(branches).where(eq(branches.restaurantId, restaurant.id)).limit(1))[0];
    const menuItem = (await db.select({ id: menuItems.id, price: menuItems.price }).from(menuItems).where(eq(menuItems.restaurantId, restaurant.id)).limit(1))[0];
    if (!branch || !menuItem) return;
    const result = await appRouter.createCaller(context("user", "customer")).platform.guestCheckout({ slug: restaurant.slug, branchId: branch.id, guestName: "ضيف اختبار", guestPhone: "0500000000", channel: "takeaway", items: [{ menuItemId: menuItem.id, quantity: 2 }] });
    expect(result).toEqual(expect.objectContaining({ success: true, paymentMethod: "cash", paymentStatus: "unpaid", status: "new", total: (Number(menuItem.price) * 2).toFixed(2) }));
    const created = (await db.select({ restaurantId: orders.restaurantId, guestName: orders.guestName, guestPhone: orders.guestPhone, paymentStatus: orders.paymentStatus, total: orders.total }).from(orders).where(eq(orders.id, result.orderId)).limit(1))[0];
    expect(created).toEqual(expect.objectContaining({ restaurantId: restaurant.id, guestName: "ضيف اختبار", guestPhone: "0500000000", paymentStatus: "unpaid", total: result.total }));
    await expect(appRouter.createCaller(context()).platform.trackGuestOrder({ slug: restaurant.slug, orderId: result.orderId, guestPhone: "0500000000" })).resolves.toEqual(expect.objectContaining({ id: result.orderId, status: "new", paymentStatus: "unpaid", total: result.total }));
    await expect(appRouter.createCaller(context()).platform.trackGuestOrder({ slug: restaurant.slug, orderId: result.orderId, guestPhone: "0500000001" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await db.delete(orderItems).where(eq(orderItems.orderId, result.orderId));
    await db.delete(orders).where(eq(orders.id, result.orderId));
  });

  it("creates a public reservation and returns public contact and branch-hour fields", async () => {
    const db = await getDb();
    if (!db) return;
    const restaurant = (await db.select({ id: restaurants.id, slug: restaurants.slug, phone: restaurants.phone, reservationEnabled: restaurants.reservationEnabled }).from(restaurants).where(eq(restaurants.status, "active")).limit(1))[0];
    if (!restaurant || !restaurant.reservationEnabled) return;
    const branch = (await db.select({ id: branches.id, openingTime: branches.openingTime, closingTime: branches.closingTime }).from(branches).where(eq(branches.restaurantId, restaurant.id)).limit(1))[0];
    if (!branch) return;
    const publicPage = await appRouter.createCaller(context()).platform.publicRestaurantPage({ slug: restaurant.slug });
    expect(publicPage?.restaurant).toEqual(expect.objectContaining({ id: restaurant.id, reservationEnabled: true }));
    expect(publicPage?.branches[0]).toEqual(expect.objectContaining({ id: branch.id, openingTime: branch.openingTime, closingTime: branch.closingTime }));
    const created = await appRouter.createCaller(context()).platform.createPublicReservation({ slug: restaurant.slug, branchId: branch.id, customerName: "ضيف حجز", phone: "0500000000", partySize: 2, reservedFor: new Date(Date.now() + 86400000), notes: "اختبار" });
    expect(created).toEqual(expect.objectContaining({ success: true, status: "pending" }));
    await db.delete(reservations).where(eq(reservations.id, created.id));
  });

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

  it("returns a privacy-safe customer display payload for an active restaurant", async () => {
    const db = await getDb();
    if (!db) return;
    const restaurant = (await db.select({ slug: restaurants.slug }).from(restaurants).where(eq(restaurants.status, "active")).limit(1))[0];
    if (!restaurant) return;
    const caller = appRouter.createCaller({ ...context(), user: null } as TrpcContext);
    const result = await caller.platform.customerDisplay({ slug: restaurant.slug });
    expect(result.restaurant).toEqual(expect.objectContaining({ name: expect.any(String), brandColor: expect.any(String) }));
    for (const order of result.orders) expect(order).toEqual(expect.objectContaining({ id: expect.any(Number), status: expect.any(String), createdAt: expect.anything() }));
    expect(JSON.stringify(result)).not.toContain("guestPhone");
    expect(JSON.stringify(result)).not.toContain("guestName");
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
      ["createBranch", ["restaurant_admin"]], ["updateBranch", ["restaurant_admin"]], ["deleteBranch", ["restaurant_admin"]],
      ["createMenuCategory", ["restaurant_admin"]], ["updateMenuCategory", ["restaurant_admin"]], ["deleteMenuCategory", ["restaurant_admin"]],
      ["createMenuItem", ["restaurant_admin"]], ["updateMenuItem", ["restaurant_admin"]], ["deleteMenuItem", ["restaurant_admin"]],
      ["createInventoryItem", ["restaurant_admin"]], ["updateInventoryItem", ["restaurant_admin"]], ["deleteInventoryItem", ["restaurant_admin"]],
      ["createPurchase", ["restaurant_admin"]], ["updatePurchase", ["restaurant_admin"]], ["deletePurchase", ["restaurant_admin"]],
      ["createEmployee", ["restaurant_admin"]], ["updateEmployee", ["restaurant_admin"]], ["deleteEmployee", ["restaurant_admin"]],
      ["createCampaign", ["restaurant_admin"]], ["updateCampaign", ["restaurant_admin"]], ["deleteCampaign", ["restaurant_admin"]],
      ["createCoupon", ["restaurant_admin"]], ["updateCoupon", ["restaurant_admin"]], ["deleteCoupon", ["restaurant_admin"]],
      ["createTable", ["restaurant_admin"]], ["deleteTable", ["restaurant_admin"]],
      ["createRestaurantRole", ["restaurant_admin"]], ["updateRestaurantRole", ["restaurant_admin"]], ["deleteRestaurantRole", ["restaurant_admin"]],
      ["updateBranding", ["restaurant_admin"]], ["setRestaurantRolePermissions", ["restaurant_admin"]],
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
    for (const summary of [customerSummary, driverSummary]) {
      expect(typeof summary.avgFulfillmentMinutes).toBe("number");
      expect(typeof summary.deliveryOrders).toBe("number");
      expect(typeof summary.customerOrders).toBe("number");
      expect(summary.avgFulfillmentMinutes).toBeGreaterThanOrEqual(0);
      expect(summary.deliveryOrders).toBeGreaterThanOrEqual(0);
      expect(summary.customerOrders).toBeGreaterThanOrEqual(0);
    }
  });

  it("allows restaurant admins to read a branch-scoped summary without platform 403", async () => {
    const summary = await appRouter.createCaller(context("user", "restaurant_admin")).platform.roleSummary({ restaurantId: 1, branchId: 1 });
    expect(summary.scope).toBe("restaurant");
    expect(summary.available).toBe(true);
    expect(summary.tables).toBeGreaterThanOrEqual(0);
    expect(summary.orders).toBeGreaterThanOrEqual(0);
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

  it("exposes branch allowance and protects branch creation by role", async () => {
    const db = await getDb();
    if (!db) return;
    const restaurant = (await db.select({ id: restaurants.id }).from(restaurants).limit(1))[0];
    if (!restaurant) return;
    const admin = appRouter.createCaller(context("admin"));
    const allowance = await admin.platform.branchLimit({ restaurantId: restaurant.id });
    expect(allowance).toEqual(expect.objectContaining({ used: expect.any(Number), canCreate: expect.any(Boolean) }));
    await expect(appRouter.createCaller(context("user", "waiter")).platform.createBranch({ restaurantId: restaurant.id, name: "فرع غير مصرح", city: "الرياض", status: "open" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("exposes employee allowance and protects waiter and driver staff creation by role", async () => {
    const db = await getDb();
    if (!db) return;
    const restaurant = (await db.select({ id: restaurants.id }).from(restaurants).limit(1))[0];
    if (!restaurant) return;
    const allowance = await appRouter.createCaller(context("admin")).platform.employeeLimit({ restaurantId: restaurant.id });
    expect(allowance).toEqual(expect.objectContaining({ used: expect.any(Number), canCreate: expect.any(Boolean) }));
    await expect(appRouter.createCaller(context("user", "waiter")).platform.createEmployee({ restaurantId: restaurant.id, name: "نادل غير مصرح", role: "نادل", status: "active" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(context("user", "driver")).platform.createEmployee({ restaurantId: restaurant.id, name: "سائق غير مصرح", role: "سائق", status: "active" })).rejects.toMatchObject({ code: "FORBIDDEN" });
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

  it("persists and removes admin menu category and item CRUD", async () => {
    const db = await getDb();
    if (!db) return;
    const restaurant = (await db.select({ id: restaurants.id }).from(restaurants).limit(1))[0];
    if (!restaurant) return;
    const caller = appRouter.createCaller(context("admin"));
    const suffix = Date.now();
    const category = await caller.platform.createMenuCategory({ restaurantId: restaurant.id, name: `اختبار CRUD ${suffix}`, sortOrder: 999 });
    let itemId: number | undefined;
    try {
      const persistedCategory = (await db.select({ id: menuCategories.id, name: menuCategories.name }).from(menuCategories).where(eq(menuCategories.id, category.id)).limit(1))[0];
      expect(persistedCategory?.name).toBe(`اختبار CRUD ${suffix}`);
      const item = await caller.platform.createMenuItem({ restaurantId: restaurant.id, categoryId: category.id, name: `صنف CRUD ${suffix}`, price: "9.99" });
      itemId = item.id;
      await expect(caller.platform.updateMenuItem({ restaurantId: restaurant.id, id: item.id, name: `صنف CRUD محدث ${suffix}`, price: "11.99" })).resolves.toMatchObject({ success: true, id: item.id });
      const persistedItem = (await db.select({ name: menuItems.name, price: menuItems.price }).from(menuItems).where(eq(menuItems.id, item.id)).limit(1))[0];
      expect(persistedItem?.name).toBe(`صنف CRUD محدث ${suffix}`);
      expect(String(persistedItem?.price)).toBe("11.99");
      await expect(caller.platform.deleteMenuItem({ restaurantId: restaurant.id, id: item.id })).resolves.toMatchObject({ success: true, id: item.id });
      itemId = undefined;
    } finally {
      if (itemId) await db.delete(menuItems).where(eq(menuItems.id, itemId));
      await db.delete(menuCategories).where(eq(menuCategories.id, category.id));
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
  it("saves each platform gateway independently and keeps secrets out of persistence", async () => {
    const db = await getDb();
    if (!db) return;
    const admin = appRouter.createCaller(context("admin"));
    const suffix = `${Date.now()}`;
    const moyasar = `Moyasar-${suffix}`;
    const tamara = `Tamara-${suffix}`;
    try {
      await expect(admin.platform.upsertIntegrationSetting({ scope: "platform", providerKey: moyasar, category: "الدفع", status: "configured", keyReference: "MOYASAR_API_KEY_PROD" })).resolves.toMatchObject({ success: true, secretStored: false });
      await expect(admin.platform.upsertIntegrationSetting({ scope: "platform", providerKey: tamara, category: "الدفع", status: "configured", keyReference: "TAMARA_API_KEY_PROD" })).resolves.toMatchObject({ success: true, secretStored: false });
      const rows = await db.select({ providerKey: integrationSettings.providerKey, category: integrationSettings.category, keyReference: integrationSettings.keyReference }).from(integrationSettings).where(eq(integrationSettings.scope, "platform"));
      expect(rows).toEqual(expect.arrayContaining([{ providerKey: moyasar, category: "الدفع", keyReference: "MOYASAR_API_KEY_PROD" }, { providerKey: tamara, category: "الدفع", keyReference: "TAMARA_API_KEY_PROD" }]));
      const waiter = appRouter.createCaller(context("user", "waiter"));
      await expect(waiter.platform.upsertIntegrationSetting({ scope: "platform", providerKey: `Blocked-${suffix}`, category: "الدفع", status: "configured", keyReference: "NO" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    } finally {
      await db.delete(integrationSettings).where(eq(integrationSettings.providerKey, moyasar));
      await db.delete(integrationSettings).where(eq(integrationSettings.providerKey, tamara));
    }
  });
});
