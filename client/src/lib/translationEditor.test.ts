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

  it("protects dictionary procedures with the translation editor guard", () => {
    const router = readFileSync("server/routers.ts", "utf8");
    expect(router).toContain("uiTranslationEntries: translationEditorProcedure");
    expect(router).toContain("saveUiTranslation: translationEditorProcedure");
  });
});
