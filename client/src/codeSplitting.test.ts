import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

describe("route code splitting", () => {
  it("lazy-loads heavy dashboard, menu, and display routes", () => {
    expect(appSource).toContain('Home: () => import("./pages/Home")');
    expect(appSource).toContain('RestaurantPublic: () => import("./pages/RestaurantPublic")');
    expect(appSource).toContain('PublicDisplay: () => import("./pages/PublicDisplay")');
    expect(appSource).toContain("lazy(routeLoaders.Home)");
    expect(appSource).toContain("lazy(routeLoaders.RestaurantPublic)");
    expect(appSource).toContain("lazy(routeLoaders.PublicDisplay)");
    expect(appSource).toContain("<Suspense fallback={<PageLoading />}>");
  });
});
