import { describe, expect, it } from "vitest";
import { moderateCustomerContent } from "../shared/contentModeration";

describe("customer studio moderation", () => {
  it("approves supported visual content and enables watermarking", () => {
    expect(moderateCustomerContent({ fileName: "dish.jpg", contentType: "image/jpeg", sizeBytes: 1024 })).toEqual({
      status: "approved",
      reason: null,
      watermarkApplied: true,
    });
    expect(moderateCustomerContent({ fileName: "visit.mp4", contentType: "video/mp4", sizeBytes: 2048 }).status).toBe("approved");
  });

  it("blocks unsupported or oversized uploads", () => {
    expect(moderateCustomerContent({ fileName: "script.js", contentType: "application/javascript", sizeBytes: 1024 }).status).toBe("blocked");
    expect(moderateCustomerContent({ fileName: "huge.mp4", contentType: "video/mp4", sizeBytes: 9 * 1024 * 1024 }).status).toBe("blocked");
  });
});
