import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateReservationDraft } from "./ReservationsView";

describe("reservation draft validation", () => {
  const future = "2030-01-01T12:00";

  it("accepts a valid future reservation", () => {
    expect(validateReservationDraft({ customerName: "عميل نُفود", phone: "+966500000000", partySize: "4", reservedFor: future }, Date.parse("2029-01-01T00:00:00Z"))).toBeNull();
  });

  it("rejects invalid guest counts and past dates", () => {
    expect(validateReservationDraft({ customerName: "عميل", phone: "", partySize: "0", reservedFor: future }, Date.parse("2029-01-01T00:00:00Z"))).toContain("الضيوف");
    expect(validateReservationDraft({ customerName: "عميل", phone: "", partySize: "2", reservedFor: "2020-01-01T12:00" }, Date.parse("2029-01-01T00:00:00Z"))).toContain("مستقبلي");
  });

  it("rejects an invalid phone number", () => {
    expect(validateReservationDraft({ customerName: "عميل", phone: "abc", partySize: "2", reservedFor: future }, Date.parse("2029-01-01T00:00:00Z"))).toContain("هاتف");
  });
});

describe("reservation operations wiring", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/ReservationsView.tsx"), "utf8");

  it("supports explicitly marked test reservations and safe cleanup controls", () => {
    expect(source).toContain("isTestReservation");
    expect(source).toContain("isTest: isTestReservation");
    expect(source).toContain("حجز اختباري (يمكن حذفه نهائيًا لاحقًا)");
    expect(source).toContain("deleteTestReservation");
    expect(source).toContain("حذف الاختبار");
    expect(source).toContain("window.confirm");
  });

  it("collects branch, slot, email, and duration for the protected reservation flow", () => {
    expect(source).toContain("reservationSlotsForRestaurant");
    expect(source).toContain("slotId");
    expect(source).toContain("durationMinutes");
    expect(source).toContain("email");
    expect(source).toContain("branchId");
  });
});
