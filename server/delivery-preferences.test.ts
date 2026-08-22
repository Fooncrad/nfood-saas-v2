import { describe, expect, it } from "vitest";
import { haversineDistanceKm } from "./db";
import { validateGuestCheckoutDetails } from "./routers";

describe("delivery and customer preference contracts", () => {
  it("calculates geographic distance in kilometers", () => {
    expect(haversineDistanceKm(24.7136, 46.6753, 24.7136, 46.6753)).toBe(0);
    expect(haversineDistanceKm(24.7136, 46.6753, 24.758, 46.6753)).toBeGreaterThan(4);
    expect(haversineDistanceKm(24.7136, 46.6753, 24.758, 46.6753)).toBeLessThan(6);
  });

  it("requires location data for delivery checkout", () => {
    expect(validateGuestCheckoutDetails({ channel: "delivery", deliveryAddress: "Riyadh" })).toContain("موقعه");
    expect(validateGuestCheckoutDetails({ channel: "delivery", deliveryAddress: "Riyadh", deliveryLatitude: 24.7, deliveryLongitude: 46.6 })).toBeNull();
  });

  it("keeps each special order channel validated independently", () => {
    expect(validateGuestCheckoutDetails({ channel: "dine_in", tableName: "4" })).toContain("عدد الأشخاص");
    expect(validateGuestCheckoutDetails({ channel: "reservation", reservationDate: new Date() })).toBeNull();
    expect(validateGuestCheckoutDetails({ channel: "hotel", hotelName: "Kingdom", hotelRoom: "N14", hotelFloor: "45" })).toBeNull();
  });
});
