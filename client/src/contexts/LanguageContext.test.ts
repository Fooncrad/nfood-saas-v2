import { describe, expect, it, vi } from "vitest";
import { DASHBOARD_LANGUAGE_STORAGE_KEY, LANGUAGE_STORAGE_KEY, MENU_LANGUAGE_MANUAL_STORAGE_KEY, detectVisitorLanguage, languageMeta, legacyUiTranslations, translations } from "./LanguageContext";

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
});
