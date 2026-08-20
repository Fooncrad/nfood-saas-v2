import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const restaurants = mysqlTable("restaurants", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "trial", "suspended"]).default("trial").notNull(),
  plan: varchar("plan", { length: 64 }).default("Growth").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const branches = mysqlTable("branches", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  city: varchar("city", { length: 120 }),
  status: mysqlEnum("status", ["open", "closed"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const menuCategories = mysqlTable("menuCategories", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export const menuItems = mysqlTable("menuItems", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("imageUrl"),
  isAvailable: boolean("isAvailable").default(true).notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  branchId: int("branchId").notNull(),
  tableName: varchar("tableName", { length: 80 }),
  status: mysqlEnum("status", ["new", "preparing", "ready", "completed", "cancelled"]).default("new").notNull(),
  channel: mysqlEnum("channel", ["dine_in", "takeaway", "delivery"]).default("dine_in").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  menuItemId: int("menuItemId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
});

export const inventoryItems = mysqlTable("inventoryItems", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  unit: varchar("unit", { length: 32 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("0").notNull(),
  minimumQuantity: decimal("minimumQuantity", { precision: 10, scale: 2 }).default("0").notNull(),
});

export const restaurantTables = mysqlTable("restaurantTables", {
  id: int("id").autoincrement().primaryKey(),
  branchId: int("branchId").notNull().references(() => branches.id),
  name: varchar("name", { length: 80 }).notNull(),
  seats: int("seats").default(2).notNull(),
  status: mysqlEnum("status", ["available", "occupied", "reserved"]).default("available").notNull(),
});

export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  supplier: varchar("supplier", { length: 160 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).default("0").notNull(),
  status: mysqlEnum("status", ["draft", "received", "cancelled"]).default("received").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const attendance = mysqlTable("attendance", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull().references(() => employees.id),
  workDate: varchar("workDate", { length: 16 }).notNull(),
  status: mysqlEnum("status", ["present", "absent", "late"]).default("present").notNull(),
});

export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  name: varchar("name", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["draft", "scheduled", "active", "ended"]).default("draft").notNull(),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
});

export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id),
  code: varchar("code", { length: 64 }).notNull().unique(),
  discountPercent: int("discountPercent").default(0).notNull(),
  usageLimit: int("usageLimit"),
  usedCount: int("usedCount").default(0).notNull(),
});

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  plan: varchar("plan", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["trial", "active", "past_due", "cancelled"]).default("trial").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  renewsAt: timestamp("renewsAt"),
});

export const restaurantMembers = mysqlTable("restaurantMembers", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  userId: int("userId").notNull().references(() => users.id),
  roleId: int("roleId").references(() => roles.id),
  branchId: int("branchId").references(() => branches.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const roles = mysqlTable("roles", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  name: varchar("name", { length: 80 }).notNull(),
  scope: mysqlEnum("scope", ["platform", "restaurant"]).default("restaurant").notNull(),
});

export const permissions = mysqlTable("permissions", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 120 }).notNull().unique(),
  label: varchar("label", { length: 160 }).notNull(),
});

export const rolePermissions = mysqlTable("rolePermissions", {
  id: int("id").autoincrement().primaryKey(),
  roleId: int("roleId").notNull().references(() => roles.id),
  permissionId: int("permissionId").notNull().references(() => permissions.id),
});

export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  role: varchar("role", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Restaurant = typeof restaurants.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
