import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("customer-only content marketplace", () => {
  const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
  const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
  const studio = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerStudio.tsx"), "utf8");
  const market = readFileSync(resolve(process.cwd(), "client/src/pages/ContentMarketplace.tsx"), "utf8");
  const portal = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerPortal.tsx"), "utf8");
  const library = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerContentLibrary.tsx"), "utf8");
  const profile = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerProfileSettings.tsx"), "utf8");
  const login = readFileSync(resolve(process.cwd(), "client/src/components/TestLoginScreen.tsx"), "utf8");
  const studioPlans = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerStudioPlans.tsx"), "utf8");
  const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

  it("keeps customers out of buying while allowing merchant buying only when admin enables it", () => {
    expect(router).toContain("الشراء متاح لهذا الحساب التجاري");
    expect(router).toContain("allowRestaurantContentPurchase");
    expect(router).toContain("شراء المحتوى متوقف من إعدادات إدارة المنصة");
    expect(router).not.toContain('buyerType: z.enum(["customer", "restaurant"])');
    expect(db).not.toContain('buyerType: "restaurant"');
    expect(db).toContain("contentPurchaseEntitlements");
  });

  it("supports public/friends visibility and controlled food tags", () => {
    expect(router).toContain('visibility: z.enum(["public", "friends"])');
    expect(router).toContain("foodTags: z.array");
    expect(studio).toContain("خاص للأصدقاء المدعوين");
    expect(studio).toContain("أصناف الطعام والهاشتاقات");
  });

  it("keeps public search tag-aware with customer selling and merchant buying", () => {
    expect(market).toContain("foodTagsJson");
    expect(market).toContain("بيع العملاء · شراء التجار");
    expect(market).toContain("شراء للتاجر");
    expect(market).toContain('purchase.mutate({ listingId })');
    expect(portal).toContain('href="/content-market"');
    expect(portal).toContain('href="/customer-content-library"');
    expect(portal).toContain("سوق المحتوى والوصفات");
    expect(portal).toContain("دخول Trend Kitchen");
    expect(portal).not.toContain("إنشاء حساب عميل مستقل");
    expect(market).toContain("هذه الميزة للبيع غير متوفرة لحسابك");
    expect(market).toContain('window.location.href = "/support"');
    expect(studio).toContain("NFOOD-STUDIO-001");
    expect(studio).toContain("تعذر تحميل بعض بيانات الاستديو");
    expect(login).toContain('data-testid="login-email"');
    expect(login).toContain('data-testid="login-password"');
    expect(login).not.toContain('data-testid="login-name"');
    expect(library).toContain("تصل الملفات هنا تلقائيًا بعد إتمام الدفع التجاري");
    expect(profile).toContain("maxEdge = field === \"avatarUrl\" ? 800 : 1800");
    expect(profile).toContain('"image/webp"');
    expect(studioPlans).toContain("باقات مساحة Studio");
    expect(studioPlans).toContain("طلب الترقية والتواصل مع الدعم");
    expect(app).toContain('path="/customer-studio-plans"');
    expect(app).toContain("CustomerAreaGuard");
    expect(app).toContain('path="/customer-portal" component={() => <CustomerAreaGuard>');
    expect(app).toContain('path="/customer-profile" component={() => <CustomerAreaGuard>');
    expect(login).toContain("continueWithGoogle");
  });
});
