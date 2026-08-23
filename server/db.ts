import { and, count, desc, eq, gte, inArray, lte, ne, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { InsertUser, branches, employees, inventoryItems, menuCategories, menuItems, orderItems, orders, kitchenSections, restaurants, users, subscriptions, roles, permissions, restaurantTables, purchases, attendance, campaigns, coupons, remoteWorkers, remoteTasks, taskMessages, notifications, testAccounts, authSessions, userSecurity, featureDefinitions, restaurantFeatures, packagePlans, packagePlanFeatures, auditLogs, platformSettings, integrationSettings, loyaltyAccounts, loyaltyTransactions, referralRecords, customerProfiles, supportAgents, supportTickets, restaurantMembers, apiWebhooks, vcardCardProducts, vcardCardOrders, vcardCardCodes, vcardCardBindings, mediaFiles, mediaFolders, translationErrorLogs, deliveryZones, pickupPoints, reservationSlots, reservations, userPreferences, favoriteMenuItems, restaurantDisplayScreens, restaurantDisplaySlides, campaignContents, receiptTemplates, kitchenSectionSla, orderStatusHistory } from "../drizzle/schema";
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
export function decryptIntegrationSecret(value: string) { const [ivPart, tagPart, ciphertextPart] = value.split("."); if (!ivPart || !tagPart || !ciphertextPart) return null; try { const decipher = createDecipheriv("aes-256-gcm", integrationKey(), Buffer.from(ivPart, "base64url")); decipher.setAuthTag(Buffer.from(tagPart, "base64url")); return Buffer.concat([decipher.update(Buffer.from(ciphertextPart, "base64url")), decipher.final()]).toString("utf8"); } catch { return null; } }
export async function getIntegrationSecret(scope: "platform" | "restaurant", providerKey: string, restaurantId?: number) { const db = await getDb(); if (!db) return null; const row = (await db.select({ secretCiphertext: integrationSettings.secretCiphertext, status: integrationSettings.status }).from(integrationSettings).where(and(eq(integrationSettings.scope, scope), eq(integrationSettings.providerKey, providerKey), scope === "restaurant" ? eq(integrationSettings.restaurantId, restaurantId ?? 0) : eq(integrationSettings.scope, "platform"))).limit(1))[0]; return row?.status === "configured" && row.secretCiphertext ? decryptIntegrationSecret(row.secretCiphertext) : null; }
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

export async function listDeliveryZones(restaurantId: number, branchId?: number) { const db = await getDb(); if (!db) return []; return db.select().from(deliveryZones).where(and(eq(deliveryZones.restaurantId, restaurantId), branchId ? or(eq(deliveryZones.branchId, branchId), sql`${deliveryZones.branchId} IS NULL`) : undefined)).orderBy(deliveryZones.name); }
export async function saveDeliveryZone(input: { id?: number; restaurantId: number; branchId?: number | null; name: string; centerLatitude: number; centerLongitude: number; radiusKm: number; deliveryFee: number; minimumOrder: number; polygonJson?: string | null; isActive: boolean }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const values = { restaurantId: input.restaurantId, branchId: input.branchId ?? null, name: input.name, centerLatitude: input.centerLatitude.toFixed(7), centerLongitude: input.centerLongitude.toFixed(7), radiusKm: input.radiusKm.toFixed(2), deliveryFee: input.deliveryFee.toFixed(2), minimumOrder: input.minimumOrder.toFixed(2), polygonJson: input.polygonJson ?? null, isActive: input.isActive }; if (input.id) { await db.update(deliveryZones).set({ ...values, updatedAt: new Date() }).where(and(eq(deliveryZones.id, input.id), eq(deliveryZones.restaurantId, input.restaurantId))); return input.id; } const result = await db.insert(deliveryZones).values(values); return Number(result[0].insertId); }
export async function deleteDeliveryZone(id: number, restaurantId: number) { const db = await getDb(); if (!db) throw new Error("Database is not available"); await db.delete(deliveryZones).where(and(eq(deliveryZones.id, id), eq(deliveryZones.restaurantId, restaurantId))); }
export async function listPickupPoints(restaurantId: number, branchId: number) { const db = await getDb(); if (!db) return []; return db.select().from(pickupPoints).where(and(eq(pickupPoints.restaurantId, restaurantId), eq(pickupPoints.branchId, branchId), eq(pickupPoints.isActive, true))).orderBy(pickupPoints.name); }
export async function savePickupPoint(input: { id?: number; restaurantId: number; branchId: number; name: string; address?: string | null; openingTime?: string | null; closingTime?: string | null; isActive: boolean }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const values = { restaurantId: input.restaurantId, branchId: input.branchId, name: input.name, address: input.address ?? null, openingTime: input.openingTime ?? null, closingTime: input.closingTime ?? null, isActive: input.isActive }; if (input.id) { await db.update(pickupPoints).set({ ...values, updatedAt: new Date() }).where(and(eq(pickupPoints.id, input.id), eq(pickupPoints.restaurantId, input.restaurantId))); return input.id; } const result = await db.insert(pickupPoints).values(values); return Number(result[0].insertId); }
export async function deletePickupPoint(id: number, restaurantId: number) { const db = await getDb(); if (!db) throw new Error("Database is not available"); await db.delete(pickupPoints).where(and(eq(pickupPoints.id, id), eq(pickupPoints.restaurantId, restaurantId))); }
export async function listReservationSlots(restaurantId: number, branchId: number) { const db = await getDb(); if (!db) return []; return db.select().from(reservationSlots).where(and(eq(reservationSlots.restaurantId, restaurantId), eq(reservationSlots.branchId, branchId), eq(reservationSlots.isActive, true))).orderBy(reservationSlots.dayOfWeek, reservationSlots.startTime); }
export async function listRestaurantTables(restaurantId: number, branchId: number) { const db = await getDb(); if (!db) return []; return db.select({ id: restaurantTables.id, branchId: restaurantTables.branchId, name: restaurantTables.name, seats: restaurantTables.seats, status: restaurantTables.status }).from(restaurantTables).innerJoin(branches, eq(restaurantTables.branchId, branches.id)).where(and(eq(branches.restaurantId, restaurantId), eq(restaurantTables.branchId, branchId))).orderBy(restaurantTables.name); }
export async function createReservationWithTable(input: { restaurantId: number; branchId: number | null; slotId?: number | null; customerName: string; email?: string | null; phone?: string | null; partySize: number; reservedFor: Date; durationMinutes?: number; notes?: string | null; createdByUserId?: number | null }) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  if (!input.branchId) throw new Error("اختر فرعًا للحجز");
  const durationMinutes = Math.max(15, Math.min(360, input.durationMinutes ?? 60));
  const start = input.reservedFor; const end = new Date(start.getTime() + durationMinutes * 60_000);
  return db.transaction(async (tx) => {
    const candidates = await tx.select({ id: restaurantTables.id, seats: restaurantTables.seats, name: restaurantTables.name }).from(restaurantTables).innerJoin(branches, eq(restaurantTables.branchId, branches.id)).where(and(eq(branches.restaurantId, input.restaurantId), eq(restaurantTables.branchId, input.branchId!), gte(restaurantTables.seats, input.partySize), ne(restaurantTables.status, "occupied"))).orderBy(restaurantTables.seats, restaurantTables.id);
    for (const table of candidates) {
      const conflicts = await tx.select({ id: reservations.id }).from(reservations).where(and(eq(reservations.assignedTableId, table.id), inArray(reservations.status, ["pending", "confirmed", "seated"]), sql`${reservations.reservedFor} < ${end}`, sql`DATE_ADD(${reservations.reservedFor}, INTERVAL ${reservations.durationMinutes} MINUTE) > ${start}`)).limit(1);
      if (conflicts.length > 0) continue;
      const result = await tx.insert(reservations).values({ restaurantId: input.restaurantId, branchId: input.branchId, slotId: input.slotId ?? null, createdByUserId: input.createdByUserId ?? null, assignedTableId: table.id, kind: "reservation", customerName: input.customerName, email: input.email ?? null, phone: input.phone ?? null, partySize: input.partySize, durationMinutes, reservedFor: start, status: "confirmed", notes: input.notes ?? null });
      return { id: Number(result[0].insertId), tableId: table.id, tableName: table.name, status: "confirmed" as const, durationMinutes };
    }
    throw new Error("لا توجد طاولة شاغرة تستوعب عدد الأشخاص في الوقت المحدد");
  });
}
export async function listReservationsDueForNoShow(now = new Date()) { const db = await getDb(); if (!db) return []; return db.select({ id: reservations.id, restaurantId: reservations.restaurantId, assignedTableId: reservations.assignedTableId, customerName: reservations.customerName, email: reservations.email, reservedFor: reservations.reservedFor, restaurantName: restaurants.name, graceMinutes: restaurants.reservationNoShowGraceMinutes }).from(reservations).innerJoin(restaurants, eq(reservations.restaurantId, restaurants.id)).where(and(eq(reservations.status, "confirmed"), sql`TIMESTAMPADD(MINUTE, ${restaurants.reservationNoShowGraceMinutes}, ${reservations.reservedFor}) <= ${now}`)); }
export async function markReservationNoShow(id: number) { const db = await getDb(); if (!db) return false; const result = await db.update(reservations).set({ status: "no_show", noShowNotifiedAt: new Date() }).where(and(eq(reservations.id, id), eq(reservations.status, "confirmed"))); return Number(result[0].affectedRows ?? 0) === 1; }
export async function saveReservationSlot(input: { id?: number; restaurantId: number; branchId: number; dayOfWeek: number; startTime: string; endTime: string; capacity: number; slotDurationMinutes: number; isActive: boolean }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const values = { restaurantId: input.restaurantId, branchId: input.branchId, dayOfWeek: input.dayOfWeek, startTime: input.startTime, endTime: input.endTime, capacity: input.capacity, slotDurationMinutes: input.slotDurationMinutes, isActive: input.isActive }; if (input.id) { await db.update(reservationSlots).set({ ...values, updatedAt: new Date() }).where(and(eq(reservationSlots.id, input.id), eq(reservationSlots.restaurantId, input.restaurantId))); return input.id; } const result = await db.insert(reservationSlots).values(values); return Number(result[0].insertId); }
export async function deleteReservationSlot(id: number, restaurantId: number) { const db = await getDb(); if (!db) throw new Error("Database is not available"); await db.delete(reservationSlots).where(and(eq(reservationSlots.id, id), eq(reservationSlots.restaurantId, restaurantId))); }
export async function getUserPreferences(userId: number) { const db = await getDb(); if (!db) return undefined; return (await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1))[0]; }
export async function upsertUserPreferences(userId: number, input: { language: string; themeMode: "light" | "dark" | "system"; themePreset: string }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const existing = await getUserPreferences(userId); if (existing) { await db.update(userPreferences).set({ ...input, updatedAt: new Date() }).where(eq(userPreferences.userId, userId)); return existing.id; } const result = await db.insert(userPreferences).values({ userId, ...input }); return Number(result[0].insertId); }
export async function listFavoriteMenuItems(userId: number, restaurantId: number) { const db = await getDb(); if (!db) return []; return db.select({ id: favoriteMenuItems.id, menuItemId: favoriteMenuItems.menuItemId, createdAt: favoriteMenuItems.createdAt }).from(favoriteMenuItems).where(and(eq(favoriteMenuItems.userId, userId), eq(favoriteMenuItems.restaurantId, restaurantId))).orderBy(desc(favoriteMenuItems.createdAt)); }
export async function listAllFavoriteMenuItems(userId: number) { const db = await getDb(); if (!db) return []; return db.select({ id: favoriteMenuItems.id, menuItemId: favoriteMenuItems.menuItemId, restaurantId: favoriteMenuItems.restaurantId, itemName: menuItems.name, description: menuItems.description, price: menuItems.price, imageUrl: menuItems.imageUrl, restaurantName: restaurants.name, restaurantSlug: restaurants.slug, isAvailable: menuItems.isAvailable, createdAt: favoriteMenuItems.createdAt }).from(favoriteMenuItems).innerJoin(menuItems, eq(favoriteMenuItems.menuItemId, menuItems.id)).innerJoin(restaurants, eq(favoriteMenuItems.restaurantId, restaurants.id)).where(and(eq(favoriteMenuItems.userId, userId), eq(restaurants.status, "active"))).orderBy(desc(favoriteMenuItems.createdAt)); }
export async function toggleFavoriteMenuItem(input: { userId: number; restaurantId: number; menuItemId: number }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const existing = (await db.select({ id: favoriteMenuItems.id }).from(favoriteMenuItems).where(and(eq(favoriteMenuItems.userId, input.userId), eq(favoriteMenuItems.restaurantId, input.restaurantId), eq(favoriteMenuItems.menuItemId, input.menuItemId))).limit(1))[0]; if (existing) { await db.delete(favoriteMenuItems).where(eq(favoriteMenuItems.id, existing.id)); return { favorite: false }; } await db.insert(favoriteMenuItems).values(input); return { favorite: true }; }
export function pointInPolygon(latitude: number, longitude: number, polygon: Array<{ latitude: number; longitude: number }>) { let inside = false; for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) { const current = polygon[index]; const prior = polygon[previous]; const intersects = ((current.longitude > longitude) !== (prior.longitude > longitude)) && latitude < (prior.latitude - current.latitude) * (longitude - current.longitude) / ((prior.longitude - current.longitude) || Number.EPSILON) + current.latitude; if (intersects) inside = !inside; } return inside; }
export function haversineDistanceKm(latitudeA: number, longitudeA: number, latitudeB: number, longitudeB: number) { const radians = (value: number) => value * Math.PI / 180; const dLat = radians(latitudeB - latitudeA); const dLon = radians(longitudeB - longitudeA); const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(latitudeA)) * Math.cos(radians(latitudeB)) * Math.sin(dLon / 2) ** 2; return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); }
export async function calculateDeliveryQuote(input: { restaurantId: number; branchId: number; latitude: number; longitude: number; subtotal: number }) { const zones = await listDeliveryZones(input.restaurantId, input.branchId); const matches = zones.map((zone) => { let polygon: Array<{ latitude: number; longitude: number }> = []; try { polygon = zone.polygonJson ? JSON.parse(zone.polygonJson) : []; } catch { polygon = []; } const insidePolygon = polygon.length >= 3 ? pointInPolygon(input.latitude, input.longitude, polygon) : false; const distanceKm = haversineDistanceKm(input.latitude, input.longitude, Number(zone.centerLatitude), Number(zone.centerLongitude)); return { zone, distanceKm, insidePolygon }; }).filter(({ zone, distanceKm, insidePolygon }) => zone.isActive && (insidePolygon || (!zone.polygonJson && distanceKm <= Number(zone.radiusKm))) && input.subtotal >= Number(zone.minimumOrder)).sort((a, b) => Number(a.zone.deliveryFee) - Number(b.zone.deliveryFee)); const match = matches[0]; return match ? { available: true as const, fee: Number(match.zone.deliveryFee), minimumOrder: Number(match.zone.minimumOrder), zoneId: match.zone.id, zoneName: match.zone.name, distanceKm: Number(match.distanceKm.toFixed(2)) } : { available: false as const, fee: 0, minimumOrder: 0, zoneId: null, zoneName: null, distanceKm: null }; }

export async function listSupportTickets(restaurantId?: number) { const db = await getDb(); if (!db) return []; return db.select().from(supportTickets).where(restaurantId ? eq(supportTickets.restaurantId, restaurantId) : undefined).orderBy(desc(supportTickets.createdAt)); }
export async function listSupportTicketsForRequester(requesterUserId: number, restaurantId?: number) { const db = await getDb(); if (!db) return []; return db.select().from(supportTickets).where(and(eq(supportTickets.requesterUserId, requesterUserId), restaurantId ? eq(supportTickets.restaurantId, restaurantId) : undefined)).orderBy(desc(supportTickets.createdAt)); }
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

export async function updateUserAvatar(userId: number, avatarUrl: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(users).set({ avatarUrl, updatedAt: new Date() }).where(eq(users.id, userId));
  return avatarUrl;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listRestaurants(restaurantId?: number) { const db = await getDb(); if (!db) return []; return restaurantId ? db.select().from(restaurants).where(eq(restaurants.id, restaurantId)).orderBy(desc(restaurants.createdAt)) : db.select().from(restaurants).orderBy(desc(restaurants.createdAt)); }
export async function listRestaurantsWithBranchCount() { const db = await getDb(); if (!db) return []; const rows = await db.select().from(restaurants).orderBy(desc(restaurants.createdAt)); const counts = await db.select({ restaurantId: branches.restaurantId, branchCount: count() }).from(branches).groupBy(branches.restaurantId); const countByRestaurant = new Map(counts.map((row) => [row.restaurantId, Number(row.branchCount)])); return rows.map((restaurant) => ({ ...restaurant, branchCount: countByRestaurant.get(restaurant.id) ?? 0 })); }
export async function getRestaurantById(id: number) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1); return result[0]; }
export async function getPublicRestaurantPage(slug: string) { const db = await getDb(); if (!db) return undefined; const restaurant = (await db.select({ id: restaurants.id, slug: restaurants.slug, customDomain: restaurants.customDomain, name: restaurants.name, status: restaurants.status, brandName: restaurants.brandName, brandColor: restaurants.brandColor, themeMode: restaurants.themeMode, themePreset: restaurants.themePreset, brandLogoUrl: restaurants.brandLogoUrl, pwaInstallMessage: restaurants.pwaInstallMessage, pwaInstallIconUrl: restaurants.pwaInstallIconUrl, brandDescription: restaurants.brandDescription, phone: restaurants.phone, whatsapp: restaurants.whatsapp, instagramUrl: restaurants.instagramUrl, facebookUrl: restaurants.facebookUrl, tiktokUrl: restaurants.tiktokUrl, websiteUrl: restaurants.websiteUrl, address: restaurants.address, languagesJson: restaurants.languagesJson, reservationEnabled: restaurants.reservationEnabled, showBranchesOnMenu: restaurants.showBranchesOnMenu }).from(restaurants).where(and(eq(restaurants.slug, slug), ne(restaurants.status, "suspended"))).limit(1))[0]; if (!restaurant) return undefined; const categories = await db.select({ id: menuCategories.id, name: menuCategories.name, imageUrl: menuCategories.imageUrl, translationsJson: menuCategories.translationsJson, sortOrder: menuCategories.sortOrder }).from(menuCategories).where(eq(menuCategories.restaurantId, restaurant.id)); const items = await db.select({ id: menuItems.id, categoryId: menuItems.categoryId, name: menuItems.name, description: menuItems.description, price: menuItems.price, imageUrl: menuItems.imageUrl, translationsJson: menuItems.translationsJson }).from(menuItems).where(and(eq(menuItems.restaurantId, restaurant.id), eq(menuItems.isAvailable, true))); const branchList = await db.select({ id: branches.id, name: branches.name, city: branches.city, openingTime: branches.openingTime, closingTime: branches.closingTime }).from(branches).where(and(eq(branches.restaurantId, restaurant.id), eq(branches.status, "open"))); const owner = (await db.select({ email: users.email }).from(restaurantMembers).innerJoin(users, eq(restaurantMembers.userId, users.id)).where(eq(restaurantMembers.restaurantId, restaurant.id)).limit(1))[0]; return { restaurant: { ...restaurant, email: owner?.email ?? null }, branches: branchList, categories, items }; }
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
export async function listOrdersByRestaurant(restaurantId: number, limit = 200) {
  const db = await getDb();
  if (!db) return [];
  const safeLimit = Math.max(25, Math.min(500, Math.trunc(limit)));
  const rows = await db.select({ id: orders.id, restaurantId: orders.restaurantId, branchId: orders.branchId, kitchenSectionId: orders.kitchenSectionId, customerId: orders.customerId, driverId: orders.driverId, tableName: orders.tableName, channel: orders.channel, paymentMethod: orders.paymentMethod, paymentStatus: orders.paymentStatus, total: orders.total, status: orders.status, createdAt: orders.createdAt, updatedAt: orders.updatedAt }).from(orders).innerJoin(branches, eq(orders.branchId, branches.id)).where(and(eq(orders.restaurantId, restaurantId), eq(branches.restaurantId, restaurantId))).orderBy(desc(orders.createdAt)).limit(safeLimit);
  if (!rows.length) return rows.map((order) => ({ ...order, items: [] as { orderItemId: number; menuItemId: number; itemName: string; quantity: number; unitPrice: string }[] }));
  const items = await db.select({ orderItemId: orderItems.id, orderId: orderItems.orderId, menuItemId: orderItems.menuItemId, itemName: menuItems.name, quantity: orderItems.quantity, unitPrice: orderItems.unitPrice }).from(orderItems).innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id)).where(and(eq(menuItems.restaurantId, restaurantId), inArray(orderItems.orderId, rows.map((order) => order.id))));
  const itemsByOrder = new Map<number, typeof items>();
  for (const item of items) itemsByOrder.set(item.orderId, [...(itemsByOrder.get(item.orderId) ?? []), item]);
  return rows.map((order) => ({ ...order, items: itemsByOrder.get(order.id) ?? [] }));
}
export async function listKitchenSectionsWithSla(restaurantId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select({ id: kitchenSections.id, name: kitchenSections.name, isEnabled: kitchenSections.isEnabled, thresholdMinutes: kitchenSectionSla.thresholdMinutes })
    .from(kitchenSections).leftJoin(kitchenSectionSla, and(eq(kitchenSectionSla.kitchenSectionId, kitchenSections.id), eq(kitchenSectionSla.restaurantId, restaurantId)))
    .where(eq(kitchenSections.restaurantId, restaurantId)).orderBy(kitchenSections.name);
}
export async function saveKitchenSectionSla(input: { restaurantId: number; kitchenSectionId: number; thresholdMinutes: number; updatedByUserId: number }) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  const section = (await db.select({ id: kitchenSections.id }).from(kitchenSections).where(and(eq(kitchenSections.id, input.kitchenSectionId), eq(kitchenSections.restaurantId, input.restaurantId))).limit(1))[0];
  if (!section) throw new Error("قسم المطبخ غير مرتبط بالمطعم");
  const existing = (await db.select({ id: kitchenSectionSla.id }).from(kitchenSectionSla).where(and(eq(kitchenSectionSla.restaurantId, input.restaurantId), eq(kitchenSectionSla.kitchenSectionId, input.kitchenSectionId))).limit(1))[0];
  if (existing) { await db.update(kitchenSectionSla).set({ thresholdMinutes: input.thresholdMinutes, updatedByUserId: input.updatedByUserId, updatedAt: new Date() }).where(eq(kitchenSectionSla.id, existing.id)); return existing.id; }
  const result = await db.insert(kitchenSectionSla).values(input); return Number(result[0].insertId);
}
export async function listOrderStatusHistory(orderId: number, restaurantId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(orderStatusHistory).where(and(eq(orderStatusHistory.orderId, orderId), eq(orderStatusHistory.restaurantId, restaurantId))).orderBy(orderStatusHistory.createdAt);
}
export async function recordOrderStatusTransition(input: { restaurantId: number; orderId: number; fromStatus?: string | null; toStatus: string; actorUserId?: number | null; at?: Date }) {
  const db = await getDb(); if (!db) return null;
  const at = input.at ?? new Date();
  const previous = (await db.select({ createdAt: orderStatusHistory.createdAt }).from(orderStatusHistory).where(and(eq(orderStatusHistory.orderId, input.orderId), eq(orderStatusHistory.restaurantId, input.restaurantId))).orderBy(desc(orderStatusHistory.createdAt)).limit(1))[0];
  const durationSeconds = previous?.createdAt ? Math.max(0, Math.round((at.getTime() - new Date(previous.createdAt).getTime()) / 1000)) : null;
  const result = await db.insert(orderStatusHistory).values({ restaurantId: input.restaurantId, orderId: input.orderId, fromStatus: input.fromStatus ?? null, toStatus: input.toStatus, actorUserId: input.actorUserId ?? null, durationSeconds, createdAt: at });
  return Number(result[0].insertId);
}
export async function getDailyOrderPerformance(restaurantId: number, from: Date, to: Date) {
  const db = await getDb(); if (!db) return { summary: { total: 0, completed: 0, delayed: 0, averagePreparationSeconds: 0 }, orders: [], bySection: [], byHour: [] };
  const slaRows = await db.select({ kitchenSectionId: kitchenSectionSla.kitchenSectionId, thresholdMinutes: kitchenSectionSla.thresholdMinutes }).from(kitchenSectionSla).where(eq(kitchenSectionSla.restaurantId, restaurantId));
  const thresholdBySection = new Map(slaRows.map((row) => [row.kitchenSectionId, Number(row.thresholdMinutes)]));
  const rows = await db.select({ id: orders.id, status: orders.status, createdAt: orders.createdAt, updatedAt: orders.updatedAt, kitchenSectionId: orders.kitchenSectionId, sectionName: kitchenSections.name, historyId: orderStatusHistory.id, fromStatus: orderStatusHistory.fromStatus, toStatus: orderStatusHistory.toStatus, durationSeconds: orderStatusHistory.durationSeconds, transitionAt: orderStatusHistory.createdAt })
    .from(orders).leftJoin(kitchenSections, eq(orders.kitchenSectionId, kitchenSections.id)).leftJoin(orderStatusHistory, and(eq(orderStatusHistory.orderId, orders.id), eq(orderStatusHistory.restaurantId, restaurantId)))
    .where(and(eq(orders.restaurantId, restaurantId), gte(orders.createdAt, from), lte(orders.createdAt, to))).orderBy(desc(orders.createdAt), orderStatusHistory.createdAt);
  const grouped = new Map<number, { id: number; status: string; createdAt: Date; updatedAt: Date; kitchenSectionId: number | null; sectionName: string | null; transitions: typeof rows }>();
  for (const row of rows) { const current = grouped.get(row.id); if (current) current.transitions.push(row); else grouped.set(row.id, { id: row.id, status: row.status, createdAt: row.createdAt, updatedAt: row.updatedAt, kitchenSectionId: row.kitchenSectionId ?? null, sectionName: row.sectionName ?? null, transitions: [row] }); }
  const ordersOut = Array.from(grouped.values()).map((order) => { const transitions = order.transitions.filter((item) => item.historyId); const prepStart = transitions.find((item) => item.toStatus === "preparing")?.transitionAt ?? order.createdAt; const completedAt = transitions.find((item) => item.toStatus === "completed")?.transitionAt; const preparationSeconds = completedAt ? Math.max(0, Math.round((new Date(completedAt).getTime() - new Date(prepStart).getTime()) / 1000)) : 0; const thresholdMinutes = thresholdBySection.get(order.kitchenSectionId ?? -1) ?? 15; const delayed = transitions.some((item) => Number(item.durationSeconds ?? 0) > thresholdMinutes * 60 && ["new", "preparing"].includes(item.toStatus ?? "")); return { id: order.id, status: order.status, createdAt: order.createdAt, updatedAt: order.updatedAt, kitchenSectionId: order.kitchenSectionId, sectionName: order.sectionName, thresholdMinutes, delayed, preparationSeconds, transitions }; });
  const completed = ordersOut.filter((order) => order.status === "completed"); const delayed = ordersOut.filter((order) => order.delayed).length;
  const averagePreparationSeconds = completed.length ? Math.round(completed.reduce((sum, order) => sum + order.preparationSeconds, 0) / completed.length) : 0;
  const sectionStats = new Map<string, { sectionId: number | null; sectionName: string; orders: number; delayed: number; completed: number; preparationSeconds: number; preparationSamples: number }>();
  const hourStats = new Map<number, { hour: number; orders: number; delayed: number; preparationSeconds: number; preparationSamples: number }>();
  for (const order of ordersOut) { const sectionKey = order.kitchenSectionId ? String(order.kitchenSectionId) : "unassigned"; const section = sectionStats.get(sectionKey) ?? { sectionId: order.kitchenSectionId, sectionName: order.sectionName ?? "غير موزع", orders: 0, delayed: 0, completed: 0, preparationSeconds: 0, preparationSamples: 0 }; section.orders += 1; section.delayed += order.delayed ? 1 : 0; section.completed += order.status === "completed" ? 1 : 0; if (order.preparationSeconds > 0) { section.preparationSeconds += order.preparationSeconds; section.preparationSamples += 1; } sectionStats.set(sectionKey, section); const hour = new Date(order.createdAt).getHours(); const hourly = hourStats.get(hour) ?? { hour, orders: 0, delayed: 0, preparationSeconds: 0, preparationSamples: 0 }; hourly.orders += 1; hourly.delayed += order.delayed ? 1 : 0; if (order.preparationSeconds > 0) { hourly.preparationSeconds += order.preparationSeconds; hourly.preparationSamples += 1; } hourStats.set(hour, hourly); }
  const bySection = Array.from(sectionStats.values()).map((item) => ({ ...item, averagePreparationSeconds: item.preparationSamples ? Math.round(item.preparationSeconds / item.preparationSamples) : 0 }));
  const byHour = Array.from(hourStats.values()).sort((a, b) => a.hour - b.hour).map((item) => ({ ...item, averagePreparationSeconds: item.preparationSamples ? Math.round(item.preparationSeconds / item.preparationSamples) : 0 }));
  return { summary: { total: ordersOut.length, completed: completed.length, delayed, averagePreparationSeconds }, orders: ordersOut, bySection, byHour };
}
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

export const RESTAURANT_FEATURE_KEYS = ["overview", "files", "branches", "orders", "pos", "kds", "menu", "tables", "inventory", "team", "marketing", "reservations", "remote", "security", "health", "custom_domain", "integrations", "delivery", "loyalty", "reviews", "vcard", "analytics", "webhooks"] as const;
const PLAN_FEATURES: Record<string, ReadonlySet<string>> = {
  Starter: new Set(["overview", "menu", "orders"]),
  Growth: new Set(["overview", "files", "branches", "orders", "pos", "menu", "tables", "team", "security"]),
  "All Features": new Set(RESTAURANT_FEATURE_KEYS),
  Enterprise: new Set(RESTAURANT_FEATURE_KEYS),
};

type FeatureAccessReason = "enabled" | "disabled" | "missing" | "dependency_disabled" | "database_unavailable";
type FeatureAccess = { key: string; enabled: boolean; limit: number | null; reason: FeatureAccessReason };
type FeatureDefinitionRow = typeof featureDefinitions.$inferSelect;
type RestaurantFeatureRow = typeof restaurantFeatures.$inferSelect;
type PlanFeatureRow = { key: string; enabled: boolean; featureLimit: number | null };
type FeatureAccessContext = {
  definitions: FeatureDefinitionRow[];
  byKey: Map<string, FeatureDefinitionRow>;
  byFeatureId: Map<number, RestaurantFeatureRow>;
  planFeatureByKey: Map<string, PlanFeatureRow>;
  configuredPlan: boolean;
  planFeatures: ReadonlySet<string>;
};

async function loadFeatureAccessContext(restaurantId: number): Promise<FeatureAccessContext | null> {
  const db = await getDb();
  if (!db) return null;
  const definitions = await db.select().from(featureDefinitions);
  const overrides = await db.select().from(restaurantFeatures).where(eq(restaurantFeatures.restaurantId, restaurantId));
  const restaurant = (await db.select({ plan: restaurants.plan }).from(restaurants).where(eq(restaurants.id, restaurantId)).limit(1))[0];
  const subscription = (await db.select({ plan: subscriptions.plan }).from(subscriptions).where(and(eq(subscriptions.restaurantId, restaurantId), eq(subscriptions.status, "active"))).orderBy(desc(subscriptions.id)).limit(1))[0];
  const activePlan = subscription?.plan ?? restaurant?.plan ?? "Starter";
  const configuredPlanRows = await db.select({ key: featureDefinitions.key, enabled: packagePlanFeatures.enabled, featureLimit: packagePlanFeatures.featureLimit }).from(packagePlanFeatures).innerJoin(packagePlans, eq(packagePlanFeatures.planId, packagePlans.id)).innerJoin(featureDefinitions, eq(packagePlanFeatures.featureId, featureDefinitions.id)).where(and(or(eq(packagePlans.key, activePlan), eq(packagePlans.name, activePlan)), eq(packagePlans.isActive, true)));
  return {
    definitions,
    byKey: new Map(definitions.map((definition) => [definition.key, definition])),
    byFeatureId: new Map(overrides.map((override) => [override.featureId, override])),
    planFeatureByKey: new Map(configuredPlanRows.map((row) => [row.key, row])),
    configuredPlan: configuredPlanRows.length > 0,
    planFeatures: PLAN_FEATURES[activePlan] ?? PLAN_FEATURES.Starter,
  };
}

function evaluateFeatureAccess(context: FeatureAccessContext, key: string, visited = new Set<string>()): Omit<FeatureAccess, "key"> {
  if (visited.has(key)) return { enabled: false, limit: null, reason: "dependency_disabled" };
  const definition = context.byKey.get(key);
  if (!definition) return { enabled: false, limit: null, reason: "missing" };
  const override = context.byFeatureId.get(definition.id);
  if (definition.dependencyKey) {
    const dependency = evaluateFeatureAccess(context, definition.dependencyKey, new Set(Array.from(visited).concat(key)));
    if (!dependency.enabled) return { enabled: false, limit: null, reason: "dependency_disabled" };
  }
  if (override?.enabled === false) return { enabled: false, limit: override.overrideLimit ?? context.planFeatureByKey.get(key)?.featureLimit ?? definition.defaultLimit ?? null, reason: "disabled" };
  const packageFeature = context.planFeatureByKey.get(key);
  if (!override && ((context.configuredPlan && packageFeature?.enabled !== true) || (!context.configuredPlan && !context.planFeatures.has(key)))) return { enabled: false, limit: packageFeature?.featureLimit ?? definition.defaultLimit ?? null, reason: "disabled" };
  return { enabled: true, limit: override?.overrideLimit ?? packageFeature?.featureLimit ?? definition.defaultLimit ?? null, reason: "enabled" };
}

export async function getFeatureAccess(restaurantId: number, featureKey: string): Promise<FeatureAccess> {
  const context = await loadFeatureAccessContext(restaurantId);
  if (!context) return { key: featureKey, enabled: false, limit: null, reason: "database_unavailable" };
  return { key: featureKey, ...evaluateFeatureAccess(context, featureKey) };
}

export async function getFeatureAccessMap(restaurantId: number): Promise<Map<string, FeatureAccess>> {
  const context = await loadFeatureAccessContext(restaurantId);
  if (!context) return new Map();
  return new Map(context.definitions.map((definition) => [definition.key, { key: definition.key, ...evaluateFeatureAccess(context, definition.key) }]));
}

export async function getUserSecurity(userId: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(userSecurity).where(eq(userSecurity.userId, userId)).limit(1); return rows[0]; }
export async function getReceiptTemplate(restaurantId: number) { const db = await getDb(); if (!db) return undefined; return (await db.select().from(receiptTemplates).where(eq(receiptTemplates.restaurantId, restaurantId)).limit(1))[0]; }
export async function upsertReceiptTemplate(input: { restaurantId: number; headerText: string; footerText: string; logoUrl?: string | null; messageTemplatesJson?: string | null; createdByUserId?: number | null }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const existing = await getReceiptTemplate(input.restaurantId); if (existing) { await db.update(receiptTemplates).set({ headerText: input.headerText, footerText: input.footerText, logoUrl: input.logoUrl === undefined ? existing.logoUrl : input.logoUrl, messageTemplatesJson: input.messageTemplatesJson === undefined ? existing.messageTemplatesJson : input.messageTemplatesJson, updatedAt: new Date() }).where(eq(receiptTemplates.restaurantId, input.restaurantId)); return existing.id; } const result = await db.insert(receiptTemplates).values({ restaurantId: input.restaurantId, headerText: input.headerText, footerText: input.footerText, logoUrl: input.logoUrl ?? null, messageTemplatesJson: input.messageTemplatesJson ?? null, createdByUserId: input.createdByUserId ?? null }); return Number(result[0].insertId); }
export async function insertAuditLog(input: typeof auditLogs.$inferInsert) { const db = await getDb(); if (!db) return undefined; let safeInput = input; if (input.actorUserId !== undefined && input.actorUserId !== null) { const actor = await db.select({ id: users.id }).from(users).where(eq(users.id, input.actorUserId)).limit(1); if (!actor[0]) safeInput = { ...input, actorUserId: null }; } const result = await db.insert(auditLogs).values(safeInput); return Number(result[0].insertId); }
export async function listAuditLogs(filters?: { restaurantId?: number; actorUserId?: number; actorRole?: string; action?: string; actions?: string[]; from?: Date; to?: Date; limit?: number }) { const db = await getDb(); if (!db) return []; const conditions = [filters?.restaurantId ? eq(auditLogs.restaurantId, filters.restaurantId) : undefined, filters?.actorUserId ? eq(auditLogs.actorUserId, filters.actorUserId) : undefined, filters?.actorRole ? eq(auditLogs.actorRole, filters.actorRole) : undefined, filters?.action ? eq(auditLogs.action, filters.action) : undefined, filters?.actions?.length ? inArray(auditLogs.action, filters.actions) : undefined, filters?.from ? gte(auditLogs.createdAt, filters.from) : undefined, filters?.to ? lte(auditLogs.createdAt, filters.to) : undefined].filter((condition): condition is NonNullable<typeof condition> => Boolean(condition)); const whereClause = conditions.length > 0 ? and(...conditions) : undefined; return db.select().from(auditLogs).where(whereClause).orderBy(desc(auditLogs.createdAt)).limit(filters?.limit ?? 100); }
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

export type MediaScope = "platform" | "restaurant" | "user";
export async function listTranslationErrors(restaurantId: number) { const db = await getDb(); if (!db) return []; return db.select().from(translationErrorLogs).where(eq(translationErrorLogs.restaurantId, restaurantId)).orderBy(desc(translationErrorLogs.createdAt)); }
export async function createTranslationError(input: { restaurantId: number; entityType: "category" | "item"; entityId: number; sourceLanguage: string; targetLanguage: string; sourceName: string; errorMessage: string; createdByUserId?: number | null; attempts?: number }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const result = await db.insert(translationErrorLogs).values({ ...input, createdByUserId: input.createdByUserId ?? null, attempts: input.attempts ?? 1 }); return Number(result[0].insertId); }
export async function resolveTranslationError(id: number, restaurantId: number) { const db = await getDb(); if (!db) throw new Error("Database is not available"); await db.update(translationErrorLogs).set({ status: "resolved", resolvedAt: new Date() }).where(and(eq(translationErrorLogs.id, id), eq(translationErrorLogs.restaurantId, restaurantId))); return { success: true, id }; }

export async function listMediaFiles(input: { scope: MediaScope; userId?: number; restaurantId?: number; search?: string; category?: "image" | "menu" | "logo" | "document" | "other" }) {
  const db = await getDb(); if (!db) return [];
  const predicates = [eq(mediaFiles.scope, input.scope), eq(mediaFiles.isDeleted, false)];
  if (input.scope === "user") predicates.push(eq(mediaFiles.ownerUserId, input.userId ?? 0));
  if (input.scope === "restaurant") predicates.push(eq(mediaFiles.restaurantId, input.restaurantId ?? 0));
  if (input.category) predicates.push(eq(mediaFiles.category, input.category));
  const rows = await db.select().from(mediaFiles).where(and(...predicates)).orderBy(desc(mediaFiles.createdAt));
  const query = input.search?.trim().toLowerCase();
  return query ? rows.filter((row) => row.originalName.toLowerCase().includes(query)) : rows;
}
export async function listMediaFolders(input: { scope: MediaScope; userId?: number; restaurantId?: number }) {
  const db = await getDb(); if (!db) return [];
  const predicates = [eq(mediaFolders.scope, input.scope)];
  if (input.scope === "user") predicates.push(eq(mediaFolders.ownerUserId, input.userId ?? 0));
  if (input.scope === "restaurant") predicates.push(eq(mediaFolders.restaurantId, input.restaurantId ?? 0));
  return db.select().from(mediaFolders).where(and(...predicates)).orderBy(desc(mediaFolders.createdAt));
}
export async function getMediaUsage(input: { scope: MediaScope; userId?: number; restaurantId?: number }) {
  const files = await listMediaFiles(input); return { usedBytes: files.reduce((total, file) => total + file.sizeBytes, 0), fileCount: files.length };
}
export async function createMediaFolder(input: { scope: MediaScope; ownerUserId?: number; restaurantId?: number; name: string; createdByUserId: number }) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  const result = await db.insert(mediaFolders).values({ scope: input.scope, ownerUserId: input.ownerUserId ?? null, restaurantId: input.restaurantId ?? null, name: input.name, createdByUserId: input.createdByUserId }); return Number(result[0].insertId);
}
export async function getValidMediaActorUserId(preferredUserId: number, restaurantId?: number) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const direct = (await db.select({ id: users.id }).from(users).where(eq(users.id, preferredUserId)).limit(1))[0]?.id; if (direct) return direct; if (restaurantId) { const member = (await db.select({ userId: restaurantMembers.userId }).from(restaurantMembers).where(eq(restaurantMembers.restaurantId, restaurantId)).limit(1))[0]?.userId; if (member) return member; } const fallback = (await db.select({ id: users.id }).from(users).limit(1))[0]?.id; if (!fallback) throw new Error("لا يوجد مستخدم صالح لحفظ ملف الوسائط"); return fallback; }
export async function getOrCreateRestaurantArchiveFolder(restaurantId: number, createdByUserId: number) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const existing = await db.select({ id: mediaFolders.id }).from(mediaFolders).where(and(eq(mediaFolders.scope, "restaurant"), eq(mediaFolders.restaurantId, restaurantId), eq(mediaFolders.name, "Menu Archive"))).limit(1); if (existing[0]) return existing[0].id; const validActor = await getValidMediaActorUserId(createdByUserId, restaurantId); const result = await db.insert(mediaFolders).values({ scope: "restaurant", restaurantId, ownerUserId: null, name: "Menu Archive", createdByUserId: validActor }); return Number(result[0].insertId); }
export async function createMediaFile(input: { scope: MediaScope; ownerUserId?: number; restaurantId?: number; folderId?: number; originalName: string; storageKey: string; publicUrl: string; contentType: string; sizeBytes: number; category: "image" | "menu" | "logo" | "document" | "other"; uploadedByUserId: number }) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  const uploadedByUserId = await getValidMediaActorUserId(input.uploadedByUserId, input.restaurantId);
  const result = await db.insert(mediaFiles).values({ ...input, uploadedByUserId, ownerUserId: input.ownerUserId ?? null, restaurantId: input.restaurantId ?? null, folderId: input.folderId ?? null }); return Number(result[0].insertId);
}
export async function bulkDeleteMediaFiles(input: { ids: number[]; scope: MediaScope; userId?: number; restaurantId?: number }) { const db = await getDb(); if (!db || input.ids.length === 0) return 0; const predicates = [inArray(mediaFiles.id, input.ids), eq(mediaFiles.scope, input.scope), eq(mediaFiles.isDeleted, false)]; if (input.scope === "user") predicates.push(eq(mediaFiles.ownerUserId, input.userId ?? 0)); if (input.scope === "restaurant") predicates.push(eq(mediaFiles.restaurantId, input.restaurantId ?? 0)); const result = await db.update(mediaFiles).set({ isDeleted: true }).where(and(...predicates)); return Number(result[0].affectedRows ?? 0); }
export async function bulkMoveMediaFiles(input: { ids: number[]; folderId: number; scope: MediaScope; userId?: number; restaurantId?: number }) { const db = await getDb(); if (!db || input.ids.length === 0) return 0; const folderPredicates = [eq(mediaFolders.id, input.folderId), eq(mediaFolders.scope, input.scope)]; if (input.scope === "user") folderPredicates.push(eq(mediaFolders.ownerUserId, input.userId ?? 0)); if (input.scope === "restaurant") folderPredicates.push(eq(mediaFolders.restaurantId, input.restaurantId ?? 0)); const folder = (await db.select({ id: mediaFolders.id }).from(mediaFolders).where(and(...folderPredicates)).limit(1))[0]; if (!folder) throw new Error("المجلد غير موجود ضمن مساحة العمل الحالية"); const predicates = [inArray(mediaFiles.id, input.ids), eq(mediaFiles.scope, input.scope), eq(mediaFiles.isDeleted, false)]; if (input.scope === "user") predicates.push(eq(mediaFiles.ownerUserId, input.userId ?? 0)); if (input.scope === "restaurant") predicates.push(eq(mediaFiles.restaurantId, input.restaurantId ?? 0)); const result = await db.update(mediaFiles).set({ folderId: input.folderId }).where(and(...predicates)); return Number(result[0].affectedRows ?? 0); }

export async function listRestaurantDisplayScreens(restaurantId: number) { const db = await getDb(); if (!db) return []; return db.select().from(restaurantDisplayScreens).where(eq(restaurantDisplayScreens.restaurantId, restaurantId)).orderBy(desc(restaurantDisplayScreens.updatedAt)); }
export async function listRestaurantDisplaySlides(screenId: number, restaurantId: number) { const db = await getDb(); if (!db) return []; return db.select({ slide: restaurantDisplaySlides, menuItem: menuItems, mediaFile: mediaFiles }).from(restaurantDisplaySlides).leftJoin(menuItems, eq(restaurantDisplaySlides.menuItemId, menuItems.id)).leftJoin(mediaFiles, eq(restaurantDisplaySlides.mediaFileId, mediaFiles.id)).where(and(eq(restaurantDisplaySlides.screenId, screenId), eq(restaurantDisplaySlides.restaurantId, restaurantId))).orderBy(restaurantDisplaySlides.sortOrder); }
export async function listCampaignContents(campaignId: number, restaurantId: number) { const db = await getDb(); if (!db) return []; return db.select({ content: campaignContents, menuItem: menuItems, mediaFile: mediaFiles }).from(campaignContents).leftJoin(menuItems, eq(campaignContents.menuItemId, menuItems.id)).leftJoin(mediaFiles, eq(campaignContents.mediaFileId, mediaFiles.id)).where(and(eq(campaignContents.campaignId, campaignId), eq(campaignContents.restaurantId, restaurantId))).orderBy(campaignContents.sortOrder); }
