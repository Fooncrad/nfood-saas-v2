import { PLAN_TIERS } from "../drizzle/schema";
import { buildAdminStoreCreationPlan, type AdminStoreCreationPlanInput } from "./adminStoreCreationPlan";

export type AdminStorePersistenceInput = AdminStoreCreationPlanInput & {
  customerName: string;
  email: string;
  countryCode: string;
  city?: string | null;
  timezone: string;
  currencyCode: string;
  plan: (typeof PLAN_TIERS)[number];
  taxId?: string;
};

/**
 * Converts the verified onboarding decision into the exact persistence values
 * used by admin store creation. Keeping this pure prevents the router from
 * deriving publication, language, modules, or sector aliases independently.
 */
export function buildAdminStorePersistencePlan(input: AdminStorePersistenceInput) {
  const creation = buildAdminStoreCreationPlan(input);

  return {
    entity: {
      customerName: input.customerName.trim(),
      email: input.email.trim().toLowerCase(),
      countryCode: input.countryCode.trim().toUpperCase(),
      city: input.city?.trim() || null,
      timezone: input.timezone.trim(),
      currencyCode: input.currencyCode.trim().toUpperCase(),
      primaryLanguage: creation.primaryLanguage,
      sector: creation.sector,
      status: input.requestedActive,
      plan: input.plan,
      taxId: input.taxId?.trim() || "",
      licensingFee: "0.00",
    },
    storefront: {
      languagesJson: JSON.stringify(creation.languages),
      sectorConfigJson: JSON.stringify({ modules: creation.modules }),
      isPublished: creation.isPublished,
    },
    marketplaceSectorId: creation.marketplaceSectorId,
    publicationReason: creation.publicationReason,
  } as const;
}
