export type CurrencyDefinition = {
  code: string;
  name: string;
  nameAr: string;
  symbol: string;
  decimals: number;
  symbolPosition: "before" | "after";
};

export type CountryDefinition = {
  code: string;
  name: string;
  nameAr: string;
  currencyCode: string;
  locale: string;
};

export const CURRENCIES: readonly CurrencyDefinition[] = [
  { code: "SAR", name: "Saudi Riyal", nameAr: "الريال السعودي", symbol: "ر.س", decimals: 2, symbolPosition: "after" },
  { code: "AED", name: "UAE Dirham", nameAr: "الدرهم الإماراتي", symbol: "د.إ", decimals: 2, symbolPosition: "after" },
  { code: "KWD", name: "Kuwaiti Dinar", nameAr: "الدينار الكويتي", symbol: "د.ك", decimals: 3, symbolPosition: "after" },
  { code: "QAR", name: "Qatari Riyal", nameAr: "الريال القطري", symbol: "ر.ق", decimals: 2, symbolPosition: "after" },
  { code: "BHD", name: "Bahraini Dinar", nameAr: "الدينار البحريني", symbol: "د.ب", decimals: 3, symbolPosition: "after" },
  { code: "OMR", name: "Omani Rial", nameAr: "الريال العماني", symbol: "ر.ع", decimals: 3, symbolPosition: "after" },
  { code: "JOD", name: "Jordanian Dinar", nameAr: "الدينار الأردني", symbol: "د.أ", decimals: 3, symbolPosition: "after" },
  { code: "EGP", name: "Egyptian Pound", nameAr: "الجنيه المصري", symbol: "ج.م", decimals: 2, symbolPosition: "after" },
  { code: "MAD", name: "Moroccan Dirham", nameAr: "الدرهم المغربي", symbol: "د.م", decimals: 2, symbolPosition: "after" },
  { code: "TRY", name: "Turkish Lira", nameAr: "الليرة التركية", symbol: "₺", decimals: 2, symbolPosition: "after" },
  { code: "USD", name: "US Dollar", nameAr: "الدولار الأمريكي", symbol: "$", decimals: 2, symbolPosition: "before" },
  { code: "EUR", name: "Euro", nameAr: "اليورو", symbol: "€", decimals: 2, symbolPosition: "before" },
  { code: "GBP", name: "British Pound", nameAr: "الجنيه الإسترليني", symbol: "£", decimals: 2, symbolPosition: "before" },
  { code: "CAD", name: "Canadian Dollar", nameAr: "الدولار الكندي", symbol: "CA$", decimals: 2, symbolPosition: "before" },
  { code: "AUD", name: "Australian Dollar", nameAr: "الدولار الأسترالي", symbol: "A$", decimals: 2, symbolPosition: "before" },
  { code: "INR", name: "Indian Rupee", nameAr: "الروبية الهندية", symbol: "₹", decimals: 2, symbolPosition: "before" },
  { code: "PKR", name: "Pakistani Rupee", nameAr: "الروبية الباكستانية", symbol: "₨", decimals: 2, symbolPosition: "after" },
];

export const COUNTRIES: readonly CountryDefinition[] = [
  { code: "SA", name: "Saudi Arabia", nameAr: "السعودية", currencyCode: "SAR", locale: "ar-SA" },
  { code: "AE", name: "United Arab Emirates", nameAr: "الإمارات العربية المتحدة", currencyCode: "AED", locale: "ar-AE" },
  { code: "KW", name: "Kuwait", nameAr: "الكويت", currencyCode: "KWD", locale: "ar-KW" },
  { code: "QA", name: "Qatar", nameAr: "قطر", currencyCode: "QAR", locale: "ar-QA" },
  { code: "BH", name: "Bahrain", nameAr: "البحرين", currencyCode: "BHD", locale: "ar-BH" },
  { code: "OM", name: "Oman", nameAr: "عُمان", currencyCode: "OMR", locale: "ar-OM" },
  { code: "JO", name: "Jordan", nameAr: "الأردن", currencyCode: "JOD", locale: "ar-JO" },
  { code: "EG", name: "Egypt", nameAr: "مصر", currencyCode: "EGP", locale: "ar-EG" },
  { code: "MA", name: "Morocco", nameAr: "المغرب", currencyCode: "MAD", locale: "ar-MA" },
  { code: "TR", name: "Türkiye", nameAr: "تركيا", currencyCode: "TRY", locale: "tr-TR" },
  { code: "US", name: "United States", nameAr: "الولايات المتحدة", currencyCode: "USD", locale: "en-US" },
  { code: "GB", name: "United Kingdom", nameAr: "المملكة المتحدة", currencyCode: "GBP", locale: "en-GB" },
  { code: "FR", name: "France", nameAr: "فرنسا", currencyCode: "EUR", locale: "fr-FR" },
  { code: "DE", name: "Germany", nameAr: "ألمانيا", currencyCode: "EUR", locale: "de-DE" },
  { code: "CA", name: "Canada", nameAr: "كندا", currencyCode: "CAD", locale: "en-CA" },
  { code: "AU", name: "Australia", nameAr: "أستراليا", currencyCode: "AUD", locale: "en-AU" },
  { code: "IN", name: "India", nameAr: "الهند", currencyCode: "INR", locale: "en-IN" },
  { code: "PK", name: "Pakistan", nameAr: "باكستان", currencyCode: "PKR", locale: "ur-PK" },
];

export function getCurrency(code: string) {
  return CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[0];
}

export function getCountry(code: string) {
  return COUNTRIES.find((country) => country.code === code) ?? COUNTRIES[0];
}

export function parseMoneyValue(value: number | string | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const raw = String(value ?? "").trim().replace(/,/g, "").replace(/[^0-9.-]/g, "");
  const unsigned = raw.replace(/(?!^)-/g, "");
  const segments = unsigned.split(".");
  const normalized = segments.length > 2
    ? segments.slice(1).every(segment => /^0+$/.test(segment))
      ? segments[0]
      : segments.join("")
    : unsigned;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatMoney(value: number | string | null | undefined, currencyCode = "SAR", locale = "ar-SA") {
  const currency = getCurrency(currencyCode);
  const normalizedLocale = locale.startsWith("ar") && !locale.includes("u-nu-") ? `${locale}-u-nu-latn` : locale;
  return new Intl.NumberFormat(normalizedLocale, { minimumFractionDigits: currency.decimals, maximumFractionDigits: currency.decimals }).format(parseMoneyValue(value));
}
