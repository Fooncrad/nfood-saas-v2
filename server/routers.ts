import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { branches, orders, restaurants, menuItems, purchases, restaurantTables, campaigns } from "../drizzle/schema";
import { getDb, getRestaurantById, getRestaurantByBarcode, listBranches, listEmployees, listInventory, listMenuCategories, listMenuItems, listOrders, listRestaurants, listSubscriptions, listRoles, listPermissions, listTables, listPurchases, listAttendance, listCampaigns, listCoupons } from "./db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  platform: router({
    restaurants: protectedProcedure.query(() => listRestaurants()),
    restaurantById: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => getRestaurantById(input.id)),
    restaurantByBarcode: protectedProcedure.input(z.object({ barcode: z.string().min(6).max(64) })).query(({ input }) => getRestaurantByBarcode(input.barcode)),
    branches: protectedProcedure.input(z.object({ restaurantId: z.number().int().positive() })).query(({ input }) => listBranches(input.restaurantId)),
    menuCategories: protectedProcedure.input(z.object({ restaurantId: z.number().int().positive() })).query(({ input }) => listMenuCategories(input.restaurantId)),
    menuItems: protectedProcedure.input(z.object({ categoryId: z.number().int().positive().optional() }).optional()).query(({ input }) => listMenuItems(input?.categoryId)),
    orders: protectedProcedure.input(z.object({ branchId: z.number().int().positive() })).query(({ input }) => listOrders(input.branchId)),
    inventory: protectedProcedure.input(z.object({ restaurantId: z.number().int().positive() })).query(({ input }) => listInventory(input.restaurantId)),
    employees: protectedProcedure.input(z.object({ restaurantId: z.number().int().positive() })).query(({ input }) => listEmployees(input.restaurantId)),
    tables: protectedProcedure.input(z.object({ branchId: z.number().int().positive() })).query(({ input }) => listTables(input.branchId)),
    purchases: protectedProcedure.input(z.object({ restaurantId: z.number().int().positive() })).query(({ input }) => listPurchases(input.restaurantId)),
    attendance: protectedProcedure.input(z.object({ employeeId: z.number().int().positive().optional() }).optional()).query(({ input }) => listAttendance(input?.employeeId)),
    campaigns: protectedProcedure.input(z.object({ restaurantId: z.number().int().positive() })).query(({ input }) => listCampaigns(input.restaurantId)),
    coupons: protectedProcedure.input(z.object({ campaignId: z.number().int().positive().optional() }).optional()).query(({ input }) => listCoupons(input?.campaignId)),
    createBranch: protectedProcedure.input(z.object({ restaurantId: z.number().int().positive(), name: z.string().min(2), city: z.string().optional() })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database is not available"); const result = await db.insert(branches).values(input); return { success: true, id: Number(result[0].insertId) }; }),
    createMenuItem: protectedProcedure.input(z.object({ categoryId: z.number().int().positive(), name: z.string().min(2), price: z.string(), description: z.string().optional() })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database is not available"); const result = await db.insert(menuItems).values({ ...input, description: input.description ?? null }); return { success: true, id: Number(result[0].insertId) }; }),
    createPurchase: protectedProcedure.input(z.object({ restaurantId: z.number().int().positive(), supplier: z.string().min(2), total: z.string() })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database is not available"); const result = await db.insert(purchases).values(input); return { success: true, id: Number(result[0].insertId) }; }),
    updateTableStatus: protectedProcedure.input(z.object({ tableId: z.number().int().positive(), status: z.enum(["available", "occupied", "reserved"]) })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database is not available"); await db.update(restaurantTables).set({ status: input.status }).where(eq(restaurantTables.id, input.tableId)); return { success: true, status: input.status }; }),
    createCampaign: protectedProcedure.input(z.object({ restaurantId: z.number().int().positive(), name: z.string().min(2), status: z.enum(["draft", "scheduled", "active", "ended"]).default("draft") })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database is not available"); const result = await db.insert(campaigns).values(input); return { success: true, id: Number(result[0].insertId) }; }),
    updateOrderStatus: protectedProcedure.input(z.object({ orderId: z.number().int().positive(), status: z.enum(["new", "preparing", "ready", "completed", "cancelled"]) })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database is not available");
      await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.orderId));
      return { success: true, orderId: input.orderId, status: input.status };
    }),
  }),
  admin: router({
    restaurants: adminProcedure.query(() => listRestaurants()),
    createRestaurant: adminProcedure.input(z.object({ name: z.string().min(2), slug: z.string().min(2).max(160), plan: z.string().min(2).default("Growth") })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database is not available"); const barcode = `NFOOD-${nanoid(10).toUpperCase()}`; const result = await db.insert(restaurants).values({ ...input, barcode, status: "trial" }); return { success: true, id: Number(result[0].insertId), barcode }; }),
    subscriptions: adminProcedure.input(z.object({ restaurantId: z.number().int().positive().optional() }).optional()).query(({ input }) => listSubscriptions(input?.restaurantId)),
    roles: adminProcedure.input(z.object({ restaurantId: z.number().int().positive().optional() }).optional()).query(({ input }) => listRoles(input?.restaurantId)),
    permissions: adminProcedure.query(() => listPermissions()),
  }),
});

export type AppRouter = typeof appRouter;
