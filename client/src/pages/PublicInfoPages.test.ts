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
      const business = content.plans.find((plan) => plan.name === (language === "ar" ? "أعمال" : "Business"));
      expect(business).toMatchObject({ price: "399" });
      expect(business?.items).toEqual(expect.arrayContaining(language === "ar" ? ["فروع متعددة", "توصيل وتسويق", "API وتكاملات"] : language === "fr" ? ["Plusieurs succursales", "Livraison et marketing", "API et intégrations"] : ["Multiple branches", "Delivery and marketing", "API and integrations"]));
      expect(content.featureGroups).toHaveLength(3);
      expect(content.steps).toHaveLength(4);
    }
  });
});
