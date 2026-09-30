import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../components/QROperationsPanel.tsx", import.meta.url), "utf8");

describe("QR operations localization", () => {
  it("localizes the panel in Arabic, English, and French", () => {
    expect(source).toContain("Stable store identifier");
    expect(source).toContain("Identifiant stable de l’établissement");
    expect(source).toContain("المعرّف الثابت للمتجر");
    expect(source).toContain('dir={locale === "ar" ? "rtl" : "ltr"}');
  });

  it("uses a tenant identifier instead of the untranslated restaurant placeholder", () => {
    expect(source).toContain('query.data?.fixedIdentifier?.trim() || String(restaurantId)');
    expect(source).not.toContain('?? "restaurant"');
    expect(source).not.toContain('nfood-menu-restaurant');
  });

  it("keeps QR labels free from stray currency markers", () => {
    expect(source).not.toMatch(/>\s*\$+\s*</);
    expect(source).not.toContain("$QR");
  });
});
