import { describe, expect, it } from "vitest";
import { createTranslator, legacyUiTranslations, modernUiTranslations, translations } from "../contexts/LanguageContext";
import { navItems } from "../components/homeNavigation";
import fs from "node:fs";
const homeModulesSource = fs.readFileSync(new URL("../components/HomeModules.tsx", import.meta.url), "utf8");
const dashboardLayoutSource = fs.readFileSync(new URL("../components/DashboardLayout.tsx", import.meta.url), "utf8");
const homeSidebarSource = fs.readFileSync(new URL("../components/HomeSidebar.tsx", import.meta.url), "utf8");
const kitchenPrinterSource = fs.readFileSync(new URL("../components/KitchenPrinterSettings.tsx", import.meta.url), "utf8");

const criticalMiddlePageLabels = [
  "أدخل بياناتك، وسنوجهك إلى مساحة العمل المناسبة.",
  "دخول آمن",
  "تسجيل الدخول موحد للأدمن والمطعم والفريق والعملاء والسائقين. يتم تحديد لوحة التحكم تلقائيًا حسب الدور.",
  "إدارة التسليم",
  "مركز السائق والتوصيل",
  "أقسام المطبخ والطابعات",
  "تذاكر أقسام المطبخ",
  "الولاء والإحالات",
  "التقييمات",
  "شاشة استدعاء العملاء",
  "النشاط والمبيعات",
  "أضف مطعمًا إلى المنصة",
] as const;

describe("translation coverage for login and operational modules", () => {
  it("keeps critical middle-page labels translated in English and French", () => {
    for (const label of criticalMiddlePageLabels) {
      expect(legacyUiTranslations.en[label], `Missing English translation: ${label}`).toBeTruthy();
      expect(legacyUiTranslations.fr[label], `Missing French translation: ${label}`).toBeTruthy();
    }
  });

  it("keeps recent UX labels translated across supported dashboard languages", () => {
    const labels = ["تثبيت Admin Web", "مركز إعدادات المنصة والبوابات", "البيانات الأساسية", "صورة الملف", "حفظ وتحديث الصفحة العامة", "إعادة المحاولة", "إعدادات صورة الحساب", "الصورة الشخصية", "اختر صورة الحساب", "حذف صورة الحساب", "سبب العطل التقني", "حدث عطل غير متوقع", "Nasser Cafe · مطعم تجريبي", "مساحة مطعم جاهزة لتجربة المنيو والطلبات والإدارة.", "استخدام مطعم ناصر التجريبي"];
    for (const label of labels) {
      const isDemoLabel = label.includes("Nasser Cafe") || label.includes("مساحة مطعم") || label.includes("استخدام مطعم ناصر");
      if (isDemoLabel) {
        expect(translations.en[Object.keys(translations.ar).find((key) => translations.ar[key as keyof typeof translations.ar] === label) as keyof typeof translations.en]).toBeTruthy();
        expect(translations.fr[Object.keys(translations.ar).find((key) => translations.ar[key as keyof typeof translations.ar] === label) as keyof typeof translations.fr]).toBeTruthy();
      } else {
        expect(modernUiTranslations.en[label], `Missing English modern translation: ${label}`).toBeTruthy();
        expect(modernUiTranslations.fr[label], `Missing French modern translation: ${label}`).toBeTruthy();
        expect(modernUiTranslations.ur[label], `Missing Urdu modern translation: ${label}`).toBeTruthy();
      }
    }
  });

  it("resolves dashboard fallback labels instead of returning raw keys", () => {
    const english = createTranslator("en");
    const french = createTranslator("fr");
    expect(english("العملاء")).toBe("Customers");
    expect(french("العملاء")).toBe("Clients");
    expect(english("الإعدادات والتشغيل")).toBe("Settings & operations");
    expect(french("الإعدادات والتشغيل")).toBe("Paramètres et opérations");
  });

  it("keeps shared dashboard and printer surfaces connected to the active language", () => {
    expect(dashboardLayoutSource).toContain('t("signInToContinue")');
    expect(dashboardLayoutSource).toContain('t("signOut")');
    expect(dashboardLayoutSource).not.toContain('>Sign out</span>');
    expect(kitchenPrinterSource).toContain("useLanguage");
    expect(kitchenPrinterSource).toContain("dir={language === \"ar\" ? \"rtl\" : \"ltr\"}");
    expect(kitchenPrinterSource).toContain("localize(\"قوالب ESC/POS\")");
  });

  it("keeps dashboard navigation translated and free from demo labels", () => {
    expect(dashboardLayoutSource).not.toContain('label: "Page 1"');
    expect(dashboardLayoutSource).not.toContain('label: "Page 2"');
    expect(dashboardLayoutSource).toContain('t("navigation.main")');
    expect(homeSidebarSource).toContain("navTranslationKeys");
    expect(homeSidebarSource).toContain("labelFor(item)");
  });

  it("exposes language and translation settings in navigation", () => {
    expect(navItems.some((item) => item.key === "languages")).toBe(true);
  });

  it("keeps the restaurant language settings aligned with the supported catalog", () => {
    expect(homeModulesSource).toContain('["ar", "en", "fr", "ur"]');
    expect(homeModulesSource).toContain('ur: { name: "اردو"');
  });
});
