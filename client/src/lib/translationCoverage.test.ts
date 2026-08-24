import { describe, expect, it } from "vitest";
import { legacyUiTranslations, modernUiTranslations, translations } from "../contexts/LanguageContext";
import { navItems } from "../components/homeNavigation";

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

  it("keeps the platform navigation free of the removed translation manager", () => {
    expect(navItems.some((item) => item.key === "languages")).toBe(false);
  });
});
