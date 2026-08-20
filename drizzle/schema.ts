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
  barcode: varchar("barcode", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "trial", "suspended"]).default("trial").notNull(),
  plan: varchar("plan", { length: 64 }).default("Growth").notNull(),
  brandName: varchar("brandName", { length: 160 }),
  brandColor: varchar("brandColor", { length: 7 }).default("#e76f3c"),
  brandLogoUrl: varchar("brandLogoUrl", { length: 500 }),
  brandDescription: text("brandDescription"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const branches = mysqlTable("branches", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  city: varchar("city", { length: 120 }),
  status: mysqlEnum("status", ["open", "closed"]).default("open").notNull(),
  openingTime: varchar("openingTime", { length: 5 }),
  closingTime: varchar("closingTime", { length: 5 }),
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
  restaurantId: int("restaurantId").references(() => restaurants.id),
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
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "bank_transfer", "online", "other"]).default("cash").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "paid", "failed", "refunded"]).default("unpaid").notNull(),
  customerId: int("customerId").references(() => users.id),
  driverId: int("driverId").references(() => users.id),
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
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).default("0").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  cancelledAt: timestamp("cancelledAt"),
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

export const remoteWorkers = mysqlTable("remoteWorkers", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  userId: int("userId").notNull().references(() => users.id),
  role: varchar("role", { length: 80 }).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const remoteWorkerApplications = mysqlTable("remoteWorkerApplications", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  applicantUserId: int("applicantUserId").notNull().references(() => users.id),
  role: varchar("role", { length: 80 }).notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewedByUserId: int("reviewedByUserId").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const remoteTasks = mysqlTable("remoteTasks", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  createdByUserId: int("createdByUserId").notNull().references(() => users.id),
  assignedWorkerId: int("assignedWorkerId").references(() => remoteWorkers.id),
  type: mysqlEnum("type", ["orders", "reservations", "social", "support", "marketing", "other"]).default("other").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).default("0").notNull(),
  currency: varchar("currency", { length: 8 }).default("SAR").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["manual", "bank_transfer", "wallet", "pending_gateway"]).default("manual").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "pending", "paid", "cancelled"]).default("unpaid").notNull(),
  status: mysqlEnum("status", ["published", "reviewing", "accepted", "in_progress", "submitted", "completed", "cancelled"]).default("published").notNull(),
  dueAt: timestamp("dueAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const taskMessages = mysqlTable("taskMessages", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull().references(() => remoteTasks.id),
  senderUserId: int("senderUserId").notNull().references(() => users.id),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  branchId: int("branchId").references(() => branches.id),
  createdByUserId: int("createdByUserId").references(() => users.id),
  kind: mysqlEnum("kind", ["reservation", "waitlist"]).default("reservation").notNull(),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  partySize: int("partySize").default(1).notNull(),
  reservedFor: timestamp("reservedFor").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "seated", "completed", "cancelled", "no_show"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export const testAccounts = mysqlTable("testAccounts", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  displayName: varchar("displayName", { length: 120 }).notNull(),
  role: mysqlEnum("role", ["restaurant_admin", "waiter", "kitchen", "cashier", "customer", "driver"]).notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const pushSubscriptions = mysqlTable("pushSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  endpoint: varchar("endpoint", { length: 1000 }).notNull().unique(),
  p256dh: varchar("p256dh", { length: 255 }).notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  userAgent: varchar("userAgent", { length: 500 }),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  taskId: int("taskId").references(() => remoteTasks.id),
  type: mysqlEnum("type", ["task", "message", "payment", "system"]).default("task").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Restaurant = typeof restaurants.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Order = typeof orders.$inferSelect;


export const authSessions = mysqlTable("authSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  sessionTokenHash: varchar("sessionTokenHash", { length: 128 }).notNull().unique(),
  deviceLabel: varchar("deviceLabel", { length: 160 }),
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const userSecurity = mysqlTable("userSecurity", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  twoFactorEnabled: boolean("twoFactorEnabled").default(false).notNull(),
  passkeyEnabled: boolean("passkeyEnabled").default(false).notNull(),
  phone: varchar("phone", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const featureDefinitions = mysqlTable("featureDefinitions", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 120 }).notNull().unique(),
  label: varchar("label", { length: 160 }).notNull(),
  dependencyKey: varchar("dependencyKey", { length: 120 }),
  defaultLimit: int("defaultLimit"),
  isAddOn: boolean("isAddOn").default(false).notNull(),
  addonPrice: decimal("addonPrice", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const restaurantFeatures = mysqlTable("restaurantFeatures", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  featureId: int("featureId").notNull().references(() => featureDefinitions.id),
  enabled: boolean("enabled").default(true).notNull(),
  overrideLimit: int("overrideLimit"),
  overrideValue: varchar("overrideValue", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  branchId: int("branchId").references(() => branches.id),
  actorUserId: int("actorUserId").references(() => users.id),
  actorRole: varchar("actorRole", { length: 80 }),
  action: varchar("action", { length: 160 }).notNull(),
  entityType: varchar("entityType", { length: 80 }),
  entityId: varchar("entityId", { length: 80 }),
  outcome: mysqlEnum("outcome", ["success", "failure", "denied"]).default("success").notNull(),
  requestId: varchar("requestId", { length: 120 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
