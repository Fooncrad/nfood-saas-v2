import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, branches, employees, inventoryItems, menuCategories, menuItems, orders, restaurants, users, subscriptions, roles, permissions, restaurantTables, purchases, attendance, campaigns, coupons, remoteWorkers, remoteTasks, taskMessages, notifications, testAccounts } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listRestaurants() { const db = await getDb(); return db ? db.select().from(restaurants).orderBy(desc(restaurants.createdAt)) : []; }
export async function getRestaurantById(id: number) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1); return result[0]; }
export async function getRestaurantByBarcode(barcode: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(restaurants).where(eq(restaurants.barcode, barcode)).limit(1); return result[0]; }
export async function listBranches(restaurantId: number) { const db = await getDb(); return db ? db.select().from(branches).where(eq(branches.restaurantId, restaurantId)) : []; }
export async function listMenuCategories(restaurantId: number) { const db = await getDb(); return db ? db.select().from(menuCategories).where(eq(menuCategories.restaurantId, restaurantId)) : []; }
export async function listMenuItems(restaurantId?: number, categoryId?: number) { const db = await getDb(); if (!db) return []; if (restaurantId && categoryId) return db.select().from(menuItems).where(and(eq(menuItems.restaurantId, restaurantId), eq(menuItems.categoryId, categoryId))); if (restaurantId) return db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId)); if (categoryId) return db.select().from(menuItems).where(eq(menuItems.categoryId, categoryId)); return db.select().from(menuItems); }
export async function listOrders(branchId: number) { const db = await getDb(); return db ? db.select().from(orders).where(eq(orders.branchId, branchId)).orderBy(desc(orders.createdAt)) : []; }
export async function listInventory(restaurantId: number) { const db = await getDb(); return db ? db.select().from(inventoryItems).where(eq(inventoryItems.restaurantId, restaurantId)) : []; }
export async function listEmployees(restaurantId: number) { const db = await getDb(); return db ? db.select().from(employees).where(eq(employees.restaurantId, restaurantId)) : []; }
export async function listSubscriptions(restaurantId?: number) { const db = await getDb(); return db ? (restaurantId ? db.select().from(subscriptions).where(eq(subscriptions.restaurantId, restaurantId)) : db.select().from(subscriptions)) : []; }
export async function listRoles(restaurantId?: number) { const db = await getDb(); return db ? (restaurantId ? db.select().from(roles).where(eq(roles.restaurantId, restaurantId)) : db.select().from(roles)) : []; }
export async function listPermissions() { const db = await getDb(); return db ? db.select().from(permissions) : []; }
export async function listTables(branchId: number) { const db = await getDb(); return db ? db.select().from(restaurantTables).where(eq(restaurantTables.branchId, branchId)) : []; }
export async function listPurchases(restaurantId: number) { const db = await getDb(); return db ? db.select().from(purchases).where(eq(purchases.restaurantId, restaurantId)).orderBy(desc(purchases.createdAt)) : []; }
export async function listAttendance(employeeId?: number) { const db = await getDb(); return db ? (employeeId ? db.select().from(attendance).where(eq(attendance.employeeId, employeeId)) : db.select().from(attendance)) : []; }
export async function listCampaigns(restaurantId: number) { const db = await getDb(); return db ? db.select().from(campaigns).where(eq(campaigns.restaurantId, restaurantId)) : []; }
export async function listCoupons(campaignId?: number) { const db = await getDb(); return db ? (campaignId ? db.select().from(coupons).where(eq(coupons.campaignId, campaignId)) : db.select().from(coupons)) : []; }
export async function listRemoteWorkers(restaurantId: number) { const db = await getDb(); return db ? db.select().from(remoteWorkers).where(eq(remoteWorkers.restaurantId, restaurantId)) : []; }
export async function listRemoteTasks(restaurantId: number) { const db = await getDb(); return db ? db.select().from(remoteTasks).where(eq(remoteTasks.restaurantId, restaurantId)).orderBy(desc(remoteTasks.createdAt)) : []; }
export async function listTaskMessages(taskId: number) { const db = await getDb(); return db ? db.select().from(taskMessages).where(eq(taskMessages.taskId, taskId)).orderBy(taskMessages.createdAt) : []; }
export async function listNotifications(userId: number) { const db = await getDb(); return db ? db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)) : []; }
export async function getTestAccountByEmail(email: string) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(testAccounts).where(eq(testAccounts.email, email.toLowerCase())).limit(1); return rows[0]; }
export async function getTestAccountById(id: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(testAccounts).where(eq(testAccounts.id, id)).limit(1); return rows[0]; }
