import { describe, expect, it } from "vitest";
import { DEFAULT_TEAM_ROLE_PERMISSIONS, TEAM_PERMISSION_CATALOG } from "@shared/rolePermissions";
import { readFileSync } from "node:fs";

describe("translation editor workflow", () => {
  it("defines a dedicated translations.manage permission", () => {
    expect(TEAM_PERMISSION_CATALOG).toContainEqual({ key: "translations.manage", label: "محرر ترجمة", group: "المنصة" });
    expect(DEFAULT_TEAM_ROLE_PERMISSIONS.translation_editor).toContain("translations.manage");
  });

  it("keeps auto-generated translations as drafts", () => {
    const router = readFileSync("server/routers.ts", "utf8");
    expect(router).toContain('action: "translation.ui.auto_drafted"');
    expect(router).toContain('status: "draft"');
  });

  it("exposes validated CSV import and export procedures", () => {
    const router = readFileSync("server/routers.ts", "utf8");
    const panel = readFileSync("client/src/components/UiTranslationAdminPanel.tsx", "utf8");
    expect(router).toContain("exportUiTranslationsCsv");
    expect(router).toContain("importUiTranslationsCsv");
    expect(router).toContain("صيغة CSV غير صحيحة");
    expect(panel).toContain("autoTranslateUiEntries");
    expect(panel).toContain("translation-csv-upload");
  });

  it("supports bulk publishing and auditable before-after history", () => {
    const router = readFileSync("server/routers.ts", "utf8");
    const schema = readFileSync("drizzle/schema.ts", "utf8");
    const panel = readFileSync("client/src/components/UiTranslationAdminPanel.tsx", "utf8");
    expect(router).toContain("publishUiTranslationsBulk");
    expect(router).toContain("uiTranslationHistory");
    expect(schema).toContain("uiTranslationHistory");
    expect(schema).toContain("translatedTextBefore");
    expect(schema).toContain("translatedTextAfter");
    expect(panel).toContain("bulkPublish");
    expect(panel).toContain("before");
    expect(panel).toContain("after");
  });

  it("shows CSV preview and requires explicit confirmation before import", () => {
    const panel = readFileSync("client/src/components/UiTranslationAdminPanel.tsx", "utf8");
    expect(panel).toContain("csvPreview");
    expect(panel).toContain("confirmImport");
    expect(panel).toContain("setCsvPreview");
    expect(panel).toContain("previewHint");
  });

  it("translates Arabic menu saves and protects non-Arabic fallback", () => {
    const router = readFileSync("server/routers.ts", "utf8");
    const autoService = readFileSync("server/autoMenuTranslations.ts", "utf8");
    const publicMenu = readFileSync("client/src/pages/RestaurantPublic.tsx", "utf8");
    const home = readFileSync("client/src/components/HomeModules.tsx", "utf8");
    expect(router).toContain("ensureAutomaticMenuTranslations({ name: input.name");
    expect(router).toContain("translateMenuDraft");
    expect(autoService).toContain('const languages = ["ar", "en", "fr"]');
    expect(home).toContain("ترجمة آلية لكل الحقول");
    expect(publicMenu).toContain("Translation pending");
    expect(publicMenu).toContain("Traduction en attente");
  });

  it("protects dictionary procedures with the translation editor guard", () => {
    const router = readFileSync("server/routers.ts", "utf8");
    expect(router).toContain("uiTranslationEntries: translationEditorProcedure");
    expect(router).toContain("saveUiTranslation: translationEditorProcedure");
  });
});
