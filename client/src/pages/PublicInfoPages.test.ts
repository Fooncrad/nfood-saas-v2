import { describe, expect, it } from "vitest";
import { publicInfoCopy } from "./PublicInfoPages";

describe("public information pages", () => {
  it("provides localized pricing, features, and onboarding content", () => {
    for (const language of ["ar", "en", "fr"] as const) {
      const content = publicInfoCopy[language];
      expect(content.pricing).toBeTruthy();
      expect(content.features).toBeTruthy();
      expect(content.how).toBeTruthy();
      expect(content.plans).toHaveLength(3);
      expect(content.featureGroups).toHaveLength(3);
      expect(content.steps).toHaveLength(4);
    }
  });
});
