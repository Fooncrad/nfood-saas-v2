import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { restaurants } from "../drizzle/schema";
import { getDb } from "./db";
import { sdk } from "./_core/sdk";
import { normalizeMenuTemplateSchedule, resolveActiveMenuTemplate } from "../shared/menuTemplateSchedule";

export async function menuTemplateScheduleHeartbeatHandler(req: Request, res: Response) {
  const timestamp = new Date().toISOString();
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database is not available", timestamp });
    const restaurant = (
      await db
        .select({ id: restaurants.id, menuTemplate: restaurants.menuTemplate, menuTemplateScheduleJson: restaurants.menuTemplateScheduleJson, menuTemplateScheduleTimezone: restaurants.menuTemplateScheduleTimezone })
        .from(restaurants)
        .where(eq(restaurants.menuTemplateScheduleCronTaskUid, user.taskUid))
        .limit(1)
    )[0];
    if (!restaurant) return res.json({ ok: true, skipped: "orphan", timestamp });
    const schedule = normalizeMenuTemplateSchedule(restaurant.menuTemplateScheduleJson);
    const activeTemplate = resolveActiveMenuTemplate({ ...schedule, timezone: restaurant.menuTemplateScheduleTimezone || schedule.timezone });
    if (activeTemplate && activeTemplate !== restaurant.menuTemplate) {
      await db.update(restaurants).set({ menuTemplate: activeTemplate }).where(eq(restaurants.id, restaurant.id));
    }
    return res.json({ ok: true, restaurantId: restaurant.id, activeTemplate, changed: activeTemplate !== restaurant.menuTemplate, timestamp });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined, context: { url: req.originalUrl, taskUid: (req as Request & { user?: { taskUid?: string } }).user?.taskUid }, timestamp });
  }
}

export function registerMenuTemplateScheduleHeartbeat(app: { post: (path: string, handler: (req: Request, res: Response) => unknown) => unknown }) {
  app.post("/api/scheduled/menu-template", menuTemplateScheduleHeartbeatHandler);
}
