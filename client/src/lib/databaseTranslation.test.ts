import { describe, expect, it } from "vitest";
import { autoTranslateText, setDatabaseUiTranslations } from "@/contexts/LanguageContext";

describe("database translation dictionary", () => {
  it("uses published database translations before the static fallback", () => {
    setDatabaseUiTranslations([{ translationKey: "marketplace.title", sourceText: "سوق المحتوى والوصفات", targetLanguage: "fr", translatedText: "Marché du contenu et des recettes" }]);
    expect(autoTranslateText("سوق المحتوى والوصفات", "fr")).toBe("Marché du contenu et des recettes");
  });

  it("never leaks Arabic when a new EN translation is missing", () => {
    setDatabaseUiTranslations([]);
    const value = autoTranslateText("عبارة عربية جديدة غير موجودة في القاموس", "en");
    expect(value).toBe("Translation pending");
    expect(value).not.toMatch(/[\\u0600-\\u06FF]/);
  });

  it("never leaks Arabic when a new FR translation is missing", () => {
    setDatabaseUiTranslations([]);
    const value = autoTranslateText("إضافة جديدة تحتاج ترجمة", "fr");
    expect(value).toBe("Traduction en attente");
    expect(value).not.toMatch(/[\\u0600-\\u06FF]/);
  });
});
