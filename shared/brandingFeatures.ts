export const BRANDING_FEATURES = [
  { key: "branding.logo", label: "شعار المطعم", category: "branding", status: "ON" as const, plans: ["Free", "Starter", "Professional", "Enterprise"] },
  { key: "branding.colors", label: "ألوان الهوية", category: "branding", status: "LIMITED" as const, plans: ["Free", "Starter", "Professional", "Enterprise"] },
  { key: "branding.dark_mode", label: "الوضع الداكن", category: "branding", status: "ON" as const, plans: ["Starter", "Professional", "Enterprise"] },
  { key: "branding.menu_theme", label: "قالب المنيو", category: "branding", status: "ON" as const, plans: ["Starter", "Professional", "Enterprise"] },
  { key: "branding.custom_font", label: "الخط المعتمد", category: "branding", status: "ENTERPRISE_ONLY" as const, plans: ["Professional", "Enterprise"] },
  { key: "branding.qr", label: "تخصيص QR", category: "branding", status: "ON" as const, plans: ["Starter", "Professional", "Enterprise"] },
  { key: "branding.remove_nfood", label: "إخفاء Powered by NFOOD", category: "branding", status: "ENTERPRISE_ONLY" as const, plans: ["Enterprise"] },
  { key: "branding.custom_domain", label: "النطاق المخصص", category: "branding", status: "ENTERPRISE_ONLY" as const, plans: ["Enterprise"] },
  { key: "branding.white_label", label: "White Label", category: "branding", status: "ENTERPRISE_ONLY" as const, plans: ["Enterprise"] },
] as const;

export type BrandingFeatureKey = typeof BRANDING_FEATURES[number]["key"];
export type BrandingPlan = "Free" | "Starter" | "Professional" | "Enterprise";

export function getBrandingFeature(key: BrandingFeatureKey) {
  return BRANDING_FEATURES.find((feature) => feature.key === key);
}

export function isBrandingFeatureAvailable(key: BrandingFeatureKey, plan: string) {
  return Boolean(getBrandingFeature(key)?.plans.some((availablePlan) => availablePlan === plan));
}
