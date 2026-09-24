import { buildRegistrationAccountLookup, type AuthenticatedRegistrationIdentity, type RegistrationUserRecord } from "./registrationAccountLookup";
import { requireMerchantOnboarding } from "./registrationRouterBoundary";

export type RegistrationRuntimePlanInput = {
  sector: string;
  submittedEmail: string;
  existingUser?: RegistrationUserRecord | null;
  authenticatedUser?: AuthenticatedRegistrationIdentity;
  marketplaceSectorExists?: boolean;
  marketplaceSectorActive?: boolean;
};

/**
 * Single runtime entry point for merchant registration identity decisions.
 * Operational account/store creation is sector-agnostic and never depends on
 * marketplace catalogue activation. Existing emails may only be linked when
 * they resolve to the same authenticated, verified NFOOD identity.
 */
export function buildRegistrationRuntimePlan(input: RegistrationRuntimePlanInput) {
  const account = buildRegistrationAccountLookup({
    submittedEmail: input.submittedEmail,
    existingUser: input.existingUser,
    authenticatedUser: input.authenticatedUser,
  });

  const decision = requireMerchantOnboarding({
    sector: input.sector,
    marketplaceSectorExists: input.marketplaceSectorExists === true,
    marketplaceSectorActive: input.marketplaceSectorActive === true,
    submittedEmail: account.normalizedEmail,
    existingUser: account.existingUser,
    authenticatedUser: account.authenticatedUser,
  });

  return {
    normalizedEmail: account.normalizedEmail,
    account: decision.account,
    sector: input.sector,
  } as const;
}
