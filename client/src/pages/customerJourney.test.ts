import { describe, expect, it } from "vitest";
import fs from "node:fs";

const home = fs.readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");
const login = fs.readFileSync(new URL("../components/TestLoginScreen.tsx", import.meta.url), "utf8");
const roadmap = fs.readFileSync(new URL("../../../docs/customer-journey-roadmap.md", import.meta.url), "utf8");
const menu = fs.readFileSync(new URL("../pages/RestaurantPublic.tsx", import.meta.url), "utf8");
const portal = fs.readFileSync(new URL("../pages/CustomerPortal.tsx", import.meta.url), "utf8");

describe("customer journey regression", () => {
  it("routes customer sessions to an independent portal", () => {
    expect(home).toContain('import CustomerPortal from "@/pages/CustomerPortal"');
    expect(home).toContain('(user?.testRole as string | undefined) ?? (user?.role === "admin" ? "admin" : user ? "customer" : undefined)');
    expect(home).toContain('(user.testRole as string | undefined) ?? (user.role === "admin" ? "admin" : "customer")');
    expect(home).not.toContain('user.testRole === "customer" ? <OverviewAnalyticsPanel');
  });

  it("keeps recovery visible in the compact login flow", () => {
    expect(login).toContain("Forgot password?");
    expect(login).toContain("إرسال رابط الاستعادة");
    expect(login).toContain("onForgotPassword");
  });

  it("keeps the menu auth sheet compact and the portal customer-specific", () => {
    expect(menu).toContain("max-h-[76dvh]");
    expect(menu).toContain("loginCustomer.mutate");
    expect(portal).toContain("CustomerRewardsWalletPanel");
    expect(portal).toContain("تسجيل الخروج");
  });

  it("exposes language switching and elevates content inside the customer portal", () => {
    expect(portal).toContain("useLanguage");
    expect(portal).toContain('aria-label="اختيار اللغة"');
    expect(portal).toContain("صور ووصفات بين مطاعمك");
    expect(portal).toContain("hover:-translate-y-1");
  });

  it("adds restaurant favorites and action-first restaurant cards", () => {
    expect(portal).toContain("favoriteRestaurants.useQuery");
    expect(portal).toContain("toggleFavoriteRestaurant.mutate");
    expect(portal).toContain("مطاعمي المفضلة");
    expect(portal).toContain("اطلب الآن");
    expect(portal).toContain("الجوال:");
  });

  it("keeps content visible by default with a local hide/show control", () => {
    expect(portal).toContain('nfood.customer.contentVisible');
    expect(portal).toContain("إخفاء المحتوى");
    expect(portal).toContain("إظهار المحتوى");
  });

  it("documents the return-to-cart and account-switch journey", () => {
    expect(roadmap).toContain("الخروج من حساب الإدارة والمتابعة كعميل");
    expect(roadmap).toContain("يعود تلقائيًا إلى السلة");
    expect(roadmap).toContain("CustomerPortal مستقل");
  });
});
