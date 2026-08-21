import { describe, expect, it } from "vitest";
import { LANGUAGE_STORAGE_KEY, languageMeta, translations } from "./LanguageContext";

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

  it("uses a stable storage key for persistence", () => {
    expect(LANGUAGE_STORAGE_KEY).toBe("nfood-language");
  });
});
