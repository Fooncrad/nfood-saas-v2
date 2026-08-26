import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("customer benefits catalog", () => {
  const page = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerBenefits.tsx"), "utf8");
  const portal = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerPortal.tsx"), "utf8");
  const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

  it("defines three plans and a 30+ feature catalog", () => {
    expect((page.match(/\[\"[a-z-]+\",/g) ?? []).length).toBeGreaterThanOrEqual(30);
    expect(page).toContain('key: "customer-start"');
    expect(page).toContain('key: "customer-plus"');
    expect(page).toContain('key: "customer-pro"');
  });

  it("grants plan features and supports individual requests", () => {
    expect(page).toContain("تُمنح الميزات تلقائيًا بحسب الباقة");
    expect(page).toContain("طلب تفعيل الميزة");
    expect(page).toContain("nfood-customer-feature-requests");
    expect(page).toContain("تم تسجيل طلب تفعيل");
  });

  it("is reachable from the customer portal", () => {
    expect(portal).toContain('href="/customer-benefits"');
    expect(app).toContain('path="/customer-benefits"');
  });
});
