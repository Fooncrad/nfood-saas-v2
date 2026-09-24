import { describe, expect, it } from "vitest";

function safeReturnTo(value: string | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\r\n]/.test(value)) return null;
  try {
    const parsed = new URL(value, "https://nfood.local");
    if (parsed.origin !== "https://nfood.local") return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch { return null; }
}

describe("Google OAuth safe return routing", () => {
  it("keeps internal customer, creator and business paths", () => {
    expect(safeReturnTo("/store/biz_123?tab=menu")).toBe("/store/biz_123?tab=menu");
    expect(safeReturnTo("/customer-studio")).toBe("/customer-studio");
    expect(safeReturnTo("/restaurant/dashboard")).toBe("/restaurant/dashboard");
  });
  it("rejects protocol-relative, external and malformed redirect targets", () => {
    expect(safeReturnTo("//evil.example")).toBeNull();
    expect(safeReturnTo("https://evil.example")).toBeNull();
    expect(safeReturnTo("/\\evil.example")).toBeNull();
  });
});
