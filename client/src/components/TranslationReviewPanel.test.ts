import { describe, expect, it } from "vitest";
import { getTranslationProgress } from "./TranslationReviewPanel";

describe("TranslationReviewPanel progress", () => {
  it("counts approved and legacy translations as complete but excludes drafts", () => {
    const entities = [
      { translations: [{ language: "ar", name: "عربي", status: "approved" as const }, { language: "en", name: "English", status: "draft" as const }] },
      { translations: [{ language: "ar", name: "عربي" }] },
    ];
    expect(getTranslationProgress(entities, "ar")).toEqual({ total: 2, complete: 2, percent: 100 });
    expect(getTranslationProgress(entities, "en")).toEqual({ total: 2, complete: 0, percent: 0 });
  });

  it("returns zero progress for an empty catalog", () => {
    expect(getTranslationProgress([], "fr")).toEqual({ total: 0, complete: 0, percent: 0 });
  });
});
