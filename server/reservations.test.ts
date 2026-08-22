import { describe, expect, it } from "vitest";
import { registerReservationHeartbeat } from "./reservations";
import { sendReservationAcceptedEmail, sendReservationNoShowEmail } from "./reservationEmail";

describe("reservation automation", () => {
  it("registers the protected no-show heartbeat endpoint", () => {
    const paths: string[] = [];
    registerReservationHeartbeat({ post: (path) => { paths.push(path); return undefined; } });
    expect(paths).toEqual(["/api/scheduled/reservation-no-show"]);
  });

  it("does not attempt email delivery without a recipient", async () => {
    await expect(sendReservationAcceptedEmail({ to: null, customerName: "ناصر", restaurantName: "Coffee Nasser", tableName: "50", reservedFor: new Date(), partySize: 2 })).resolves.toEqual({ sent: false, skipped: "no-recipient" });
    await expect(sendReservationNoShowEmail({ to: undefined, customerName: "ناصر", restaurantName: "Coffee Nasser", reservedFor: new Date(), graceMinutes: 10 })).resolves.toEqual({ sent: false, skipped: "no-recipient" });
  });
});
