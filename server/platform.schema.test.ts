import { describe, expect, it } from "vitest";
import { branches, coupons, employees, inventoryItems, menuCategories, menuItems, orders, purchases, restaurants } from "../drizzle/schema";
import { getNextBranchOpeningLabel, isBranchAcceptingOrders, parseBranchOperatingWindows } from "./db";

describe("NFOOD platform schema", () => {
  it("exposes the core restaurant operating tables", () => {
    expect(restaurants).toBeDefined();
    expect(branches).toBeDefined();
    expect(menuCategories).toBeDefined();
    expect(menuItems).toBeDefined();
    expect(orders).toBeDefined();
    expect(inventoryItems).toBeDefined();
    expect(employees).toBeDefined();
    expect(purchases).toBeDefined();
  });

  it("defines a unique barcode column for each restaurant account", () => {
    expect(restaurants.barcode).toBeDefined();
    expect(restaurants.barcode.config.notNull).toBe(true);
  });

  it("defines branch-scoped staff support for restaurant operations", () => {
    expect(employees.branchId).toBeDefined();
    expect(employees.role).toBeDefined();
  });

  it("defines persisted branch operating hours", () => {
    expect(branches.openingTime).toBeDefined();
    expect(branches.closingTime).toBeDefined();
    expect(branches.operatingWindowsJson).toBeDefined();
  });

  it("accepts orders only inside configured weekly windows", () => {
    const windows = JSON.stringify([{ dayOfWeek: 2, startTime: "09:00", endTime: "15:00", channels: ["delivery"] }]);
    expect(parseBranchOperatingWindows(windows)).toHaveLength(1);
    expect(isBranchAcceptingOrders({ status: "open", operatingWindowsJson: windows }, "delivery", new Date("2026-08-25T09:00:00.000Z"))).toBe(true);
    expect(isBranchAcceptingOrders({ status: "open", operatingWindowsJson: windows }, "dine_in", new Date("2026-08-25T09:00:00.000Z"))).toBe(false);
    expect(getNextBranchOpeningLabel({ operatingWindowsJson: windows }, "delivery", new Date("2026-08-25T10:00:00.000Z"))).toContain("الثلاثاء");
  });

  it("defines persisted coupon fields for tenant-scoped marketing", () => {
    expect(coupons).toBeDefined();
    expect(coupons.campaignId).toBeDefined();
    expect(coupons.code).toBeDefined();
    expect(coupons.discountPercent).toBeDefined();
  });

  it("defines the order lifecycle columns used by POS and KDS", () => {
    expect(orders.status).toBeDefined();
    expect(orders.branchId).toBeDefined();
    expect(orders.updatedAt).toBeDefined();
    expect(orders.paymentMethod).toBeDefined();
    expect(orders.paymentStatus).toBeDefined();
    expect(orders.notes).toBeDefined();
    expect(orders.cashierNotes).toBeDefined();
    expect(orders.customerId).toBeDefined();
    expect(orders.guestName).toBeDefined();
    expect(orders.guestPhone).toBeDefined();
  });
});
