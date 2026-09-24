import { resolveAdminStoreOnboarding, type AdminStoreOnboardingInput } from "./adminStoreOnboarding";

export type AdminStoreCreationPlanInput = AdminStoreOnboardingInput & {
  primaryLanguage: string;
  sector: string;
};

const RESTAURANT_MODULES = [
  "catalog",
  "orders",
  "reservations",
  "restaurant_tables",
  "kitchen",
  "pos",
  "invoicing",
  "inventory",
] as const;

const STORE_MODULES = ["catalog", "orders", "pos", "invoicing", "inventory"] as const;

const SECTOR_ALIASES: Record<string, string> = {
  restaurants: "restaurant",
  cars: "automotive",
  "real_estate": "real-estate",
};

export function normalizeActivitySector(value: string) {
  const normalized = value.trim().toLowerCase();
  return SECTOR_ALIASES[normalized] ?? normalized;
}

export function normalizeActivityLanguage(value: string) {
  const normalized = value.trim().toLowerCase().split("-")[0];
  return normalized === "ar" || normalized === "en" || normalized === "fr" ? normalized : "ar";
}

/**
 * Pure creation plan shared by admin store onboarding.
 * Operational creation never depends on marketplace activation; publication does.
 * AR/EN/FR are always available while preserving a supported selected primary language.
 * Legacy sector aliases are canonicalized so every entry path gets the same operating modules.
 */
export function buildAdminStoreCreationPlan(input: AdminStoreCreationPlanInput) {
  const onboarding = resolveAdminStoreOnboarding(input);
  const sector = normalizeActivitySector(input.sector);
  const primaryLanguage = normalizeActivityLanguage(input.primaryLanguage);
  const languages = Array.from(new Set([primaryLanguage, "ar", "en", "fr"]));
  const modules = sector === "restaurant" ? RESTAURANT_MODULES : STORE_MODULES;

  return {
    ...onboarding,
    sector,
    primaryLanguage,
    languages,
    modules: [...modules],
  } as const;
}
