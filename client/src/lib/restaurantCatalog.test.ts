import { describe, expect, it } from "vitest";
import { filterRestaurantRows } from "./restaurantCatalog";

describe("restaurant catalog filters", () => {
  const restaurants = [
    { id: 1, name: "Nasser Cafe", slug: "nssercafa", plan: "All Features", status: "active" },
    { id: 2, name: "Demo Bistro", slug: "demo-bistro", plan: "growth", status: "trial" },
    { id: 3, name: "Legacy Shop", slug: "legacy", plan: null, status: "suspended" },
  ];
  const plans = [{ key: "growth", name: "Growth" }, { key: "all_features", name: "All Features" }];

  it("filters by activity status", () => {
    expect(filterRestaurantRows(restaurants, "", "تجربة", "الكل", plans).map((item) => item.id)).toEqual([2]);
    expect(filterRestaurantRows(restaurants, "", "معلّق", "الكل", plans).map((item) => item.id)).toEqual([3]);
  });

  it("matches a plan by either display name or stored key", () => {
    expect(filterRestaurantRows(restaurants, "", "الكل", "Growth", plans).map((item) => item.id)).toEqual([2]);
    expect(filterRestaurantRows(restaurants, "", "الكل", "all_features", plans).map((item) => item.id)).toEqual([1]);
  });

  it("combines query, status, and plan filters", () => {
    expect(filterRestaurantRows(restaurants, "nasser", "نشط", "All Features", plans).map((item) => item.id)).toEqual([1]);
    expect(filterRestaurantRows(restaurants, "nasser", "تجربة", "All Features", plans)).toEqual([]);
  });
});
