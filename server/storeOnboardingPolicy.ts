export type StoreOnboardingPublicationInput = {
  requestedActive: boolean;
  marketplaceSectorExists?: boolean;
  marketplaceSectorActive?: boolean;
};

export type StoreOnboardingPublicationDecision = {
  canCreateStore: true;
  publishStorefront: boolean;
  publicationReason: "published" | "sector_unavailable" | "store_inactive";
};

/**
 * Creating a tenant/store is an operational concern and must not depend on the
 * optional public marketplace catalogue. Marketplace availability only controls
 * whether the storefront may be published for public discovery.
 */
export function resolveStoreOnboardingPublication(
  input: StoreOnboardingPublicationInput,
): StoreOnboardingPublicationDecision {
  if (!input.requestedActive) {
    return { canCreateStore: true, publishStorefront: false, publicationReason: "store_inactive" };
  }

  if (!input.marketplaceSectorExists || !input.marketplaceSectorActive) {
    return { canCreateStore: true, publishStorefront: false, publicationReason: "sector_unavailable" };
  }

  return { canCreateStore: true, publishStorefront: true, publicationReason: "published" };
}
