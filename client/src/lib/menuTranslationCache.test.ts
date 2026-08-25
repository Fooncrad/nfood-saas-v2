import { afterEach, describe, expect, it } from "vitest";
import { clearMenuTranslationCache, getMenuTranslationCacheKey, readMenuTranslation, saveMenuTranslationForSource } from "./menuTranslationCache";

type LocalStorageStub = { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void; removeItem: (key: string) => void };

function installStorage() {
  const values = new Map<string, string>();
  const storage: LocalStorageStub = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
  (globalThis as typeof globalThis & { window?: { localStorage: LocalStorageStub } }).window = { localStorage: storage };
  return storage;
}

afterEach(() => {
  clearMenuTranslationCache();
  delete (globalThis as typeof globalThis & { window?: unknown }).window;
});

describe("menu translation cache", () => {
  it("stores a translation by entity, language, and source fingerprint", () => {
    installStorage();
    saveMenuTranslationForSource("item", 42, "fr", "Berry Cheesecake", "Creamy cheesecake", "Cheesecake aux fruits rouges", "Gâteau crémeux");
    expect(getMenuTranslationCacheKey("item", 42, "fr")).toBe("item:42:fr");
    expect(readMenuTranslation("item", 42, "fr", "Berry Cheesecake", "Creamy cheesecake")).toEqual({ name: "Cheesecake aux fruits rouges", description: "Gâteau crémeux" });
  });

  it("does not reuse a translation after the source text changes", () => {
    installStorage();
    saveMenuTranslationForSource("category", 7, "en", "مشروبات", null, "Beverages");
    expect(readMenuTranslation("category", 7, "en", "مشروبات", null)?.name).toBe("Beverages");
    expect(readMenuTranslation("category", 7, "en", "حلويات", null)).toBeNull();
  });
});
