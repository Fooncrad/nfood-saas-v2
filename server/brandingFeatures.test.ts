import { describe, expect, it } from "vitest";
import { BRANDING_FEATURES, isBrandingFeatureAvailable } from "@shared/brandingFeatures";

describe("attachment branding feature catalog", () => {
  it("keeps the requested plan-gated branding keys", () => {
    expect(BRANDING_FEATURES.map((feature) => feature.key)).toEqual(expect.arrayContaining([
      "branding.logo",
      "branding.colors",
      "branding.dark_mode",
      "branding.custom_font",
      "branding.menu_theme",
      "branding.remove_nfood",
      "branding.custom_domain",
      "branding.white_label",
    ]));
  });

  it("does not grant enterprise-only branding to Starter", () => {
    expect(isBrandingFeatureAvailable("branding.white_label", "Starter")).toBe(false);
    expect(isBrandingFeatureAvailable("branding.white_label", "Enterprise")).toBe(true);
    expect(isBrandingFeatureAvailable("branding.dark_mode", "Starter")).toBe(true);
  });
});
