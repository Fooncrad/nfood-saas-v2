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
