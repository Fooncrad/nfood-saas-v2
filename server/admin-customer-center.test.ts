import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());

describe("platform customer center", () => {
  it("exposes a protected customer insights procedure and temporary customer entry", () => {
    const router = readFileSync(resolve(root, "server/routers.ts"), "utf8");
    const db = readFileSync(resolve(root, "server/db.ts"), "utf8");
    expect(router).toContain("customerAccounts: platformAdminProcedure");
    expect(router).toContain("enterCustomerAccount: platformAdminProcedure");
    expect(router).toContain("admin.customer.enter");
    expect(db).toContain("listAdminCustomerAccounts");
    expect(db).toContain("grossSales");
  });

  it("renders customer metrics, search, wallet, entry, and password controls", () => {
    const panel = readFileSync(resolve(root, "client/src/components/SuperAdminCustomerCatalog.tsx"), "utf8");
    const overview = readFileSync(resolve(root, "client/src/components/PlatformOverview.tsx"), "utf8");
    expect(panel).toContain("قائمة العملاء والحقوق");
    expect(panel).toContain("محافظ");
    expect(panel).toContain("enterCustomerAccount");
    expect(panel).toContain("updateManagedAccount");
    expect(overview).toContain("<SuperAdminCustomerCatalog />");
  });
});
