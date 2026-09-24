export type RegistrationAccountDecision =
  | { action: "create" }
  | { action: "link"; userId: number };

export type RegistrationOwnerPersistencePlan =
  | {
      mode: "create_identity";
      normalizedEmail: string;
      requiresEmailVerification: true;
      issueTemporaryPassword: true;
    }
  | {
      mode: "reuse_verified_identity";
      normalizedEmail: string;
      ownerUserId: number;
      requiresEmailVerification: false;
      issueTemporaryPassword: false;
    };

/**
 * Converts the verified registration-account decision into an explicit persistence plan.
 * Existing verified NFOOD identities are reused rather than duplicated in legacy testAccounts.
 */
export function buildRegistrationOwnerPersistencePlan(input: {
  normalizedEmail: string;
  account: RegistrationAccountDecision;
}): RegistrationOwnerPersistencePlan {
  if (input.account.action === "link") {
    return {
      mode: "reuse_verified_identity",
      normalizedEmail: input.normalizedEmail,
      ownerUserId: input.account.userId,
      requiresEmailVerification: false,
      issueTemporaryPassword: false,
    };
  }

  return {
    mode: "create_identity",
    normalizedEmail: input.normalizedEmail,
    requiresEmailVerification: true,
    issueTemporaryPassword: true,
  };
}
