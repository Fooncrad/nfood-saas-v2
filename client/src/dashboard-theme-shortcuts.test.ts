import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), "client/src", relativePath), "utf8");

describe("dashboard theme, notifications, and shortcuts", () => {
  it("exposes theme controls in the active admin command center", () => {
    const admin = read("components/CentralAdminCommandCenter.tsx");
    expect(admin).toContain("useTheme");
    expect(admin).toContain("Sun");
    expect(admin).toContain("Moon");
    expect(admin).toContain("toggleTheme");
  });

  it("keeps the active admin command center wired to navigation and notifications", () => {
    const home = read("pages/Home.tsx");
    const admin = read("components/CentralAdminCommandCenter.tsx");
    expect(home).toContain("CentralAdminCommandCenter");
    expect(home).toContain("adminPanelChildren");
    expect(admin).toContain("onNavigate");
    expect(admin).toContain("notifications");
    expect(admin).toContain("onLogout");
  });

  it("keeps platform KPIs data-backed and readable in both themes", () => {
    const overview = read("components/PlatformOverview.tsx");
    const css = read("index.css");
    expect(overview).toContain("SuperAdminRestaurantCatalog");
    expect(overview).toContain("formatPlatformMoney");
    expect(overview).toContain("إجمالي المطاعم");
    expect(overview).toContain("monthlyRecurringRevenue");
    expect(overview).toContain("تفاصيل التقرير");
    expect(overview).toContain("dark:bg-slate-900/90");
    expect(overview).toContain("hover:-translate-y-0.5");
    expect(overview).not.toContain("مركز نشاط NFOOD");
    expect(overview).not.toContain("نبض المنصة");
    const home = read("pages/Home.tsx");
    const analytics = read("components/OverviewAnalyticsPanel.tsx");
    expect(home).toContain("CentralAdminCommandCenter");
    expect(home).toContain("isCentralAdmin");
    expect(home).toContain("<CentralAdminCommandCenter");
    expect(home).toContain("adminPanelChildren");
    expect(home).toContain("<ActivitiesSectorsAdmin");
    expect(home).not.toContain('case "activities": return <PlatformOverview');
    expect(home).not.toContain("<SuperAdminRestaurantCatalog");
    expect(analytics).not.toContain(">{copy.overview}</h2>");
    expect(analytics).not.toContain("{copy.subtitle}</p>");
    expect(css).toContain(".dark .nfood-dashboard-shell");
    expect(css).toContain("background-color: #111c2f");
    expect(css).toContain("color: #f8fafc");
  });

  it("keeps restaurant cards consolidated without duplicate stats or horizontal scrolling", () => {
    const catalog = read("components/SuperAdminRestaurantCatalog.tsx");
    expect(catalog).toContain("grid min-w-0 gap-3 sm:grid-cols-2");
    expect(catalog).toContain("دخول المطعم");
    expect(catalog).toContain("فتح Menu");
    expect(catalog).not.toContain("إجمالي المطاعم");
    expect(catalog).not.toContain("مميزات مفعلة في الباقات");
    expect(catalog).not.toContain("overflow-x-auto");
    expect(catalog).not.toContain("min-w-[980px]");
  });
  it("keeps every Super Admin module wired to the active shell and real data procedures", () => {
    const home = read("pages/Home.tsx");
    const admin = read("components/CentralAdminCommandCenter.tsx");
    const requiredNav = ["overview", "admin", "activities", "stores", "site", "nfc", "trend", "settings", "languages", "files", "security", "health"];
    for (const key of requiredNav) expect(admin).toContain(`"${key}"`);
    const requiredPanels = ["SuperAdminView", "PlatformOverview", "AccountManagementPanel", "PlatformSettingsPanel", "UiTranslationAdminPanel", "MediaLibraryPanel", "MarketplaceStoresView", "ContentMarketplace", "VcardCardsAdmin", "SecurityView", "SystemHealthView"];
    for (const panel of requiredPanels) expect(home).toContain(panel);
    for (const key of ["activities", "stores", "site", "nfc", "trend", "settings", "languages", "files", "security", "health"]) expect(home).toContain(`case "${key}"`);
    expect(admin).toContain("trpc.admin.restaurants.useQuery");
    expect(admin).toContain("trpc.admin.subscriptions.useQuery");
    expect(admin).toContain("trpc.admin.customers.useQuery");
    expect(admin).toContain("trpc.admin.saasMetrics.useQuery");
    expect(admin).toContain("trpc.notifications.mine.useQuery");
    expect(admin).toContain("markAllRead");
    expect(admin).toContain("deleteAll");
    expect(admin).toContain("onLogout");
  });

});
