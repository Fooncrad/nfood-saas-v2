import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

describe("route code splitting", () => {
  it("lazy-loads heavy dashboard, menu, and display routes", () => {
    expect(appSource).toContain('lazy(() => import("./pages/Home"))');
    expect(appSource).toContain('lazy(() => import("./pages/RestaurantPublic"))');
    expect(appSource).toContain('lazy(() => import("./pages/PublicDisplay"))');
    expect(appSource).toContain("<Suspense fallback={<PageLoading />}>");
  });
});
