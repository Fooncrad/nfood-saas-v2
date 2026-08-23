import { describe, expect, it } from "vitest";
import { prepareDevTemplate } from "./_core/vite";

describe("prepareDevTemplate", () => {
  const template = '<script type="module" src="/src/main.tsx"></script><script defer src="%VITE_ANALYTICS_ENDPOINT%/umami" data-website-id="%VITE_ANALYTICS_WEBSITE_ID%"></script>';

  it("removes the analytics script when development analytics are not configured", () => {
    const result = prepareDevTemplate(template, "", "");
    expect(result).not.toContain("%VITE_");
    expect(result).not.toContain("/umami");
    expect(result).toContain("/src/main.tsx?v=");
  });

  it("replaces analytics placeholders when both values are configured", () => {
    const result = prepareDevTemplate(template, "https://analytics.example", "site-123");
    expect(result).toContain("https://analytics.example/umami");
    expect(result).toContain('data-website-id="site-123"');
    expect(result).not.toContain("%VITE_");
  });
});
