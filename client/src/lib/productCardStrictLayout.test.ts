import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("strict product card layout", () => {
  const page = readFileSync(resolve(process.cwd(), "client/src/pages/RestaurantPublic.tsx"), "utf8");
  const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

  it("scopes the card variant to a two-column mobile grid and fixed card heights", () => {
    expect(css).toContain(".nfood-menu-cards .nfood-menu-grid");
    expect(css).toContain("repeat(2, minmax(0, 1fr))");
    expect(css).toContain("grid-auto-rows: 200px");
    expect(css).toContain("height: 240px");
  });

  it("keeps status and favorite controls in separate image corners", () => {
    expect(css).toContain(".nfood-menu-cards .nfood-menu-item-image > button");
    expect(css).toContain("left: 8px");
    expect(css).toContain(".nfood-menu-cards .nfood-menu-item-image > span");
    expect(css).toContain("right: 8px");
  });

  it("truncates summaries and preserves quick add without opening details", () => {
    expect(css).toContain("white-space: nowrap");
    expect(css).toContain("text-overflow: ellipsis");
    expect(page).toContain("nfood-menu-card-shell");
    expect(page).toContain("updateCart(item.id, 1)");
    expect(page).toContain("إضافة ${item.name} إلى السلة");
  });
});
