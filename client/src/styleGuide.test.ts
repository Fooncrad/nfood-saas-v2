import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("NFOOD visual style guide", () => {
  const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
  const html = readFileSync(resolve(process.cwd(), "client/index.html"), "utf8");

  it("defines the Plum & Amber semantic palette", () => {
    expect(css).toContain("--primary: oklch(0.33 0.11 313)");
    expect(css).toContain("--accent: oklch(0.70 0.17 45)");
    expect(css).toContain("--sidebar: oklch(0.24 0.07 310)");
    expect(css).toContain("--success: oklch(0.66 0.14 158)");
  });

  it("keeps dark mode aligned with the Plum & Amber identity", () => {
    expect(css).toContain("--primary: oklch(0.74 0.16 55)");
    expect(css).toContain("--sidebar: oklch(0.14 0.035 310)");
    expect(css).toContain(".dark body");
    expect(css).not.toContain("--primary: var(--color-blue-700)");
  });

  it("loads the Arabic product font and protects reduced-motion users", () => {
    expect(html).toContain("IBM+Plex+Sans+Arabic");
    expect(css).toContain('font-family: "IBM Plex Sans Arabic"');
    expect(css).toContain("prefers-reduced-motion: reduce");
  });
});
