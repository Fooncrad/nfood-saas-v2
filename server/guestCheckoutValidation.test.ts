import { describe, expect, it } from "vitest";
import { validateGuestCheckoutDetails } from "./routers";
import { selectNearestDriver } from "./db";

describe("guest checkout channel requirements", () => {
  it("requires table details for dine-in", () => {
    expect(validateGuestCheckoutDetails({ channel: "dine_in" })).toContain("الطاولة");
    expect(validateGuestCheckoutDetails({ channel: "dine_in", tableName: "T4", partySize: 4 })).toBeNull();
  });

  it("requires a complete map location for delivery", () => {
    expect(validateGuestCheckoutDetails({ channel: "delivery", deliveryAddress: "King Road" })).toContain("الخريطة");
    expect(validateGuestCheckoutDetails({ channel: "delivery", deliveryAddress: "King Road", deliveryLatitude: 24.7, deliveryLongitude: 46.7 })).toBeNull();
  });

  it("requires reservation and hotel details for their channels", () => {
    expect(validateGuestCheckoutDetails({ channel: "reservation" })).toContain("الحجز");
    expect(validateGuestCheckoutDetails({ channel: "reservation", reservationDate: new Date() })).toBeNull();
    expect(validateGuestCheckoutDetails({ channel: "hotel", hotelName: "Kingdom Hotel", hotelRoom: "N14" })).toContain("الفندق");
    expect(validateGuestCheckoutDetails({ channel: "hotel", hotelId: 10 })).toContain("الغرفة");
    expect(validateGuestCheckoutDetails({ channel: "hotel", hotelId: 10, hotelRoomId: 14 })).toBeNull();
  });

  it("keeps takeaway backwards compatible while accepting pickupPoint", () => {
    expect(validateGuestCheckoutDetails({ channel: "takeaway" })).toBeNull();
    expect(validateGuestCheckoutDetails({ channel: "takeaway", pickupPoint: "Main entrance" })).toBeNull();
  });
});

describe("delivery driver selection", () => {
  it("selects the closest available driver and ignores drivers without coordinates", () => {
    const result = selectNearestDriver([
      { userId: 7, latitude: "24.7136", longitude: "46.6753" },
      { userId: 3, latitude: null, longitude: null },
      { userId: 9, latitude: "24.9000", longitude: "46.9000" },
    ], { latitude: 24.7137, longitude: 46.6754 });
    expect(result?.driver.userId).toBe(7);
    expect(result?.distanceKm).toBeLessThan(0.1);
  });

  it("returns no assignment when the restaurant has no usable origin", () => {
    expect(selectNearestDriver([{ userId: 7, latitude: "24.7136", longitude: "46.6753" }], { latitude: null, longitude: null })).toBeNull();
  });
});

describe("customer cancellation policy", () => {
  const createdAt = new Date("2026-08-22T10:00:00.000Z");
  it("allows cancellation within the configured window after acceptance", async () => {
    const { getCustomerCancellationDecision } = await import("./routers");
    const result = getCustomerCancellationDecision({ enabled: true, windowMinutes: 15, status: "preparing", createdAt, acceptedAt: new Date("2026-08-22T10:05:00.000Z"), now: new Date("2026-08-22T10:14:00.000Z") });
    expect(result.allowed).toBe(true);
    expect(result.remainingMinutes).toBe(6);
  });
  it("rejects expired, completed, and disabled cancellations", async () => {
    const { getCustomerCancellationDecision } = await import("./routers");
    expect(getCustomerCancellationDecision({ enabled: true, windowMinutes: 15, status: "preparing", createdAt, acceptedAt: new Date("2026-08-22T10:00:00.000Z"), now: new Date("2026-08-22T10:16:00.000Z") }).reason).toBe("expired");
    expect(getCustomerCancellationDecision({ enabled: true, windowMinutes: 15, status: "completed", createdAt, now: new Date("2026-08-22T10:01:00.000Z") }).reason).toBe("status");
    expect(getCustomerCancellationDecision({ enabled: false, windowMinutes: 15, status: "new", createdAt, now: new Date("2026-08-22T10:01:00.000Z") }).reason).toBe("disabled");
  });
});
