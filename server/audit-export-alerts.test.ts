import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");
describe("audit export and alerts", () => {
  it("provides filtered CSV/PDF audit exports", () => {
    const router = read("server/routers.ts");
    const panel = read("client/src/components/RestaurantAccessControlPanel.tsx");
    const db = read("server/db.ts");
    expect(db).toContain("actorName?: string");
    expect(router).toContain("exportActivityAuditCsv:");
    expect(router).toContain("exportActivityAuditExcel:");
    expect(read("server/auditCsv.ts")).toContain("auditLogsToExcel");
    expect(router).toContain("exportActivityAuditPdf:");
    expect(panel).toContain("type=\"date\"");
    expect(panel).toContain("اسم المستخدم");
    expect(panel).toContain("PDF / طباعة");
    expect(panel).toContain("كل مستويات الخطورة");
    expect(panel).toContain("severity");
    expect(router).toContain("summary-card");
    expect(router).toContain("severity-${row.severity}");
  });
  it("keeps Excel export aligned with filtered audit data", () => {
    const excel = read("server/auditCsv.ts");
    const panel = read("client/src/components/RestaurantAccessControlPanel.tsx");
    expect(excel).toContain("safeMetadata");
    expect(excel).toContain("direction:rtl");
    expect(panel).toContain("exportExcel");
    expect(panel).toContain("application/vnd.ms-excel");
  });
  it("surfaces sensitive audit events in the dashboard", () => {
    const alerts = read("client/src/components/AuditSecurityAlerts.tsx");
    const home = read("client/src/pages/Home.tsx");
    expect(alerts).toContain("order.status.updated");
    expect(alerts).toContain("team.account.updated");
    expect(alerts).toContain("refetchInterval: 5000");
    expect(alerts).toContain("toast.error");
    expect(alerts).toContain("toast.warning");
    expect(home).toContain("<AuditSecurityAlerts restaurantId={restaurantId} />");
  });
  it("supports discounted favorites and advanced menu search", () => {
    const favorites = read("client/src/pages/FavoritesPage.tsx");
    const menu = read("client/src/components/HomeModules.tsx");
    expect(favorites).toContain("discountedOnly");
    expect(favorites).toContain("compareAtPrice");
    expect(favorites).toContain("خصم");
    expect(menu).toContain("itemSearch");
    expect(menu).toContain("priceAsc");
    expect(menu).toContain("discountDesc");
    expect(menu).toContain("ابحث بالاسم أو الفئة");
  });
  it("supports previous and discounted prices", () => {
    const schema = read("drizzle/schema.ts");
    const db = read("server/db.ts");
    const router = read("server/routers.ts");
    const publicMenu = read("client/src/pages/RestaurantPublic.tsx");
    expect(schema).toContain("compareAtPrice");
    expect(db).toContain("compareAtPrice: menuItems.compareAtPrice");
    expect(router).toContain("السعر قبل الخصم يجب أن يكون أعلى من السعر الحالي");
    expect(publicMenu).toContain("discountLabel");
  });
});
