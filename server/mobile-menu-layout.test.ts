import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("mobile menu layout", () => {
  const readPublicMenu = () => readFileSync(resolve(process.cwd(), "client/src/pages/RestaurantPublic.tsx"), "utf8");

  it("avoids mobile overlap and reserves space for bottom navigation", () => {
    const page = readPublicMenu();
    expect(page).toContain("pb-24 sm:pb-14");
    expect(page).toContain("mt-3 rounded-[1.75rem] sm:-mt-8");
    expect(page).toContain("mb-2 flex max-w-7xl");
  });

  it("provides a compact order type selector in the cart", () => {
    const page = readPublicMenu();
    expect(page).toContain("اختر نوع الطلب بسرعة");
    expect(page).toContain('setOrderType("takeaway")');
    expect(page).toContain('setOrderType("dineIn")');
    expect(page).toContain('setOrderType("delivery")');
  });

  it("shows platform-specific PWA guidance and animated category results", () => {
    const page = readPublicMenu();
    const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
    expect(page).toContain("على iPhone أو iPad");
    expect(page).toContain("على Android");
    expect(page).toContain("category-results");
    expect(css).toContain("nfood-category-enter");
    expect(css).toContain("prefers-reduced-motion: reduce");
  });
});
