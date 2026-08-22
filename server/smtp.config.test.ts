import { describe, expect, it } from "vitest";

describe("SMTP reservation email configuration", () => {
  it("has the Hostinger SMTP endpoint and sender configured", () => {
    expect(process.env.SMTP_HOST).toBe("smtp.hostinger.com");
    expect(process.env.SMTP_PORT).toBe("587");
    expect(process.env.SMTP_USER).toBe("info@fooncard.com");
    expect(process.env.SMTP_FROM_EMAIL).toBe("info@fooncard.com");
    expect(process.env.SMTP_PASSWORD).toBeTruthy();
  });
});

// This is intentionally a configuration smoke test: credentials are never printed or persisted in test output.
