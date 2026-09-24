import { normalizeRegistrationEmail } from "./registrationPolicy";

export type RegistrationUserRecord = {
  id: number;
  email: string | null;
  emailVerified: boolean;
};

export type AuthenticatedRegistrationIdentity = {
  id: number;
  email?: string | null;
  emailVerified?: boolean | null;
} | null | undefined;

/**
 * Produces the exact identity snapshots consumed by registrationPolicy.
 * This adapter is deliberately sector-agnostic: account recognition must be
 * identical for restaurants and every other activity type.
 */
export function buildRegistrationAccountLookup(input: {
  submittedEmail: string;
  existingUser?: RegistrationUserRecord | null;
  authenticatedUser?: AuthenticatedRegistrationIdentity;
}) {
  const normalizedEmail = normalizeRegistrationEmail(input.submittedEmail);
  const existingUser = input.existingUser
    ? {
        id: input.existingUser.id,
        email: input.existingUser.email ? normalizeRegistrationEmail(input.existingUser.email) : null,
        emailVerified: input.existingUser.emailVerified === true,
      }
    : null;
  const authenticatedUser = input.authenticatedUser
    ? {
        id: input.authenticatedUser.id,
        email: input.authenticatedUser.email ? normalizeRegistrationEmail(input.authenticatedUser.email) : null,
        emailVerified: input.authenticatedUser.emailVerified === true,
      }
    : null;

  return { normalizedEmail, existingUser, authenticatedUser } as const;
}
