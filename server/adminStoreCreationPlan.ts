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

/**
 * Pure creation plan shared by admin store onboarding.
 * Operational creation never depends on marketplace activation; publication does.
 * AR/EN/FR are always available while preserving the activity's selected primary language.
 */
export function buildAdminStoreCreationPlan(input: AdminStoreCreationPlanInput) {
  const onboarding = resolveAdminStoreOnboarding(input);
  const languages = Array.from(new Set([input.primaryLanguage.toLowerCase(), "ar", "en", "fr"]));
  const modules = input.sector === "restaurant" ? RESTAURANT_MODULES : STORE_MODULES;

  return {
    ...onboarding,
    languages,
    modules: [...modules],
  } as const;
}
