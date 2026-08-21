import { describe, expect, it } from "vitest";
import { validateRegistrationContact } from "./registrationValidation";

describe("registration validation", () => {
  it("accepts a complete restaurant contact with country", () => {
    expect(validateRegistrationContact({ name: "مطعم نكهة", city: "الرياض", email: "owner@example.com", phone: "+966500000000", country: "السعودية" }, true)).toBe(true);
  });
  it("rejects incomplete driver contact data", () => {
    expect(validateRegistrationContact({ name: "س", city: "", email: "bad", phone: "123" })).toBe(false);
  });
  it("rejects a restaurant without country when country is required", () => {
    expect(validateRegistrationContact({ name: "NFOOD", city: "Riyadh", email: "owner@example.com", phone: "1234567", country: "" }, true)).toBe(false);
  });
});
