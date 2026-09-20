import { beforeEach, describe, expect, it, vi } from "vitest";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import { getDb } from "./db";
import { getEffectivePermissionKeys, requireScopedPermission } from "./rbac";

vi.mock("./db", () => ({ getDb: vi.fn() }));
const where = vi.fn();
const query = { from: vi.fn(), innerJoin: vi.fn(), where };
beforeEach(() => {
  vi.resetAllMocks();
  query.from.mockReturnValue(query);
  query.innerJoin.mockReturnValue(query);
  vi.mocked(getDb).mockResolvedValue({ select: () => query } as unknown as NonNullable<Awaited<ReturnType<typeof getDb>>>);
  where.mockResolvedValue([]);
});
function condition() { return new MySqlDialect().sqlToQuery(where.mock.calls[0][0]); }

describe("scoped permission resolution", () => {
  it("requires restaurant-wide assignments for restaurant-wide actions", async () => {
    await getEffectivePermissionKeys(10, { restaurantId: 7 });
    const { sql, params } = condition();
    expect(sql).toContain('`scoped_role_assignments`.`branch_id` is null');
    expect(sql).toContain('`scoped_role_assignments`.`department_id` is null');
    expect(params).toContain(7);
  });
  it("does not use tenant permissions for a platform-wide action", async () => {
    await getEffectivePermissionKeys(10);
    const { sql } = condition();
    expect(sql).toContain('`scoped_role_assignments`.`restaurant_id` is null');
    expect(sql).toContain('`scoped_role_assignments`.`branch_id` is null');
    expect(sql).toContain('`scoped_role_assignments`.`department_id` is null');
  });
  it("includes inherited permissions while constraining specified branch and department", async () => {
    await getEffectivePermissionKeys(10, { restaurantId: 7, branchId: 8, departmentId: 9 });
    const { sql, params } = condition();
    expect(params).toEqual(expect.arrayContaining([10, 7, 8, 9]));
    expect(sql).toContain('`branch_id` = ? or');
    expect(sql).toContain('`department_id` = ? or');
    expect(sql).toContain('`is_active` = ?');
  });
  it("denies callers with no active assignments", async () => {
    await expect(requireScopedPermission(10, "orders.refund", { restaurantId: 7 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("allows an assigned key and denies unrelated keys", async () => {
    where.mockResolvedValueOnce([{ roleId: 1 }]).mockResolvedValueOnce([{ key: "orders.refund" }]);
    await expect(requireScopedPermission(10, "orders.refund", { restaurantId: 7 })).resolves.toBeUndefined();
    where.mockResolvedValueOnce([{ roleId: 1 }]).mockResolvedValueOnce([{ key: "orders.read" }]);
    await expect(requireScopedPermission(10, "orders.refund", { restaurantId: 7 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("fails closed when the database is unavailable", async () => {
    vi.mocked(getDb).mockResolvedValue(null);
    await expect(requireScopedPermission(10, "orders.refund")).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });
});
