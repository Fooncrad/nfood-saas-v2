export type RegistrationSectorPolicyInput = {
  sector: string;
  marketplaceSectorExists?: boolean;
  marketplaceSectorActive?: boolean;
};

/**
 * New tenant onboarding creates the business first; the optional public
 * marketplace catalogue must never be an account-creation prerequisite.
 * Catalogue activation remains a publication/discovery concern.
 */
export function canCreateTenantForSector(_input: RegistrationSectorPolicyInput): boolean {
  return true;
}

/** Canonical email comparison for existing-account recognition. */
export function normalizeRegistrationEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Existing accounts may only be linked by the registration flow when the
 * submitted email resolves to the already-authenticated user's own email.
 * This helper intentionally does not authenticate users or bypass verification.
 */
export function isSameRegistrationAccount(existingEmail: string, submittedEmail: string): boolean {
  return normalizeRegistrationEmail(existingEmail) === normalizeRegistrationEmail(submittedEmail);
}

export type RegistrationAccountDecision =
  | { action: "create" }
  | { action: "link"; userId: number }
  | { action: "reject"; reason: "sign_in_required" | "email_verification_required" | "email_mismatch" };

export type RegistrationAccountPolicyInput = {
  submittedEmail: string;
  existingUser?: { id: number; email: string | null; emailVerified: boolean } | null;
  authenticatedUser?: { id: number; email: string | null; emailVerified: boolean } | null;
};

/**
 * Decide whether merchant onboarding may create a fresh identity or reuse an
 * existing NFOOD identity. An existing email is never silently claimed: it can
 * only be linked to the same authenticated, verified user. This keeps account
 * recognition separate from authentication and prevents duplicate identities
 * without introducing an account-takeover path.
 */
export function resolveRegistrationAccount(input: RegistrationAccountPolicyInput): RegistrationAccountDecision {
  if (!input.existingUser) return { action: "create" };

  const authenticated = input.authenticatedUser;
  if (!authenticated) return { action: "reject", reason: "sign_in_required" };
  if (authenticated.id !== input.existingUser.id) return { action: "reject", reason: "email_mismatch" };
  if (!authenticated.email || !input.existingUser.email) return { action: "reject", reason: "email_mismatch" };
  if (!isSameRegistrationAccount(authenticated.email, input.submittedEmail) || !isSameRegistrationAccount(input.existingUser.email, input.submittedEmail)) {
    return { action: "reject", reason: "email_mismatch" };
  }
  if (!authenticated.emailVerified || !input.existingUser.emailVerified) {
    return { action: "reject", reason: "email_verification_required" };
  }

  return { action: "link", userId: input.existingUser.id };
}

export type MerchantOnboardingDecision =
  | { allowed: true; normalizedEmail: string; account: { action: "create" } | { action: "link"; userId: number } }
  | { allowed: false; normalizedEmail: string; reason: RegistrationAccountDecision extends { action: "reject"; reason: infer R } ? R : never };

/**
 * Single server-side decision for merchant onboarding. Tenant creation is
 * deliberately independent from marketplace publication state, while existing
 * email reuse remains bound to the same authenticated and verified identity.
 * Routers should consume this result before creating restaurant/store records.
 */
export function resolveMerchantOnboarding(input: RegistrationSectorPolicyInput & RegistrationAccountPolicyInput): MerchantOnboardingDecision {
  const normalizedEmail = normalizeRegistrationEmail(input.submittedEmail);
  if (!canCreateTenantForSector(input)) {
    // Kept as a defensive boundary if tenant policy ever gains a real platform restriction.
    return { allowed: false, normalizedEmail, reason: "email_mismatch" };
  }
  const account = resolveRegistrationAccount({
    submittedEmail: normalizedEmail,
    existingUser: input.existingUser,
    authenticatedUser: input.authenticatedUser,
  });
  if (account.action === "reject") return { allowed: false, normalizedEmail, reason: account.reason };
  return { allowed: true, normalizedEmail, account };
}
