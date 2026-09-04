import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("customer governance contracts", () => {
  const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
  const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
  const market = readFileSync(resolve(process.cwd(), "client/src/pages/ContentMarketplace.tsx"), "utf8");
  const profileCenter = readFileSync(resolve(process.cwd(), "client/src/components/ProfileGovernanceCenter.tsx"), "utf8");

  it("keeps V Card purchases customer-only and exposes review procedures", () => {
    expect(router).toContain("شراء بطاقات V Card متاح للعملاء فقط");
    expect(router).toContain("targetRole !== \"customer\"");
    expect(router).toContain("reviewCardRequest");
  });

  it("has one-device governance tables and customer card request lifecycle", () => {
    expect(schema).toContain('mysqlTable("trustedDevices"');
    expect(schema).toContain('mysqlTable("customerCardRequests"');
    expect(schema).toContain('"pending", "active", "revoked", "blocked"');
    expect(schema).toContain('"replace_key"');
  });

  it("exposes profile governance, open key generation, and explicit binding metadata", () => {
    expect(router).toContain("profileGovernance");
    expect(router).toContain("updateProfileGovernance");
    expect(router).toContain("profileCustomerEnabled");
    expect(router).toContain("profileRestaurantEnabled");
    expect(router).toContain("profilePlansJson");
    expect(router).toContain("generateProfileKey");
    expect(router).toContain("bindProfileKey");
    expect(router.indexOf("generateProfileKey")).toBeLessThan(router.indexOf("bindProfileKey"));
    expect(router).toContain("codeLast4");
    expect(router).toContain("customerProfileId");
    expect(router).toContain("profile.governance.updated");
    expect(router).toContain("profile.key.generated");
    expect(router).toContain("profile.key.bound");
  });

  it("renders visible profile metrics, confirmation flow, and advanced filtering", () => {
    expect(profileCenter).toContain("بطاقات مربوطة");
    expect(profileCenter).toContain("الباقات النشطة");
    expect(profileCenter).toContain("aria-label=\"البحث في مركز Profile\"");
    expect(profileCenter).toContain("aria-label=\"تصفية نوع الحساب\"");
    expect(profileCenter).toContain("confirmAction");
    expect(profileCenter).toContain("تم ربط البطاقة بالـProfile بنجاح");
    expect(profileCenter).toContain("animate-in");
  });

  it("clearly separates the content market from restaurant menus and assigns buying to merchants", () => {
    expect(market).toContain("ليس قائمة Menu");
    expect(market).toContain("المطاعم والحسابات المصنفة كتاجر هي الجهات المشترية افتراضيًا");
    expect(market).toContain("بيع العملاء · شراء التجار");
    expect(router).toContain("contentPurchaseEligibility");
    expect(router).toContain("الشراء محصور بالمطاعم والحسابات التجارية عند تفعيل الإدارة");
    expect(schema).toContain('mysqlTable("contentPurchaseEntitlements"');
  });
});
