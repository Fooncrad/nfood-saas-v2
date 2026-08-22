import { describe, expect, it } from "vitest";
import { detectMenuSourceLanguage } from "./translationSource";

describe("detectMenuSourceLanguage", () => {
  it("detects Arabic menu names", () => expect(detectMenuSourceLanguage("برجر كلاسيك")).toBe("ar"));
  it("detects French menu names with accents", () => expect(detectMenuSourceLanguage("Crème brûlée")).toBe("fr"));
  it("uses English for Latin text without French markers", () => expect(detectMenuSourceLanguage("Classic Burger")).toBe("en"));
});
