import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, inArray, isNull, lte, or, sql } from "drizzle-orm";
import {
  PLAN_TIERS,
  affiliateAccounts,
  affiliateCommissions,
  affiliateLinks,
  affiliatePayoutRequests,
  marketplaceListings,
  marketplaceSectors,
  marketplaceStorefrontSettings,
  platformEntities,
  restaurants,
  storeCampaigns,
  storeCouponRedemptions,
  storeCoupons,
  storeLoyaltyAccounts,
  storeLoyaltySettings,
  storeReferralLinks,
  storeReferralRecords,
  storeRewardTransactions,
  users,
  walletAccounts,
} from "../drizzle/schema";
import { publicProcedure, protectedProcedure, adminProcedure, platformAdminProcedure, router } from "./_core/trpc";
import type { TrpcContext } from "./_core/context";
import { nanoid } from "nanoid";
import { getDb, getMerchantRestaurantId, insertAuditLog } from "./db";
import { sendPushToUser } from "./push";

async function getProviderEntity(user: AuthUser) {
  const db = await getDb();
  if (!db) return null;
  if (user.email) {
    const byEmail = (await db.select().from(platformEntities).where(eq(platformEntities.email, user.email.trim().toLowerCase())).limit(1))[0];
    if (byEmail) return byEmail;
  }
  const merchantRestaurantId = await getMerchantRestaurantId(user.id);
  if (!merchantRestaurantId) return null;
  const members = await db.select({ email: users.email }).from(users).innerJoin(restaurants, eq(restaurants.id, merchantRestaurantId)).where(eq(users.id, user.id)).limit(1);
  const memberEmail = members[0]?.email;
  if (memberEmail) {
    const byMember = (await db.select().from(platformEntities).where(eq(platformEntities.email, memberEmail.trim().toLowerCase())).limit(1))[0];
    if (byMember) return byMember;
  }
  return null;
}

type AuthUser = NonNullable<TrpcContext["user"]>;

async function requireProviderEntity(user: AuthUser | null, db: NonNullable<Awaited<ReturnType<typeof getDb>>>) {
  const entity = await getProviderEntity(user as AuthUser);
  if (!entity) throw new TRPCError({ code: "FORBIDDEN", message: "حساب التاجر غير مرتبط بمنشأة NFOOD" });
  return entity;
}

const entityIdSchema = z.string().trim().min(1).max(30);

export const marketplaceRouter = router({
  // ── Public storefront ────────────────────────────────────────────────
  publicSectors: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const sectors = await db.select().from(marketplaceSectors).where(eq(marketplaceSectors.isActive, true)).orderBy(marketplaceSectors.sortOrder);
    const counts = await db.select({ sectorId: marketplaceListings.sectorId, total: sql<number>`count(*)` }).from(marketplaceListings).where(eq(marketplaceListings.status, "active")).groupBy(marketplaceListings.sectorId);
    const countMap = new Map(counts.map((row) => [Number(row.sectorId), Number(row.total)]));
    return sectors.map((sector) => ({ ...sector, listingCount: countMap.get(sector.id) ?? 0 }));
  }),
  publicStores: publicProcedure.input(z.object({
    countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()).optional(),
    sectorSlug: z.string().trim().min(1).max(80).optional(),
    search: z.string().trim().max(120).optional(),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    let sectorIdsBySlug = new Map<number, number>();
    if (input.sectorSlug) {
      const sector = (await db.select({ id: marketplaceSectors.id }).from(marketplaceSectors).where(eq(marketplaceSectors.slug, input.sectorSlug)).limit(1))[0];
      if (!sector) return [];
      sectorIdsBySlug.set(sector.id, sector.id);
    }
    const listings = await db.select({
      entityId: marketplaceListings.entityId,
      sectorId: marketplaceListings.sectorId,
      title: marketplaceListings.title,
      price: marketplaceListings.price,
      currencyCode: marketplaceListings.currencyCode,
      imageUrl: marketplaceListings.imageUrl,
      isFeatured: marketplaceListings.isFeatured,
    }).from(marketplaceListings).where(eq(marketplaceListings.status, "active"));
    let matchingEntityIds = new Set<string>();
    if (sectorIdsBySlug.size) {
      for (const listing of listings) if (sectorIdsBySlug.has(listing.sectorId)) matchingEntityIds.add(listing.entityId);
    } else {
      for (const listing of listings) matchingEntityIds.add(listing.entityId);
    }
    if (!matchingEntityIds.size) return [];
    const entityConditions = [eq(platformEntities.status, true), inArray(platformEntities.id, Array.from(matchingEntityIds))];
    if (input.countryCode) entityConditions.push(eq(platformEntities.countryCode, input.countryCode));
    const entityRows = await db.select().from(platformEntities).where(and(...entityConditions));
    const searchTerm = input.search?.trim().toLowerCase();
    const result = [];
    for (const entity of entityRows) {
      if (searchTerm && !(entity.customerName.toLowerCase().includes(searchTerm) || entity.email.toLowerCase().includes(searchTerm))) continue;
      const entityListings = listings.filter((listing) => listing.entityId === entity.id);
      const restaurantMatch = await db.select({ id: restaurants.id, brandName: restaurants.brandName, brandLogoUrl: restaurants.brandLogoUrl, coverUrl: restaurants.coverUrl, city: restaurants.city, brandColor: restaurants.brandColor, brandAccentColor: restaurants.brandAccentColor }).from(restaurants).where(eq(restaurants.brandName, entity.customerName)).limit(1);
      const storefront = (await db.select().from(marketplaceStorefrontSettings).where(and(eq(marketplaceStorefrontSettings.entityId, entity.id), eq(marketplaceStorefrontSettings.isPublished, true))).limit(1))[0] ?? null;
      result.push({
        entityId: entity.id,
        customerName: entity.customerName,
        email: entity.email,
        sector: entity.sector,
        status: entity.status,
        plan: entity.plan,
        listingCount: entityListings.length,
        minPrice: entityListings.length ? Math.min(...entityListings.map((row) => Number(row.price))) : 0,
        restaurant: restaurantMatch[0] ?? null,
        storefront,
      });
    }
    return result;
  }),
  publicStore: publicProcedure.input(z.object({
    entityId: entityIdSchema,
    countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()).optional(),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const entity = (await db.select().from(platformEntities).where(and(eq(platformEntities.id, input.entityId), eq(platformEntities.status, true))).limit(1))[0];
    if (!entity) throw new TRPCError({ code: "NOT_FOUND", message: "المتجر غير موجود" });
    if (input.countryCode && entity.countryCode !== input.countryCode) {
      throw new TRPCError({ code: "NOT_FOUND", message: "المتجر غير متاح في هذه الدولة" });
    }
    const listings = await db.select().from(marketplaceListings).where(and(eq(marketplaceListings.entityId, input.entityId), eq(marketplaceListings.status, "active"))).orderBy(desc(marketplaceListings.isFeatured), desc(marketplaceListings.createdAt));
    const loyaltySettings = (await db.select().from(storeLoyaltySettings).where(eq(storeLoyaltySettings.entityId, input.entityId)).limit(1))[0] ?? null;
    const now = new Date();
    const coupons = await db.select().from(storeCoupons).where(and(eq(storeCoupons.entityId, input.entityId), eq(storeCoupons.isActive, true), or(isNull(storeCoupons.startsAt), lte(storeCoupons.startsAt, now)), or(isNull(storeCoupons.endsAt), gte(storeCoupons.endsAt, now)))).orderBy(desc(storeCoupons.createdAt));
    const restaurant = (await db.select().from(restaurants).where(eq(restaurants.brandName, entity.customerName)).limit(1))[0] ?? null;
    const storefront = (await db.select().from(marketplaceStorefrontSettings).where(and(eq(marketplaceStorefrontSettings.entityId, entity.id), eq(marketplaceStorefrontSettings.isPublished, true))).limit(1))[0] ?? null;
    return { entity, listings, loyaltySettings, coupons, restaurant, storefront };
  }),
  publicListings: publicProcedure.input(z.object({ sectorId: z.number().int().positive().optional(), featuredOnly: z.boolean().optional(), countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()).optional() }).optional()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions = [eq(marketplaceListings.status, "active")];
    if (input?.countryCode) {
      const countryEntities = await db.select({ id: platformEntities.id }).from(platformEntities).where(and(eq(platformEntities.status, true), eq(platformEntities.countryCode, input.countryCode)));
      if (!countryEntities.length) return [];
      conditions.push(inArray(marketplaceListings.entityId, countryEntities.map((row) => row.id)));
    }
    if (input?.sectorId) conditions.push(eq(marketplaceListings.sectorId, input.sectorId));
    if (input?.featuredOnly) conditions.push(eq(marketplaceListings.isFeatured, true));
    return db.select().from(marketplaceListings).where(and(...conditions)).orderBy(desc(marketplaceListings.isFeatured), desc(marketplaceListings.sortOrder));
  }),

  // ── Provider store manager ───────────────────────────────────────────
  providerStore: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const entity = await requireProviderEntity(ctx.user, db);
    const listings = await db.select().from(marketplaceListings).where(eq(marketplaceListings.entityId, entity.id)).orderBy(desc(marketplaceListings.createdAt));
    const loyaltySettings = await getOrCreateLoyaltySettings(db, entity.id);
    const coupons = await db.select().from(storeCoupons).where(eq(storeCoupons.entityId, entity.id)).orderBy(desc(storeCoupons.createdAt));
    const campaigns = await db.select().from(storeCampaigns).where(eq(storeCampaigns.entityId, entity.id)).orderBy(desc(storeCampaigns.createdAt));
    const referralLinks = await db.select().from(storeReferralLinks).where(eq(storeReferralLinks.entityId, entity.id)).orderBy(desc(storeReferralLinks.createdAt));
    const restaurant = (await db.select().from(restaurants).where(eq(restaurants.brandName, entity.customerName)).limit(1))[0] ?? null;
    const storeCount = await db.select({ total: sql<number>`count(*)` }).from(storeRewardTransactions).where(eq(storeRewardTransactions.entityId, entity.id));
    return {
      entity,
      restaurant,
      listings,
      loyaltySettings,
      coupons,
      campaigns,
      referralLinks,
      rewardTransactionCount: Number(storeCount[0]?.total ?? 0),
    };
  }),

  createListing: protectedProcedure.input(z.object({
    entityId: entityIdSchema,
    sectorId: z.number().int().positive(),
    title: z.string().trim().min(2).max(200),
    titleEn: z.string().trim().max(200).optional(),
    description: z.string().trim().max(4000).optional(),
    descriptionEn: z.string().trim().max(4000).optional(),
    imageUrl: z.string().trim().max(500).optional(),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/),
    compareAtPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    currencyCode: z.string().trim().length(3).default("SAR"),
    unit: z.string().trim().max(40).default("piece"),
    stockQuantity: z.number().int().nonnegative().optional(),
    isFeatured: z.boolean().optional(),
    tagsJson: z.string().max(2000).optional(),
    metadataJson: z.string().max(8000).optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const entity = await requireProviderEntity(ctx.user, db);
    if (entity.id !== input.entityId) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية هذا المتجر" });
    const sector = (await db.select({ id: marketplaceSectors.id, slug: marketplaceSectors.slug }).from(marketplaceSectors).where(eq(marketplaceSectors.id, input.sectorId)).limit(1))[0];
    if (!sector) throw new TRPCError({ code: "BAD_REQUEST", message: "القطاع غير معروف" });
    const normalizedSector = sector.slug === "restaurants" ? "restaurant" : sector.slug;
    if (entity.sector !== normalizedSector) {
      throw new TRPCError({ code: "FORBIDDEN", message: "لا يمكن إضافة منتج لنشاط مختلف عن نشاط المتجر" });
    }
    const result = await db.insert(marketplaceListings).values({
      entityId: entity.id,
      sectorId: input.sectorId,
      title: input.title,
      titleEn: input.titleEn ?? null,
      description: input.description ?? null,
      descriptionEn: input.descriptionEn ?? null,
      imageUrl: input.imageUrl ?? null,
      price: input.price,
      compareAtPrice: input.compareAtPrice ?? null,
      currencyCode: input.currencyCode,
      unit: input.unit,
      stockQuantity: input.stockQuantity ?? null,
      isFeatured: input.isFeatured ?? false,
      tagsJson: input.tagsJson ?? null,
      metadataJson: input.metadataJson ?? null,
      status: "active",
    });
    const id = Number(result[0].insertId);
    await insertAuditLog({ actorUserId: ctx.user.id, action: "marketplace.listing.created", entityType: "marketplace_listing", entityId: String(id), outcome: "success", requestId: id.toString(), metadata: JSON.stringify({ entityId: entity.id, title: input.title }) });
    return { success: true, id };
  }),
  updateListing: protectedProcedure.input(z.object({
    id: z.number().int().positive(),
    title: z.string().trim().min(2).max(200).optional(),
    titleEn: z.string().trim().max(200).optional(),
    description: z.string().trim().max(4000).nullable().optional(),
    descriptionEn: z.string().trim().max(4000).nullable().optional(),
    imageUrl: z.string().trim().max(500).nullable().optional(),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    compareAtPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable().optional(),
    currencyCode: z.string().trim().length(3).optional(),
    unit: z.string().trim().max(40).optional(),
    stockQuantity: z.number().int().nonnegative().nullable().optional(),
    isFeatured: z.boolean().optional(),
    status: z.enum(["draft", "active", "paused", "sold_out"]).optional(),
    tagsJson: z.string().max(2000).nullable().optional(),
    metadataJson: z.string().max(8000).nullable().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const entity = await requireProviderEntity(ctx.user, db);
    const existing = (await db.select({ id: marketplaceListings.id, entityId: marketplaceListings.entityId }).from(marketplaceListings).where(eq(marketplaceListings.id, input.id)).limit(1))[0];
    if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "المنتج غير موجود" });
    if (existing.entityId !== entity.id) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية هذا المنتج" });
    const { id, ...changes } = input;
    const clean = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined));
    await db.update(marketplaceListings).set(clean).where(eq(marketplaceListings.id, id));
    await insertAuditLog({ actorUserId: ctx.user.id, action: "marketplace.listing.updated", entityType: "marketplace_listing", entityId: String(id), outcome: "success", requestId: id.toString(), metadata: JSON.stringify(clean) });
    return { success: true, id };
  }),
  setListingStatus: protectedProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["draft", "active", "paused", "sold_out"]) })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const entity = await requireProviderEntity(ctx.user, db);
    const existing = (await db.select({ id: marketplaceListings.id, entityId: marketplaceListings.entityId }).from(marketplaceListings).where(eq(marketplaceListings.id, input.id)).limit(1))[0];
    if (!existing || existing.entityId !== entity.id) throw new TRPCError({ code: "NOT_FOUND", message: "المنتج غير موجود" });
    await db.update(marketplaceListings).set({ status: input.status }).where(eq(marketplaceListings.id, input.id));
    return { success: true, id: input.id, status: input.status };
  }),

  updateLoyaltySettings: protectedProcedure.input(z.object({
    entityId: entityIdSchema,
    pointsPerCurrency: z.string().regex(/^\d+(\.\d{1,2})?$/),
    redeemRate: z.string().regex(/^\d+(\.\d{1,4})?$/),
    minPointsToRedeem: z.number().int().nonnegative(),
    welcomeBonusPoints: z.number().int().nonnegative(),
    tierThresholdsJson: z.string().max(4000).nullable().optional(),
    isActive: z.boolean(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const entity = await requireProviderEntity(ctx.user, db);
    if (entity.id !== input.entityId) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية هذا المتجر" });
    const existing = (await db.select({ id: storeLoyaltySettings.id }).from(storeLoyaltySettings).where(eq(storeLoyaltySettings.entityId, input.entityId)).limit(1))[0];
    const values = { pointsPerCurrency: input.pointsPerCurrency, redeemRate: input.redeemRate, minPointsToRedeem: input.minPointsToRedeem, welcomeBonusPoints: input.welcomeBonusPoints, tierThresholdsJson: input.tierThresholdsJson ?? null, isActive: input.isActive };
    if (existing) await db.update(storeLoyaltySettings).set(values).where(eq(storeLoyaltySettings.id, existing.id));
    else await db.insert(storeLoyaltySettings).values({ entityId: input.entityId, ...values });
    return { success: true };
  }),

  createCoupon: protectedProcedure.input(z.object({
    entityId: entityIdSchema,
    code: z.string().trim().min(3).max(64).toUpperCase(),
    description: z.string().trim().max(300).optional(),
    discountType: z.enum(["percent", "fixed"]).default("percent"),
    discountValue: z.string().regex(/^\d+(\.\d{1,2})?$/),
    minOrderAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).default("0"),
    maxDiscountAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable().optional(),
    usageLimit: z.number().int().positive().nullable().optional(),
    perUserLimit: z.number().int().positive().default(1),
    startsAt: z.string().datetime({ offset: true }).optional(),
    endsAt: z.string().datetime({ offset: true }).optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const entity = await requireProviderEntity(ctx.user, db);
    if (entity.id !== input.entityId) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية هذا المتجر" });
    const duplicate = (await db.select({ id: storeCoupons.id }).from(storeCoupons).where(eq(storeCoupons.code, input.code)).limit(1))[0];
    if (duplicate) throw new TRPCError({ code: "CONFLICT", message: "كود الكوبون مستخدم" });
    const result = await db.insert(storeCoupons).values({
      entityId: entity.id,
      code: input.code,
      description: input.description ?? null,
      discountType: input.discountType,
      discountValue: input.discountValue,
      minOrderAmount: input.minOrderAmount,
      maxDiscountAmount: input.maxDiscountAmount ?? null,
      usageLimit: input.usageLimit ?? null,
      perUserLimit: input.perUserLimit,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      isActive: true,
      createdByUserId: ctx.user.id,
    });
    const id = Number(result[0].insertId);
    await insertAuditLog({ actorUserId: ctx.user.id, action: "marketplace.coupon.created", entityType: "store_coupon", entityId: String(id), outcome: "success", requestId: id.toString(), metadata: JSON.stringify({ entityId: entity.id, code: input.code }) });
    return { success: true, id };
  }),
  toggleCoupon: protectedProcedure.input(z.object({ id: z.number().int().positive(), isActive: z.boolean() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const entity = await requireProviderEntity(ctx.user, db);
    const existing = (await db.select({ id: storeCoupons.id, entityId: storeCoupons.entityId }).from(storeCoupons).where(eq(storeCoupons.id, input.id)).limit(1))[0];
    if (!existing || existing.entityId !== entity.id) throw new TRPCError({ code: "NOT_FOUND", message: "الكوبون غير موجود" });
    await db.update(storeCoupons).set({ isActive: input.isActive }).where(eq(storeCoupons.id, input.id));
    return { success: true, id: input.id, isActive: input.isActive };
  }),
  deleteCoupon: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const entity = await requireProviderEntity(ctx.user, db);
    const existing = (await db.select({ id: storeCoupons.id, entityId: storeCoupons.entityId }).from(storeCoupons).where(eq(storeCoupons.id, input.id)).limit(1))[0];
    if (!existing || existing.entityId !== entity.id) throw new TRPCError({ code: "NOT_FOUND", message: "الكوبون غير موجود" });
    await db.delete(storeCoupons).where(eq(storeCoupons.id, input.id));
    return { success: true, id: input.id };
  }),

  createCampaign: protectedProcedure.input(z.object({
    entityId: entityIdSchema,
    name: z.string().trim().min(2).max(160),
    description: z.string().trim().max(2000).optional(),
    type: z.enum(["general", "seasonal", "referral_boost", "loyalty_boost", "flash_sale"]).default("general"),
    startsAt: z.string().datetime({ offset: true }).optional(),
    endsAt: z.string().datetime({ offset: true }).optional(),
    bonusPoints: z.number().int().nonnegative().optional(),
    bonusPercent: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    targetCouponId: z.number().int().positive().nullable().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const entity = await requireProviderEntity(ctx.user, db);
    if (entity.id !== input.entityId) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية هذا المتجر" });
    const result = await db.insert(storeCampaigns).values({
      entityId: entity.id,
      name: input.name,
      description: input.description ?? null,
      type: input.type,
      status: "active",
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      bonusPoints: input.bonusPoints ?? 0,
      bonusPercent: input.bonusPercent ?? "0",
      targetCouponId: input.targetCouponId ?? null,
      createdByUserId: ctx.user.id,
    });
    return { success: true, id: Number(result[0].insertId) };
  }),
  endCampaign: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const entity = await requireProviderEntity(ctx.user, db);
    const existing = (await db.select({ id: storeCampaigns.id, entityId: storeCampaigns.entityId }).from(storeCampaigns).where(eq(storeCampaigns.id, input.id)).limit(1))[0];
    if (!existing || existing.entityId !== entity.id) throw new TRPCError({ code: "NOT_FOUND", message: "الحملة غير موجودة" });
    await db.update(storeCampaigns).set({ status: "ended" }).where(eq(storeCampaigns.id, input.id));
    return { success: true, id: input.id };
  }),

  createReferralLink: protectedProcedure.input(z.object({
    entityId: entityIdSchema,
    rewardType: z.enum(["percent", "fixed", "points"]).default("percent"),
    rewardValue: z.string().regex(/^\d+(\.\d{1,2})?$/).default("0"),
    maxUses: z.number().int().positive().nullable().optional(),
    expiresAt: z.string().datetime({ offset: true }).optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const entity = await requireProviderEntity(ctx.user, db);
    if (entity.id !== input.entityId) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية هذا المتجر" });
    const code = `RF-${entity.id.toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const result = await db.insert(storeReferralLinks).values({
      entityId: entity.id,
      code,
      rewardType: input.rewardType,
      rewardValue: input.rewardValue,
      maxUses: input.maxUses ?? null,
      isActive: true,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      createdByUserId: ctx.user.id,
    });
    return { success: true, id: Number(result[0].insertId), code };
  }),
  toggleReferralLink: protectedProcedure.input(z.object({ id: z.number().int().positive(), isActive: z.boolean() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const entity = await requireProviderEntity(ctx.user, db);
    const existing = (await db.select({ id: storeReferralLinks.id, entityId: storeReferralLinks.entityId }).from(storeReferralLinks).where(eq(storeReferralLinks.id, input.id)).limit(1))[0];
    if (!existing || existing.entityId !== entity.id) throw new TRPCError({ code: "NOT_FOUND", message: "الرابط غير موجود" });
    await db.update(storeReferralLinks).set({ isActive: input.isActive }).where(eq(storeReferralLinks.id, input.id));
    return { success: true, id: input.id, isActive: input.isActive };
  }),

  // ── Customer rewards ─────────────────────────────────────────────────
  myRewards: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { wallet: null, loyalty: [], couponsRedeemed: 0, referrals: 0 };
    const wallet = (await db.select().from(walletAccounts).where(eq(walletAccounts.customerId, ctx.user.id)).limit(1))[0] ?? null;
    const loyalty = await db.select().from(storeLoyaltyAccounts).where(eq(storeLoyaltyAccounts.userId, ctx.user.id)).orderBy(desc(storeLoyaltyAccounts.totalEarned));
    const redemptions = await db.select({ total: sql<number>`count(*)` }).from(storeCouponRedemptions).where(eq(storeCouponRedemptions.userId, ctx.user.id));
    const referrals = await db.select({ total: sql<number>`count(*)` }).from(storeReferralRecords).where(eq(storeReferralRecords.referredUserId, ctx.user.id));
    return { wallet, loyalty, couponsRedeemed: Number(redemptions[0]?.total ?? 0), referrals: Number(referrals[0]?.total ?? 0) };
  }),
  redeemCoupon: protectedProcedure.input(z.object({ code: z.string().trim().min(3).max(64), entityId: entityIdSchema.optional(), orderAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const code = input.code.toUpperCase();
    const couponConditions = [eq(storeCoupons.code, code), eq(storeCoupons.isActive, true)];
    if (input.entityId) couponConditions.push(eq(storeCoupons.entityId, input.entityId));
    const coupon = (await db.select().from(storeCoupons).where(and(...couponConditions)).limit(1))[0];
    if (!coupon) throw new TRPCError({ code: "NOT_FOUND", message: "الكوبون غير صالح أو غير موجود" });
    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) throw new TRPCError({ code: "BAD_REQUEST", message: "الكوبون لم يبدأ بعد" });
    if (coupon.endsAt && coupon.endsAt < now) throw new TRPCError({ code: "BAD_REQUEST", message: "الكوبون منتهي الصلاحية" });
    if (coupon.usageLimit && coupon.useCount >= coupon.usageLimit) throw new TRPCError({ code: "BAD_REQUEST", message: "الوصول للحد الأقصى لاستخدام الكوبون" });
    const priorByUser = (await db.select({ total: sql<number>`count(*)` }).from(storeCouponRedemptions).where(and(eq(storeCouponRedemptions.couponId, coupon.id), eq(storeCouponRedemptions.userId, ctx.user.id))))[0];
    if (Number(priorByUser?.total ?? 0) >= coupon.perUserLimit) throw new TRPCError({ code: "BAD_REQUEST", message: "استخدمت هذا الكوبون مسبقاً" });
    const orderAmount = Number(input.orderAmount ?? "0");
    const discount = coupon.discountType === "percent"
      ? (Number(coupon.discountValue) * orderAmount) / 100
      : Number(coupon.discountValue);
    const capped = coupon.maxDiscountAmount ? Math.min(discount, Number(coupon.maxDiscountAmount)) : discount;
    const finalDiscount = Math.max(0, Math.min(capped, orderAmount));
    await db.transaction(async (tx) => {
      await tx.insert(storeCouponRedemptions).values({ couponId: coupon.id, entityId: coupon.entityId, userId: ctx.user.id, discountApplied: finalDiscount.toFixed(2), redeemedAt: now });
      await tx.update(storeCoupons).set({ useCount: coupon.useCount + 1 }).where(eq(storeCoupons.id, coupon.id));
    });
    return { success: true, couponId: coupon.id, code: coupon.code, discountType: coupon.discountType, discountAmount: finalDiscount.toFixed(2), perUserLimit: coupon.perUserLimit };
  }),
  rewardHistory: protectedProcedure.input(z.object({ entityId: entityIdSchema.optional() }).optional()).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions = [eq(storeRewardTransactions.userId, ctx.user.id)];
    if (input?.entityId) conditions.push(eq(storeRewardTransactions.entityId, input.entityId));
    return db.select().from(storeRewardTransactions).where(and(...conditions)).orderBy(desc(storeRewardTransactions.createdAt)).limit(200);
  }),
  claimReferral: publicProcedure.input(z.object({ code: z.string().trim().min(3).max(80), userId: z.number().int().positive().optional() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const link = (await db.select().from(storeReferralLinks).where(and(eq(storeReferralLinks.code, input.code), eq(storeReferralLinks.isActive, true))).limit(1))[0];
    if (!link) return { success: false, reason: "not_found" };
    if (link.expiresAt && link.expiresAt < new Date()) return { success: false, reason: "expired" };
    if (link.maxUses && link.useCount >= link.maxUses) return { success: false, reason: "limit" };
    const prior = (await db.select({ id: storeReferralRecords.id }).from(storeReferralRecords).where(and(eq(storeReferralRecords.linkId, link.id), input.userId ? eq(storeReferralRecords.referredUserId, input.userId) : undefined)).limit(1))[0];
    if (!prior) {
      await db.insert(storeReferralRecords).values({ linkId: link.id, entityId: link.entityId, referredUserId: input.userId ?? null, status: "pending" });
      await db.update(storeReferralLinks).set({ useCount: link.useCount + 1 }).where(eq(storeReferralLinks.id, link.id));
    }
    return { success: true, entityId: link.entityId };
  }),

  // ── Admin governance ─────────────────────────────────────────────────
  adminSectors: platformAdminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(marketplaceSectors).orderBy(marketplaceSectors.sortOrder);
  }),
  createSector: platformAdminProcedure.input(z.object({
    slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9_-]+$/),
    labelAr: z.string().trim().min(1).max(120),
    labelEn: z.string().trim().min(1).max(120),
    labelFr: z.string().trim().min(1).max(120),
    icon: z.string().trim().max(40).default("store"),
    color: z.string().trim().max(16).default("#E76F3C"),
    descriptionAr: z.string().trim().max(500).optional(),
    descriptionEn: z.string().trim().max(500).optional(),
    descriptionFr: z.string().trim().max(500).optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const duplicate = (await db.select({ id: marketplaceSectors.id }).from(marketplaceSectors).where(eq(marketplaceSectors.slug, input.slug)).limit(1))[0];
    if (duplicate) throw new TRPCError({ code: "CONFLICT", message: "القطاع موجود مسبقاً" });
    const result = await db.insert(marketplaceSectors).values({ slug: input.slug, labelAr: input.labelAr, labelEn: input.labelEn, labelFr: input.labelFr, icon: input.icon, color: input.color, descriptionAr: input.descriptionAr ?? null, descriptionEn: input.descriptionEn ?? null, descriptionFr: input.descriptionFr ?? null, isActive: true });
    const id = Number(result[0].insertId);
    await insertAuditLog({ actorUserId: ctx.user.id, actorRole: ctx.user.role ?? "admin", action: "marketplace.sector.created", entityType: "marketplace_sector", entityId: String(id), outcome: "success", requestId: String(id), metadata: JSON.stringify({ slug: input.slug, labelAr: input.labelAr }) });
    return { success: true, id };
  }),
  updateSector: platformAdminProcedure.input(z.object({
    id: z.number().int().positive(),
    labelAr: z.string().trim().min(1).max(120).optional(),
    labelEn: z.string().trim().min(1).max(120).optional(),
    labelFr: z.string().trim().min(1).max(120).optional(),
    icon: z.string().trim().max(40).optional(),
    color: z.string().trim().max(16).optional(),
    descriptionAr: z.string().trim().max(500).nullable().optional(),
    descriptionEn: z.string().trim().max(500).nullable().optional(),
    descriptionFr: z.string().trim().max(500).nullable().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const existing = (await db.select({ id: marketplaceSectors.id }).from(marketplaceSectors).where(eq(marketplaceSectors.id, input.id)).limit(1))[0];
    if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "القطاع غير موجود" });
    const { id, ...changes } = input;
    const clean = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined));
    await db.update(marketplaceSectors).set(clean).where(eq(marketplaceSectors.id, id));
    await insertAuditLog({ actorUserId: ctx.user.id, actorRole: ctx.user.role ?? "admin", action: "marketplace.sector.updated", entityType: "marketplace_sector", entityId: String(id), outcome: "success", requestId: String(id), metadata: JSON.stringify(clean) });
    return { success: true, id };
  }),

  // ── Affiliate ────────────────────────────────────────────────────────
  applyAffiliate: protectedProcedure.input(z.object({ code: z.string().trim().min(3).max(80).optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const existing = (await db.select().from(affiliateAccounts).where(eq(affiliateAccounts.userId, ctx.user.id)).limit(1))[0];
    if (existing) throw new TRPCError({ code: "CONFLICT", message: "لديك حساب تابع مسبقاً" });
    const code = (input.code ?? `AFF-${ctx.user.id}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`).trim();
    const result = await db.insert(affiliateAccounts).values({ userId: ctx.user.id, code, status: "pending" });
    return { success: true, id: Number(result[0].insertId), code };
  }),
  myAffiliate: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const account = (await db.select().from(affiliateAccounts).where(eq(affiliateAccounts.userId, ctx.user.id)).limit(1))[0] ?? null;
    if (!account) return { account: null, links: [], commissions: [], payouts: [] };
    const links = await db.select().from(affiliateLinks).where(eq(affiliateLinks.affiliateUserId, account.id)).orderBy(desc(affiliateLinks.createdAt));
    const commissions = await db.select().from(affiliateCommissions).where(eq(affiliateCommissions.affiliateUserId, account.id)).orderBy(desc(affiliateCommissions.createdAt)).limit(200);
    const payouts = await db.select().from(affiliatePayoutRequests).where(eq(affiliatePayoutRequests.affiliateUserId, account.id)).orderBy(desc(affiliatePayoutRequests.createdAt)).limit(100);
    return { account, links, commissions, payouts };
  }),
  createAffiliateLink: protectedProcedure.input(z.object({ entityId: entityIdSchema.optional(), targetPath: z.string().trim().max(300).default("/"), code: z.string().trim().min(3).max(80).optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const account = (await db.select().from(affiliateAccounts).where(and(eq(affiliateAccounts.userId, ctx.user.id), eq(affiliateAccounts.status, "active"))).limit(1))[0];
    if (!account) throw new TRPCError({ code: "FORBIDDEN", message: "حسابك التابع غير مفعّل بعد" });
    const code = (input.code ?? `AFF-${account.id}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`).trim();
    const result = await db.insert(affiliateLinks).values({ affiliateUserId: account.id, entityId: input.entityId ?? null, code, targetPath: input.targetPath, isActive: true });
    return { success: true, id: Number(result[0].insertId), code };
  }),
  recordAffiliateClick: publicProcedure.input(z.object({ code: z.string().trim().min(3).max(80) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) return { success: false };
    await db.update(affiliateLinks).set({ clickCount: sql`clickCount + 1` }).where(and(eq(affiliateLinks.code, input.code), eq(affiliateLinks.isActive, true)));
    return { success: true };
  }),
  requestPayout: protectedProcedure.input(z.object({
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
    paymentMethod: z.string().trim().max(40).default("bank_transfer"),
    paymentDetailsJson: z.string().max(2000).nullable().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const account = (await db.select().from(affiliateAccounts).where(and(eq(affiliateAccounts.userId, ctx.user.id), eq(affiliateAccounts.status, "active"))).limit(1))[0];
    if (!account) throw new TRPCError({ code: "FORBIDDEN", message: "حسابك التابع غير مفعّل بعد" });
    const pending = (await db.select({ id: affiliatePayoutRequests.id }).from(affiliatePayoutRequests).where(and(eq(affiliatePayoutRequests.affiliateUserId, account.id), eq(affiliatePayoutRequests.status, "pending"))).limit(1))[0];
    if (pending) throw new TRPCError({ code: "CONFLICT", message: "لديك طلب سحب قيد المراجعة" });
    const available = Number(account.totalEarnings) - Number(account.paidEarnings);
    const requested = Number(input.amount);
    if (!Number.isFinite(requested) || requested <= 0 || requested > available) throw new TRPCError({ code: "BAD_REQUEST", message: "المبلغ المطلوب يتجاوز أرباحك المتاحة" });
    const result = await db.insert(affiliatePayoutRequests).values({ affiliateUserId: account.id, amount: input.amount, currencyCode: "SAR", paymentMethod: input.paymentMethod, paymentDetailsJson: input.paymentDetailsJson ?? null, status: "pending" });
    return { success: true, id: Number(result[0].insertId) };
  }),
  adminAffiliates: platformAdminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(affiliateAccounts).orderBy(desc(affiliateAccounts.appliedAt));
  }),
  reviewAffiliate: platformAdminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["active", "rejected", "suspended"]) })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const existing = (await db.select().from(affiliateAccounts).where(eq(affiliateAccounts.id, input.id)).limit(1))[0];
    if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "الحساب التابع غير موجود" });
    await db.update(affiliateAccounts).set({ status: input.status, approvedAt: input.status === "active" ? new Date() : existing.approvedAt }).where(eq(affiliateAccounts.id, input.id));
    await insertAuditLog({ actorUserId: ctx.user.id, actorRole: ctx.user.role ?? "admin", action: "affiliate.reviewed", entityType: "affiliate_account", entityId: String(input.id), outcome: "success", requestId: String(input.id), metadata: JSON.stringify({ status: input.status }) });
    return { success: true, id: input.id, status: input.status };
  }),
  adminPayouts: platformAdminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(affiliatePayoutRequests).orderBy(desc(affiliatePayoutRequests.createdAt)).limit(200);
  }),
  reviewPayout: platformAdminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["processing", "completed", "rejected"]), reviewNote: z.string().trim().max(500).optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const payout = (await db.select().from(affiliatePayoutRequests).where(eq(affiliatePayoutRequests.id, input.id)).limit(1))[0];
    if (!payout) throw new TRPCError({ code: "NOT_FOUND", message: "طلب السحب غير موجود" });
    await db.update(affiliatePayoutRequests).set({ status: input.status, reviewNote: input.reviewNote ?? null, reviewedByUserId: ctx.user.id, processedAt: input.status === "completed" ? new Date() : payout.processedAt }).where(eq(affiliatePayoutRequests.id, input.id));
    if (input.status === "completed") {
      const account = (await db.select().from(affiliateAccounts).where(eq(affiliateAccounts.id, payout.affiliateUserId)).limit(1))[0];
      if (account) {
        const nextPaid = (Number(account.paidEarnings) + Number(payout.amount)).toFixed(2);
        await db.update(affiliateAccounts).set({ paidEarnings: nextPaid }).where(eq(affiliateAccounts.id, account.id));
        const userRow = (await db.select({ id: users.id }).from(users).where(eq(users.id, account.userId)).limit(1))[0];
        if (userRow) await sendPushToUser(userRow.id, { title: "تم تحويل أرباحك", body: `تم صرف مبلغ ${payout.amount} SAR لأرباحك التابعة.`, url: "/affiliate" });
      }
    }
    await insertAuditLog({ actorUserId: ctx.user.id, actorRole: ctx.user.role ?? "admin", action: "affiliate.payout.reviewed", entityType: "affiliate_payout_request", entityId: String(input.id), outcome: "success", requestId: String(input.id), metadata: JSON.stringify({ status: input.status }) });
    return { success: true, id: input.id, status: input.status };
  }),

  adminStores: platformAdminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const [stores, listingCounts, couponCounts, sectorRows] = await Promise.all([
      db.select().from(platformEntities).orderBy(desc(platformEntities.createdAt)),
      db.select({ entityId: marketplaceListings.entityId, total: sql<number>`count(*)` }).from(marketplaceListings).groupBy(marketplaceListings.entityId),
      db.select({ entityId: storeCoupons.entityId, total: sql<number>`count(*)` }).from(storeCoupons).groupBy(storeCoupons.entityId),
      db.select().from(marketplaceSectors),
    ]);
    const listingMap = new Map(listingCounts.map((row) => [row.entityId, Number(row.total ?? 0)]));
    const couponMap = new Map(couponCounts.map((row) => [row.entityId, Number(row.total ?? 0)]));
    const sectorBySlug = new Map(sectorRows.map((row) => [row.slug, row]));
    return stores.map((store) => {
      const sector = sectorBySlug.get(store.sector) ?? null;
      return {
        id: store.id,
        customerName: store.customerName,
        email: store.email,
        sector: store.sector,
        sectorLabelAr: sector?.labelAr ?? store.sector,
        sectorLabelEn: sector?.labelEn ?? store.sector,
        sectorLabelFr: sector?.labelFr ?? store.sector,
        status: store.status,
        plan: store.plan,
        taxId: store.taxId,
        licensingFee: store.licensingFee,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
        listings: listingMap.get(store.id) ?? 0,
        coupons: couponMap.get(store.id) ?? 0,
      };
    });
  }),

  adminUpdateStore: platformAdminProcedure.input(z.object({
    id: z.string().trim().min(1).max(30),
    status: z.boolean().optional(),
    plan: z.enum(PLAN_TIERS).optional(),
    customerName: z.string().trim().min(1).max(300).optional(),
    taxId: z.string().trim().min(1).max(50).optional(),
    licensingFee: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
    const existing = (await db.select().from(platformEntities).where(eq(platformEntities.id, input.id)).limit(1))[0];
    if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "المنشأة غير موجودة" });
    const patch: { status?: boolean; plan?: (typeof PLAN_TIERS)[number]; customerName?: string; taxId?: string; licensingFee?: string } = {};
    if (input.status !== undefined) patch.status = input.status;
    if (input.plan !== undefined) patch.plan = input.plan;
    if (input.customerName !== undefined) patch.customerName = input.customerName;
    if (input.taxId !== undefined) patch.taxId = input.taxId;
    if (input.licensingFee !== undefined) patch.licensingFee = input.licensingFee;
    await db.update(platformEntities).set(patch).where(eq(platformEntities.id, input.id));
    await insertAuditLog({ actorUserId: ctx.user.id, actorRole: "admin", action: "marketplace.store.updated", entityType: "platform_entity", entityId: input.id, outcome: "success", requestId: nanoid(12), metadata: JSON.stringify(patch) });
    return { success: true, id: input.id };
  }),

  adminSummary: platformAdminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { sectors: 0, stores: 0, listings: 0, activeListings: 0, coupons: 0, affiliates: 0, pendingAffiliates: 0, pendingPayouts: 0 };
    const [sectorCount, storeCount, listingCount, activeListingCount, couponCount, affiliateCount, pendingAffiliateCount, pendingPayoutCount] = await Promise.all([
      db.select({ total: sql<number>`count(*)` }).from(marketplaceSectors),
      db.select({ total: sql<number>`count(*)` }).from(platformEntities).where(eq(platformEntities.status, true)),
      db.select({ total: sql<number>`count(*)` }).from(marketplaceListings),
      db.select({ total: sql<number>`count(*)` }).from(marketplaceListings).where(eq(marketplaceListings.status, "active")),
      db.select({ total: sql<number>`count(*)` }).from(storeCoupons),
      db.select({ total: sql<number>`count(*)` }).from(affiliateAccounts),
      db.select({ total: sql<number>`count(*)` }).from(affiliateAccounts).where(eq(affiliateAccounts.status, "pending")),
      db.select({ total: sql<number>`count(*)` }).from(affiliatePayoutRequests).where(eq(affiliatePayoutRequests.status, "pending")),
    ]);
    return {
      sectors: Number(sectorCount[0]?.total ?? 0),
      stores: Number(storeCount[0]?.total ?? 0),
      listings: Number(listingCount[0]?.total ?? 0),
      activeListings: Number(activeListingCount[0]?.total ?? 0),
      coupons: Number(couponCount[0]?.total ?? 0),
      affiliates: Number(affiliateCount[0]?.total ?? 0),
      pendingAffiliates: Number(pendingAffiliateCount[0]?.total ?? 0),
      pendingPayouts: Number(pendingPayoutCount[0]?.total ?? 0),
    };
  }),
});

async function getOrCreateLoyaltySettings(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, entityId: string) {
  const existing = (await db.select().from(storeLoyaltySettings).where(eq(storeLoyaltySettings.entityId, entityId)).limit(1))[0];
  if (existing) return existing;
  const result = await db.insert(storeLoyaltySettings).values({ entityId, pointsPerCurrency: "1.00", redeemRate: "0.01", minPointsToRedeem: 100, welcomeBonusPoints: 0, isActive: true });
  const id = Number(result[0].insertId);
  return (await db.select().from(storeLoyaltySettings).where(eq(storeLoyaltySettings.id, id)).limit(1))[0];
}

export type MarketplaceRouter = typeof marketplaceRouter;