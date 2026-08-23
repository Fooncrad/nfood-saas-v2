import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("mobile menu layout", () => {
  it("avoids mobile overlap and reserves space for bottom navigation", () => {
    const page = readFileSync(resolve(process.cwd(), "client/src/pages/RestaurantPublic.tsx"), "utf8");
    expect(page).toContain("pb-24 sm:pb-14");
    expect(page).toContain("mt-3 rounded-[1.75rem] sm:-mt-8");
    expect(page).toContain("mb-2 flex max-w-7xl");
  });

  it("keeps order type in checkout while hiding the hero selector on small screens", () => {
    const page = readFileSync(resolve(process.cwd(), "client/src/pages/RestaurantPublic.tsx"), "utf8");
    expect(page).toContain("className=\"hidden text-xs font-bold text-slate-600 sm:block\">{copy.orderType}");
    expect(page).toContain("<select value={orderType} onChange");
    expect(page).toContain("{copy.continueCheckout}");
  });
});
