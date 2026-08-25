export type MenuLanguage = "ar" | "en" | "fr" | "ur" | "es" | "de" | "tr";

export type CachedMenuTranslation = {
  language: MenuLanguage;
  name: string;
  description?: string | null;
  sourceFingerprint: string;
  savedAt: number;
};

const CACHE_KEY = "nfood-menu-translation-cache-v1";
const MAX_ENTRIES = 500;

function fingerprint(name: string, description?: string | null) {
  return `${name.trim()}\u0000${(description ?? "").trim()}`;
}

function readCache(): Record<string, CachedMenuTranslation> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CACHE_KEY) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, CachedMenuTranslation> : {};
  } catch {
    return {};
  }
}

function writeCache(cache: Record<string, CachedMenuTranslation>) {
  if (typeof window === "undefined") return;
  try {
    const entries = Object.entries(cache).sort(([, left], [, right]) => right.savedAt - left.savedAt).slice(0, MAX_ENTRIES);
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // A full or disabled localStorage must never block the public menu.
  }
}

export function getMenuTranslationCacheKey(entityType: "category" | "item" | "addon", entityId: number, language: MenuLanguage) {
  return `${entityType}:${entityId}:${language}`;
}

export function readMenuTranslation(entityType: "category" | "item" | "addon", entityId: number, language: MenuLanguage, name: string, description?: string | null) {
  const entry = readCache()[getMenuTranslationCacheKey(entityType, entityId, language)];
  if (!entry || entry.language !== language || entry.sourceFingerprint !== fingerprint(name, description) || !entry.name.trim()) return null;
  return { name: entry.name, description: entry.description ?? description };
}

export function saveMenuTranslationForSource(entityType: "category" | "item" | "addon", entityId: number, language: MenuLanguage, sourceName: string, sourceDescription: string | null | undefined, translatedName: string, translatedDescription?: string | null) {
  const cache = readCache();
  cache[getMenuTranslationCacheKey(entityType, entityId, language)] = {
    language,
    name: translatedName.trim(),
    description: translatedDescription ?? sourceDescription ?? null,
    sourceFingerprint: fingerprint(sourceName, sourceDescription),
    savedAt: Date.now(),
  };
  writeCache(cache);
}

export function clearMenuTranslationCache() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CACHE_KEY);
}

export const menuTranslationCacheKey = CACHE_KEY;
