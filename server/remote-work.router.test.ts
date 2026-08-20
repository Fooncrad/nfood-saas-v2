import { describe, expect, it } from "vitest";
import { appRouter, assertRemoteTaskTransition } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import { remoteTasks, restaurants, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

function context(testRole?: "restaurant_admin" | "waiter" | "kitchen" | "cashier" | "driver"): TrpcContext {
  return {
    user: { id: 7, openId: "remote-test", name: "اختبار", email: "remote@nfood.local", loginMethod: "test", role: "user", testRole, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("remote work procedures", () => {
  it("protects tasks, messages, and notifications from unauthenticated access", async () => {
    const caller = appRouter.createCaller({ ...context(), user: null } as TrpcContext);
    await expect(caller.remote.tasks({ restaurantId: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.remote.messages({ taskId: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.notifications.mine()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("enforces the Remote Work transition graph", () => {
    expect(() => assertRemoteTaskTransition("in_progress", "submitted", false)).not.toThrow();
    expect(() => assertRemoteTaskTransition("published", "completed", false)).toThrow(/انتقال حالة المهمة غير مسموح/);
    expect(() => assertRemoteTaskTransition("completed", "cancelled", true)).toThrow(/انتقال حالة المهمة غير مسموح/);
  });

  it("rejects lifecycle updates when the task is missing", async () => {
    const caller = appRouter.createCaller(context("waiter"));
    await expect(caller.remote.updateTaskStatus({ taskId: 999999, status: "submitted" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("persists a task and enforces the transition graph", async () => {
    const db = await getDb();
    if (!db) return;
    const restaurant = (await db.select({ id: restaurants.id }).from(restaurants).limit(1))[0];
    const actor = (await db.select({ id: users.id }).from(users).limit(1))[0];
    if (!restaurant || !actor) return;
    const base = context("restaurant_admin");
    const caller = appRouter.createCaller({ ...base, user: { ...base.user!, id: actor.id } });
    const created = await caller.remote.createTask({ restaurantId: restaurant.id, type: "support", title: "اختبار انتقال", amount: "10.00", currency: "SAR", paymentMethod: "manual" });
    try {
      await expect(caller.remote.updateTaskStatus({ taskId: created.id, status: "reviewing" })).resolves.toMatchObject({ success: true, status: "reviewing" });
      await expect(caller.remote.updateTaskStatus({ taskId: created.id, status: "completed" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
      await expect(caller.remote.updateTaskStatus({ taskId: created.id, status: "cancelled" })).resolves.toMatchObject({ success: true, status: "cancelled" });
    } finally {
      await db.delete(remoteTasks).where(eq(remoteTasks.id, created.id));
    }
  });

  it("validates task value and title before attempting persistence", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.remote.createTask({ restaurantId: 1, type: "orders", title: "x", amount: "not-money", currency: "SAR", paymentMethod: "manual" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
