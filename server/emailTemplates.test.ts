import { describe, expect, it } from "vitest";
import { getDefaultEmailTemplates, renderEmailTemplate } from "./emailTemplates";

describe("email templates", () => {
  it("provides templates for core account and operational events", () => {
    const events = new Set(getDefaultEmailTemplates().map((template) => template.eventKey));
    expect(events).toEqual(new Set([
      "account.welcome",
      "account.password_reset",
      "account.otp",
      "order.received",
      "order.status",
      "reservation.accepted",
      "reservation.cancelled",
      "payment.receipt",
      "driver.assignment",
    ]));
  });

  it("escapes user-controlled values while rendering placeholders", () => {
    const rendered = renderEmailTemplate("مرحبًا {{name}} — {{resetUrl}}", { name: "<script>alert(1)</script>", resetUrl: "https://example.com/?a=1&b=2" });
    expect(rendered).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(rendered).toContain("https://example.com/?a=1&amp;b=2");
    expect(rendered).not.toContain("<script>");
  });
});
