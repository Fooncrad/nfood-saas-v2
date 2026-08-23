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
});
