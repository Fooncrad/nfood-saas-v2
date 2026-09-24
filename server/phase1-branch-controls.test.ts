import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, "marketplaceRouter.ts"), "utf8");

function procedureBlock(startMarker: string, nextMarker: string) {
  const start = source.indexOf(startMarker);
  expect(start, `${startMarker} must exist`).toBeGreaterThanOrEqual(0);
  const end = source.indexOf(nextMarker, start + startMarker.length);
  expect(end, `${nextMarker} must follow ${startMarker}`).toBeGreaterThan(start);
  return source.slice(start, end);
}

describe("phase 1 restaurant branch controls", () => {
  it("scopes branch listing to the selected restaurant", () => {
    const block = procedureBlock("adminRestaurantBranches", "adminCreateRestaurantBranch");
    expect(block).toContain("eq(branches.restaurantId, input.restaurantId)");
  });

  it("validates the parent restaurant before creating a branch", () => {
    const block = procedureBlock("adminCreateRestaurantBranch", "adminUpdateRestaurantBranch");
    expect(block).toContain("eq(restaurants.id, input.restaurantId)");
    expect(block).toContain('code: "NOT_FOUND"');
    expect(block).toContain('action: "branch.created"');
    expect(block).toContain("restaurantId: input.restaurantId");
  });

  it("audits branch changes and never accepts restaurantId in the update payload", () => {
    const block = procedureBlock("adminUpdateRestaurantBranch", "adminUpdateStore");
    const inputSchema = block.slice(0, block.indexOf(".mutation"));
    expect(block).toContain('action: "branch.updated"');
    expect(inputSchema).toContain("id: z.number().int().positive()");
    expect(inputSchema).not.toContain("restaurantId:");
  });
});
