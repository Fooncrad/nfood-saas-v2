import { describe, expect, it, vi } from "vitest";
import { DASHBOARD_LANGUAGE_STORAGE_KEY, LANGUAGE_STORAGE_KEY, MENU_LANGUAGE_MANUAL_STORAGE_KEY, autoTranslateText, detectVisitorLanguage, findUntranslatedArabic, formatGregorianDate, formatLatinNumber, isPublicLanguagePath, languageMeta, legacyUiTranslations, translations } from "./LanguageContext";

describe("language configuration", () => {
  it("contains Arabic, English, and French with correct directions", () => {
    expect(languageMeta.ar.dir).toBe("rtl");
    expect(languageMeta.en.dir).toBe("ltr");
    expect(languageMeta.fr.dir).toBe("ltr");
  });

  it("provides translated labels for the core navigation", () => {
    expect(translations.ar.dashboard).toBe("لوحة التحكم");
    expect(translations.en.dashboard).toBe("Dashboard");
    expect(translations.fr.dashboard).toBe("Tableau de bord");
  });

  it("translates compound legacy UI text and preserves dynamic values", () => {
    expect(autoTranslateText("الحالة: قيد التحضير · الإجمالي: 45 ر.س", "en")).toContain("Status:");
    expect(autoTranslateText("الحالة: قيد التحضير · الإجمالي: 45 ر.س", "en")).toContain("45 SAR");
    expect(autoTranslateText("الحالة: قيد التحضير", "ar")).toBe("الحالة: قيد التحضير");
  });

  it("detects untranslated Arabic after automatic localization", () => {
    expect(findUntranslatedArabic("الحالة: قيد التحضير · الإجمالي: 45 ر.س", "en")).toEqual([]);
    expect(findUntranslatedArabic("الحالة: قيد التحضير · الإجمالي: 45 ر.س", "fr")).toEqual([]);
    expect(findUntranslatedArabic("الحالة: قيد التحضير", "ar")).toEqual([]);
  });

  it("does not alias Urdu to English for core labels", () => {
    expect(translations.ur.dashboard).not.toBe(translations.en.dashboard);
    expect(translations.ur.dashboard).not.toBe("");
  });

  it("auto-translates every core Arabic label to English and French", () => {
    for (const [key, arabicValue] of Object.entries(translations.ar)) {
      expect(autoTranslateText(arabicValue, "en"), `Missing English auto-translation for ${key}`).toBe(translations.en[key as keyof typeof translations.en]);
      expect(autoTranslateText(arabicValue, "fr"), `Missing French auto-translation for ${key}`).toBe(translations.fr[key as keyof typeof translations.fr]);
    }
  });

  it("keeps all translation keys aligned across the three languages", () => {
    const arabicKeys = Object.keys(translations.ar).sort();
    expect(Object.keys(translations.en).sort()).toEqual(arabicKeys);
    expect(Object.keys(translations.fr).sort()).toEqual(arabicKeys);
    for (const key of arabicKeys) {
      expect(translations.en[key as keyof typeof translations.en]).not.toBe("");
      expect(translations.fr[key as keyof typeof translations.fr]).not.toBe("");
    }
  });

  it("covers legacy middle-page labels in English and French", () => {
    const arabicPattern = /[\u0600-\u06FF]/;
    for (const [key, value] of Object.entries(legacyUiTranslations.en)) {
      expect(value.trim()).not.toBe("");
      const frenchValue = legacyUiTranslations.fr[key];
      expect(frenchValue, `Missing French translation for: ${key}`).toBeDefined();
      expect(frenchValue?.trim()).not.toBe("");
      expect(arabicPattern.test(value), `Arabic characters remain in English for: ${key} => ${value}`).toBe(false);
      expect(arabicPattern.test(frenchValue ?? ""), `Arabic characters remain in French for: ${key} => ${frenchValue}`).toBe(false);
    }
  });

  it("formats Arabic dates with Gregorian calendar and Latin numerals", () => {
    const formattedDate = formatGregorianDate("2026-08-25T12:00:00.000Z", "ar");
    const formattedNumber = formatLatinNumber(111000.45, "ar");
    expect(formattedDate).toContain("2026");
    expect(formattedDate).not.toMatch(/[٠-٩]/);
    expect(formattedNumber).not.toMatch(/[٠-٩]/);
    expect(formattedNumber).toContain("111");
  });

  it("uses separate dashboard and public manual-language storage keys", () => {
    expect(LANGUAGE_STORAGE_KEY).toBe("nfood-language");
    expect(DASHBOARD_LANGUAGE_STORAGE_KEY).toBe("nfood-dashboard-language");
    expect(MENU_LANGUAGE_MANUAL_STORAGE_KEY).toBe("nfood-menu-language-manual");
  });

  it("detects supported visitor languages from navigator.language", () => {
    vi.stubGlobal("window", { navigator: { language: "fr-FR" } });
    expect(detectVisitorLanguage()).toBe("fr");
    vi.stubGlobal("window", { navigator: { language: "en-US" } });
    expect(detectVisitorLanguage()).toBe("en");
    vi.unstubAllGlobals();
  });

  it("uses English as the safe default for unsupported visitors", () => {
    vi.stubGlobal("window", { navigator: { language: "de-DE" } });
    expect(detectVisitorLanguage()).toBe("en");
    vi.unstubAllGlobals();
  });

  it("recognizes public menu routes separately from dashboard routes", () => {
    expect(isPublicLanguagePath("/restaurant/demo")).toBe(true);
    expect(isPublicLanguagePath("/menu/demo")).toBe(true);
    expect(isPublicLanguagePath("/dashboard")).toBe(false);
  });

  it("translates newly added Trend Kitchen labels in English and French", () => {
    expect(autoTranslateText("سوق نفود للمحتوى · برجر · شراء", "en")).toBe("NFOOD Content Market · Burger · Buy");
    expect(autoTranslateText("سوق نفود للمحتوى · برجر · شراء", "fr")).toBe("Marché de contenu NFOOD · Burger · Acheter");
  });

  it("translates newly rendered marketplace status text", () => {
    expect(autoTranslateText("جارٍ تحميل السوق...", "en")).toBe("Loading marketplace...");
    expect(autoTranslateText("إضافة إلى المفضلة", "fr")).toBe("Ajouter aux favoris");
  });
});
