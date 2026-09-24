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
