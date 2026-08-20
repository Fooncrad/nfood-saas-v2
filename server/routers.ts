import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { branches, orders } from "../drizzle/schema";
import { getDb, listBranches, listEmployees, listInventory, listMenuCategories, listMenuItems, listOrders, listRestaurants } from "./db";
import { eq } from "drizzle-orm";

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
    branches: protectedProcedure.input(z.object({ restaurantId: z.number().int().positive() })).query(({ input }) => listBranches(input.restaurantId)),
    menuCategories: protectedProcedure.input(z.object({ restaurantId: z.number().int().positive() })).query(({ input }) => listMenuCategories(input.restaurantId)),
    menuItems: protectedProcedure.input(z.object({ categoryId: z.number().int().positive().optional() }).optional()).query(({ input }) => listMenuItems(input?.categoryId)),
    orders: protectedProcedure.input(z.object({ branchId: z.number().int().positive() })).query(({ input }) => listOrders(input.branchId)),
    inventory: protectedProcedure.input(z.object({ restaurantId: z.number().int().positive() })).query(({ input }) => listInventory(input.restaurantId)),
    employees: protectedProcedure.input(z.object({ restaurantId: z.number().int().positive() })).query(({ input }) => listEmployees(input.restaurantId)),
    updateOrderStatus: protectedProcedure.input(z.object({ orderId: z.number().int().positive(), status: z.enum(["new", "preparing", "ready", "completed", "cancelled"]) })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database is not available");
      await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.orderId));
      return { success: true, orderId: input.orderId, status: input.status };
    }),
  }),
  admin: router({
    restaurants: adminProcedure.query(() => listRestaurants()),
  }),
});

export type AppRouter = typeof appRouter;
