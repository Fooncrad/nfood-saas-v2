import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { authenticatedLandingPath, effectiveAccountRole, isRestaurantAreaAccount } from "./lib/authRouting";

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
    const app = read("pages/SuperAdminApp.tsx");
    const admin = read("components/CentralAdminCommandCenter.tsx");
    expect(app).toContain("<CentralAdminCommandCenter");
    expect(app).toContain("active={active}");
    expect(app).toContain("onNavigate={setActive}");
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
    const app = read("pages/SuperAdminApp.tsx");
    const analytics = read("components/OverviewAnalyticsPanel.tsx");
    expect(app).toContain("CentralAdminCommandCenter");
    expect(app).toContain("<CentralAdminCommandCenter");
    expect(app).toContain("<ActivitiesSectorsAdmin");
    expect(app).not.toContain('case "activities": return <PlatformOverview');
    expect(app).not.toContain("<SuperAdminRestaurantCatalog");
    expect(analytics).not.toContain(">{copy.overview}</h2>");
    expect(analytics).not.toContain("{copy.subtitle}</p>");
    expect(css).toContain(".dark .nfood-dashboard-shell");
    expect(css).toContain("background-color: #111c2f");
    expect(css).toContain("color: #f8fafc");
  });

  it("keeps restaurant cards consolidated without duplicate stats or horizontal scrolling", () => {
    const catalog = read("components/SuperAdminRestaurantCatalog.tsx");
    expect(catalog).toMatch(/grid min-w-0 gap-3(?:[^"\\n]*)sm:grid-cols-2|grid min-w-0 gap-[^"\\n]*sm:grid-cols-2/);
    expect(catalog).toContain("دخول المطعم");
    expect(catalog).toContain("فتح Menu");
    expect(catalog).not.toContain("إجمالي المطاعم");
    expect(catalog).not.toContain("مميزات مفعلة في الباقات");
    expect(catalog).not.toContain("overflow-x-auto");
    expect(catalog).not.toContain("min-w-[980px]");
  });

  it("keeps removed legacy Super Admin duplicates from returning", () => {
    const home = read("pages/Home.tsx");
    const settings = read("components/PlatformSettingsPanel.tsx");
    const start = home.indexOf("function SuperAdminView()");
    const end = home.indexOf("function CustomerAdminPanel()", start);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const legacyView = home.slice(start, end);
    expect(legacyView).not.toContain('<CardTitle className="text-base">المطاعم والعملاء</CardTitle>');
    for (const duplicate of ["<SubscriptionAdminPanel", "<CustomerAdminPanel", "<RoleAdminPanel", "<RolePermissionsPanel", "<FeatureUsagePanel", "<FeatureAccessPanel"]) {
      expect(legacyView).not.toContain(duplicate);
    }
    expect(settings).not.toContain('import { WalletTopupReviewPanel }');
    expect(settings).not.toContain("<WalletTopupReviewPanel");
  });

  it("keeps the canonical Super Admin shell wired to live data and modules", () => {
    const admin = read("components/CentralAdminCommandCenter.tsx");
    const app = read("pages/SuperAdminApp.tsx");
    const routes = read("App.tsx");
    for (const key of ["overview", "activities", "stores", "site", "nfc", "trend", "settings", "languages", "files", "security", "health"]) expect(admin).toContain(`"${key}"`);
    expect(admin).not.toContain('admin: { ar: "Super Admin"');
    for (const panel of ["AccountManagementPanel", "PlatformSettingsPanel", "UiTranslationAdminPanel", "MediaLibraryPanel", "MarketplaceStoresView", "ContentMarketplace", "VcardCardsAdmin", "SecurityView", "SystemHealthView"]) expect(app).toContain(panel);
    expect(routes).toContain('path="/admin" component={SuperAdminRoute}');
    for (const procedure of ["restaurants", "subscriptions", "customers", "saasMetrics"]) expect(admin).toContain(`trpc.admin.${procedure}.useQuery`);
    expect(admin).toContain("trpc.notifications.mine.useQuery");
    expect(admin).toContain("onLogout");
  });

  it("keeps staff and administrators out of customer-only routes", () => {
    for (const role of ["restaurant_admin", "waiter", "kitchen", "bar", "cashier", "driver", "accountant"]) {
      const user = { accountRole: role };
      expect(effectiveAccountRole(user)).toBe(role);
      expect(isRestaurantAreaAccount(user)).toBe(true);
      expect(authenticatedLandingPath(user, "/customer-portal")).toBe("/restaurant/dashboard");
    }

    expect(authenticatedLandingPath({ role: "admin" }, "/customer-portal")).toBe("/admin");
    expect(authenticatedLandingPath({ accountRole: "customer" }, "/restaurant/dashboard")).toBe("/customer-portal");
    expect(authenticatedLandingPath({ accountRole: "customer" }, "/menu/nasser")).toBe("/menu/nasser");

    const app = read("App.tsx");
    const login = read("pages/LoginPage.tsx");
    expect(app).toContain("isRestaurantAreaAccount(user)");
    expect(app).not.toContain("const teamRole = user?.testRole");
    expect(login).toContain("authenticatedLandingPath(user, next)");
  });

});
