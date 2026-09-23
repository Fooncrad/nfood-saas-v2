export type MerchantOnboardingDraft = {
  step: 1 | 2 | 3;
  sector: string;
  business: string;
  email: string;
  phone: string;
  city: string;
  countryCode: string;
  currencyCode: string;
};

const STORAGE_KEY = "nfood:merchant-onboarding:v1";
const MAX_TEXT = 191;

const clean = (value: unknown, fallback = "") =>
  typeof value === "string" ? value.trim().slice(0, MAX_TEXT) : fallback;

export const emptyMerchantOnboardingDraft = (): MerchantOnboardingDraft => ({
  step: 1,
  sector: "restaurant",
  business: "",
  email: "",
  phone: "",
  city: "",
  countryCode: "SA",
  currencyCode: "SAR",
});

export function normalizeMerchantOnboardingDraft(value: unknown): MerchantOnboardingDraft {
  const fallback = emptyMerchantOnboardingDraft();
  if (!value || typeof value !== "object") return fallback;
  const input = value as Record<string, unknown>;
  const numericStep = Number(input.step);
  return {
    step: numericStep === 2 || numericStep === 3 ? numericStep : 1,
    sector: clean(input.sector, fallback.sector) || fallback.sector,
    business: clean(input.business),
    email: clean(input.email).toLowerCase(),
    phone: clean(input.phone),
    city: clean(input.city),
    countryCode: clean(input.countryCode, fallback.countryCode).toUpperCase() || fallback.countryCode,
    currencyCode: clean(input.currencyCode, fallback.currencyCode).toUpperCase() || fallback.currencyCode,
  };
}

export function readMerchantOnboardingDraft(storage: Pick<Storage, "getItem"> | null | undefined): MerchantOnboardingDraft {
  if (!storage) return emptyMerchantOnboardingDraft();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? normalizeMerchantOnboardingDraft(JSON.parse(raw)) : emptyMerchantOnboardingDraft();
  } catch {
    return emptyMerchantOnboardingDraft();
  }
}

export function writeMerchantOnboardingDraft(storage: Pick<Storage, "setItem"> | null | undefined, draft: MerchantOnboardingDraft) {
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(normalizeMerchantOnboardingDraft(draft)));
}

export function clearMerchantOnboardingDraft(storage: Pick<Storage, "removeItem"> | null | undefined) {
  storage?.removeItem(STORAGE_KEY);
}

export { STORAGE_KEY as MERCHANT_ONBOARDING_STORAGE_KEY };
