import { describe, expect, it } from "vitest";
import { normalizeOptionalUrl } from "./optionalUrl";

describe("normalizeOptionalUrl", () => {
  it("keeps absolute http(s) URLs", () => {
    expect(normalizeOptionalUrl(" https://cdn.example.com/logo.png ")).toBe("https://cdn.example.com/logo.png");
  });

  it("keeps same-origin storage paths", () => {
    expect(normalizeOptionalUrl("/manus-storage/restaurants/logo.png")).toBe("/manus-storage/restaurants/logo.png");
  });

  it("clears empty and legacy placeholder values", () => {
    expect(normalizeOptionalUrl("")).toBe("");
    expect(normalizeOptionalUrl("undefined")).toBe("");
    expect(normalizeOptionalUrl(null)).toBe("");
  });

  it("clears malformed and unsafe protocols", () => {
    expect(normalizeOptionalUrl("not-a-url")).toBe("");
    expect(normalizeOptionalUrl("javascript:alert(1)")).toBe("");
    expect(normalizeOptionalUrl("//cdn.example.com/logo.png")).toBe("");
  });
});
