import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

describe("responsive scrolling contracts", () => {
  it("allows natural page scrolling for the public menu and dashboard on mobile", () => {
    const css = read("client/src/index.css");
    const menu = read("client/src/pages/RestaurantPublic.tsx");
    const dashboard = read("client/src/components/DashboardLayout.tsx");
    expect(menu).toContain("nfood-menu-shell");
    expect(menu).toContain('<main className="min-w-0 px-3 sm:px-6">');
    expect(dashboard).toContain("nfood-dashboard-inset");
    expect(css).toContain("overflow-y: auto");
    expect(css).toContain("-webkit-overflow-scrolling: touch");
  });

  it("keeps KDS column scrolling isolated", () => {
    const kds = read("client/src/components/KdsOperationsBoard.tsx");
    expect(kds).toContain('className="flex h-full min-h-0 flex-col gap-2 overflow-hidden p-2"');
    expect(kds).toContain("min-h-0 flex-1 space-y-2 overflow-y-auto");
  });
});
