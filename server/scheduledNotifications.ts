import type { Request, Response } from "express";
import { and, eq, inArray, or } from "drizzle-orm";
import { notifications, scheduledNotifications, users } from "../drizzle/schema";
import { getDb } from "./db";
import { sendPushToUser } from "./push";
import { sdk } from "./_core/sdk";

export type NotificationTarget = "all" | "customers" | "restaurants" | "admins" | "selected";

export async function resolveNotificationRecipients(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, targetType: NotificationTarget, idsJson?: string | null) {
  if (targetType === "selected") {
    let ids: number[] = [];
    try { const parsed = JSON.parse(idsJson || "[]"); ids = Array.isArray(parsed) ? parsed.map(Number).filter(Number.isInteger).slice(0, 5000) : []; } catch { ids = []; }
    if (!ids.length) return [];
    return (await db.select({ id: users.id }).from(users).where(inArray(users.id, ids))).map(row => row.id);
  }
  if (targetType === "customers") return (await db.select({ id: users.id }).from(users).where(eq(users.accountRole, "customer"))).map(row => row.id);
  if (targetType === "restaurants") return (await db.select({ id: users.id }).from(users).where(inArray(users.accountRole, ["restaurant_admin", "waiter", "kitchen", "bar", "cashier", "accountant"]))).map(row => row.id);
  if (targetType === "admins") return (await db.select({ id: users.id }).from(users).where(or(eq(users.role, "admin"), eq(users.accountRole, "admin")))).map(row => row.id);
  return (await db.select({ id: users.id }).from(users)).map(row => row.id);
}

export async function deliverNotification(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userIds: number[], payload: { title: string; body: string; type: "task" | "message" | "payment" | "system" }) {
  const uniqueIds = Array.from(new Set(userIds));
  if (!uniqueIds.length) return { notified: 0, pushSent: 0 };
  await db.insert(notifications).values(uniqueIds.map(userId => ({ userId, type: payload.type, title: payload.title, body: payload.body })));
  const results = await Promise.all(uniqueIds.map(userId => sendPushToUser(userId, { title: payload.title, body: payload.body, url: "/" })));
  return { notified: uniqueIds.length, pushSent: results.reduce((sum, result) => sum + result.sent, 0) };
}

export async function scheduledNotificationHeartbeatHandler(req: Request, res: Response) {
  const timestamp = new Date().toISOString();
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database is not available", timestamp });
    const campaign = (await db.select().from(scheduledNotifications).where(and(eq(scheduledNotifications.scheduleCronTaskUid, user.taskUid), eq(scheduledNotifications.status, "scheduled"))).limit(1))[0];
    if (!campaign) return res.json({ ok: true, skipped: "orphan-or-paused", timestamp });
    const recipientIds = await resolveNotificationRecipients(db, campaign.targetType, campaign.targetUserIdsJson);
    const result = await deliverNotification(db, recipientIds, { title: campaign.title, body: campaign.body, type: campaign.type });
    await db.update(scheduledNotifications).set({ lastRunAt: new Date() }).where(eq(scheduledNotifications.id, campaign.id));
    return res.json({ ok: true, campaignId: campaign.id, ...result, timestamp });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error), timestamp });
  }
}

export function registerScheduledNotificationHeartbeat(app: { post: (path: string, handler: (req: Request, res: Response) => unknown) => unknown }) {
  app.post("/api/scheduled/notification", scheduledNotificationHeartbeatHandler);
}
