import { describe, expect, it } from "vitest";
import { legacyUiTranslations } from "../contexts/LanguageContext";

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
});
