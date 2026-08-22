import { describe, expect, it } from "vitest";
import { buildMenuTranslations, primaryMenuTranslation, type LocalizedDraft } from "./menuLanguageDraft";

const draft: LocalizedDraft = {
  ar: { name: "برجر كلاسيك", description: "وصف عربي" },
  en: { name: "Classic Burger", description: "English description" },
  fr: { name: "Burger classique", description: "Description française" },
};

describe("menu language draft", () => {
  it("builds only the languages selected by the restaurant", () => {
    expect(buildMenuTranslations(["ar", "fr"], draft)).toEqual([
      { language: "ar", name: "برجر كلاسيك", description: "وصف عربي", status: "approved", confidence: 1 },
      { language: "fr", name: "Burger classique", description: "Description française", status: "approved", confidence: 1 },
    ]);
  });

  it("uses Arabic as the primary menu name when it is selected", () => {
    expect(primaryMenuTranslation(["ar", "en"], draft).name).toBe("برجر كلاسيك");
    expect(primaryMenuTranslation(["en", "fr"], { ...draft, ar: { name: "", description: "" } }).name).toBe("Classic Burger");
  });
});
