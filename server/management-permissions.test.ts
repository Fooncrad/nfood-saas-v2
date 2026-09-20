import { beforeEach, describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { requireScopedPermission } from "./rbac";
import { getDb } from "./db";

vi.mock("./rbac", () => ({ requireScopedPermission: vi.fn() }));
vi.mock("./db", async original => ({ ...await original<typeof import("./db")>(), getDb: vi.fn() }));
function context(testRole?: "restaurant_admin" | "admin", role = "user", restaurantId = 1): TrpcContext {
  return { user: { id: 10, role, testRole, restaurantId } as unknown as NonNullable<TrpcContext["user"]>, req: { headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}
type Caller = ReturnType<typeof appRouter.createCaller>;
const operations: Array<{ name: string; key: string; run: (c: Caller) => Promise<unknown> }> = [
  { name: "create team account", key: "users.manage", run: c => c.platform.createTeamAccount({ restaurantId: 1, email: "staff@example.com", displayName: "Staff", role: "waiter", password: "Test-Password-123" }) },
  { name: "update team account", key: "users.manage", run: c => c.platform.updateTeamAccount({ restaurantId: 1, id: 2, displayName: "Staff" }) },
  { name: "create employee", key: "users.manage", run: c => c.platform.createEmployee({ restaurantId: 1, name: "Staff" }) },
  { name: "update employee", key: "users.manage", run: c => c.platform.updateEmployee({ restaurantId: 1, id: 2, name: "Staff" }) },
  { name: "delete employee", key: "users.manage", run: c => c.platform.deleteEmployee({ restaurantId: 1, id: 2 }) },
  { name: "create role", key: "roles.manage", run: c => c.platform.createRestaurantRole({ restaurantId: 1, name: "Stock" }) },
  { name: "update role", key: "roles.manage", run: c => c.platform.updateRestaurantRole({ restaurantId: 1, id: 2, name: "Stock" }) },
  { name: "delete role", key: "roles.manage", run: c => c.platform.deleteRestaurantRole({ restaurantId: 1, id: 2 }) },
  { name: "set role permissions", key: "roles.manage", run: c => c.platform.setRestaurantRolePermissions({ restaurantId: 1, roleId: 2, permissionIds: [] }) },
];
beforeEach(() => { vi.resetAllMocks(); vi.mocked(getDb).mockResolvedValue(null); });
describe("scoped user and role management", () => {
  it.each(operations)("denies $name before database access without its key", async ({ key, run }) => {
    vi.mocked(requireScopedPermission).mockRejectedValue(new TRPCError({ code: "FORBIDDEN" }));
    await expect(run(appRouter.createCaller(context()))).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(requireScopedPermission).toHaveBeenCalledWith(10, key, { restaurantId: 1 });
    expect(getDb).not.toHaveBeenCalled();
  });
  it.each(operations)("allows $name with its key to reach existing safeguards", async ({ key, run }) => {
    await expect(run(appRouter.createCaller(context()))).rejects.toThrow("Database is not available");
    expect(requireScopedPermission).toHaveBeenCalledWith(10, key, { restaurantId: 1 });
  });
  for (const ctx of [context("restaurant_admin"), context("admin"), context(undefined, "admin")]) {
    it.each(operations)(`preserves ${ctx.user?.testRole ?? "platform admin"} access to $name`, async ({ run }) => {
      await expect(run(appRouter.createCaller(ctx))).rejects.toThrow("Database is not available");
      expect(requireScopedPermission).not.toHaveBeenCalled();
    });
  }
  it.each(operations)("blocks $name by an owner of another restaurant", async ({ run }) => {
    await expect(run(appRouter.createCaller(context("restaurant_admin", "user", 3)))).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(getDb).not.toHaveBeenCalled();
  });
  it("cannot promote a delegated user to restaurant admin", async () => {
    await expect(appRouter.createCaller(context()).platform.updateTeamAccount({ restaurantId: 1, id: 2, role: "restaurant_admin" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(getDb).not.toHaveBeenCalled();
  });
  it("cannot create a restaurant admin with delegated keys", async () => {
    await expect(appRouter.createCaller(context()).platform.createTeamAccount({ restaurantId: 1, email: "owner@example.com", displayName: "Owner", role: "restaurant_admin", password: "Test-Password-123" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(getDb).not.toHaveBeenCalled();
  });
  it("requires roles.manage to change account permissions", async () => {
    vi.mocked(requireScopedPermission).mockImplementation(async (_id, key) => { if (key === "roles.manage") throw new TRPCError({ code: "FORBIDDEN" }); });
    await expect(appRouter.createCaller(context()).platform.updateTeamAccount({ restaurantId: 1, id: 2, permissions: [] })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(getDb).not.toHaveBeenCalled();
  });
  it("cannot reset or disable an existing owner with delegated keys", async () => {
    const update = vi.fn();
    const limit = vi.fn().mockResolvedValue([{ id: 2, restaurantId: 1, role: "restaurant_admin" }]);
    vi.mocked(getDb).mockResolvedValue({ select: () => ({ from: () => ({ where: () => ({ limit }) }) }), update } as unknown as NonNullable<Awaited<ReturnType<typeof getDb>>>);
    await expect(appRouter.createCaller(context()).platform.updateTeamAccount({ restaurantId: 1, id: 2, password: "Changed-Password-123", isActive: false })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(update).not.toHaveBeenCalled();
  });
  it("rejects a role belonging to another restaurant before writing permissions", async () => {
    const remove = vi.fn();
    const limit = vi.fn().mockResolvedValue([{ restaurantId: 3 }]);
    vi.mocked(getDb).mockResolvedValue({ select: () => ({ from: () => ({ where: () => ({ limit }) }) }), delete: remove } as unknown as NonNullable<Awaited<ReturnType<typeof getDb>>>);
    await expect(appRouter.createCaller(context()).platform.setRestaurantRolePermissions({ restaurantId: 1, roleId: 2, permissionIds: [] })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(remove).not.toHaveBeenCalled();
  });
});
