import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, "marketplaceRouter.ts"), "utf8");

describe("phase 1 restaurant branch controls", () => {
  it("scopes branch listing to the selected restaurant", () => {
    expect(source).toContain("adminRestaurantBranches");
    expect(source).toContain("eq(branches.restaurantId, input.restaurantId)");
  });

  it("validates the parent restaurant before creating a branch", () => {
    const start = source.indexOf("adminCreateRestaurantBranch");
    const end = source.indexOf("adminUpdateRestaurantBranch", start);
    const block = source.slice(start, end);
    expect(block).toContain("eq(restaurants.id, input.restaurantId)");
    expect(block).toContain('code: "NOT_FOUND"');
    expect(block).toContain('action: "branch.created"');
    expect(block).toContain("restaurantId: input.restaurantId");
  });

  it("audits branch changes and never accepts restaurantId in the update payload", () => {
    const start = source.indexOf("adminUpdateRestaurantBranch");
    const end = source.indexOf("adminUpdateStore", start);
    const block = source.slice(start, end);
    expect(block).toContain('action: "branch.updated"');
    expect(block).toContain("id: z.number().int().positive()");
    expect(block).not.toContain("restaurantId: z.number()");
  });
});
