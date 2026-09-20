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
