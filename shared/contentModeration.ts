export type ContentModerationDecision = {
  status: "approved" | "blocked";
  reason: string | null;
  watermarkApplied: boolean;
};

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const blockedExtensions = /\.(?:exe|js|html|svg|php|sh|bat|cmd|zip|rar)$/i;

export function moderateCustomerContent(input: {
  fileName: string;
  contentType: string;
  sizeBytes: number;
}): ContentModerationDecision {
  if (input.sizeBytes <= 0 || input.sizeBytes > 8 * 1024 * 1024) {
    return { status: "blocked", reason: "حجم الملف غير مسموح به", watermarkApplied: false };
  }
  if (blockedExtensions.test(input.fileName) || !allowedTypes.has(input.contentType.toLowerCase())) {
    return { status: "blocked", reason: "نوع الملف غير مدعوم للمحتوى المرئي", watermarkApplied: false };
  }
  return { status: "approved", reason: null, watermarkApplied: true };
}
