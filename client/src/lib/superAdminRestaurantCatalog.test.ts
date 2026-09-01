import fs from "node:fs";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync("client/src/components/SuperAdminRestaurantCatalog.tsx", "utf8");

describe("super admin restaurant catalog safety layout", () => {
  it("keeps the essential restaurant actions visible and hides secondary card actions", () => {
    expect(source).toContain("data-testid=\"super-admin-restaurant-catalog\"");
    expect(source).toContain("فتح Menu");
    expect(source).toContain("enterRestaurant.mutate({ id: restaurant.id })");
    expect(source).toContain("ui.resetPassword");
    expect(source).not.toContain("ui.editPlan");
    expect(source).toContain("ui.pause");
    expect(source).toContain("ui.activate");
    expect(source).toContain("data-testid={`restaurant-status-toggle-${restaurant.id}`}");
    expect(source).toContain("status: restaurant.status === \"suspended\" ? \"active\" : \"suspended\"");
  });

  it("renders deletion as explicitly disabled to prevent accidental removal", () => {
    expect(source).toContain("data-testid={`restaurant-delete-disabled-${restaurant.id}`}");
    expect(source).toContain("disabled");
    expect(source).toContain("الحذف معطل");
    expect(source).not.toContain("deleteRestaurant.mutate({ id: restaurant.id })");
  });
});
