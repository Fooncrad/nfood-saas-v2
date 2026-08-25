import { and, eq } from "drizzle-orm";
import { menuCategories, menuItems, menuItemAddons } from "../drizzle/schema";
import { getDb } from "./db";
import { invokeLLM } from "./_core/llm";

export type MenuLanguage = "ar" | "en" | "fr" | "ur";
export type MenuTranslationEntityType = "category" | "item" | "addon";

type TranslationEntry = {
  language?: string;
  name?: string;
  description?: string | null;
  status?: string;
  confidence?: number;
  automatic?: boolean;
  sourceFingerprint?: string;
  updatedAt?: string;
};

type TranslationEntity = {
  entityType: MenuTranslationEntityType;
  id: number;
  restaurantId: number;
  name: string;
  description?: string | null;
  translationsJson?: string | null;
};

export type PublicMenuTranslation = {
  entityType: MenuTranslationEntityType;
  entityId: number;
  language: MenuLanguage;
  name: string;
  description?: string | null;
  automatic: true;
};

const SUPPORTED_LANGUAGES: MenuLanguage[] = ["ar", "en", "fr", "ur"];
const MAX_BATCH_SIZE = 30;
const MAX_NAME_LENGTH = 160;
const MAX_DESCRIPTION_LENGTH = 1000;

function sourceFingerprint(name: string, description?: string | null) {
  return `${name.trim()}\u0000${(description ?? "").trim()}`;
}

function parseEntries(raw?: string | null): TranslationEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((entry): entry is TranslationEntry => Boolean(entry && typeof entry === "object")) : [];
  } catch {
    return [];
  }
}

function getStoredTranslation(entity: TranslationEntity, language: MenuLanguage) {
  const fingerprint = sourceFingerprint(entity.name, entity.description);
  return parseEntries(entity.translationsJson).find((entry) => entry.language === language && typeof entry.name === "string" && entry.name.trim() && (!entry.status || ["approved", "auto", "auto-approved"].includes(entry.status)) && (!entry.sourceFingerprint || entry.sourceFingerprint === fingerprint));
}

function extractText(raw: unknown) {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw.map((part) => typeof part === "string" ? part : part && typeof part === "object" && "text" in part && typeof part.text === "string" ? part.text : "").join("");
  if (raw && typeof raw === "object" && "text" in raw && typeof raw.text === "string") return raw.text;
  return "";
}

function parseGeneratedTranslations(raw: unknown): Array<{ entityType: MenuTranslationEntityType; entityId: number; name: string; description: string }> {
  const text = extractText(raw).replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  const start = Math.min(...[text.indexOf("{"), text.indexOf("[")].filter((value) => value >= 0));
  const end = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (!Number.isFinite(start) || start < 0 || end < start) throw new Error("Invalid translation response");
  const parsed = JSON.parse(text.slice(start, end + 1)) as unknown;
  const values = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" && "translations" in parsed && Array.isArray(parsed.translations) ? parsed.translations : [];
  return values.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const value = entry as Record<string, unknown>;
    const entityType = value.entityType;
    const entityId = Number(value.entityId);
    const name = typeof value.name === "string" ? value.name.trim().slice(0, MAX_NAME_LENGTH) : "";
    const description = typeof value.description === "string" ? value.description.trim().slice(0, MAX_DESCRIPTION_LENGTH) : "";
    if ((entityType !== "category" && entityType !== "item" && entityType !== "addon") || !Number.isInteger(entityId) || entityId <= 0 || !name) return [];
    return [{ entityType, entityId, name, description }];
  });
}

function getEntityTable(entityType: MenuTranslationEntityType) {
  return entityType === "category" ? menuCategories : entityType === "item" ? menuItems : menuItemAddons;
}

async function translateBatch(entities: TranslationEntity[], targetLanguage: MenuLanguage): Promise<Array<{ entityType: MenuTranslationEntityType; entityId: number; name: string; description: string }>> {
  const response = await invokeLLM({
    model: "gpt-5-mini",
    maxTokens: 4000,
    messages: [
      { role: "system", content: "You are a precise restaurant menu translator. Translate every entity into exactly the requested target language. Preserve dish names, brand names, ingredients, allergens, quantities, and meaning. Do not add prices, ingredients, health claims, or marketing claims. Return JSON only." },
      { role: "user", content: JSON.stringify({ targetLanguage, entities: entities.map((entity) => ({ entityType: entity.entityType, entityId: entity.id, sourceName: entity.name, sourceDescription: entity.description ?? "" })) }) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "public_menu_translations",
        strict: true,
        schema: {
          type: "object",
          properties: {
            translations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  entityType: { type: "string", enum: ["category", "item", "addon"] },
                  entityId: { type: "integer" },
                  name: { type: "string", minLength: 1, maxLength: MAX_NAME_LENGTH },
                  description: { type: "string", maxLength: MAX_DESCRIPTION_LENGTH },
                },
                required: ["entityType", "entityId", "name", "description"],
                additionalProperties: false,
              },
            },
          },
          required: ["translations"],
          additionalProperties: false,
        },
      },
    },
  });
  return parseGeneratedTranslations(response.choices?.[0]?.message?.content);
}

export async function resolvePublicMenuTranslations(input: { restaurantId: number; language: MenuLanguage; categories: TranslationEntity[]; items: TranslationEntity[]; addons: TranslationEntity[] }) {
  const db = await getDb();
  if (!db) return { translations: [] as PublicMenuTranslation[], generated: 0 };
  const allEntities = [...input.categories, ...input.items, ...input.addons];
  const missing = allEntities.filter((entity) => !getStoredTranslation(entity, input.language));
  if (!missing.length) return { translations: [] as PublicMenuTranslation[], generated: 0 };
  const translated: PublicMenuTranslation[] = [];
  for (let offset = 0; offset < missing.length; offset += MAX_BATCH_SIZE) {
    const batch = missing.slice(offset, offset + MAX_BATCH_SIZE);
    let generated: Array<{ entityType: MenuTranslationEntityType; entityId: number; name: string; description: string }> = [];
    try {
      generated = await translateBatch(batch, input.language);
    } catch {
      continue;
    }
    for (const result of generated) {
      const source = batch.find((entity) => entity.entityType === result.entityType && entity.id === result.entityId);
      if (!source || source.restaurantId !== input.restaurantId || !result.name.trim()) continue;
      const table = getEntityTable(result.entityType);
      const previous = parseEntries(source.translationsJson).filter((entry) => entry.language !== input.language || entry.sourceFingerprint !== sourceFingerprint(source.name, source.description));
      const entry: TranslationEntry = { language: input.language, name: result.name, description: result.description || null, confidence: 0.9, status: "auto-approved", automatic: true, sourceFingerprint: sourceFingerprint(source.name, source.description), updatedAt: new Date().toISOString() };
      await db.update(table).set({ translationsJson: JSON.stringify([...previous, entry]) }).where(and(eq(table.id, source.id), eq(table.restaurantId, input.restaurantId)));
      translated.push({ entityType: result.entityType, entityId: result.entityId, language: input.language, name: result.name, description: result.description || null, automatic: true });
    }
  }
  return { translations: translated, generated: translated.length };
}

export function resolveSupportedMenuLanguage(raw: string | null | undefined, requested?: string): MenuLanguage {
  const supported: MenuLanguage[] = (() => {
    try {
      const parsed: unknown = JSON.parse(raw ?? "[]");
      const values = Array.isArray(parsed) ? parsed.filter((value): value is MenuLanguage => typeof value === "string" && SUPPORTED_LANGUAGES.includes(value as MenuLanguage)) : [];
      return values.length ? values : ["ar", "en", "fr"] as MenuLanguage[];
    } catch {
      return ["ar", "en", "fr"] as MenuLanguage[];
    }
  })();
  return requested && supported.includes(requested as MenuLanguage) ? requested as MenuLanguage : supported[0] ?? "ar";
}
