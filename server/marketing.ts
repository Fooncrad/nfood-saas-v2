import type { Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { campaigns, orders, users } from "../drizzle/schema";
import { getDb } from "./db";
import { sdk } from "./_core/sdk";

function sameMonthDay(value: Date, now: Date) {
  return value.getUTCMonth() === now.getUTCMonth() && value.getUTCDate() === now.getUTCDate();
}

export async function marketingHeartbeatHandler(req: Request, res: Response) {
  const timestamp = new Date().toISOString();
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database is not available", timestamp });
    const campaign = (await db.select().from(campaigns).where(eq(campaigns.scheduleCronTaskUid, user.taskUid)).limit(1))[0];
    if (!campaign) return res.json({ ok: true, skipped: "orphan" });
    const now = new Date();
    const customerRows = await db.select({ id: users.id, birthDate: users.birthDate }).from(users);
    const orderRows = await db.select({ customerId: orders.customerId, createdAt: orders.createdAt }).from(orders).where(and(eq(orders.restaurantId, campaign.restaurantId), eq(orders.paymentStatus, "paid")));
    const lastOrderByCustomer = new Map<number, Date>();
    for (const order of orderRows) if (order.customerId && order.createdAt && (!lastOrderByCustomer.has(order.customerId) || lastOrderByCustomer.get(order.customerId)! < order.createdAt)) lastOrderByCustomer.set(order.customerId, order.createdAt);
    const eligibleCustomerIds = customerRows.filter((customer) => {
      if (campaign.kind === "birthday") return !!customer.birthDate && sameMonthDay(customer.birthDate, now);
      if (campaign.kind === "reengagement") { const last = lastOrderByCustomer.get(customer.id); const days = campaign.reengagementDays ?? 30; return !last || now.getTime() - last.getTime() >= days * 86400000; }
      return false;
    }).map((customer) => customer.id);
    return res.json({ ok: true, campaignId: campaign.id, kind: campaign.kind, eligibleCount: eligibleCustomerIds.length, delivery: "not_configured", timestamp });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined, context: { url: req.originalUrl, taskUid: (req as Request & { user?: { taskUid?: string } }).user?.taskUid }, timestamp });
  }
}

export function registerMarketingHeartbeat(app: { post: (path: string, handler: (req: Request, res: Response) => unknown) => unknown }) {
  app.post("/api/scheduled/marketing", marketingHeartbeatHandler);
}

export const __marketingTest = { sameMonthDay };
