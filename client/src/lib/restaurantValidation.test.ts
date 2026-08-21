import { describe, expect, it } from "vitest";
import { validateRestaurantDraft } from "./restaurantValidation";

describe("restaurant draft validation", () => {
  it("accepts a valid restaurant draft", () => {
    expect(validateRestaurantDraft({ name: "NFOOD", slug: "nfood-riyadh", plan: "Growth" })).toBeNull();
  });
  it("rejects invalid public slugs", () => {
    expect(validateRestaurantDraft({ name: "NFOOD", slug: "اسم المطعم", plan: "Growth" })).toBeTruthy();
  });
  it("requires the restaurant name and plan", () => {
    expect(validateRestaurantDraft({ name: "", slug: "nfood", plan: "Growth" })).toBeTruthy();
    expect(validateRestaurantDraft({ name: "NFOOD", slug: "nfood", plan: "" })).toBeTruthy();
  });
});
