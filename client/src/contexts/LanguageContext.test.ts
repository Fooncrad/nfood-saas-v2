import { describe, expect, it } from "vitest";
import { LANGUAGE_STORAGE_KEY, languageMeta, legacyUiTranslations, translations } from "./LanguageContext";

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
      expect(arabicPattern.test(value)).toBe(false);
      expect(arabicPattern.test(frenchValue ?? "")).toBe(false);
    }
  });

  it("uses a stable storage key for persistence", () => {
    expect(LANGUAGE_STORAGE_KEY).toBe("nfood-language");
  });
});
