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
 * deriving publication, language, modules, sector aliases, or branch defaults independently.
 */
export function buildAdminStorePersistencePlan(input: AdminStorePersistenceInput) {
  const creation = buildAdminStoreCreationPlan(input);
  const customerName = input.customerName.trim();
  const city = input.city?.trim() || null;
  const timezone = input.timezone.trim();
  const currencyCode = input.currencyCode.trim().toUpperCase();

  return {
    entity: {
      customerName,
      email: input.email.trim().toLowerCase(),
      countryCode: input.countryCode.trim().toUpperCase(),
      city,
      timezone,
      currencyCode,
      primaryLanguage: creation.primaryLanguage,
      sector: creation.sector,
      status: input.requestedActive,
      plan: input.plan,
      taxId: input.taxId?.trim() || "",
      licensingFee: "0.00",
    },
    primaryBranch: {
      name: customerName,
      city,
      timezone,
      currencyCode,
      isActive: input.requestedActive,
      isPrimary: true,
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
