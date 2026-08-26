import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getTranslationProgress } from "./TranslationReviewPanel";

const reviewPanelSource = readFileSync(resolve(process.cwd(), "client/src/components/TranslationReviewPanel.tsx"), "utf8");
const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const mobileDrawerSource = readFileSync(resolve(process.cwd(), "client/src/components/MobileNavigationDrawer.tsx"), "utf8");
const languageSource = readFileSync(resolve(process.cwd(), "client/src/contexts/LanguageContext.tsx"), "utf8");
const styleSource = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

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

  it("defers translation catalog queries until the review center is opened", () => {
    expect(reviewPanelSource).toContain("enabled: isOpen");
    expect(reviewPanelSource).toContain("فتح مركز الترجمة");
    expect(reviewPanelSource).toContain("{isOpen && <CardContent");
  });

  it("keeps the mobile drawer compact and separate from the profile controls", () => {
    expect(homeSource).toContain("MobileNavigationDrawer");
    expect(mobileDrawerSource).toContain("visibleNavItems.slice(0, 6)");
    expect(mobileDrawerSource).toContain("nfood-mobile-drawer");
    expect(homeSource).toContain("lg:hidden left-3");
  });

  it("scopes mutation translation work to added nodes and caches dictionary entries", () => {
    expect(languageSource).toContain("autoTranslationEntriesCache");
    expect(languageSource).toContain("mutation.addedNodes.forEach");
    expect(languageSource).toContain("applyLegacyUiTranslations(legacyTranslationLanguage, node)");
  });

  it("uses the orange and deep teal clarity palette for dashboard surfaces", () => {
    expect(styleSource).toContain("--primary: oklch(0.39 0.09 190)");
    expect(styleSource).toContain(".nfood-dashboard-shell .nfood-unified-sidebar");
    expect(styleSource).toContain(".nfood-mobile-drawer");
  });
});
