import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("menu AI import, translation, and content showcase", () => {
  it("keeps AI menu extraction as a reviewable PDF/image draft", () => {
    const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    expect(source).toContain("importMenuDraft");
    expect(source).toContain("application/pdf");
    expect(source).toContain("needsReview");
    expect(source).toContain("menu_import_draft");
    expect(source).toContain("applyMenuImportDraft");
    expect(readFileSync(resolve(process.cwd(), "client/src/components/MenuImportReviewPanel.tsx"), "utf8")).toContain("اعتماد ونشر المنيو");
  });

  it("keeps one bulk translation action for categories and items", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/HomeModules.tsx"), "utf8");
    expect(source).toContain("ترجمة القائمة كاملة");
    expect(source).toContain("getMissingTranslationTasks(remoteCategories.data ?? [], remoteMenu.data ?? [])");
    expect(source).toContain("translateMenuEntity.mutateAsync");
  });

  it("publishes only approved restaurant video listings and labels payment as unconfigured", () => {
    const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    const publicPage = readFileSync(resolve(process.cwd(), "client/src/pages/RestaurantPublic.tsx"), "utf8");
    const panel = readFileSync(resolve(process.cwd(), "client/src/components/MediaLibraryPanel.tsx"), "utf8");
    expect(db).toContain('eq(contentListings.status, "published")');
    expect(db).toContain("mediaShowcaseEnabled");
    expect(router).toContain("createContentListing");
    expect(router).toContain('paymentStatus: "not_configured"');
    expect(panel).toContain("تسعير وبيع المحتوى");
    expect(panel).toContain("contentCategory");
    expect(panel).toContain("watermarkEnabled");
    expect(publicPage).toContain("contentCategoryFilter");
    expect(publicPage).toContain("NFOOD · PREVIEW");
    expect(publicPage).toContain("paymentMethod");
    expect(publicPage).toContain("media-showcase");
    expect(publicPage).toContain("شراء المحتوى · قريبًا");
  });
});
