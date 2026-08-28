import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getTranslationPageNumbers, getTranslationPagination, getTranslationProgress } from "./TranslationReviewPanel";

const reviewPanelSource = readFileSync(resolve(process.cwd(), "client/src/components/TranslationReviewPanel.tsx"), "utf8");
const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const mobileDrawerSource = readFileSync(resolve(process.cwd(), "client/src/components/MobileNavigationDrawer.tsx"), "utf8");
const languageSwitcherSource = readFileSync(resolve(process.cwd(), "client/src/components/LanguageSwitcher.tsx"), "utf8");
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

  it("calculates page size, page boundaries, and clamps an out-of-range page", () => {
    expect(getTranslationPagination(120, 3, 50)).toEqual({ page: 3, pageSize: 50, pageCount: 3, startIndex: 100, endIndex: 120 });
    expect(getTranslationPagination(120, 99, 100)).toEqual({ page: 2, pageSize: 100, pageCount: 2, startIndex: 100, endIndex: 120 });
    expect(getTranslationPagination(250, 1, 999)).toEqual({ page: 1, pageSize: 50, pageCount: 5, startIndex: 0, endIndex: 50 });
    expect(getTranslationPagination(0, 0, 150)).toEqual({ page: 1, pageSize: 150, pageCount: 1, startIndex: 0, endIndex: 0 });
  });

  it("generates compact numbered navigation with boundary pages", () => {
    expect(getTranslationPageNumbers(5, 3)).toEqual([1, 2, 3, 4, 5]);
    expect(getTranslationPageNumbers(20, 10)).toEqual([1, 9, 10, 11, 20]);
    expect(getTranslationPageNumbers(20, 1)).toEqual([1, 2, 3, 4, 20]);
    expect(getTranslationPageNumbers(20, 20)).toEqual([1, 17, 18, 19, 20]);
  });

  it("renders numbered rows and selectable 50-to-200 page sizes", () => {
    expect(reviewPanelSource).toContain("TRANSLATION_PAGE_SIZES = [50, 100, 150, 200]");
    expect(reviewPanelSource).toContain("visibleEntities");
    expect(reviewPanelSource).toContain("aria-label=\"عدد السجلات في الصفحة\"");
    expect(reviewPanelSource).toContain("aria-label={`رقم الصف ${rowNumber}`}");
    expect(reviewPanelSource).toContain("aria-label=\"ترقيم قاموس اللغات\"");
    expect(reviewPanelSource).toContain("السابق");
    expect(reviewPanelSource).toContain("التالي");
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
    expect(homeSource).toContain("lg:hidden start-3");
  });

  it("shows a visible language-switch loading state", () => {
    expect(languageSource).toContain("isLanguageChanging");
    expect(languageSwitcherSource).toContain("LoaderCircle");
    expect(languageSwitcherSource).toContain('role="status"');
    expect(languageSwitcherSource).toContain('aria-busy={isLanguageChanging}');
  });

  it("animates the mobile drawer without blocking reduced-motion users", () => {
    expect(mobileDrawerSource).toContain("transition-transform duration-200");
    expect(mobileDrawerSource).toContain("motion-reduce:transition-none");
    expect(mobileDrawerSource).toContain("pointer-events-none");
  });

  it("scopes mutation translation work to added nodes and caches dictionary entries", () => {
    expect(languageSource).toContain("autoTranslationEntriesCache");
    expect(languageSource).toContain("mutation.addedNodes.forEach");
    expect(languageSource).toContain("applyLegacyUiTranslations(legacyTranslationLanguage, node)");
  });

  it("does not translate non-visual style or script nodes", () => {
    expect(languageSource).toContain('closest("style, script, template, noscript")');
    expect(languageSource).toContain("isNonVisualTranslationNode(textNode)");
  });

  it("uses the orange and deep teal clarity palette for dashboard surfaces", () => {
    expect(styleSource).toContain("--primary: oklch(0.39 0.09 190)");
    expect(styleSource).toContain(".nfood-dashboard-shell .nfood-unified-sidebar");
    expect(styleSource).toContain(".nfood-mobile-drawer");
  });
});
