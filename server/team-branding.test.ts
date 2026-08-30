import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("team and branding controls", () => {
  it("exposes reset ordering and loading feedback", () => {
    const quickAccess = read("client/src/components/DashboardQuickAccess.tsx");
    const editor = read("client/src/components/BrandingEditorPanel.tsx");
    expect(quickAccess).toContain("إعادة الضبط");
    expect(quickAccess).toContain("widget-order:${storageScope}");
    expect(editor).toContain('assetType: AssetType');
    expect(editor).toContain('"cover"');
    expect(editor).toContain("animate-spin");
  });

  it("separates restaurant identity from menu layout settings", () => {
    const modules = read("client/src/components/HomeModules.tsx");
    expect(modules).toContain('data-restaurant-identity-card');
    expect(modules).toContain('id="menu-layouts"');
    expect(modules).toContain('data-menu-layouts-card');
    expect(modules).toContain("هذا القسم للهوية فقط");
    expect(modules).toContain("قسم مستقل بالكامل عن الهوية");
    expect(modules).toContain('data-identity-preview');
    expect(modules).not.toContain('import { BrandingEditorPanel }');
    expect(modules).not.toContain('<BrandingEditorPanel restaurantId={restaurantId} />');
  });

  it("exposes brand colors, fonts, saved layout templates, and live preview", () => {
    const schema = read("drizzle/schema.ts");
    const db = read("server/db.ts");
    const router = read("server/routers.ts");
    const modules = read("client/src/components/HomeModules.tsx");
    const publicMenu = read("client/src/pages/RestaurantPublic.tsx");
    expect(schema).toContain('brandAccentColor: varchar("brandAccentColor"');
    expect(schema).toContain('brandFontFamily: varchar("brandFontFamily"');
    expect(schema).toContain('restaurantMenuLayoutTemplates = mysqlTable');
    expect(db).toContain("listRestaurantMenuLayoutTemplates");
    expect(router).toContain("createMenuLayoutTemplate:");
    expect(router).toContain("deleteMenuLayoutTemplate:");
    expect(modules).toContain("data-brand-identity-customization");
    expect(modules).toContain("قوالب تخطيطات محفوظة");
    expect(modules).toContain("data-menu-layout-live-preview");
    expect(modules).toContain("تم تطبيق القالب على المعاينة والمسودة");
    expect(publicMenu).toContain("--menu-font-family");
    expect(publicMenu).toContain("brandAccentColor");
  });

  it("keeps detailed permissions and audit procedures protected", () => {
    const permissions = read("shared/rolePermissions.ts");
    const router = read("server/routers.ts");
    const panel = read("client/src/components/RestaurantAccessControlPanel.tsx");
    expect(permissions).toContain('"orders.update"');
    expect(permissions).toContain('"finance.read"');
    expect(permissions).toContain('"reports.read"');
    expect(router).toContain('assertTeamPermission(ctx, input.status === "cancelled" ? "orders.cancel" : "orders.update")');
    expect(router).toContain('action: "order.status.updated"');
    expect(router).toContain('activityAuditLogs:');
    expect(panel).toContain("الصلاحيات التفصيلية حسب الدور");
    expect(panel).toContain("سجل نشاط المطعم");
  });

  it("keeps team account fields and protected server procedures", () => {
    const schema = read("drizzle/schema.ts");
    const router = read("server/routers.ts");
    const panel = read("client/src/components/RestaurantTeamAccountsPanel.tsx");
    expect(schema).toContain('phone: varchar("phone", { length: 40 })');
    expect(router).toContain("teamAccounts:");
    expect(router).toContain("createTeamAccount:");
    expect(router).toContain("updateTeamAccount:");
    expect(router).toContain("scrypt$");
    expect(panel).toContain("البريد الإلكتروني");
    expect(panel).toContain("رقم الجوال");
    expect(panel).toContain("إيقاف الحساب");
    expect(panel).toContain("أُنشئ");
  });

  it("supports restaurant staff identity, waiter table assignments, and self password changes", () => {
    const router = read("server/routers.ts");
    const panel = read("client/src/components/RestaurantTeamAccountsPanel.tsx");
    expect(router).toContain("userId: (await db.select({ id: users.id })");
    expect(router).toContain("changeMyTeamPassword:");
    expect(router).toContain("replaceWaiterTableAssignments:");
    expect(panel).toContain("account.userId");
    expect(panel).toContain("حفظ ربط");
    expect(panel).toContain("tablesByBranch.useQuery");
  });
});
