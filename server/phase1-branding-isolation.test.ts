import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, "routers.ts"), "utf8");

function procedureBlock(name: string, nextName: string) {
  const start = source.indexOf(`${name}:`);
  const end = source.indexOf(`${nextName}:`, start + name.length);
  expect(start, `${name} procedure must exist`).toBeGreaterThan(-1);
  expect(end, `${nextName} boundary must exist`).toBeGreaterThan(start);
  return source.slice(start, end);
}

describe("Phase 1 restaurant identity/settings isolation", () => {
  it("requires a positive restaurantId and tenant access before branding writes", () => {
    const block = procedureBlock("updateBranding", "updateMenuTemplateSchedule");
    expect(block).toContain("restaurantId: z.number().int().positive()");
    expect(block).toContain("assertRestaurantAccess(ctx, input.restaurantId)");
    expect(block).toContain("where(eq(restaurants.id, input.restaurantId))");
  });

  it("does not allow branding updates to reassign restaurant ownership", () => {
    const block = procedureBlock("updateBranding", "updateMenuTemplateSchedule");
    const inputSchema = block.slice(0, block.indexOf(".mutation"));
    expect(inputSchema).not.toContain("branchId:");
    expect(inputSchema).not.toContain("ownerId:");
    expect(inputSchema).not.toContain("userId:");
  });

  it("keeps custom-domain and media settings tenant-scoped", () => {
    const customDomain = procedureBlock("updateCustomDomain", "updateMediaShowcase");
    const media = procedureBlock("updateMediaShowcase", "updateBranding");
    expect(customDomain).toContain("assertRestaurantAccess(ctx, input.restaurantId)");
    expect(customDomain).toContain("where(eq(restaurants.id, input.restaurantId))");
    expect(media).toContain("assertRestaurantAccess(ctx, input.restaurantId)");
    expect(media).toContain("where(eq(restaurants.id, input.restaurantId))");
  });
});
