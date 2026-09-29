import { describe, expect, it } from "vitest";
import { getDefaultEmailTemplates, renderEmailTemplate } from "./emailTemplates";

describe("email templates", () => {
  it("provides every supported event in Arabic, English and French", () => {
    const templates = getDefaultEmailTemplates();
    const events = new Set(templates.map((template) => template.eventKey));
    expect(events.size).toBeGreaterThanOrEqual(20);
    for (const eventKey of events) {
      expect(templates.filter((template) => template.eventKey === eventKey).map((template) => template.locale).sort()).toEqual(["ar", "en", "fr"]);
    }
  });

  it("uses the correct direction and branded shell for every locale", () => {
    const templates = getDefaultEmailTemplates();
    expect(templates.find((x) => x.eventKey === "account.welcome" && x.locale === "ar")?.htmlBody).toContain('dir="rtl"');
    expect(templates.find((x) => x.eventKey === "account.welcome" && x.locale === "en")?.htmlBody).toContain('dir="ltr"');
    expect(templates.find((x) => x.eventKey === "account.welcome" && x.locale === "fr")?.htmlBody).toContain('dir="ltr"');
    expect(templates.every((x) => x.htmlBody.includes("FOONCARD · NFOOD"))).toBe(true);
  });

  it("escapes user-controlled values while rendering placeholders", () => {
    const rendered = renderEmailTemplate("مرحبًا {{name}} — {{resetUrl}}", { name: "<script>alert(1)</script>", resetUrl: "https://example.com/?a=1&b=2" });
    expect(rendered).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(rendered).toContain("https://example.com/?a=1&amp;b=2");
    expect(rendered).not.toContain("<script>");
  });
});
