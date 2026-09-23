import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearMerchantOnboardingDraft,
  emptyMerchantOnboardingDraft,
  readMerchantOnboardingDraft,
  type MerchantOnboardingDraft,
  writeMerchantOnboardingDraft,
} from "@/lib/merchantOnboardingDraft";

/**
 * Keeps merchant onboarding progress resumable without persisting credentials,
 * captcha answers, legal acceptance, tokens, or any other secret state.
 */
export function useMerchantOnboardingDraft() {
  const [draft, setDraft] = useState<MerchantOnboardingDraft>(() => {
    if (typeof window === "undefined") return emptyMerchantOnboardingDraft();
    return readMerchantOnboardingDraft(window.localStorage);
  });
  const hydrated = useRef(false);

  useEffect(() => {
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current || typeof window === "undefined") return;
    writeMerchantOnboardingDraft(window.localStorage, draft);
  }, [draft]);

  const patchDraft = useCallback((patch: Partial<MerchantOnboardingDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  const resetDraft = useCallback(() => {
    if (typeof window !== "undefined") clearMerchantOnboardingDraft(window.localStorage);
    setDraft(emptyMerchantOnboardingDraft());
  }, []);

  return { draft, setDraft, patchDraft, resetDraft };
}
