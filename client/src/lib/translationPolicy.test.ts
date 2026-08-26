import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { autoTranslateText, UI_LANGUAGES } from "../contexts/LanguageContext";

const switcherSource = fs.readFileSync("client/src/components/LanguageSwitcher.tsx", "utf8");
const preferencesSource = fs.readFileSync("client/src/components/AccountPreferencesPanel.tsx", "utf8");
const settingsSource = fs.readFileSync("client/src/components/PlatformSettingsPanel.tsx", "utf8");
const appSource = fs.readFileSync("client/src/App.tsx", "utf8");

describe("central translation policy", () => {
  it("keeps the dashboard language picker limited to Arabic, English, and French", () => {
    expect(UI_LANGUAGES).toEqual(["ar", "en", "fr"]);
    expect(switcherSource).toContain("UI_LANGUAGES");
    expect(preferencesSource).toContain('["fr", "Français"]');
    expect(preferencesSource).not.toContain('["ur", "اردو"]');
    expect(preferencesSource).not.toContain('["es", "Español"]');
  });

  it("normalizes stale unsupported selections instead of restoring them", () => {
    expect(appSource).toContain("isUiLanguage(stored)");
    expect(appSource).not.toContain('stored === "ur"');
  });

  it("uses an English bridge for French when a recent UI phrase has no French entry", () => {
    expect(autoTranslateText("إدارة المنصة", "fr")).not.toMatch(/[\u0600-\u06FF]/);
    expect(autoTranslateText("مركز العمليات", "fr")).not.toMatch(/[\u0600-\u06FF]/);
    expect(autoTranslateText("إجمالي المبيعات من المؤشر الحالي", "fr")).not.toMatch(/[\u0600-\u06FF]/);
  });

  it("shows only the compact language and currency controls in platform settings", () => {
    expect(settingsSource).toContain("اللغات المثبتة في واجهة NFOOD");
    expect(settingsSource).toContain("العملة الافتراضية");
    expect(settingsSource).not.toContain('label="اللغات" value={draft.availableLanguages}');
  });
});
