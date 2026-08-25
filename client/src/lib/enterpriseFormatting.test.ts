import { describe, expect, it } from "vitest";
import { formatInteger, formatIntegerMoney, integerValue, isEnterpriseLanguage, sanitizeRawLabel } from "./enterpriseFormatting";

describe("enterprise formatting", () => {
  it("rounds numeric display values without changing internal strings", () => {
    expect(integerValue("299.50")).toBe(300);
    expect(integerValue("15.49")).toBe(15);
    expect(integerValue("not-a-number")).toBe(0);
  });

  it("renders western digits for every supported language", () => {
    for (const language of ["ar", "en", "fr", "ur", "es", "de", "tr"] as const) {
      expect(formatInteger(11000.45, language)).toMatch(/^[0-9,\.\s]+$/);
      expect(formatInteger(11000.45, language)).not.toMatch(/[٠-٩۰-۹]/);
    }
  });

  it("keeps money labels integer-only", () => {
    expect(formatIntegerMoney("11000.45", "SAR", "ar")).toContain("11,000");
    expect(formatIntegerMoney("11000.45", "SAR", "ar")).not.toContain(".");
  });

  it("validates enterprise locale identifiers", () => {
    expect(isEnterpriseLanguage("de")).toBe(true);
    expect(isEnterpriseLanguage("ja")).toBe(false);
  });

  it("sanitizes raw implementation keys before display", () => {
    expect(sanitizeRawLabel("packagePlans")).toBe("Package plans");
    expect(sanitizeRawLabel("feature_definitions")).toBe("Feature definitions");
    expect(sanitizeRawLabel("مطاعم نشطة")).toBe("مطاعم نشطة");
  });
});
