import { readLocalizedDraft } from "./menuLanguageDraft";

export type BulkTranslationEntity = {
  id: number;
  name: string;
  description?: string | null;
  translationsJson?: string | null;
};

export type BulkTranslationTask = {
  entityType: "category" | "item";
  entityId: number;
  label: string;
  sourceName: string;
  sourceDescription: string;
  targetLanguage: "en" | "fr";
};

export function getMissingTranslationTasks(categories: BulkTranslationEntity[], items: BulkTranslationEntity[]): BulkTranslationTask[] {
  return [
    ...categories.map((entity) => ({ entityType: "category" as const, entity, label: `الفئة: ${entity.name}` })),
    ...items.map((entity) => ({ entityType: "item" as const, entity, label: `الصنف: ${entity.name}` })),
  ].flatMap(({ entityType, entity, label }) => {
    const draft = readLocalizedDraft(entity.translationsJson, entity.name, entity.description ?? "");
    return (["en", "fr"] as const)
      .filter((targetLanguage) => !draft[targetLanguage].name.trim())
      .map((targetLanguage) => ({
        entityType,
        entityId: entity.id,
        label,
        sourceName: entity.name,
        sourceDescription: entity.description ?? "",
        targetLanguage,
      }));
  });
}
