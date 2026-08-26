import { describe, expect, it } from "vitest";
import { autoTranslateText, setDatabaseUiTranslations } from "@/contexts/LanguageContext";

describe("database translation dictionary", () => {
  it("uses published database translations before the static fallback", () => {
    setDatabaseUiTranslations([{ translationKey: "marketplace.title", sourceText: "سوق المحتوى والوصفات", targetLanguage: "fr", translatedText: "Marché du contenu et des recettes" }]);
    expect(autoTranslateText("سوق المحتوى والوصفات", "fr")).toBe("Marché du contenu et des recettes");
  });

  it("does not use an untranslated empty entry", () => {
    setDatabaseUiTranslations([{ translationKey: "admin.empty", sourceText: "عبارة غير مترجمة", targetLanguage: "fr", translatedText: null }]);
    expect(autoTranslateText("عبارة غير مترجمة", "fr")).not.toBe("");
  });
});
