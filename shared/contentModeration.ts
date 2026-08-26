export type FoodContentCategory = "burger" | "desserts" | "coffee" | "meals" | "drinks" | "other_food";

export type ContentModerationDecision = {
  status: "approved" | "blocked";
  reason: string | null;
  watermarkApplied: boolean;
  category: FoodContentCategory;
};

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const blockedExtensions = /\.(?:exe|js|html|svg|php|sh|bat|cmd|zip|rar)$/i;
const blockedSignals = /(?:nude|porn|sex|violence|gore|weapon|blood|nsfw|عارية|اباحية|إباحية|عنف|دماء|سلاح)/i;
const categorySignals: Array<[FoodContentCategory, RegExp]> = [
  ["burger", /burger|برجر|برغ\/?ر|ساندوتش|sandwich/i],
  ["desserts", /dessert|cake|sweet|حلى|حلويات|كيك|تشيز|شوكولاته|chocolate/i],
  ["coffee", /coffee|latte|espresso|قهوة|كابتشينو|لاتيه|اسبرسو/i],
  ["drinks", /drink|juice|مشروب|عصير|موهيتو|ماء/i],
  ["meals", /meal|food|dish|وجبة|طبق|مأكولات|أكل|طعام/i],
];

export function classifyFoodContent(fileName: string): FoodContentCategory {
  return categorySignals.find(([, signal]) => signal.test(fileName))?.[0] ?? "other_food";
}

export function validateMarketplaceCapture(input: { captureMethod?: string; capturedAt?: Date | null; maxAgeMs?: number; deviceModel?: string | null }) {
  if (input.captureMethod !== "camera") return { valid: false, reason: "يجب التقاط الصورة مباشرة من كاميرا Studio" };
  if (!input.capturedAt || Number.isNaN(input.capturedAt.getTime())) return { valid: false, reason: "تعذر التحقق من وقت التقاط الصورة" };
  const age = Date.now() - input.capturedAt.getTime();
  const maxAgeMs = input.maxAgeMs ?? 24 * 60 * 60 * 1000;
  if (age < -5 * 60 * 1000 || age > maxAgeMs) return { valid: false, reason: "لا تُقبل الصور القديمة؛ التقط صورة جديدة من كاميرا Studio" };
  if (!input.deviceModel?.trim()) return { valid: false, reason: "بيانات الجهاز غير متاحة للتحقق" };
  return { valid: true as const, reason: null };
}

export function moderateCustomerContent(input: {
  fileName: string;
  contentType: string;
  sizeBytes: number;
}): ContentModerationDecision {
  const category = classifyFoodContent(input.fileName);
  if (input.sizeBytes <= 0 || input.sizeBytes > 8 * 1024 * 1024) {
    return { status: "blocked", reason: "حجم الملف غير مسموح به", watermarkApplied: false, category };
  }
  if (blockedExtensions.test(input.fileName) || !allowedImageTypes.has(input.contentType.toLowerCase())) {
    return { status: "blocked", reason: "مسموح برفع الصور الغذائية فقط في المرحلة الحالية", watermarkApplied: false, category };
  }
  if (blockedSignals.test(input.fileName)) {
    return { status: "blocked", reason: "تم رفض الصورة لمخالفتها إرشادات المحتوى الآمن", watermarkApplied: false, category };
  }
  return { status: "approved", reason: null, watermarkApplied: true, category };
}
