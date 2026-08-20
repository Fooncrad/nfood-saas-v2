import { describe, expect, it } from "vitest";
import { appRouter, assertRemoteTaskTransition } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import { remoteTasks, remoteWorkerApplications, remoteWorkers, restaurants, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

function context(testRole?: "restaurant_admin" | "waiter" | "kitchen" | "cashier" | "driver"): TrpcContext {
  return {
    user: { id: 7, openId: "remote-test", name: "اختبار", email: "remote@nfood.local", loginMethod: "test", role: "user", testRole, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("remote work procedures", () => {
  it("restricts remote worker mutations to restaurant admins", async () => {
    const waiter = appRouter.createCaller(context("waiter"));
    await expect(waiter.remote.createWorker({ restaurantId: 1, userId: 7, role: "متابع" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(waiter.remote.updateWorker({ restaurantId: 1, id: 1, isAvailable: false })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(waiter.remote.deleteWorker({ restaurantId: 1, id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("restricts application review to restaurant admins", async () => {
    const waiter = appRouter.createCaller(context("waiter"));
    await expect(waiter.remote.workerApplications({ restaurantId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(waiter.remote.reviewWorkerApplication({ restaurantId: 1, applicationId: 1, status: "approved" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("requires authentication to submit a worker application", async () => {
    const caller = appRouter.createCaller({ ...context(), user: null } as TrpcContext);
    await expect(caller.remote.applyAsRemoteWorker({ restaurantId: 1, role: "متابع طلبات" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

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

  it("rejects messages when the task is missing", async () => {
    const caller = appRouter.createCaller(context("waiter"));
    await expect(caller.remote.messages({ taskId: 999999 })).rejects.toMatchObject({ code: "NOT_FOUND" });
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

  it("completes independent application approval and accepts a task with the linked account", async () => {
    const db = await getDb();
    if (!db) return;
    const restaurant = (await db.select({ id: restaurants.id }).from(restaurants).limit(1))[0];
    if (!restaurant) return;
    const openId = `remote-application-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const insertedUser = await db.insert(users).values({ openId, name: "متقدم اختبار", email: `${openId}@nfood.local`, loginMethod: "test", role: "user" });
    const applicantId = Number(insertedUser[0].insertId);
    let applicationId: number | undefined;
    let workerId: number | undefined;
    let taskId: number | undefined;
    try {
      const applicantBase = context("waiter");
      const applicant = appRouter.createCaller({ ...applicantBase, user: { ...applicantBase.user!, id: applicantId } });
      const restaurantAdmin = appRouter.createCaller({ ...context("restaurant_admin"), user: { ...context("restaurant_admin").user!, id: applicantId } });
      const submitted = await applicant.remote.applyAsRemoteWorker({ restaurantId: restaurant.id, role: "متابع طلبات", message: "أرغب بالانضمام" });
      applicationId = submitted.id;
      await expect(restaurantAdmin.remote.reviewWorkerApplication({ restaurantId: restaurant.id, applicationId, status: "approved" })).resolves.toMatchObject({ success: true, status: "approved" });
      const linked = await applicant.remote.currentWorker({ restaurantId: restaurant.id });
      expect(linked?.id).toBeDefined();
      workerId = linked!.id;
      const task = await restaurantAdmin.remote.createTask({ restaurantId: restaurant.id, type: "orders", title: "مهمة اختبار العامل", amount: "5.00", currency: "SAR", paymentMethod: "manual" });
      taskId = task.id;
      await expect(applicant.remote.acceptTask({ taskId, workerId })).resolves.toMatchObject({ success: true, status: "accepted" });
    } finally {
      if (taskId) await db.delete(remoteTasks).where(eq(remoteTasks.id, taskId));
      if (applicationId) await db.delete(remoteWorkerApplications).where(eq(remoteWorkerApplications.id, applicationId));
      if (workerId) await db.delete(remoteWorkers).where(eq(remoteWorkers.id, workerId));
      await db.delete(users).where(eq(users.id, applicantId));
    }
  });

  it("validates task value and title before attempting persistence", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.remote.createTask({ restaurantId: 1, type: "orders", title: "x", amount: "not-money", currency: "SAR", paymentMethod: "manual" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
