import { and, count, desc, eq, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { InsertUser, branches, employees, inventoryItems, menuCategories, menuItems, orders, restaurants, users, subscriptions, roles, permissions, restaurantTables, purchases, attendance, campaigns, coupons, remoteWorkers, remoteTasks, taskMessages, notifications, testAccounts, authSessions, userSecurity, featureDefinitions, restaurantFeatures, auditLogs, platformSettings, integrationSettings, loyaltyAccounts, loyaltyTransactions, referralRecords, customerProfiles, supportAgents, supportTickets, restaurantMembers, apiWebhooks, vcardCardProducts, vcardCardOrders, vcardCardCodes, vcardCardBindings } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export const PLATFORM_SETTING_KEYS = ["supportEmail", "supportPhone", "defaultCurrency", "defaultTimezone", "baseDomain", "maintenanceMode", "allowGuestCheckout", "siteLanguage", "availableLanguages", "country", "siteName", "copyrightYear", "currencyDisplayMode", "numberFormat", "pricingLayout", "analyticsId", "facebookPixelId", "siteDescription", "homepageContent", "termsOfService", "privacyPolicy", "refundPolicy", "subscriptionTaxRate", "taxNumber", "companyDetails", "vcardEnabledRoles"] as const;
export const LOYALTY_TIERS = [
  { key: "standard", label: "Standard", minPoints: 0 },
  { key: "silver", label: "Silver", minPoints: 500 },
  { key: "gold", label: "Gold", minPoints: 1000 },
] as const;
export type LoyaltyTier = typeof LOYALTY_TIERS[number]["key"];
export function getLoyaltyTier(points: number): LoyaltyTier {
  const safePoints = Math.max(0, points);
  return safePoints >= 1000 ? "gold" : safePoints >= 500 ? "silver" : "standard";
}
export type PlatformSettingKey = typeof PLATFORM_SETTING_KEYS[number];

export async function listIntegrationSettings(scope: "platform" | "restaurant", restaurantId?: number) {
  const db = await getDb(); if (!db) return [];
  const filters = scope === "platform" ? eq(integrationSettings.scope, "platform") : and(eq(integrationSettings.scope, "restaurant"), restaurantId ? eq(integrationSettings.restaurantId, restaurantId) : eq(integrationSettings.restaurantId, 0));
  return db.select().from(integrationSettings).where(filters).orderBy(integrationSettings.category, integrationSettings.providerKey);
}
function integrationKey() { return createHash("sha256").update(process.env.JWT_SECRET || "nfood-integration-secret").digest(); }
export function encryptIntegrationSecret(secret: string) { const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", integrationKey(), iv); const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]); return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${ciphertext.toString("base64url")}`; }
export async function upsertIntegrationSetting(input: { scope: "platform" | "restaurant"; restaurantId?: number; providerKey: string; category: string; status: "not_configured" | "configured" | "disabled"; keyReference?: string | null; secret?: string | null; updatedByUserId: number }) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  const existing = await db.select({ id: integrationSettings.id }).from(integrationSettings).where(and(eq(integrationSettings.scope, input.scope), eq(integrationSettings.providerKey, input.providerKey), input.scope === "restaurant" ? eq(integrationSettings.restaurantId, input.restaurantId ?? 0) : eq(integrationSettings.scope, "platform"))).limit(1);
  const encrypted = input.secret?.trim() ? encryptIntegrationSecret(input.secret.trim()) : undefined;
  if (existing[0]) { await db.update(integrationSettings).set({ category: input.category, status: input.status, keyReference: input.keyReference ?? null, ...(encrypted ? { secretCiphertext: encrypted } : {}), updatedByUserId: input.updatedByUserId, updatedAt: new Date() }).where(eq(integrationSettings.id, existing[0].id)); return existing[0].id; }
  const result = await db.insert(integrationSettings).values({ scope: input.scope, restaurantId: input.restaurantId ?? null, providerKey: input.providerKey, category: input.category, status: input.status, keyReference: input.keyReference ?? null, secretCiphertext: encrypted ?? null, updatedByUserId: input.updatedByUserId }); return Number(result[0].insertId);
}

export async function getCustomerProfile(userId: number) { const db = await getDb(); if (!db) return undefined; return (await db.select().from(customerProfiles).where(eq(customerProfiles.userId, userId)).limit(1))[0]; }
export async function getPublicCustomerProfile(slug: string) { const db = await getDb(); if (!db) return undefined; const profile = (await db.select({ id: customerProfiles.id, slug: customerProfiles.slug, isPublic: customerProfiles.isPublic, displayName: customerProfiles.displayName, title: customerProfiles.title, bio: customerProfiles.bio, avatarUrl: customerProfiles.avatarUrl, coverUrl: customerProfiles.coverUrl, phone: customerProfiles.phone, whatsapp: customerProfiles.whatsapp, email: customerProfiles.email, websiteUrl: customerProfiles.websiteUrl, address: customerProfiles.address, city: customerProfiles.city, instagramUrl: customerProfiles.instagramUrl, twitterUrl: customerProfiles.twitterUrl, facebookUrl: customerProfiles.facebookUrl, linkedinUrl: customerProfiles.linkedinUrl, servicesJson: customerProfiles.servicesJson }).from(customerProfiles).where(and(eq(customerProfiles.slug, slug), eq(customerProfiles.isPublic, true))).limit(1))[0]; if (!profile) return undefined; let services: Array<{ name: string; description?: string; url?: string }> = []; try { services = profile.servicesJson ? JSON.parse(profile.servicesJson) : []; } catch { services = []; } return { ...profile, services }; }
export async function upsertCustomerProfile(userId: number, input: { slug: string; isPublic: boolean; displayName?: string | null; title?: string | null; bio?: string | null; avatarUrl?: string | null; coverUrl?: string | null; phone?: string | null; whatsapp?: string | null; email?: string | null; websiteUrl?: string | null; address?: string | null; city?: string | null; instagramUrl?: string | null; twitterUrl?: string | null; facebookUrl?: string | null; linkedinUrl?: string | null; servicesJson?: string | null }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const existing = await getCustomerProfile(userId); if (existing) { await db.update(customerProfiles).set({ ...input, updatedAt: new Date() }).where(eq(customerProfiles.userId, userId)); return existing.id; } const result = await db.insert(customerProfiles).values({ userId, ...input }); return Number(result[0].insertId); }

export async function listSupportTickets(restaurantId?: number) { const db = await getDb(); if (!db) return []; return db.select().from(supportTickets).where(restaurantId ? eq(supportTickets.restaurantId, restaurantId) : undefined).orderBy(desc(supportTickets.createdAt)); }
export async function listSupportAgents(includeInactive = false) { const db = await getDb(); if (!db) return []; return db.select({ id: supportAgents.id, userId: supportAgents.userId, isActive: supportAgents.isActive, skillsJson: supportAgents.skillsJson }).from(supportAgents).where(includeInactive ? undefined : eq(supportAgents.isActive, true)); }
export async function createSupportAgent(input: { userId: number; skillsJson?: string }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const result = await db.insert(supportAgents).values({ userId: input.userId, skillsJson: input.skillsJson ?? null }); return Number(result[0].insertId); }
export async function updateSupportAgent(id: number, input: { isActive?: boolean; skillsJson?: string | null }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); await db.update(supportAgents).set({ ...input, updatedAt: new Date() }).where(eq(supportAgents.id, id)); }
export async function deleteSupportAgent(id: number) { const db = await getDb(); if (!db) throw new Error("Database is not available"); await db.delete(supportAgents).where(eq(supportAgents.id, id)); }
export async function createSupportTicket(input: { restaurantId?: number; requesterUserId: number; subject: string; description: string; priority: "low" | "normal" | "high" | "urgent" }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const now = Date.now(); const responseHours = input.priority === "urgent" ? 2 : input.priority === "high" ? 8 : input.priority === "normal" ? 24 : 48; const resolutionHours = input.priority === "urgent" ? 24 : input.priority === "high" ? 72 : input.priority === "normal" ? 120 : 168; const result = await db.insert(supportTickets).values({ ...input, restaurantId: input.restaurantId ?? null, firstResponseDueAt: new Date(now + responseHours * 3600000), resolutionDueAt: new Date(now + resolutionHours * 3600000) }); return Number(result[0].insertId); }
export async function updateSupportTicket(id: number, input: { status?: "open" | "in_progress" | "pending" | "resolved" | "closed"; assignedAgentId?: number | null }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); await db.update(supportTickets).set({ ...input, updatedAt: new Date() }).where(eq(supportTickets.id, id)); }
export async function listApiWebhooks(scope: "platform" | "restaurant", restaurantId?: number) { const db = await getDb(); if (!db) return []; return db.select({ id: apiWebhooks.id, scope: apiWebhooks.scope, restaurantId: apiWebhooks.restaurantId, name: apiWebhooks.name, endpointUrl: apiWebhooks.endpointUrl, eventsJson: apiWebhooks.eventsJson, status: apiWebhooks.status, createdAt: apiWebhooks.createdAt, updatedAt: apiWebhooks.updatedAt }).from(apiWebhooks).where(and(eq(apiWebhooks.scope, scope), scope === "restaurant" && restaurantId ? eq(apiWebhooks.restaurantId, restaurantId) : undefined)).orderBy(desc(apiWebhooks.updatedAt)); }
export async function upsertApiWebhook(input: { scope: "platform" | "restaurant"; restaurantId?: number; name: string; endpointUrl: string; secretHash: string; eventsJson: string; status: "active" | "disabled"; createdByUserId: number }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const result = await db.insert(apiWebhooks).values({ ...input, restaurantId: input.restaurantId ?? null }); return Number(result[0].insertId); }
export async function getApiWebhook(id: number) { const db = await getDb(); if (!db) return undefined; return (await db.select().from(apiWebhooks).where(eq(apiWebhooks.id, id)).limit(1))[0]; }
export async function updateApiWebhook(id: number, input: { name?: string; endpointUrl?: string; eventsJson?: string; status?: "active" | "disabled" }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); await db.update(apiWebhooks).set({ ...input, updatedAt: new Date() }).where(eq(apiWebhooks.id, id)); }
export async function deleteApiWebhook(id: number) { const db = await getDb(); if (!db) throw new Error("Database is not available"); await db.delete(apiWebhooks).where(eq(apiWebhooks.id, id)); }

export async function listVcardProducts(includeInactive = false) { const db = await getDb(); if (!db) return []; return db.select().from(vcardCardProducts).where(includeInactive ? undefined : eq(vcardCardProducts.isActive, true)).orderBy(desc(vcardCardProducts.createdAt)); }
export async function createVcardProduct(input: { name: string; description?: string; price: string; currency?: string; targetRole: "customer" | "restaurant" | "driver"; isActive?: boolean }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const result = await db.insert(vcardCardProducts).values({ ...input, description: input.description ?? null, currency: input.currency ?? "SAR", isActive: input.isActive ?? true }); return Number(result[0].insertId); }
export async function createVcardOrder(input: { productId: number; userId: number; restaurantId?: number }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const result = await db.insert(vcardCardOrders).values({ ...input, restaurantId: input.restaurantId ?? null, status: "pending_payment" }); return Number(result[0].insertId); }
export async function createVcardCode(input: { productId: number; codeHash: string; codeLast4: string }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const result = await db.insert(vcardCardCodes).values({ ...input, status: "available" }); return Number(result[0].insertId); }
export async function listVcardCodes(productId?: number) { const db = await getDb(); if (!db) return []; return db.select({ id: vcardCardCodes.id, productId: vcardCardCodes.productId, codeLast4: vcardCardCodes.codeLast4, status: vcardCardCodes.status, orderId: vcardCardCodes.orderId, createdAt: vcardCardCodes.createdAt, boundAt: vcardCardCodes.boundAt }).from(vcardCardCodes).where(productId ? eq(vcardCardCodes.productId, productId) : undefined).orderBy(desc(vcardCardCodes.createdAt)); }
export async function disableVcardCode(id: number) { const db = await getDb(); if (!db) throw new Error("Database is not available"); await db.update(vcardCardCodes).set({ status: "disabled" }).where(eq(vcardCardCodes.id, id)); }
export async function bindVcardCode(input: { codeHash: string; userId: number; targetRole: "customer" | "restaurant" | "driver"; customerProfileId?: number; restaurantId?: number }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const code = (await db.select().from(vcardCardCodes).where(eq(vcardCardCodes.codeHash, input.codeHash)).limit(1))[0]; if (!code || code.status !== "available") throw new Error("VCard code is unavailable"); const result = await db.insert(vcardCardBindings).values({ codeId: code.id, userId: input.userId, customerProfileId: input.customerProfileId ?? null, restaurantId: input.restaurantId ?? null, targetRole: input.targetRole }); await db.update(vcardCardCodes).set({ status: "bound", boundAt: new Date() }).where(eq(vcardCardCodes.id, code.id)); return Number(result[0].insertId); }
export async function getVcardBinding(userId: number) { const db = await getDb(); if (!db) return undefined; return (await db.select().from(vcardCardBindings).where(eq(vcardCardBindings.userId, userId)).limit(1))[0]; }

export async function getPlatformSettings() {
  const db = await getDb();
  const defaults: Record<PlatformSettingKey, string> = { supportEmail: "", supportPhone: "", defaultCurrency: "SAR", defaultTimezone: "Asia/Riyadh", baseDomain: "", maintenanceMode: "false", allowGuestCheckout: "true", siteLanguage: "ar", availableLanguages: "ar,en,fr", country: "Saudi Arabia", siteName: "NFOOD Restaurant SaaS", copyrightYear: String(new Date().getFullYear()), currencyDisplayMode: "symbol", numberFormat: "1,000.00", pricingLayout: "style-1", analyticsId: "", facebookPixelId: "", siteDescription: "", homepageContent: "", termsOfService: "", privacyPolicy: "", refundPolicy: "", subscriptionTaxRate: "0", taxNumber: "", companyDetails: "", vcardEnabledRoles: "customer" };
  if (!db) return defaults;
  const rows = await db.select({ key: platformSettings.settingKey, value: platformSettings.settingValue }).from(platformSettings);
  for (const row of rows) { if (row.key in defaults) defaults[row.key as PlatformSettingKey] = row.value; }
  return defaults;
}

export async function setPlatformSetting(key: PlatformSettingKey, value: string, updatedByUserId: number) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  await db.insert(platformSettings).values({ settingKey: key, settingValue: value, updatedByUserId }).onDuplicateKeyUpdate({ set: { settingValue: value, updatedByUserId, updatedAt: new Date() } });
}

export async function getLoyaltyAccount(restaurantId: number, customerId: number) {
  const db = await getDb(); if (!db) return undefined;
  return (await db.select().from(loyaltyAccounts).where(and(eq(loyaltyAccounts.restaurantId, restaurantId), eq(loyaltyAccounts.customerId, customerId))).limit(1))[0];
}

export async function ensureLoyaltyAccount(restaurantId: number, customerId: number) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  const existing = await getLoyaltyAccount(restaurantId, customerId);
  if (existing) return existing;
  const result = await db.insert(loyaltyAccounts).values({ restaurantId, customerId, pointsBalance: 0, tier: "standard" });
  return (await db.select().from(loyaltyAccounts).where(eq(loyaltyAccounts.id, Number(result[0].insertId))).limit(1))[0];
}

export async function getLoyaltySummary(restaurantId: number, customerId: number) {
  const account = await ensureLoyaltyAccount(restaurantId, customerId);
  const db = await getDb(); if (!db || !account) return { account, transactions: [] };
  const transactions = await db.select().from(loyaltyTransactions).where(and(eq(loyaltyTransactions.restaurantId, restaurantId), eq(loyaltyTransactions.customerId, customerId))).orderBy(desc(loyaltyTransactions.createdAt)).limit(50);
  return { account, transactions };
}

export async function addLoyaltyPoints(restaurantId: number, customerId: number, points: number, type: "earn" | "adjust" | "redeem", note?: string, orderId?: number) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  const account = await ensureLoyaltyAccount(restaurantId, customerId);
  if (!account) throw new Error("Loyalty account could not be created");
  const nextBalance = account.pointsBalance + points;
  if (nextBalance < 0) throw new Error("Loyalty points cannot be negative");
  await db.update(loyaltyAccounts).set({ pointsBalance: nextBalance, tier: getLoyaltyTier(nextBalance), updatedAt: new Date() }).where(eq(loyaltyAccounts.id, account.id));
  const result = await db.insert(loyaltyTransactions).values({ restaurantId, customerId, orderId: orderId ?? null, points, type, note: note ?? null });
  return { accountId: account.id, transactionId: Number(result[0].insertId), pointsBalance: nextBalance };
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

export async function listRestaurants(restaurantId?: number) { const db = await getDb(); if (!db) return []; return restaurantId ? db.select().from(restaurants).where(eq(restaurants.id, restaurantId)).orderBy(desc(restaurants.createdAt)) : db.select().from(restaurants).orderBy(desc(restaurants.createdAt)); }
export async function listRestaurantsWithBranchCount() { const db = await getDb(); if (!db) return []; const rows = await db.select().from(restaurants).orderBy(desc(restaurants.createdAt)); const counts = await db.select({ restaurantId: branches.restaurantId, branchCount: count() }).from(branches).groupBy(branches.restaurantId); const countByRestaurant = new Map(counts.map((row) => [row.restaurantId, Number(row.branchCount)])); return rows.map((restaurant) => ({ ...restaurant, branchCount: countByRestaurant.get(restaurant.id) ?? 0 })); }
export async function getRestaurantById(id: number) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1); return result[0]; }
export async function getPublicRestaurantPage(slug: string) { const db = await getDb(); if (!db) return undefined; const restaurant = (await db.select({ id: restaurants.id, slug: restaurants.slug, customDomain: restaurants.customDomain, name: restaurants.name, status: restaurants.status, brandName: restaurants.brandName, brandColor: restaurants.brandColor, brandLogoUrl: restaurants.brandLogoUrl, brandDescription: restaurants.brandDescription, phone: restaurants.phone, whatsapp: restaurants.whatsapp, instagramUrl: restaurants.instagramUrl, facebookUrl: restaurants.facebookUrl, tiktokUrl: restaurants.tiktokUrl, websiteUrl: restaurants.websiteUrl, address: restaurants.address, reservationEnabled: restaurants.reservationEnabled }).from(restaurants).where(and(eq(restaurants.slug, slug), ne(restaurants.status, "suspended"))).limit(1))[0]; if (!restaurant) return undefined; const categories = await db.select({ id: menuCategories.id, name: menuCategories.name, sortOrder: menuCategories.sortOrder }).from(menuCategories).where(eq(menuCategories.restaurantId, restaurant.id)); const items = await db.select({ id: menuItems.id, categoryId: menuItems.categoryId, name: menuItems.name, description: menuItems.description, price: menuItems.price, imageUrl: menuItems.imageUrl }).from(menuItems).where(and(eq(menuItems.restaurantId, restaurant.id), eq(menuItems.isAvailable, true))); const branchList = await db.select({ id: branches.id, name: branches.name, city: branches.city, openingTime: branches.openingTime, closingTime: branches.closingTime }).from(branches).where(and(eq(branches.restaurantId, restaurant.id), eq(branches.status, "open"))); const owner = (await db.select({ email: users.email }).from(restaurantMembers).innerJoin(users, eq(restaurantMembers.userId, users.id)).where(eq(restaurantMembers.restaurantId, restaurant.id)).limit(1))[0]; return { restaurant: { ...restaurant, email: owner?.email ?? null }, branches: branchList, categories, items }; }
export async function listPublicRestaurants() { const db = await getDb(); if (!db) return []; return db.select({ id: restaurants.id, name: restaurants.name, slug: restaurants.slug, brandName: restaurants.brandName, brandColor: restaurants.brandColor, brandLogoUrl: restaurants.brandLogoUrl, brandDescription: restaurants.brandDescription, city: restaurants.city, address: restaurants.address, phone: restaurants.phone, reservationEnabled: restaurants.reservationEnabled }).from(restaurants).where(ne(restaurants.status, "suspended")).orderBy(restaurants.name); }
export async function getRestaurantByBarcode(barcode: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(restaurants).where(eq(restaurants.barcode, barcode)).limit(1); return result[0]; }
export async function getBranchAllowance(restaurantId: number): Promise<{ plan: string | null; limit: number | null; used: number; canCreate: boolean; source: "subscription" | "unlimited" | "default" | "database_unavailable" }> {
  const db = await getDb();
  if (!db) return { plan: null, limit: null, used: 0, canCreate: false, source: "database_unavailable" };
  const subscription = (await db.select({ plan: subscriptions.plan, status: subscriptions.status }).from(subscriptions).where(and(eq(subscriptions.restaurantId, restaurantId), ne(subscriptions.status, "cancelled"))).orderBy(desc(subscriptions.startedAt)).limit(1))[0];
  const used = Number((await db.select({ total: count() }).from(branches).where(eq(branches.restaurantId, restaurantId)))[0]?.total ?? 0);
  const plan = subscription?.plan ?? null;
  const normalizedPlan = plan?.trim().toLowerCase();
  const planLimits: Record<string, number | null> = { starter: 1, basic: 3, growth: 5, professional: 15, pro: 15, enterprise: null };
  const limit = normalizedPlan ? (Object.prototype.hasOwnProperty.call(planLimits, normalizedPlan) ? planLimits[normalizedPlan] : 3) : 1;
  const source = limit === null ? "unlimited" : subscription ? "subscription" : "default";
  return { plan, limit, used, canCreate: limit === null || used < limit, source };
}

export async function getEmployeeAllowance(restaurantId: number): Promise<{ plan: string | null; limit: number | null; used: number; canCreate: boolean; source: "subscription" | "unlimited" | "default" | "database_unavailable" }> {
  const db = await getDb();
  if (!db) return { plan: null, limit: null, used: 0, canCreate: false, source: "database_unavailable" };
  const subscription = (await db.select({ plan: subscriptions.plan, status: subscriptions.status }).from(subscriptions).where(and(eq(subscriptions.restaurantId, restaurantId), ne(subscriptions.status, "cancelled"))).orderBy(desc(subscriptions.startedAt)).limit(1))[0];
  const used = Number((await db.select({ total: count() }).from(employees).where(eq(employees.restaurantId, restaurantId)))[0]?.total ?? 0);
  const plan = subscription?.plan ?? null;
  const normalizedPlan = plan?.trim().toLowerCase();
  const planLimits: Record<string, number | null> = { starter: 5, basic: 15, growth: 50, professional: 150, pro: 150, enterprise: null };
  const limit = normalizedPlan ? (Object.prototype.hasOwnProperty.call(planLimits, normalizedPlan) ? planLimits[normalizedPlan] : 15) : 5;
  const source = limit === null ? "unlimited" : subscription ? "subscription" : "default";
  return { plan, limit, used, canCreate: limit === null || used < limit, source };
}

export async function listBranches(restaurantId: number) { const db = await getDb(); return db ? db.select().from(branches).where(eq(branches.restaurantId, restaurantId)) : []; }
export async function listMenuCategories(restaurantId: number) { const db = await getDb(); return db ? db.select().from(menuCategories).where(eq(menuCategories.restaurantId, restaurantId)) : []; }
export async function listMenuItems(restaurantId?: number, categoryId?: number) { const db = await getDb(); if (!db) return []; if (restaurantId && categoryId) return db.select().from(menuItems).where(and(eq(menuItems.restaurantId, restaurantId), eq(menuItems.categoryId, categoryId))); if (restaurantId) return db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId)); if (categoryId) return db.select().from(menuItems).where(eq(menuItems.categoryId, categoryId)); return db.select().from(menuItems); }
export async function listOrders(branchId: number, restaurantId?: number) { const db = await getDb(); if (!db) return []; const filters = [eq(orders.branchId, branchId)]; if (restaurantId) filters.push(eq(orders.restaurantId, restaurantId)); return db.select().from(orders).where(and(...filters)).orderBy(desc(orders.createdAt)); }
export async function listOrdersByRestaurant(restaurantId: number) { const db = await getDb(); return db ? db.select({ id: orders.id, restaurantId: orders.restaurantId, branchId: orders.branchId, customerId: orders.customerId, driverId: orders.driverId, tableName: orders.tableName, channel: orders.channel, paymentMethod: orders.paymentMethod, paymentStatus: orders.paymentStatus, total: orders.total, status: orders.status, createdAt: orders.createdAt, updatedAt: orders.updatedAt }).from(orders).innerJoin(branches, eq(orders.branchId, branches.id)).where(eq(branches.restaurantId, restaurantId)).orderBy(desc(orders.createdAt)) : []; }
export async function listInventory(restaurantId: number) { const db = await getDb(); return db ? db.select().from(inventoryItems).where(eq(inventoryItems.restaurantId, restaurantId)) : []; }
export async function listEmployees(restaurantId: number) { const db = await getDb(); return db ? db.select().from(employees).where(eq(employees.restaurantId, restaurantId)) : []; }
export async function listSubscriptions(restaurantId?: number) { const db = await getDb(); return db ? (restaurantId ? db.select().from(subscriptions).where(eq(subscriptions.restaurantId, restaurantId)) : db.select().from(subscriptions)) : []; }
export async function listRoles(restaurantId?: number) { const db = await getDb(); return db ? (restaurantId ? db.select().from(roles).where(eq(roles.restaurantId, restaurantId)) : db.select().from(roles)) : []; }
export async function listPermissions() { const db = await getDb(); return db ? db.select().from(permissions) : []; }
export async function listTables(branchId: number, restaurantId?: number) { const db = await getDb(); if (!db) return []; if (!restaurantId) return db.select().from(restaurantTables).where(eq(restaurantTables.branchId, branchId)); return db.select({ id: restaurantTables.id, branchId: restaurantTables.branchId, name: restaurantTables.name, seats: restaurantTables.seats, status: restaurantTables.status }).from(restaurantTables).innerJoin(branches, eq(restaurantTables.branchId, branches.id)).where(and(eq(restaurantTables.branchId, branchId), eq(branches.restaurantId, restaurantId))); }
export async function listPurchases(restaurantId: number) { const db = await getDb(); return db ? db.select().from(purchases).where(eq(purchases.restaurantId, restaurantId)).orderBy(desc(purchases.createdAt)) : []; }
export async function listAttendance(employeeId?: number, restaurantId?: number) { const db = await getDb(); if (!db) return []; const filters = []; if (employeeId) filters.push(eq(attendance.employeeId, employeeId)); if (restaurantId) filters.push(eq(employees.restaurantId, restaurantId)); const query = db.select({ id: attendance.id, employeeId: attendance.employeeId, workDate: attendance.workDate, status: attendance.status }).from(attendance).innerJoin(employees, eq(attendance.employeeId, employees.id)); return filters.length ? query.where(and(...filters)) : query; }
export async function listCampaigns(restaurantId: number) { const db = await getDb(); return db ? db.select().from(campaigns).where(eq(campaigns.restaurantId, restaurantId)) : []; }
export async function listCoupons(campaignId?: number, restaurantId?: number) { const db = await getDb(); if (!db) return []; const filters = []; if (campaignId) filters.push(eq(coupons.campaignId, campaignId)); if (restaurantId) filters.push(eq(campaigns.restaurantId, restaurantId)); const query = db.select({ id: coupons.id, campaignId: coupons.campaignId, code: coupons.code, discountPercent: coupons.discountPercent, usageLimit: coupons.usageLimit, usedCount: coupons.usedCount }).from(coupons).innerJoin(campaigns, eq(coupons.campaignId, campaigns.id)); return filters.length ? query.where(and(...filters)) : query; }
export async function listRemoteWorkers(restaurantId: number) { const db = await getDb(); return db ? db.select().from(remoteWorkers).where(eq(remoteWorkers.restaurantId, restaurantId)) : []; }
export async function listRemoteTasks(restaurantId: number) { const db = await getDb(); return db ? db.select().from(remoteTasks).where(eq(remoteTasks.restaurantId, restaurantId)).orderBy(desc(remoteTasks.createdAt)) : []; }
export async function listTaskMessages(taskId: number) { const db = await getDb(); return db ? db.select().from(taskMessages).where(eq(taskMessages.taskId, taskId)).orderBy(taskMessages.createdAt) : []; }
export async function listNotifications(userId: number) { const db = await getDb(); return db ? db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)) : []; }
export async function getTestAccountByEmail(email: string) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(testAccounts).where(eq(testAccounts.email, email.toLowerCase())).limit(1); return rows[0]; }
export async function listManagedTestAccounts() { const db = await getDb(); if (!db) return []; return db.select({ id: testAccounts.id, restaurantId: testAccounts.restaurantId, email: testAccounts.email, displayName: testAccounts.displayName, role: testAccounts.role, isActive: testAccounts.isActive, createdAt: testAccounts.createdAt }).from(testAccounts).orderBy(testAccounts.role, testAccounts.displayName); }
export async function updateManagedTestAccount(id: number, changes: { email?: string; displayName?: string; role?: "admin" | "restaurant_admin" | "waiter" | "kitchen" | "cashier" | "customer" | "driver"; isActive?: boolean; passwordHash?: string }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const existing = (await db.select({ id: testAccounts.id }).from(testAccounts).where(eq(testAccounts.id, id)).limit(1))[0]; if (!existing) return false; await db.update(testAccounts).set(changes).where(eq(testAccounts.id, id)); return true; }
export async function getManagedTestAccount(id: number) { const db = await getDb(); if (!db) return undefined; return (await db.select().from(testAccounts).where(eq(testAccounts.id, id)).limit(1))[0]; }
export async function getTestAccountById(id: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(testAccounts).where(eq(testAccounts.id, id)).limit(1); return rows[0]; }
export async function listAuthSessions(userId: number) { const db = await getDb(); return db ? db.select().from(authSessions).where(eq(authSessions.userId, userId)).orderBy(desc(authSessions.lastSeenAt)) : []; }
export async function listFeatureDefinitions() { const db = await getDb(); return db ? db.select().from(featureDefinitions).orderBy(featureDefinitions.key) : []; }
export async function listRestaurantFeatures(restaurantId: number) { const db = await getDb(); return db ? db.select().from(restaurantFeatures).where(eq(restaurantFeatures.restaurantId, restaurantId)) : []; }

export async function getFeatureAccess(restaurantId: number, featureKey: string): Promise<{ key: string; enabled: boolean; limit: number | null; reason: "enabled" | "disabled" | "missing" | "dependency_disabled" | "database_unavailable" }> {
  const db = await getDb();
  if (!db) return { key: featureKey, enabled: false, limit: null, reason: "database_unavailable" };
  const definitions = await db.select().from(featureDefinitions);
  const overrides = await db.select().from(restaurantFeatures).where(eq(restaurantFeatures.restaurantId, restaurantId));
  const byKey = new Map(definitions.map((definition) => [definition.key, definition]));
  const byFeatureId = new Map(overrides.map((override) => [override.featureId, override]));
  const evaluate = (key: string, visited = new Set<string>()): { enabled: boolean; limit: number | null; reason: "enabled" | "disabled" | "missing" | "dependency_disabled" } => {
    if (visited.has(key)) return { enabled: false, limit: null, reason: "dependency_disabled" };
    const definition = byKey.get(key);
    if (!definition) return { enabled: false, limit: null, reason: "missing" };
    const override = byFeatureId.get(definition.id);
    if (definition.dependencyKey) { const dependency = evaluate(definition.dependencyKey, new Set(Array.from(visited).concat(key))); if (!dependency.enabled) return { enabled: false, limit: null, reason: "dependency_disabled" }; }
    if (override?.enabled === false) return { enabled: false, limit: override.overrideLimit ?? definition.defaultLimit ?? null, reason: "disabled" };
    return { enabled: true, limit: override?.overrideLimit ?? definition.defaultLimit ?? null, reason: "enabled" };
  };
  return { key: featureKey, ...evaluate(featureKey) };
}

export async function getUserSecurity(userId: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(userSecurity).where(eq(userSecurity.userId, userId)).limit(1); return rows[0]; }
export async function insertAuditLog(input: typeof auditLogs.$inferInsert) { const db = await getDb(); if (!db) return undefined; const result = await db.insert(auditLogs).values(input); return Number(result[0].insertId); }
export async function listAuditLogs(restaurantId?: number) { const db = await getDb(); if (!db) return []; return restaurantId ? db.select().from(auditLogs).where(eq(auditLogs.restaurantId, restaurantId)).orderBy(desc(auditLogs.createdAt)).limit(100) : db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100); }
export async function getActivitySummary(restaurantId?: number) {
  const db = await getDb();
  if (!db) return { scope: restaurantId ? "restaurant" as const : "platform" as const, totals: { orders: 0, completed: 0, sales: 0, active: 0, auditEvents: 0 }, days: [] as Array<{ date: string; orders: number; sales: number }>, recentEvents: [] };
  const orderRows = restaurantId ? await db.select({ createdAt: orders.createdAt, status: orders.status, total: orders.total }).from(orders).where(eq(orders.restaurantId, restaurantId)) : await db.select({ createdAt: orders.createdAt, status: orders.status, total: orders.total }).from(orders);
  const events = restaurantId ? await db.select().from(auditLogs).where(eq(auditLogs.restaurantId, restaurantId)).orderBy(desc(auditLogs.createdAt)).limit(100) : await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);
  const now = new Date(); const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(now); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (6 - index)); return { key: date.toISOString().slice(0, 10), date: date.toLocaleDateString("ar-SA", { weekday: "short", month: "numeric", day: "numeric" }), orders: 0, sales: 0 }; });
  const byDate = new Map(days.map((day) => [day.key, day]));
  let sales = 0; let completed = 0;
  for (const row of orderRows) { const amount = Number(row.total ?? 0); sales += amount; if (row.status === "completed") completed += 1; const key = new Date(row.createdAt).toISOString().slice(0, 10); const day = byDate.get(key); if (day) { day.orders += 1; day.sales += amount; } }
  return { scope: restaurantId ? "restaurant" as const : "platform" as const, totals: { orders: orderRows.length, completed, sales, active: orderRows.filter((row) => ["new", "preparing", "ready"].includes(row.status)).length, auditEvents: events.length }, days: days.map(({ key, ...day }) => day), recentEvents: events.slice(0, 12) };
}
export async function globalSearch(restaurantId: number, query: string, limit = 20) {
  const db = await getDb();
  if (!db) return { results: [], available: false as const };
  const normalized = query.trim().toLowerCase();
  if (!normalized) return { results: [], available: true as const };
  const [menu, orderRows, staff, branchRows, tasks] = await Promise.all([
    db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId)),
    db.select().from(orders).where(eq(orders.restaurantId, restaurantId)).orderBy(desc(orders.createdAt)).limit(100),
    db.select().from(employees).where(eq(employees.restaurantId, restaurantId)),
    db.select().from(branches).where(eq(branches.restaurantId, restaurantId)),
    db.select().from(remoteTasks).where(eq(remoteTasks.restaurantId, restaurantId)).orderBy(desc(remoteTasks.createdAt)).limit(100),
  ]);
  const results = [
    ...menu.filter((item) => `${item.name} ${item.description ?? ""}`.toLowerCase().includes(normalized)).map((item) => ({ type: "menu" as const, id: item.id, title: item.name, subtitle: `${item.price} ر.س`, action: "menu" })),
    ...orderRows.filter((item) => `${item.id} ${item.tableName ?? ""} ${item.status}`.toLowerCase().includes(normalized)).map((item) => ({ type: "order" as const, id: item.id, title: `طلب #${item.id}`, subtitle: `${item.status} · ${item.total} ر.س`, action: "orders" })),
    ...staff.filter((item) => `${item.name} ${item.role}`.toLowerCase().includes(normalized)).map((item) => ({ type: "employee" as const, id: item.id, title: item.name, subtitle: item.role, action: "employees" })),
    ...branchRows.filter((item) => `${item.name} ${item.city}`.toLowerCase().includes(normalized)).map((item) => ({ type: "branch" as const, id: item.id, title: item.name, subtitle: item.city, action: "branches" })),
    ...tasks.filter((item) => `${item.title} ${item.description ?? ""}`.toLowerCase().includes(normalized)).map((item) => ({ type: "task" as const, id: item.id, title: item.title, subtitle: item.status, action: "remote" })),
  ];
  return { results: results.slice(0, limit), available: true as const };
}
export async function getRoleSummary(restaurantId: number, role?: string, userId?: number, branchId?: number) {
  const unavailable = { available: false as const, sales: 0, orders: 0, average: 0, avgFulfillmentMinutes: 0, deliveryOrders: 0, customerOrders: 0, newOrders: 0, preparing: 0, ready: 0, completed: 0, tables: 0, scope: "unavailable" as const };
  const db = await getDb();
  if (!db) return unavailable;
  const scope = role === "customer" ? "customer" : role === "driver" ? "driver" : "restaurant";
  const baseFilters = [eq(orders.restaurantId, restaurantId), ...(branchId ? [eq(orders.branchId, branchId)] : [])];
  const roleFilters = role === "customer" && userId ? [...baseFilters, eq(orders.customerId, userId)] : role === "driver" && userId ? [...baseFilters, eq(orders.driverId, userId)] : baseFilters;
  const rows = await db.select().from(orders).where(and(...roleFilters));
  const total = rows.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const completedRows = rows.filter((order) => order.status === "completed" && order.createdAt && order.updatedAt);
  const avgFulfillmentMinutes = completedRows.length ? completedRows.reduce((sum, order) => sum + Math.max(0, new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime()) / 60000, 0) / completedRows.length : 0;
  const tableRows = branchId ? await db.select({ status: restaurantTables.status }).from(restaurantTables).where(eq(restaurantTables.branchId, branchId)) : [];
  const tables = tableRows.filter((table) => table.status === "occupied").length;
  const deliveryOrders = rows.filter((order) => order.channel === "delivery").length;
  const customerOrders = role === "customer" ? rows.length : rows.filter((order) => order.customerId != null).length;
  return { available: true as const, sales: total, orders: rows.length, average: rows.length ? total / rows.length : 0, avgFulfillmentMinutes, deliveryOrders, customerOrders, newOrders: rows.filter((order) => order.status === "new").length, preparing: rows.filter((order) => order.status === "preparing").length, ready: rows.filter((order) => order.status === "ready").length, completed: rows.filter((order) => order.status === "completed").length, tables, scope };
}
