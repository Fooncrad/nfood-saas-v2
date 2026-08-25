import type { Request, Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { getDb, getIntegrationSecret, listRestaurantManagerUserIds } from "./db";
import { sendPushToUser } from "./push";
import { integrationSettings, kitchenSections, notifications, printerLogs } from "../drizzle/schema";
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
      const previousStatus = section.printerStatus;
      let status: "unknown" | "connected" | "offline" = section.printerType === "browser" ? "connected" : "unknown";
      let message = status === "connected" ? "طباعة المتصفح متاحة" : "لم يتم إعداد بوابة محلية للفحص الحقيقي"; let latencyMs: number | null = null; let printDurationMs: number | null = null;
      if (section.printerType !== "browser" && section.printerType !== "none") {
        const gateway = (await db.select({ url: integrationSettings.keyReference }).from(integrationSettings).where(and(eq(integrationSettings.scope, "restaurant"), eq(integrationSettings.restaurantId, section.restaurantId), eq(integrationSettings.providerKey, "printer_gateway"))).limit(1))[0];
        const token = await getIntegrationSecret("restaurant", "printer_gateway", section.restaurantId);
        if (gateway?.url && token) { try { const response = await fetch(`${gateway.url.replace(/\/+$/, "")}/probe`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ transport: section.printerType, host: section.printerAddress, port: section.printerPort }) }); const result = await response.json() as { ok?: boolean; message?: string; latencyMs?: number; printDurationMs?: number }; status = result.ok ? "connected" : "offline"; message = result.message || (result.ok ? "تم الاتصال بالطابعة" : "تعذر الاتصال بالطابعة"); latencyMs = result.latencyMs ?? null; printDurationMs = result.printDurationMs ?? null; } catch (error) { status = "offline"; message = error instanceof Error ? error.message : "تعذر الوصول إلى بوابة الطباعة"; } }
      }
      await db.update(kitchenSections).set({ printerStatus: status, printerLastCheckedAt: new Date(), printerLastError: status === "offline" ? message : null }).where(eq(kitchenSections.id, section.id));
      await db.insert(printerLogs).values({ restaurantId: section.restaurantId, kitchenSectionId: section.id, operation: "health_check", result: status === "connected" ? "success" : "error", message, latencyMs, printDurationMs });
      if (status === "offline" && previousStatus !== "offline") { const managerIds = await listRestaurantManagerUserIds(section.restaurantId); await Promise.all(managerIds.map(async (userId) => { await db.insert(notifications).values({ userId, type: "system", title: `انقطاع الطابعة: ${section.printerName || section.name}`, body: message }); await sendPushToUser(userId, { title: `انقطاع الطابعة: ${section.printerName || section.name}`, body: message, url: "/", tag: `printer-offline-${section.id}` }).catch((error) => console.warn("[Printer] offline push failed", error)); })); }
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
