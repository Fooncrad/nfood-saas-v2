import { useEffect } from "react";
import { isUiLanguage, refreshLegacyUiTranslations, setDatabaseUiTranslations, useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

export function DatabaseTranslationBridge() {
  const { language } = useLanguage();
  const locale = isUiLanguage(language) ? language : "en";
  const query = trpc.publicUiTranslations.useQuery({ targetLanguage: locale }, { staleTime: 60_000, refetchOnWindowFocus: false });
  useEffect(() => {
    if (!query.data) return;
    setDatabaseUiTranslations(query.data);
    refreshLegacyUiTranslations(language);
  }, [language, query.data]);
  return null;
}
