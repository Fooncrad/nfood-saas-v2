import { describe, expect, it } from "vitest";
import { branches, employees, inventoryItems, menuCategories, menuItems, orders, purchases, restaurants } from "../drizzle/schema";

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

  it("defines the order lifecycle columns used by POS and KDS", () => {
    expect(orders.status).toBeDefined();
    expect(orders.branchId).toBeDefined();
    expect(orders.updatedAt).toBeDefined();
    expect(orders.paymentMethod).toBeDefined();
    expect(orders.paymentStatus).toBeDefined();
  });
});
