import { describe, expect, it } from "vitest";
import {
  clearMerchantOnboardingDraft,
  emptyMerchantOnboardingDraft,
  MERCHANT_ONBOARDING_STORAGE_KEY,
  normalizeMerchantOnboardingDraft,
  readMerchantOnboardingDraft,
  writeMerchantOnboardingDraft,
} from "./merchantOnboardingDraft";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  };
}

describe("merchant onboarding draft", () => {
  it("uses safe Saudi defaults when no draft exists", () => {
    expect(readMerchantOnboardingDraft(memoryStorage())).toEqual(emptyMerchantOnboardingDraft());
  });

  it("persists and resumes the current onboarding step and business fields", () => {
    const storage = memoryStorage();
    writeMerchantOnboardingDraft(storage, {
      step: 2,
      sector: "restaurant",
      business: "Nasser Cafe",
      email: "Owner@Example.com",
      phone: "0500000000",
      city: "Riyadh",
      countryCode: "sa",
      currencyCode: "sar",
    });
    expect(readMerchantOnboardingDraft(storage)).toEqual(expect.objectContaining({
      step: 2,
      business: "Nasser Cafe",
      email: "owner@example.com",
      countryCode: "SA",
      currencyCode: "SAR",
    }));
  });

  it("does not persist passwords, captcha answers, legal acceptance, or secrets", () => {
    const normalized = normalizeMerchantOnboardingDraft({
      step: 3,
      business: "Safe Store",
      password: "must-not-persist",
      captchaAnswer: "12",
      acceptedLegal: true,
      clientSecret: "must-not-persist",
    });
    expect(normalized).not.toHaveProperty("password");
    expect(normalized).not.toHaveProperty("captchaAnswer");
    expect(normalized).not.toHaveProperty("acceptedLegal");
    expect(normalized).not.toHaveProperty("clientSecret");
  });

  it("recovers from malformed storage and can be cleared after successful completion", () => {
    const storage = memoryStorage();
    storage.setItem(MERCHANT_ONBOARDING_STORAGE_KEY, "{bad-json");
    expect(readMerchantOnboardingDraft(storage)).toEqual(emptyMerchantOnboardingDraft());
    writeMerchantOnboardingDraft(storage, { ...emptyMerchantOnboardingDraft(), business: "Store" });
    clearMerchantOnboardingDraft(storage);
    expect(storage.getItem(MERCHANT_ONBOARDING_STORAGE_KEY)).toBeNull();
  });
});
