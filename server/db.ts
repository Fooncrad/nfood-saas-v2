import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, branches, employees, inventoryItems, menuCategories, menuItems, orders, restaurants, users } from "../drizzle/schema";
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
export async function listBranches(restaurantId: number) { const db = await getDb(); return db ? db.select().from(branches).where(eq(branches.restaurantId, restaurantId)) : []; }
export async function listMenuCategories(restaurantId: number) { const db = await getDb(); return db ? db.select().from(menuCategories).where(eq(menuCategories.restaurantId, restaurantId)) : []; }
export async function listMenuItems(categoryId?: number) { const db = await getDb(); return db ? (categoryId ? db.select().from(menuItems).where(eq(menuItems.categoryId, categoryId)) : db.select().from(menuItems)) : []; }
export async function listOrders(branchId: number) { const db = await getDb(); return db ? db.select().from(orders).where(eq(orders.branchId, branchId)).orderBy(desc(orders.createdAt)) : []; }
export async function listInventory(restaurantId: number) { const db = await getDb(); return db ? db.select().from(inventoryItems).where(eq(inventoryItems.restaurantId, restaurantId)) : []; }
export async function listEmployees(restaurantId: number) { const db = await getDb(); return db ? db.select().from(employees).where(eq(employees.restaurantId, restaurantId)) : []; }
