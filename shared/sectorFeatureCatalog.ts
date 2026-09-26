export type SectorFamily = "hospitality" | "retail" | "services" | "creator";

const HOSPITALITY = new Set(["restaurant", "restaurants", "cafe", "cafes", "coffee", "coffee_shop"]);
const CREATOR = new Set(["creator", "content_creator", "photographer"]);
const SERVICES = new Set(["car_wash", "laundry", "beauty_salon", "public_works", "service"]);

export function sectorFamily(sector?: string | null): SectorFamily {
  const key = (sector ?? "").trim().toLowerCase();
  if (HOSPITALITY.has(key)) return "hospitality";
  if (CREATOR.has(key)) return "creator";
  if (SERVICES.has(key)) return "services";
  return "retail";
}

export const sectorFeatureCatalog: Record<SectorFamily, string[]> = {
  hospitality: [
    "digital_menu", "qr_menu", "nfc_menu", "menu_templates", "orders", "pos",
    "kds", "tables", "waiter_call", "reservations", "waitlist", "delivery",
    "takeaway", "room_service", "employees", "inventory", "purchases",
    "suppliers", "loyalty", "coupons", "campaigns", "reviews", "analytics",
    "multi_branch", "content_library", "storage",
  ],
  retail: [
    "storefront", "catalog", "variants", "inventory", "orders", "delivery",
    "pickup", "customers", "loyalty", "coupons", "campaigns", "reviews",
    "analytics", "multi_branch", "content_library", "storage",
  ],
  services: [
    "storefront", "service_catalog", "appointments", "queue", "employees",
    "customers", "payments", "loyalty", "coupons", "campaigns", "reviews",
    "analytics", "multi_branch", "content_library", "storage",
  ],
  creator: [
    "creator_profile", "content_marketplace", "media_library", "watermark",
    "content_pricing", "sales", "purchases", "analytics", "storage",
  ],
};

export function isFeatureRelevantToSector(sector: string | null | undefined, featureKey: string) {
  return sectorFeatureCatalog[sectorFamily(sector)].includes(featureKey);
}
