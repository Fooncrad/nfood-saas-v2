import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

describe("translation management contracts", () => {
  it("protects glossary terms and exposes tenant-scoped procedures", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("translationGlossary");
    expect(router).toContain("upsertTranslationGlossary");
    expect(router).toContain("assertRestaurantAccess(ctx, input.restaurantId)");
    expect(router).toContain("glossaryEntries.filter");
  });

  it("supports batch progress and manual review for categories, items, and addons", () => {
    const modules = read("client/src/components/HomeModules.tsx");
    const review = read("client/src/components/TranslationReviewPanel.tsx");
    expect(modules).toContain("bulkTranslation.completed");
    expect(modules).toContain("TranslationGlossaryPanel");
    expect(review).toContain('type: "category" | "item" | "addon"');
    expect(review).toContain("حفظ واعتماد يدوي");
    expect(review).toContain("updateAddon");
  });
});
