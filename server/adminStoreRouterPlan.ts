import { PLAN_TIERS } from "../drizzle/schema";
import { buildAdminStorePersistencePlan } from "./adminStorePersistencePlan";

export type AdminCreateStoreRouterInput = {
  customerName: string;
  email: string;
  countryCode: string;
  city?: string | null;
  timezone: string;
  currencyCode: string;
  primaryLanguage: string;
  sector: string;
  plan: (typeof PLAN_TIERS)[number];
  taxId?: string;
  status: boolean;
};

export type MarketplaceSectorSnapshot = {
  id: number;
  slug: string;
  isActive: boolean;
} | null | undefined;

/**
 * Narrow adapter for marketplaceRouter.adminCreateStore.
 * Operational tenant creation is never gated by marketplace catalogue state;
 * the catalogue snapshot only controls public storefront publication.
 */
export function buildAdminStoreRouterPlan(
  input: AdminCreateStoreRouterInput,
  marketplaceSector: MarketplaceSectorSnapshot,
) {
  return buildAdminStorePersistencePlan({
    customerName: input.customerName,
    email: input.email,
    countryCode: input.countryCode,
    city: input.city,
    timezone: input.timezone,
    currencyCode: input.currencyCode,
    primaryLanguage: input.primaryLanguage,
    sector: input.sector,
    plan: input.plan,
    taxId: input.taxId,
    requestedActive: input.status,
    marketplaceSector,
  });
}
