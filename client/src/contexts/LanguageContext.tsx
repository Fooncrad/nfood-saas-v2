import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "ar" | "en" | "fr";
export const LANGUAGE_STORAGE_KEY = "nfood-language";

export const languageMeta: Record<Language, { label: string; nativeLabel: string; dir: "rtl" | "ltr"; locale: string }> = {
  ar: { label: "Arabic", nativeLabel: "العربية", dir: "rtl", locale: "ar-SA" },
  en: { label: "English", nativeLabel: "English", dir: "ltr", locale: "en-US" },
  fr: { label: "French", nativeLabel: "Français", dir: "ltr", locale: "fr-FR" },
};

export const translations = {
  ar: { dashboard: "لوحة التحكم", overview: "نظرة عامة", platformAdmin: "إدارة المنصة", restaurant: "المطعم", branch: "الفرع", language: "اللغة", save: "حفظ", cancel: "إلغاء", signOut: "تسجيل الخروج", search: "بحث شامل", chooseLanguage: "اختر اللغة", languageSaved: "تم حفظ اللغة" },
  en: { dashboard: "Dashboard", overview: "Overview", platformAdmin: "Platform Admin", restaurant: "Restaurant", branch: "Branch", language: "Language", save: "Save", cancel: "Cancel", signOut: "Sign out", search: "Global search", chooseLanguage: "Choose language", languageSaved: "Language saved" },
  fr: { dashboard: "Tableau de bord", overview: "Vue d’ensemble", platformAdmin: "Administration", restaurant: "Restaurant", branch: "Succursale", language: "Langue", save: "Enregistrer", cancel: "Annuler", signOut: "Se déconnecter", search: "Recherche globale", chooseLanguage: "Choisir la langue", languageSaved: "Langue enregistrée" },
} as const;

type TranslationKey = keyof typeof translations.ar;
type LanguageContextValue = { language: Language; direction: "rtl" | "ltr"; locale: string; setLanguage: (language: Language) => void; t: (key: TranslationKey) => string; formatDate: (value: Date | string | number) => string; formatNumber: (value: number) => string };

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return "ar";
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "en" || stored === "fr" ? stored : "ar";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);
  const meta = languageMeta[language];
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = meta.dir;
    document.body.dir = meta.dir;
    document.body.dataset.language = language;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language, meta.dir]);
  const value = useMemo<LanguageContextValue>(() => ({
    language,
    direction: meta.dir,
    locale: meta.locale,
    setLanguage: (next) => setLanguageState(next),
    t: (key) => translations[language][key],
    formatDate: (input) => new Intl.DateTimeFormat(meta.locale, { dateStyle: "medium" }).format(new Date(input)),
    formatNumber: (input) => new Intl.NumberFormat(meta.locale).format(input),
  }), [language, meta.dir, meta.locale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
