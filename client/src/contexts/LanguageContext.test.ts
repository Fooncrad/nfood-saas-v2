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

  it("uses a stable storage key for persistence", () => {
    expect(LANGUAGE_STORAGE_KEY).toBe("nfood-language");
  });
});
