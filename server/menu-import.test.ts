import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("menu import and bulk translation contract", () => {
  it("accepts PDF/image extraction inputs and returns a reviewable draft contract", () => {
    const source = readFileSync(
      resolve(process.cwd(), "server/routers.ts"),
      "utf8"
    );
    expect(source).toContain("importMenuDraft");
    expect(source).toContain("application/pdf");
    expect(source).toContain("menu_import_draft");
    expect(source).toContain("needsReview");
    expect(source).toContain("sourceUrl: stored.url");
  });

  it("keeps translation as a single bulk action over missing languages", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/components/HomeModules.tsx"),
      "utf8"
    );
    expect(source).toContain("ترجمة القائمة كاملة");
    expect(source).toContain("getMissingTranslationTasks(");
    expect(source).toContain("remoteCategories.data");
    expect(source).toContain("remoteMenu.data");
    expect(source).toContain("translateMenuEntity.mutateAsync");
    expect(source).toContain("كمسودات للمراجعة");
  });
});
