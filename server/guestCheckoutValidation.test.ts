import { describe, expect, it } from "vitest";
import { validateGuestCheckoutDetails } from "./routers";

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
    expect(validateGuestCheckoutDetails({ channel: "hotel", hotelName: "Kingdom Hotel", hotelRoom: "N14", hotelFloor: "45" })).toBeNull();
  });

  it("keeps takeaway backwards compatible while accepting pickupPoint", () => {
    expect(validateGuestCheckoutDetails({ channel: "takeaway" })).toBeNull();
    expect(validateGuestCheckoutDetails({ channel: "takeaway", pickupPoint: "Main entrance" })).toBeNull();
  });
});
