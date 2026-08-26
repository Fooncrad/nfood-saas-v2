import { invokeLLM } from "./_core/llm";

export type MenuTranslationEntry = { language: string; name: string; description?: string; status: "approved"; confidence: number };

const languages = ["ar", "en", "fr", "ur", "es", "de", "tr"] as const;
type SupportedLanguage = (typeof languages)[number];

function parseEntries(raw?: string | null): MenuTranslationEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((entry): entry is MenuTranslationEntry => Boolean(entry && typeof entry === "object" && typeof (entry as { language?: unknown }).language === "string" && typeof (entry as { name?: unknown }).name === "string")) : [];
  } catch {
    return [];
  }
}

export async function ensureAutomaticMenuTranslations(input: { name: string; description?: string | null; translationsJson?: string | null }): Promise<string> {
  const name = input.name.trim();
  const description = input.description?.trim() ?? "";
  const existing = parseEntries(input.translationsJson);
  const existingByLanguage = new Map(existing.map((entry) => [entry.language, entry]));
  if (!existingByLanguage.has("ar")) existingByLanguage.set("ar", { language: "ar", name, description: description || undefined, status: "approved", confidence: 1 });
  const missing = languages.filter((language) => language !== "ar" && !existingByLanguage.has(language));
  if (missing.length === 0) return JSON.stringify(Array.from(existingByLanguage.values()));
  if (process.env.NODE_ENV === "test" || process.env.VITEST) return JSON.stringify(Array.from(existingByLanguage.values()));

  try {
    const response = await invokeLLM({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: "You translate restaurant menu content accurately. Return JSON only. Preserve brand names and culinary meaning. Translate the Arabic source into every requested target language. If description is empty, return an empty description." },
        { role: "user", content: JSON.stringify({ sourceLanguage: "ar", name, description, targetLanguages: missing }) },
      ],
      response_format: { type: "json_schema", json_schema: { name: "menu_translations", strict: true, schema: { type: "object", properties: { translations: { type: "array", items: { type: "object", properties: { language: { type: "string", enum: [...missing] }, name: { type: "string", minLength: 1 }, description: { type: "string" } }, required: ["language", "name", "description"], additionalProperties: false } } }, required: ["translations"], additionalProperties: false } } },
      maxTokens: 2400,
    });
    const raw = response.choices?.[0]?.message?.content;
    const parsed: unknown = typeof raw === "string" ? JSON.parse(raw) : null;
    const generated = parsed && typeof parsed === "object" && Array.isArray((parsed as { translations?: unknown }).translations) ? (parsed as { translations: Array<{ language?: unknown; name?: unknown; description?: unknown }> }).translations : [];
    for (const entry of generated) {
      if (typeof entry.language !== "string" || !missing.includes(entry.language as SupportedLanguage) || typeof entry.name !== "string" || !entry.name.trim()) continue;
      existingByLanguage.set(entry.language, { language: entry.language, name: entry.name.trim(), description: typeof entry.description === "string" && entry.description.trim() ? entry.description.trim() : undefined, status: "approved", confidence: 0.95 });
    }
  } catch (error) {
    console.warn("[AutoTranslation] menu translation failed; preserving source and existing entries", error);
  }
  return JSON.stringify(Array.from(existingByLanguage.values()));
}
