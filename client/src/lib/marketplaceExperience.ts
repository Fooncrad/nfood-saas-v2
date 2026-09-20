export type MarketplaceLanguage = "ar" | "en" | "fr";

export const marketplaceCountries = [
  { code: "SA", flag: "🇸🇦", ar: "السعودية", en: "Saudi Arabia", fr: "Arabie saoudite", currency: "SAR" },
  { code: "AE", flag: "🇦🇪", ar: "الإمارات", en: "United Arab Emirates", fr: "Émirats arabes unis", currency: "AED" },
  { code: "KW", flag: "🇰🇼", ar: "الكويت", en: "Kuwait", fr: "Koweït", currency: "KWD" },
  { code: "BH", flag: "🇧🇭", ar: "البحرين", en: "Bahrain", fr: "Bahreïn", currency: "BHD" },
  { code: "QA", flag: "🇶🇦", ar: "قطر", en: "Qatar", fr: "Qatar", currency: "QAR" },
  { code: "OM", flag: "🇴🇲", ar: "عُمان", en: "Oman", fr: "Oman", currency: "OMR" },
] as const;

export const sectorExperience: Record<string, { icon: string; ar: string; en: string; fr: string; hintAr: string; hintEn: string }> = {
  restaurants: { icon: "🍽️", ar: "مطاعم", en: "Restaurants", fr: "Restaurants", hintAr: "منيو، طلب، حجز وطاولات", hintEn: "Menu, ordering & reservations" },
  restaurant: { icon: "🍽️", ar: "مطاعم", en: "Restaurants", fr: "Restaurants", hintAr: "منيو، طلب، حجز وطاولات", hintEn: "Menu, ordering & reservations" },
  fashion: { icon: "👕", ar: "أزياء وملابس", en: "Fashion", fr: "Mode", hintAr: "مقاسات، ألوان وتشكيلات", hintEn: "Sizes, colors & collections" },
  clothing: { icon: "👕", ar: "أزياء وملابس", en: "Fashion", fr: "Mode", hintAr: "مقاسات، ألوان وتشكيلات", hintEn: "Sizes, colors & collections" },
  cars: { icon: "🚘", ar: "سيارات", en: "Cars", fr: "Automobile", hintAr: "موديلات، مواصفات وتمويل", hintEn: "Models, specs & financing" },
  automotive: { icon: "🚘", ar: "سيارات", en: "Cars", fr: "Automobile", hintAr: "موديلات، مواصفات وتمويل", hintEn: "Models, specs & financing" },
  "real-estate": { icon: "🏠", ar: "عقارات", en: "Real Estate", fr: "Immobilier", hintAr: "بيع، إيجار ومشاريع", hintEn: "Buy, rent & developments" },
  services: { icon: "✨", ar: "خدمات", en: "Services", fr: "Services", hintAr: "خدمات، مواعيد وحجوزات", hintEn: "Services & appointments" },
  retail: { icon: "🛍️", ar: "تجزئة ومتاجر", en: "Retail", fr: "Commerce", hintAr: "منتجات، عروض وتوصيل", hintEn: "Products, offers & delivery" },
};

export function sectorMeta(slug: string) {
  return sectorExperience[slug.toLowerCase()] ?? { icon: "🏪", ar: slug, en: slug, fr: slug, hintAr: "متاجر ومنتجات مختارة", hintEn: "Curated stores & products" };
}

export function marketplaceCopy(language: MarketplaceLanguage) {
  if (language === "en") return { discover: "Discover your city", title: "One platform. Every business.", subtitle: "Choose your country, then the activity you need. NFOOD keeps every market, business and experience clearly separated.", country: "Country", activity: "Choose an activity", stores: "Stores near you", search: "Search stores, products or services", change: "Change", merchant: "For businesses", login: "Sign in", install: "Install app", explore: "Explore" };
  if (language === "fr") return { discover: "Découvrez votre ville", title: "Une plateforme. Tous les commerces.", subtitle: "Choisissez votre pays puis votre activité. NFOOD sépare clairement chaque marché et chaque expérience.", country: "Pays", activity: "Choisir une activité", stores: "Commerces près de vous", search: "Rechercher commerces, produits ou services", change: "Changer", merchant: "Pour les entreprises", login: "Connexion", install: "Installer", explore: "Explorer" };
  return { discover: "اكتشف مدينتك", title: "منصة واحدة. لكل نشاط تجربته.", subtitle: "اختر دولتك ثم النشاط الذي تحتاجه. NFOOD يفصل الأسواق والأنشطة والمتاجر لتصل لما تريد بسرعة ووضوح.", country: "الدولة", activity: "اختر النشاط", stores: "متاجر في دولتك", search: "ابحث عن متجر، منتج أو خدمة", change: "تغيير", merchant: "لأصحاب الأعمال", login: "تسجيل الدخول", install: "تثبيت التطبيق", explore: "استكشف" };
}
