export type AfricanCurrency = {
  code: string;
  nameAr: string;
  nameEn: string;
  symbol: string;
  decimals: number;
};

/** ISO 4217 currency choices used by African countries and territories. */
export const AFRICAN_CURRENCIES: AfricanCurrency[] = [
  { code: "SAR", nameAr: "الريال السعودي (للمطاعم الحالية)", nameEn: "Saudi riyal (legacy restaurants)", symbol: "ر.س", decimals: 2 },
  { code: "DZD", nameAr: "الدينار الجزائري", nameEn: "Algerian dinar", symbol: "دج", decimals: 2 },
  { code: "AOA", nameAr: "الكوانزا الأنغولي", nameEn: "Angolan kwanza", symbol: "Kz", decimals: 2 },
  { code: "BWP", nameAr: "البولا البوتسواني", nameEn: "Botswana pula", symbol: "P", decimals: 2 },
  { code: "BIF", nameAr: "الفرنك البوروندي", nameEn: "Burundian franc", symbol: "FBu", decimals: 0 },
  { code: "CVE", nameAr: "الإسكودو الرأس أخضري", nameEn: "Cape Verdean escudo", symbol: "$", decimals: 2 },
  { code: "XAF", nameAr: "فرنك وسط أفريقيا", nameEn: "Central African CFA franc", symbol: "FCFA", decimals: 0 },
  { code: "XOF", nameAr: "فرنك غرب أفريقيا", nameEn: "West African CFA franc", symbol: "F CFA", decimals: 0 },
  { code: "KMF", nameAr: "الفرنك القمري", nameEn: "Comorian franc", symbol: "CF", decimals: 0 },
  { code: "CDF", nameAr: "الفرنك الكونغولي", nameEn: "Congolese franc", symbol: "FC", decimals: 2 },
  { code: "DJF", nameAr: "الفرنك الجيبوتي", nameEn: "Djiboutian franc", symbol: "Fdj", decimals: 0 },
  { code: "EGP", nameAr: "الجنيه المصري", nameEn: "Egyptian pound", symbol: "ج.م", decimals: 2 },
  { code: "ERN", nameAr: "الناكفا الإريترية", nameEn: "Eritrean nakfa", symbol: "Nfk", decimals: 2 },
  { code: "SZL", nameAr: "الليلانجيني الإسواتيني", nameEn: "Eswatini lilangeni", symbol: "E", decimals: 2 },
  { code: "ETB", nameAr: "البِر الإثيوبي", nameEn: "Ethiopian birr", symbol: "Br", decimals: 2 },
  { code: "GMD", nameAr: "الدالاسي الغامبي", nameEn: "Gambian dalasi", symbol: "D", decimals: 2 },
  { code: "GHS", nameAr: "السيدي الغاني", nameEn: "Ghanaian cedi", symbol: "GH₵", decimals: 2 },
  { code: "GNF", nameAr: "الفرنك الغيني", nameEn: "Guinean franc", symbol: "FG", decimals: 0 },
  { code: "KES", nameAr: "الشلن الكيني", nameEn: "Kenyan shilling", symbol: "KSh", decimals: 2 },
  { code: "LSL", nameAr: "اللوتي الليسوتي", nameEn: "Lesotho loti", symbol: "L", decimals: 2 },
  { code: "LRD", nameAr: "الدولار الليبيري", nameEn: "Liberian dollar", symbol: "$", decimals: 2 },
  { code: "LYD", nameAr: "الدينار الليبي", nameEn: "Libyan dinar", symbol: "ل.د", decimals: 3 },
  { code: "MGA", nameAr: "الأرياري الملغاشي", nameEn: "Malagasy ariary", symbol: "Ar", decimals: 2 },
  { code: "MWK", nameAr: "الكواشا الملاوي", nameEn: "Malawian kwacha", symbol: "MK", decimals: 2 },
  { code: "MRU", nameAr: "الأوقية الموريتانية", nameEn: "Mauritanian ouguiya", symbol: "UM", decimals: 2 },
  { code: "MUR", nameAr: "الروبية الموريشية", nameEn: "Mauritian rupee", symbol: "₨", decimals: 2 },
  { code: "MAD", nameAr: "الدرهم المغربي", nameEn: "Moroccan dirham", symbol: "د.م.", decimals: 2 },
  { code: "MZN", nameAr: "المتكال الموزمبيقي", nameEn: "Mozambican metical", symbol: "MT", decimals: 2 },
  { code: "NAD", nameAr: "الدولار الناميبي", nameEn: "Namibian dollar", symbol: "$", decimals: 2 },
  { code: "NGN", nameAr: "النايرا النيجيرية", nameEn: "Nigerian naira", symbol: "₦", decimals: 2 },
  { code: "RWF", nameAr: "الفرنك الرواندي", nameEn: "Rwandan franc", symbol: "FRw", decimals: 0 },
  { code: "STN", nameAr: "الدوبرا الساوتومية", nameEn: "São Tomé and Príncipe dobra", symbol: "Db", decimals: 2 },
  { code: "SCR", nameAr: "الروبية السيشلية", nameEn: "Seychellois rupee", symbol: "₨", decimals: 2 },
  { code: "SLE", nameAr: "الليون السيراليوني", nameEn: "Sierra Leonean leone", symbol: "Le", decimals: 2 },
  { code: "SOS", nameAr: "الشلن الصومالي", nameEn: "Somali shilling", symbol: "Sh", decimals: 2 },
  { code: "ZAR", nameAr: "الراند الجنوب أفريقي", nameEn: "South African rand", symbol: "R", decimals: 2 },
  { code: "SSP", nameAr: "الجنيه الجنوب سوداني", nameEn: "South Sudanese pound", symbol: "£", decimals: 2 },
  { code: "SDG", nameAr: "الجنيه السوداني", nameEn: "Sudanese pound", symbol: "ج.س.", decimals: 2 },
  { code: "TZS", nameAr: "الشلن التنزاني", nameEn: "Tanzanian shilling", symbol: "TSh", decimals: 2 },
  { code: "TND", nameAr: "الدينار التونسي", nameEn: "Tunisian dinar", symbol: "د.ت", decimals: 3 },
  { code: "UGX", nameAr: "الشلن الأوغندي", nameEn: "Ugandan shilling", symbol: "USh", decimals: 0 },
  { code: "ZMW", nameAr: "الكواشا الزامبي", nameEn: "Zambian kwacha", symbol: "ZK", decimals: 2 },
  { code: "ZWL", nameAr: "الدولار الزيمبابوي", nameEn: "Zimbabwean dollar", symbol: "$", decimals: 2 },
];

export const AFRICAN_CURRENCY_CODES = AFRICAN_CURRENCIES.map((currency) => currency.code);
export const getAfricanCurrency = (code: string) => AFRICAN_CURRENCIES.find((currency) => currency.code === code);
