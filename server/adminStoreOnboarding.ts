import { resolveStoreOnboardingPublication } from "./storeOnboardingPolicy";

export type AdminStoreOnboardingInput = {
  requestedActive: boolean;
  marketplaceSector?: { id: number; slug: string; isActive: boolean } | null;
};

/**
 * Admin store creation is an operational tenant action. Marketplace catalogue
 * state only decides whether the public storefront may be published.
 *
 * Keep this decision server-side so adminCreateStore cannot accidentally
 * re-introduce the legacy `sector must exist and be active` creation gate.
 */
export function resolveAdminStoreOnboarding(input: AdminStoreOnboardingInput) {
  const publication = resolveStoreOnboardingPublication({
    requestedActive: input.requestedActive,
    marketplaceSectorExists: Boolean(input.marketplaceSector),
    marketplaceSectorActive: Boolean(input.marketplaceSector?.isActive),
  });

  return {
    canCreateStore: publication.canCreateStore,
    isPublished: publication.publishStorefront,
    publicationReason: publication.publicationReason,
    marketplaceSectorId: input.marketplaceSector?.id ?? null,
  } as const;
}
