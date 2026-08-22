import { describe, expect, it } from "vitest";
import { getMissingTranslationTasks } from "./menuBulkTranslation";

describe("bulk menu translation", () => {
  it("returns only missing English and French translations", () => {
    const tasks = getMissingTranslationTasks(
      [{ id: 1, name: "المشروبات", translationsJson: JSON.stringify([{ language: "ar", name: "المشروبات" }, { language: "en", name: "Drinks" }]) }],
      [{ id: 2, name: "قهوة", description: "قهوة ساخنة", translationsJson: JSON.stringify([{ language: "ar", name: "قهوة" }]) }],
    );
    expect(tasks).toEqual([
      { entityType: "category", entityId: 1, label: "الفئة: المشروبات", sourceName: "المشروبات", sourceDescription: "", targetLanguage: "fr" },
      { entityType: "item", entityId: 2, label: "الصنف: قهوة", sourceName: "قهوة", sourceDescription: "قهوة ساخنة", targetLanguage: "en" },
      { entityType: "item", entityId: 2, label: "الصنف: قهوة", sourceName: "قهوة", sourceDescription: "قهوة ساخنة", targetLanguage: "fr" },
    ]);
  });
});
