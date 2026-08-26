import { describe, expect, it } from "vitest";
import { maskEmail, maskPhone, redactDeliveryContact } from "../shared/privacy";

describe("privacy data minimization", () => {
  it("masks customer email and phone for non-platform views", () => {
    expect(maskEmail("customer@example.com")).toBe("c•••@example.com");
    expect(maskPhone("+966501234567")).toBe("+96••••67");
  });

  it("does not expose the delivery address in a driver contact payload", () => {
    expect(redactDeliveryContact({ name: "عميل", phone: "+966501234567", address: "شارع كامل 12" })).toEqual({
      name: "عميل",
      phone: "+96••••67",
      address: "يظهر ضمن نافذة التوصيل فقط",
    });
  });
});
