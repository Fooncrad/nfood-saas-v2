import { describe, expect, it } from "vitest";
import { reservationNotificationText } from "./reservationEmail";

describe("reservation notification lifecycle", () => {
  const base = { customerName: "عميل الاختبار", restaurantName: "NFOOD", reservedFor: new Date("2026-09-10T18:00:00Z"), partySize: 2, tableName: "#1" };

  it("does not describe a pending request as confirmed", () => {
    const message = reservationNotificationText({ ...base, status: "pending" });
    expect(message).toContain("تم تحديث الحجز");
    expect(message).not.toContain("تم قبول الحجز");
  });

  it("uses distinct customer-facing status messages", () => {
    expect(reservationNotificationText({ ...base, status: "confirmed" })).toContain("تم قبول الحجز");
    expect(reservationNotificationText({ ...base, status: "rejected", reason: "الوقت غير متاح" })).toContain("الوقت غير متاح");
    expect(reservationNotificationText({ ...base, status: "cancelled", reason: "إلغاء من المطعم" })).toContain("تم إلغاء الحجز");
    expect(reservationNotificationText({ ...base, status: "completed" })).toContain("تم تحديث الحجز");
  });
});
