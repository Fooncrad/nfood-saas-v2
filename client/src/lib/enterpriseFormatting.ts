export const SUPPORTED_LANGUAGES = ["ar", "en", "fr", "ur", "es", "de", "tr"] as const;

export type EnterpriseLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LOCALES: Record<EnterpriseLanguage, { label: string; nativeLabel: string; dir: "rtl" | "ltr"; locale: string }> = {
  ar: { label: "Arabic", nativeLabel: "العربية", dir: "rtl", locale: "ar-SA" },
  en: { label: "English", nativeLabel: "English", dir: "ltr", locale: "en-US" },
  fr: { label: "French", nativeLabel: "Français", dir: "ltr", locale: "fr-FR" },
  ur: { label: "Urdu", nativeLabel: "اردو", dir: "rtl", locale: "ur-PK" },
  es: { label: "Spanish", nativeLabel: "Español", dir: "ltr", locale: "es-ES" },
  de: { label: "German", nativeLabel: "Deutsch", dir: "ltr", locale: "de-DE" },
  tr: { label: "Turkish", nativeLabel: "Türkçe", dir: "ltr", locale: "tr-TR" },
};

export function isEnterpriseLanguage(value: unknown): value is EnterpriseLanguage {
  return typeof value === "string" && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export function integerValue(value: number | string | null | undefined, fallback = 0) {
  const parsed = typeof value === "string" ? Number(value.trim().replace(/,/g, "")) : Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

export function formatInteger(value: number | string | null | undefined, language: EnterpriseLanguage = "en") {
  const locale = LANGUAGE_LOCALES[language].locale;
  return integerValue(value).toLocaleString(`${locale}-u-nu-latn`, { maximumFractionDigits: 0 });
}

export function formatIntegerMoney(value: number | string | null | undefined, currency = "SAR", language: EnterpriseLanguage = "en") {
  return `${formatInteger(value, language)} ${currency}`;
}

const RAW_KEY_LABELS: Record<string, string> = {
  packagePlans: "Package plans",
  package_plans: "Package plans",
  featureDefinitions: "Feature definitions",
  feature_definitions: "Feature definitions",
};

export function sanitizeRawLabel(value: string, fallback?: string) {
  const source = value.trim();
  if (!source) return fallback ?? "";
  if (RAW_KEY_LABELS[source]) return RAW_KEY_LABELS[source];
  if (/^[A-Za-z][A-Za-z0-9_.-]{2,}$/.test(source) && /(?:Plans?|Features?|Definitions?|Settings?|Management?)/i.test(source)) {
    const readable = source.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_.-]+/g, " ").trim();
    return readable.replace(/\b\w/g, (character) => character.toUpperCase());
  }
  return source;
}
