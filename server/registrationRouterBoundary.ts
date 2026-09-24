import { TRPCError } from "@trpc/server";
import {
  resolveMerchantOnboarding,
  type RegistrationAccountPolicyInput,
  type RegistrationRejectReason,
  type RegistrationSectorPolicyInput,
} from "./registrationPolicy";

export type RegistrationRouterInput = RegistrationSectorPolicyInput & RegistrationAccountPolicyInput;

const REJECTION_MESSAGES: Record<RegistrationRejectReason, string> = {
  sign_in_required: "البريد مستخدم مسبقًا. سجّل الدخول بالحساب نفسه لإكمال إنشاء النشاط.",
  email_verification_required: "يجب تأكيد البريد الإلكتروني للحساب الحالي قبل إنشاء النشاط.",
  email_mismatch: "البريد لا يطابق الحساب المسجّل دخوله.",
};

/**
 * Router-facing boundary for merchant onboarding.
 *
 * Marketplace publication state is deliberately not an onboarding gate. Existing
 * email reuse is accepted only when registrationPolicy confirms that it belongs
 * to the same authenticated, verified NFOOD identity.
 */
export function requireMerchantOnboarding(input: RegistrationRouterInput) {
  const decision = resolveMerchantOnboarding(input);
  if (!decision.allowed) {
    throw new TRPCError({
      code: decision.reason === "sign_in_required" ? "CONFLICT" : "FORBIDDEN",
      message: REJECTION_MESSAGES[decision.reason],
    });
  }
  return decision;
}
