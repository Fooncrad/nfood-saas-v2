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

export function readLocalizedDraft(translationsJson: unknown, fallbackName = "", fallbackDescription = ""): LocalizedDraft {
  const draft: LocalizedDraft = { ar: { name: "", description: "" }, en: { name: "", description: "" }, fr: { name: "", description: "" } };
  try {
    const entries = Array.isArray(translationsJson) ? translationsJson : typeof translationsJson === "string" ? JSON.parse(translationsJson) : [];
    if (Array.isArray(entries)) {
      for (const entry of entries) {
        if (entry && (entry.language === "ar" || entry.language === "en" || entry.language === "fr") && typeof entry.name === "string") {
          const language = entry.language as MenuLanguage;
          draft[language] = { name: entry.name, description: typeof entry.description === "string" ? entry.description : "" };
        }
      }
    }
  } catch {
    // Keep the safe empty draft when legacy data is malformed.
  }
  if (!draft.ar.name) draft.ar = { name: fallbackName, description: fallbackDescription };
  return draft;
}
