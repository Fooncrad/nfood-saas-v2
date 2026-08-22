import type { Request, Response } from "express";
import { listReservationsDueForNoShow, markReservationNoShow } from "./db";
import { sendReservationNoShowEmail } from "./reservationEmail";
import { sdk } from "./_core/sdk";

export async function reservationNoShowHeartbeatHandler(req: Request, res: Response) {
  const timestamp = new Date().toISOString();
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) return res.status(403).json({ error: "cron-only" });
    const due = await listReservationsDueForNoShow(new Date());
    let cancelled = 0;
    for (const reservation of due) {
      const changed = await markReservationNoShow(reservation.id);
      if (!changed) continue;
      cancelled += 1;
      try {
        await sendReservationNoShowEmail({ to: reservation.email, customerName: reservation.customerName, restaurantName: reservation.restaurantName, reservedFor: reservation.reservedFor, graceMinutes: reservation.graceMinutes });
      } catch (error) {
        console.error("[ReservationEmail] no-show email failed", { reservationId: reservation.id, error: error instanceof Error ? error.message : String(error) });
      }
    }
    return res.json({ ok: true, scanned: due.length, cancelled, timestamp });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined, context: { url: req.originalUrl }, timestamp });
  }
}

export function registerReservationHeartbeat(app: { post: (path: string, handler: (req: Request, res: Response) => unknown) => unknown }) {
  app.post("/api/scheduled/reservation-no-show", reservationNoShowHeartbeatHandler);
}
