import { and, eq, inArray, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { permissions, rolePermissions, scopedRoleAssignments } from "../drizzle/schema";
import { getDb } from "./db";

export type PermissionScope = {
  restaurantId?: number | null;
  branchId?: number | null;
  departmentId?: number | null;
};

export async function getEffectivePermissionKeys(userId: number, scope: PermissionScope = {}) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });

  const scopeConditions = [];
  if (scope.restaurantId) scopeConditions.push(or(eq(scopedRoleAssignments.restaurantId, scope.restaurantId), eq(scopedRoleAssignments.restaurantId, null))!);
  if (scope.branchId) scopeConditions.push(or(eq(scopedRoleAssignments.branchId, scope.branchId), eq(scopedRoleAssignments.branchId, null))!);
  if (scope.departmentId) scopeConditions.push(or(eq(scopedRoleAssignments.departmentId, scope.departmentId), eq(scopedRoleAssignments.departmentId, null))!);

  const assignments = await db.select({ roleId: scopedRoleAssignments.roleId })
    .from(scopedRoleAssignments)
    .where(and(eq(scopedRoleAssignments.userId, userId), eq(scopedRoleAssignments.isActive, true), ...scopeConditions));
  const roleIds = Array.from(new Set(assignments.map((row) => row.roleId)));
  if (!roleIds.length) return [] as string[];

  const rows = await db.select({ key: permissions.key })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(inArray(rolePermissions.roleId, roleIds));
  return Array.from(new Set(rows.map((row) => row.key))).sort();
}

export async function hasScopedPermission(userId: number, permissionKey: string, scope: PermissionScope = {}) {
  const keys = await getEffectivePermissionKeys(userId, scope);
  return keys.includes(permissionKey);
}

export async function requireScopedPermission(userId: number, permissionKey: string, scope: PermissionScope = {}) {
  if (!(await hasScopedPermission(userId, permissionKey, scope))) {
    throw new TRPCError({ code: "FORBIDDEN", message: `Missing required permission: ${permissionKey}` });
  }
}
