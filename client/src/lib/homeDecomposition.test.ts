import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("../pages/Home.tsx", import.meta.url), "utf8");
const sidebarSource = readFileSync(new URL("../components/HomeSidebar.tsx", import.meta.url), "utf8");
const modulesSource = readFileSync(new URL("../components/HomeModules.tsx", import.meta.url), "utf8");

 describe("Home decomposition", () => {
  it("keeps the primary shell small and delegates navigation to HomeSidebar", () => {
    expect(homeSource).toContain('import { HomeSidebar }');
    expect(homeSource).toContain("const LazyModuleView = lazy(");
    expect(homeSource).not.toContain("function ModuleView(");
    expect(homeSource.length).toBeLessThan(50000);
  });

  it("organizes central admin navigation into collapsible platform groups", () => {
    expect(sidebarSource).toContain('const platformGroups = [');
    expect(sidebarSource).toContain('id: "platform-management"');
    expect(sidebarSource).toContain('id: "platform-settings"');
    expect(sidebarSource).toContain("collapsedGroups");
    expect(sidebarSource).toContain('isCentralAdmin ? platformGroups : sidebarGroups');
    expect(sidebarSource).toContain('aria');
  });

  it("keeps the deferred operational modules self-contained", () => {
    expect(modulesSource).toContain("export function ModuleView(");
    expect(modulesSource).toContain("trpc.platform.menuItems.useQuery");
    expect(homeSource).toContain("trpc.platform.ordersByRestaurant.useQuery");
    expect(sidebarSource).toContain("export function HomeSidebar(");
    expect(sidebarSource).toContain("onNavigate");
  });
});
