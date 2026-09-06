import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("restaurant theme customization", () => {
  const settings = readFileSync(resolve(process.cwd(), "shared/menuDisplaySettings.ts"), "utf8");
  const modules = readFileSync(resolve(process.cwd(), "client/src/components/HomeModules.tsx"), "utf8");
  const dashboard = readFileSync(resolve(process.cwd(), "client/src/components/DashboardLayout.tsx"), "utf8");
  const publicMenu = readFileSync(resolve(process.cwd(), "client/src/pages/RestaurantPublic.tsx"), "utf8");

  it("defines dark menu surfaces with safe defaults", () => {
    expect(settings).toContain("darkMode");
    expect(settings).toContain("menuBackgroundColor");
    expect(settings).toContain("cardTextColor");
    expect(settings).toContain("normalizeMenuDisplaySettings");
  });

  it("persists restaurant-scoped dashboard colors", () => {
    expect(modules).toContain("nfood-dashboard-theme-${restaurantId}");
    expect(modules).toContain("nfood-dashboard-theme-active");
    expect(modules).toContain("brandAccentColor");
  });

  it("applies the saved theme to the dashboard and public menu", () => {
    expect(dashboard).toContain("nfood-dashboard-theme-active");
    expect(dashboard).toContain("--sidebar-primary");
    expect(publicMenu).toContain("menuBackgroundColor");
    expect(publicMenu).toContain("cardTextColor");
  });
});
