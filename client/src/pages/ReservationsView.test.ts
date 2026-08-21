import { describe, expect, it } from "vitest";
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
