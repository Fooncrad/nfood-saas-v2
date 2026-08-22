export type MenuLanguage = "ar" | "en" | "fr";

export type LocalizedDraft = Record<MenuLanguage, { name: string; description: string }>;

export type MenuTranslationDraft = {
  language: MenuLanguage;
  name: string;
  description?: string;
  status: "approved";
  confidence: number;
};

export function buildMenuTranslations(selected: MenuLanguage[], draft: LocalizedDraft): MenuTranslationDraft[] {
  return selected
    .filter((language) => draft[language].name.trim())
    .map((language) => ({
      language,
      name: draft[language].name.trim(),
      description: draft[language].description.trim() || undefined,
      status: "approved" as const,
      confidence: 1,
    }));
}

export function primaryMenuTranslation(selected: MenuLanguage[], draft: LocalizedDraft) {
  return draft.ar.name.trim() ? draft.ar : draft[selected[0]];
}
