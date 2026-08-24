import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(
  new URL("../pages/Home.tsx", import.meta.url),
  "utf8"
);
const sidebarSource = readFileSync(
  new URL("../components/HomeSidebar.tsx", import.meta.url),
  "utf8"
);
const modulesSource = readFileSync(
  new URL("../components/HomeModules.tsx", import.meta.url),
  "utf8"
);
const quickAccessSource = readFileSync(
  new URL("../components/DashboardQuickAccess.tsx", import.meta.url),
  "utf8"
);
const compactOrdersSource = readFileSync(
  new URL("../components/CompactOrdersBoard.tsx", import.meta.url),
  "utf8"
);
const driverDeliverySource = readFileSync(
  new URL("../components/DriverDeliveryView.tsx", import.meta.url),
  "utf8"
);

describe("Home decomposition", () => {
  it("keeps the primary shell small and delegates navigation to HomeSidebar", () => {
    expect(homeSource).toContain("import { HomeSidebar }");
    expect(homeSource).toContain("const LazyModuleView = lazy(");
    expect(homeSource).not.toContain("function ModuleView(");
    expect(homeSource.length).toBeLessThan(70000);
  });

  it("organizes central admin navigation into collapsible platform groups", () => {
    expect(sidebarSource).toContain("const platformGroups = [");
    expect(sidebarSource).not.toContain('id: "platform-management"');
    expect(sidebarSource).toContain('id: "platform-settings"');
    expect(sidebarSource).toContain("collapsedGroups");
    expect(sidebarSource).toContain("nfood:sidebar-groups:");
    expect(sidebarSource).toContain("localStorage.getItem(sidebarStorageKey)");
    expect(sidebarSource).toContain("window.localStorage.setItem(");
    expect(sidebarSource).toContain("sidebarStorageKey");
    expect(sidebarSource).toContain(
      "isCentralAdmin ? platformGroups : sidebarGroups"
    );
    expect(sidebarSource).toContain("aria");
    expect(sidebarSource).toContain("const showRestaurantWorkspace = [");
    expect(sidebarSource).toContain('"restaurant_admin"');
    expect(sidebarSource).toContain('"cashier"');
    expect(sidebarSource).toContain('{showRestaurantWorkspace && (');
    expect(sidebarSource).toContain('workspaceQuery');
    expect(sidebarSource).toContain('filteredBranches');
    expect(sidebarSource).toContain('nfood-enter_220ms');
  });

  it("shows a role-aware quick access grid and a visible, compact sidebar", () => {
    expect(homeSource).toContain("<DashboardQuickAccess items={quickItems}");
    expect(homeSource).toContain(
      'location === "/register" || location === "/restaurant/register"'
    );
    expect(homeSource).toContain('location === "/login"');
    expect(homeSource).toContain("lg:mr-[304px]");
    expect(sidebarSource).toContain("w-[304px]");
    expect(sidebarSource).toContain("nfood-unified-sidebar");
    expect(sidebarSource).toContain(
      "nfood-sidebar-nav min-h-0 flex-1 space-y-2 overflow-hidden"
    );
    expect(sidebarSource).toContain("sidebarCollapsedKey");
    expect(sidebarSource).toContain("data-sidebar-collapsed");
    expect(sidebarSource).toContain("roleScope");
    expect(sidebarSource).toContain("overflow-hidden overscroll-contain");
    expect(quickAccessSource).toContain(
      'keys: ["pos", "orders", "kds", "menu"'
    );
    expect(quickAccessSource).toContain(
      'keys: ["branches", "inventory", "team"'
    );
    expect(quickAccessSource).toContain("group.items.map");
  });

  it("keeps the translation manager usable for platform and restaurant admins", () => {
    const panelSource = readFileSync(
      new URL("../components/TranslationReviewPanel.tsx", import.meta.url),
      "utf8"
    );
    expect(panelSource).toContain("استيراد JSON");
    expect(panelSource).toContain("تصدير JSON");
    expect(panelSource).toContain("ابحث عن نص أو كلمة محددة");
    expect(panelSource).toContain('role="tablist"');
    expect(panelSource).toContain("updateMenuCategory");
    expect(panelSource).toContain("updateMenuItem");
  });

  it("uses compact single-screen summaries for orders and driver delivery", () => {
    expect(modulesSource).toContain("import { CompactOrdersBoard }");
    expect(modulesSource).toContain(
      'if (active === "orders") return <OperationalModuleShell title="إدارة الطلبات"><CompactOrdersBoard'
    );
    expect(compactOrdersSource).toContain(
      "<CompactModuleSummary metrics={metrics} />"
    );
    expect(compactOrdersSource).toContain("ordersLoading");
    expect(compactOrdersSource).toContain('viewMode === "kanban"');
    expect(compactOrdersSource).toContain("nfood:orders-view");
    expect(compactOrdersSource).toContain("طريقة عرض الطلبات");
    expect(driverDeliverySource).toContain(
      "<CompactModuleSummary metrics={summary} />"
    );
    expect(driverDeliverySource).toContain("summary");
    expect(driverDeliverySource).toContain(
      "<CompactModuleSummary metrics={summary}"
    );
    expect(modulesSource).toContain('title="المخزون والمشتريات"');
    expect(modulesSource).toContain('title="الحجوزات وقائمة الانتظار"');
    expect(modulesSource).toContain('title="الفروع والإعدادات"');
    expect(modulesSource).toContain('title="نقطة البيع POS"');
    expect(modulesSource).toContain("title={info.title}");
    expect(modulesSource).toContain('title="الطاولات"');
  });

  it("keeps the deferred operational modules self-contained", () => {
    expect(modulesSource).toContain("export function ModuleView(");
    expect(modulesSource).toContain("trpc.platform.menuItems.useQuery");
    expect(homeSource).toContain("trpc.platform.ordersByRestaurant.useQuery");
    expect(sidebarSource).toContain("export function HomeSidebar(");
    expect(sidebarSource).toContain("onNavigate");
  });
});
