import { describe, expect, it } from "vitest";
import { resolveSupportedMenuLanguage } from "./menuTranslation";

describe("resolveSupportedMenuLanguage", () => {
  it("accepts a requested language enabled by the restaurant", () => {
    expect(resolveSupportedMenuLanguage('["ar","en","fr"]', "fr")).toBe("fr");
  });

  it("falls back to the restaurant default when the request is not enabled", () => {
    expect(resolveSupportedMenuLanguage('["ar","fr"]', "en")).toBe("ar");
  });

  it("ignores malformed language settings without returning an unsupported locale", () => {
    expect(resolveSupportedMenuLanguage("not-json", "ur")).toBe("ar");
  });
});
