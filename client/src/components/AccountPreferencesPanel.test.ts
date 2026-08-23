import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("account theme preset contract", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/components/AccountPreferencesPanel.tsx"), "utf8");

  it("uses the canonical public-menu preset identifiers", () => {
    expect(source).toContain('"olive-cream"');
    expect(source).toContain('"midnight-berry"');
    expect(source).toContain('"ocean-mint"');
    expect(source).toContain("normalizeThemePreset");
  });
});
