import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("customer benefits catalog", () => {
  const page = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerBenefits.tsx"), "utf8");
  const portal = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerPortal.tsx"), "utf8");
  const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
  const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
  const routers = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

  it("defines three plans and a 30+ feature catalog", () => {
    expect((db.match(/\[\"[a-z-]+\",/g) ?? []).length).toBeGreaterThanOrEqual(30);
    expect(db).toContain('key: "customer-start"');
    expect(db).toContain('key: "customer-plus"');
    expect(db).toContain('key: "customer-pro"');
  });

  it("grants plan features and supports individual requests", () => {
    expect(page).toContain("trpc.platform.customerBenefits.useQuery");
    expect(page).toContain("طلب تفعيل الميزة");
    expect(routers).toContain("requestCustomerBenefit: protectedProcedure");
    expect(db).toContain("duplicate: true");
  });

  it("is reachable from the customer portal", () => {
    expect(portal).toContain('href="/customer-benefits"');
    expect(app).toContain('path="/customer-benefits"');
  });
});
