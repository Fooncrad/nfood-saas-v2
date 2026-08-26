import { describe, expect, it } from "vitest";
import { moderateCustomerContent } from "../shared/contentModeration";

describe("customer studio moderation", () => {
  it("approves a food image, enables watermarking, and classifies it", () => {
    expect(moderateCustomerContent({ fileName: "burger.jpg", contentType: "image/jpeg", sizeBytes: 1024 })).toEqual({
      status: "approved",
      reason: null,
      watermarkApplied: true,
      category: "burger",
    });
  });

  it("blocks videos, unsupported files, oversized uploads, and unsafe signals", () => {
    expect(moderateCustomerContent({ fileName: "visit.mp4", contentType: "video/mp4", sizeBytes: 2048 }).status).toBe("blocked");
    expect(moderateCustomerContent({ fileName: "script.js", contentType: "application/javascript", sizeBytes: 1024 }).status).toBe("blocked");
    expect(moderateCustomerContent({ fileName: "huge.jpg", contentType: "image/jpeg", sizeBytes: 9 * 1024 * 1024 }).status).toBe("blocked");
    expect(moderateCustomerContent({ fileName: "unsafe-nude.jpg", contentType: "image/jpeg", sizeBytes: 1024 }).status).toBe("blocked");
  });
});
