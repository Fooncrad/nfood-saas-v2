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
  { code: "DZD", name: "Algerian Dinar", nameAr: "الدينار الجزائري", symbol: "دج", decimals: 2, symbolPosition: "after" },
  { code: "AOA", name: "Angolan Kwanza", nameAr: "الكوانزا الأنغولي", symbol: "Kz", decimals: 2, symbolPosition: "after" },
  { code: "BWP", name: "Botswana Pula", nameAr: "البولا البوتسواني", symbol: "P", decimals: 2, symbolPosition: "after" },
  { code: "BIF", name: "Burundian Franc", nameAr: "الفرنك البوروندي", symbol: "FBu", decimals: 0, symbolPosition: "after" },
  { code: "CVE", name: "Cape Verdean Escudo", nameAr: "الإسكودو الرأس أخضري", symbol: "$", decimals: 2, symbolPosition: "after" },
  { code: "XAF", name: "Central African CFA Franc", nameAr: "فرنك وسط أفريقيا", symbol: "FCFA", decimals: 0, symbolPosition: "after" },
  { code: "XOF", name: "West African CFA Franc", nameAr: "فرنك غرب أفريقيا", symbol: "F CFA", decimals: 0, symbolPosition: "after" },
  { code: "KMF", name: "Comorian Franc", nameAr: "الفرنك القمري", symbol: "CF", decimals: 0, symbolPosition: "after" },
  { code: "CDF", name: "Congolese Franc", nameAr: "الفرنك الكونغولي", symbol: "FC", decimals: 2, symbolPosition: "after" },
  { code: "DJF", name: "Djiboutian Franc", nameAr: "الفرنك الجيبوتي", symbol: "Fdj", decimals: 0, symbolPosition: "after" },
  { code: "ERN", name: "Eritrean Nakfa", nameAr: "الناكفا الإريترية", symbol: "Nfk", decimals: 2, symbolPosition: "after" },
  { code: "SZL", name: "Eswatini Lilangeni", nameAr: "الليلانجيني الإسواتيني", symbol: "E", decimals: 2, symbolPosition: "after" },
  { code: "ETB", name: "Ethiopian Birr", nameAr: "البِر الإثيوبي", symbol: "Br", decimals: 2, symbolPosition: "after" },
  { code: "GMD", name: "Gambian Dalasi", nameAr: "الدالاسي الغامبي", symbol: "D", decimals: 2, symbolPosition: "after" },
  { code: "GHS", name: "Ghanaian Cedi", nameAr: "السيدي الغاني", symbol: "GH₵", decimals: 2, symbolPosition: "after" },
  { code: "GNF", name: "Guinean Franc", nameAr: "الفرنك الغيني", symbol: "FG", decimals: 0, symbolPosition: "after" },
  { code: "KES", name: "Kenyan Shilling", nameAr: "الشلن الكيني", symbol: "KSh", decimals: 2, symbolPosition: "after" },
  { code: "LSL", name: "Lesotho Loti", nameAr: "اللوتي الليسوتي", symbol: "L", decimals: 2, symbolPosition: "after" },
  { code: "LRD", name: "Liberian Dollar", nameAr: "الدولار الليبيري", symbol: "$", decimals: 2, symbolPosition: "after" },
  { code: "LYD", name: "Libyan Dinar", nameAr: "الدينار الليبي", symbol: "ل.د", decimals: 3, symbolPosition: "after" },
  { code: "MGA", name: "Malagasy Ariary", nameAr: "الأرياري الملغاشي", symbol: "Ar", decimals: 2, symbolPosition: "after" },
  { code: "MWK", name: "Malawian Kwacha", nameAr: "الكواشا الملاوي", symbol: "MK", decimals: 2, symbolPosition: "after" },
  { code: "MRU", name: "Mauritanian Ouguiya", nameAr: "الأوقية الموريتانية", symbol: "UM", decimals: 2, symbolPosition: "after" },
  { code: "MUR", name: "Mauritian Rupee", nameAr: "الروبية الموريشية", symbol: "₨", decimals: 2, symbolPosition: "after" },
  { code: "MAD", name: "Moroccan Dirham", nameAr: "الدرهم المغربي", symbol: "د.م", decimals: 2, symbolPosition: "after" },
  { code: "MZN", name: "Mozambican Metical", nameAr: "المتكال الموزمبيقي", symbol: "MT", decimals: 2, symbolPosition: "after" },
  { code: "NAD", name: "Namibian Dollar", nameAr: "الدولار الناميبي", symbol: "$", decimals: 2, symbolPosition: "after" },
  { code: "NGN", name: "Nigerian Naira", nameAr: "النايرا النيجيرية", symbol: "₦", decimals: 2, symbolPosition: "after" },
  { code: "RWF", name: "Rwandan Franc", nameAr: "الفرنك الرواندي", symbol: "FRw", decimals: 0, symbolPosition: "after" },
  { code: "STN", name: "São Tomé and Príncipe Dobra", nameAr: "الدوبرا الساوتومية", symbol: "Db", decimals: 2, symbolPosition: "after" },
  { code: "SCR", name: "Seychellois Rupee", nameAr: "الروبية السيشلية", symbol: "₨", decimals: 2, symbolPosition: "after" },
  { code: "SLE", name: "Sierra Leonean Leone", nameAr: "الليون السيراليوني", symbol: "Le", decimals: 2, symbolPosition: "after" },
  { code: "SOS", name: "Somali Shilling", nameAr: "الشلن الصومالي", symbol: "Sh", decimals: 2, symbolPosition: "after" },
  { code: "SSP", name: "South Sudanese Pound", nameAr: "الجنيه الجنوب سوداني", symbol: "£", decimals: 2, symbolPosition: "after" },
  { code: "SDG", name: "Sudanese Pound", nameAr: "الجنيه السوداني", symbol: "ج.س.", decimals: 2, symbolPosition: "after" },
  { code: "TZS", name: "Tanzanian Shilling", nameAr: "الشلن التنزاني", symbol: "TSh", decimals: 2, symbolPosition: "after" },
  { code: "TND", name: "Tunisian Dinar", nameAr: "الدينار التونسي", symbol: "د.ت", decimals: 3, symbolPosition: "after" },
  { code: "UGX", name: "Ugandan Shilling", nameAr: "الشلن الأوغندي", symbol: "USh", decimals: 0, symbolPosition: "after" },
  { code: "ZMW", name: "Zambian Kwacha", nameAr: "الكواشا الزامبي", symbol: "ZK", decimals: 2, symbolPosition: "after" },
  { code: "ZWL", name: "Zimbabwean Dollar", nameAr: "الدولار الزيمبابوي", symbol: "$", decimals: 2, symbolPosition: "after" },
  { code: "ZAR", name: "South African Rand", nameAr: "الراند الجنوب أفريقي", symbol: "R", decimals: 2, symbolPosition: "after" },
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
  { code: "DZ", name: "Algeria", nameAr: "الجزائر", currencyCode: "DZD", locale: "ar-DZ" },
  { code: "AO", name: "Angola", nameAr: "أنغولا", currencyCode: "AOA", locale: "pt-AO" },
  { code: "BJ", name: "Benin", nameAr: "بنين", currencyCode: "XOF", locale: "fr-BJ" },
  { code: "BW", name: "Botswana", nameAr: "بوتسوانا", currencyCode: "BWP", locale: "en-BW" },
  { code: "BF", name: "Burkina Faso", nameAr: "بوركينا فاسو", currencyCode: "XOF", locale: "fr-BF" },
  { code: "BI", name: "Burundi", nameAr: "بوروندي", currencyCode: "BIF", locale: "fr-BI" },
  { code: "CV", name: "Cabo Verde", nameAr: "الرأس الأخضر", currencyCode: "CVE", locale: "pt-CV" },
  { code: "CM", name: "Cameroon", nameAr: "الكاميرون", currencyCode: "XAF", locale: "fr-CM" },
  { code: "CF", name: "Central African Republic", nameAr: "جمهورية أفريقيا الوسطى", currencyCode: "XAF", locale: "fr-CF" },
  { code: "TD", name: "Chad", nameAr: "تشاد", currencyCode: "XAF", locale: "fr-TD" },
  { code: "KM", name: "Comoros", nameAr: "جزر القمر", currencyCode: "KMF", locale: "ar-KM" },
  { code: "CG", name: "Republic of the Congo", nameAr: "جمهورية الكونغو", currencyCode: "XAF", locale: "fr-CG" },
  { code: "CD", name: "Democratic Republic of the Congo", nameAr: "جمهورية الكونغو الديمقراطية", currencyCode: "CDF", locale: "fr-CD" },
  { code: "CI", name: "Côte d’Ivoire", nameAr: "ساحل العاج", currencyCode: "XOF", locale: "fr-CI" },
  { code: "DJ", name: "Djibouti", nameAr: "جيبوتي", currencyCode: "DJF", locale: "fr-DJ" },
  { code: "GQ", name: "Equatorial Guinea", nameAr: "غينيا الاستوائية", currencyCode: "XAF", locale: "es-GQ" },
  { code: "ER", name: "Eritrea", nameAr: "إريتريا", currencyCode: "ERN", locale: "ar-ER" },
  { code: "SZ", name: "Eswatini", nameAr: "إسواتيني", currencyCode: "SZL", locale: "en-SZ" },
  { code: "ET", name: "Ethiopia", nameAr: "إثيوبيا", currencyCode: "ETB", locale: "am-ET" },
  { code: "GA", name: "Gabon", nameAr: "الغابون", currencyCode: "XAF", locale: "fr-GA" },
  { code: "GM", name: "The Gambia", nameAr: "غامبيا", currencyCode: "GMD", locale: "en-GM" },
  { code: "GH", name: "Ghana", nameAr: "غانا", currencyCode: "GHS", locale: "en-GH" },
  { code: "GN", name: "Guinea", nameAr: "غينيا", currencyCode: "GNF", locale: "fr-GN" },
  { code: "GW", name: "Guinea-Bissau", nameAr: "غينيا بيساو", currencyCode: "XOF", locale: "pt-GW" },
  { code: "KE", name: "Kenya", nameAr: "كينيا", currencyCode: "KES", locale: "en-KE" },
  { code: "LS", name: "Lesotho", nameAr: "ليسوتو", currencyCode: "LSL", locale: "en-LS" },
  { code: "LR", name: "Liberia", nameAr: "ليبيريا", currencyCode: "LRD", locale: "en-LR" },
  { code: "LY", name: "Libya", nameAr: "ليبيا", currencyCode: "LYD", locale: "ar-LY" },
  { code: "MG", name: "Madagascar", nameAr: "مدغشقر", currencyCode: "MGA", locale: "fr-MG" },
  { code: "MW", name: "Malawi", nameAr: "ملاوي", currencyCode: "MWK", locale: "en-MW" },
  { code: "ML", name: "Mali", nameAr: "مالي", currencyCode: "XOF", locale: "fr-ML" },
  { code: "MR", name: "Mauritania", nameAr: "موريتانيا", currencyCode: "MRU", locale: "ar-MR" },
  { code: "MU", name: "Mauritius", nameAr: "موريشيوس", currencyCode: "MUR", locale: "en-MU" },
  { code: "MZ", name: "Mozambique", nameAr: "موزمبيق", currencyCode: "MZN", locale: "pt-MZ" },
  { code: "NA", name: "Namibia", nameAr: "ناميبيا", currencyCode: "NAD", locale: "en-NA" },
  { code: "NE", name: "Niger", nameAr: "النيجر", currencyCode: "XOF", locale: "fr-NE" },
  { code: "NG", name: "Nigeria", nameAr: "نيجيريا", currencyCode: "NGN", locale: "en-NG" },
  { code: "RW", name: "Rwanda", nameAr: "رواندا", currencyCode: "RWF", locale: "rw-RW" },
  { code: "ST", name: "São Tomé and Príncipe", nameAr: "ساو تومي وبرينسيبي", currencyCode: "STN", locale: "pt-ST" },
  { code: "SC", name: "Seychelles", nameAr: "سيشل", currencyCode: "SCR", locale: "en-SC" },
  { code: "SN", name: "Senegal", nameAr: "السنغال", currencyCode: "XOF", locale: "fr-SN" },
  { code: "SL", name: "Sierra Leone", nameAr: "سيراليون", currencyCode: "SLE", locale: "en-SL" },
  { code: "SO", name: "Somalia", nameAr: "الصومال", currencyCode: "SOS", locale: "so-SO" },
  { code: "ZA", name: "South Africa", nameAr: "جنوب أفريقيا", currencyCode: "ZAR", locale: "en-ZA" },
  { code: "SS", name: "South Sudan", nameAr: "جنوب السودان", currencyCode: "SSP", locale: "en-SS" },
  { code: "SD", name: "Sudan", nameAr: "السودان", currencyCode: "SDG", locale: "ar-SD" },
  { code: "TZ", name: "Tanzania", nameAr: "تنزانيا", currencyCode: "TZS", locale: "sw-TZ" },
  { code: "TG", name: "Togo", nameAr: "توغو", currencyCode: "XOF", locale: "fr-TG" },
  { code: "TN", name: "Tunisia", nameAr: "تونس", currencyCode: "TND", locale: "ar-TN" },
  { code: "UG", name: "Uganda", nameAr: "أوغندا", currencyCode: "UGX", locale: "en-UG" },
  { code: "ZM", name: "Zambia", nameAr: "زامبيا", currencyCode: "ZMW", locale: "en-ZM" },
  { code: "ZW", name: "Zimbabwe", nameAr: "زيمبابوي", currencyCode: "ZWL", locale: "en-ZW" },
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
