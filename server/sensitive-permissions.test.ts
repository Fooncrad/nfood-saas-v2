import { beforeEach, describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { requireScopedPermission } from "./rbac";
import { getDb } from "./db";

vi.mock("./rbac", () => ({ requireScopedPermission: vi.fn() }));
vi.mock("./db", async (original) => ({ ...await original<typeof import("./db")>(), getDb: vi.fn() }));

function context(testRole?: "cashier" | "restaurant_admin" | "admin", role = "user", restaurantId = 1): TrpcContext {
  return { user: { id: 10, role, testRole, restaurantId } as unknown as NonNullable<TrpcContext["user"]>, req: { headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}
const input = { restaurantId: 1, orderId: 2, pin: "1234" };
beforeEach(() => { vi.resetAllMocks(); vi.mocked(getDb).mockResolvedValue(null); });

describe("refund permission enforcement", () => {
  it("denies missing permission before reading or mutating order data", async () => {
    vi.mocked(requireScopedPermission).mockRejectedValue(new TRPCError({ code: "FORBIDDEN" }));
    await expect(appRouter.createCaller(context("cashier")).platform.refundOrder(input)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(requireScopedPermission).toHaveBeenCalledWith(10, "orders.refund", { restaurantId: 1 });
    expect(getDb).not.toHaveBeenCalled();
  });
  it("does not bypass the existing finance gate when a cashier has the scoped key", async () => {
    await expect(appRouter.createCaller(context("cashier")).platform.refundOrder(input)).rejects.toMatchObject({ code: "FORBIDDEN", message: "لا تملك صلاحية finance.read" });
    expect(requireScopedPermission).toHaveBeenCalledWith(10, "orders.refund", { restaurantId: 1 });
    expect(getDb).not.toHaveBeenCalled();
  });
  it.each([context("restaurant_admin"), context("admin"), context(undefined, "admin")])("preserves owner and platform admin access", async (ctx) => {
    await expect(appRouter.createCaller(ctx).platform.refundOrder(input)).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
    expect(requireScopedPermission).not.toHaveBeenCalled();
    expect(getDb).toHaveBeenCalled();
  });
  it.each(["cashier", "restaurant_admin"] as const)("blocks %s outside their restaurant", async (role) => {
    await expect(appRouter.createCaller(context(role, "user", 3)).platform.refundOrder(input)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(requireScopedPermission).not.toHaveBeenCalled();
    expect(getDb).not.toHaveBeenCalled();
  });
});

type Caller = ReturnType<typeof appRouter.createCaller>;
const operations: Array<{ name: string; key: string; run: (caller: Caller) => Promise<unknown> }> = [
  { name: "create inventory", key: "inventory.adjust", run: c => c.platform.createInventoryItem({ restaurantId: 1, name: "Flour", unit: "kg" }) },
  { name: "update inventory", key: "inventory.adjust", run: c => c.platform.updateInventoryItem({ restaurantId: 1, id: 2, quantity: "4" }) },
  { name: "delete inventory", key: "inventory.adjust", run: c => c.platform.deleteInventoryItem({ restaurantId: 1, id: 2 }) },
  { name: "create purchase", key: "purchase.create", run: c => c.platform.createPurchase({ restaurantId: 1, supplier: "Supplier", total: "10", status: "draft" }) },
  { name: "update purchase", key: "purchase.create", run: c => c.platform.updatePurchase({ restaurantId: 1, id: 2, total: "20" }) },
  { name: "delete purchase", key: "purchase.approve", run: c => c.platform.deletePurchase({ restaurantId: 1, id: 2 }) },
];

describe("inventory and purchase permission enforcement", () => {
  it.each(operations)("denies $name without the key before database access", async ({ key, run }) => {
    vi.mocked(requireScopedPermission).mockRejectedValue(new TRPCError({ code: "FORBIDDEN" }));
    await expect(run(appRouter.createCaller(context()))).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(requireScopedPermission).toHaveBeenCalledWith(10, key, { restaurantId: 1 });
    expect(getDb).not.toHaveBeenCalled();
  });
  it.each(operations)("allows $name with permission to reach existing safeguards", async ({ key, run }) => {
    await expect(run(appRouter.createCaller(context()))).rejects.toThrow("Database is not available");
    expect(requireScopedPermission).toHaveBeenCalledWith(10, key, { restaurantId: 1 });
  });
  for (const ctx of [context("restaurant_admin"), context("admin"), context(undefined, "admin")]) {
    it.each(operations)(`preserves ${ctx.user?.testRole ?? "platform admin"} access to $name`, async ({ run }) => {
      await expect(run(appRouter.createCaller(ctx))).rejects.toThrow("Database is not available");
      expect(requireScopedPermission).not.toHaveBeenCalled();
    });
  }
  it.each(operations)("blocks the owner from $name in another restaurant", async ({ run }) => {
    await expect(run(appRouter.createCaller(context("restaurant_admin", "user", 3)))).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(getDb).not.toHaveBeenCalled();
  });
  it.each([undefined, "received"] as const)("requires approval for a directly received purchase (%s)", async (status) => {
    vi.mocked(requireScopedPermission).mockImplementation(async (_user, key) => {
      if (key === "purchase.approve") throw new TRPCError({ code: "FORBIDDEN" });
    });
    await expect(appRouter.createCaller(context()).platform.createPurchase({ restaurantId: 1, supplier: "Supplier", total: "10", status })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(requireScopedPermission).toHaveBeenCalledWith(10, "purchase.approve", { restaurantId: 1 });
    expect(getDb).not.toHaveBeenCalled();
  });
  it("requires approval even when editing a purchase without a status field", async () => {
    vi.mocked(requireScopedPermission).mockImplementation(async (_user, key) => {
      if (key === "purchase.approve") throw new TRPCError({ code: "FORBIDDEN" });
    });
    await expect(appRouter.createCaller(context()).platform.updatePurchase({ restaurantId: 1, id: 2, total: "50" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(getDb).not.toHaveBeenCalled();
  });
  it("creates a draft with only purchase.create", async () => {
    const values = vi.fn().mockResolvedValue([{ insertId: 42 }]);
    vi.mocked(getDb).mockResolvedValue({ insert: () => ({ values }) } as unknown as NonNullable<Awaited<ReturnType<typeof getDb>>>);
    await expect(appRouter.createCaller(context()).platform.createPurchase({ restaurantId: 1, supplier: "Supplier", total: "10", status: "draft" })).resolves.toEqual({ success: true, id: 42 });
    expect(requireScopedPermission).toHaveBeenCalledTimes(1);
    expect(requireScopedPermission).toHaveBeenCalledWith(10, "purchase.create", { restaurantId: 1 });
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ status: "draft", restaurantId: 1 }));
  });
});
