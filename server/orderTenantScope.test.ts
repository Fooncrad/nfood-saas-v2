import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const start = source.indexOf("export async function listOrdersByRestaurant");
const end = source.indexOf("export async function listOrdersForWaiter", start);
const block = source.slice(start, end);

describe("restaurant order tenant scope", () => {
  it("includes legacy branchless orders without accepting another restaurant branch", () => {
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    expect(block).toContain(".from(orders).leftJoin(branches");
    expect(block).toContain(
      "and(eq(orders.restaurantId, restaurantId), or(isNull(orders.branchId), eq(branches.restaurantId, restaurantId)))",
    );
    expect(block).not.toContain(".from(orders).innerJoin(branches");
  });

  it("returns saved order item names and quantities with each order", () => {
    expect(block).toContain("itemName:");
    expect(block).toContain("quantity: item.quantity");
    expect(block).toContain("items: itemsByOrder.get(order.id) ?? []");
  });
});
