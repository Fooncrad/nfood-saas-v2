import type { Request, Response } from "express";
import { desc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { kitchenSections, printerLogs } from "../drizzle/schema";
import { sdk } from "./_core/sdk";

export async function printerHealthHeartbeatHandler(req: Request, res: Response) {
  const timestamp = new Date().toISOString();
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) return res.status(403).json({ error: "cron-only" });
    const db = await getDb();
    if (!db) throw new Error("Database is not available");
    const sections = await db.select().from(kitchenSections);
    let checked = 0;
    for (const section of sections) {
      const status = section.printerType === "browser" ? "connected" : "unknown";
      await db.update(kitchenSections).set({ printerStatus: status, printerLastCheckedAt: new Date(), printerLastError: null }).where(eq(kitchenSections.id, section.id));
      await db.insert(printerLogs).values({ restaurantId: section.restaurantId, kitchenSectionId: section.id, operation: "health_check", result: status === "connected" ? "success" : "error", message: status === "connected" ? "طباعة المتصفح متاحة" : "تحتاج طابعة الشبكة أو USB إلى بوابة محلية للفحص الحقيقي" });
      checked += 1;
    }
    return res.json({ ok: true, checked, timestamp });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined, context: { url: req.originalUrl }, timestamp });
  }
}

export function registerPrinterHealthHeartbeat(app: { post: (path: string, handler: (req: Request, res: Response) => unknown) => unknown }) {
  app.post("/api/scheduled/printer-health", printerHealthHeartbeatHandler);
}
