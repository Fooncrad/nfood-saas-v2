import { describe, expect, it } from "vitest";
import { autoTranslateText, setDatabaseUiTranslations } from "@/contexts/LanguageContext";

describe("database translation dictionary", () => {
  it("uses published database translations before the static fallback", () => {
    setDatabaseUiTranslations([{ translationKey: "marketplace.title", sourceText: "سوق المحتوى والوصفات", targetLanguage: "fr", translatedText: "Marché du contenu et des recettes" }]);
    expect(autoTranslateText("سوق المحتوى والوصفات", "fr")).toBe("Marché du contenu et des recettes");
  });

  it("never exposes an internal pending marker for a new EN translation", () => {
    setDatabaseUiTranslations([]);
    expect(autoTranslateText("عبارة عربية جديدة غير موجودة في القاموس", "en")).not.toBe("Translation pending");
  });

  it("never exposes an internal pending marker for a new FR translation", () => {
    setDatabaseUiTranslations([]);
    expect(autoTranslateText("إضافة جديدة تحتاج ترجمة", "fr")).not.toBe("Traduction en attente");
  });
});
