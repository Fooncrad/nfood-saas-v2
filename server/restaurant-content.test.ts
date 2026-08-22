import { describe, expect, it } from "vitest";
import { isDisplaySlideActive, validateCampaignContentDraft, validateDisplaySlideDraft } from "./routers";

describe("restaurant display and marketing content validation", () => {
  it("requires a menu item or media asset for a display slide", () => {
    expect(validateDisplaySlideDraft({ durationSeconds: 8 })).toBe("يجب ربط الشريحة بصنف أو صورة");
    expect(validateDisplaySlideDraft({ menuItemId: 41, durationSeconds: 8 })).toBeNull();
    expect(validateDisplaySlideDraft({ mediaFileId: 17, durationSeconds: 8 })).toBeNull();
  });

  it("keeps display durations within a usable range", () => {
    expect(validateDisplaySlideDraft({ mediaFileId: 17, durationSeconds: 2 })).toBe("مدة العرض يجب أن تكون بين 3 و120 ثانية");
    expect(validateDisplaySlideDraft({ mediaFileId: 17, durationSeconds: 121 })).toBe("مدة العرض يجب أن تكون بين 3 و120 ثانية");
  });

  it("accepts the four supported marketing locales and rejects unsupported ones", () => {
    expect(validateCampaignContentDraft({ locale: "ar", headline: "عرض اليوم" })).toBeNull();
    expect(validateCampaignContentDraft({ locale: "en", headline: "Today's offer" })).toBeNull();
    expect(validateCampaignContentDraft({ locale: "de", headline: "Angebot" })).toBe("لغة المحتوى غير مدعومة");
  });

  it("requires a meaningful marketing headline", () => {
    expect(validateCampaignContentDraft({ locale: "fr", headline: "  " })).toBe("العنوان التسويقي مطلوب");
  });

  it("selects only slides active in their time window and campaign", () => {
    const now = new Date("2026-08-22T12:00:00.000Z");
    expect(isDisplaySlideActive({ isActive: true, startsAt: new Date("2026-08-22T11:00:00.000Z"), endsAt: new Date("2026-08-22T13:00:00.000Z") }, undefined, now)).toBe(true);
    expect(isDisplaySlideActive({ isActive: true, startsAt: new Date("2026-08-22T13:00:00.000Z") }, undefined, now)).toBe(false);
    expect(isDisplaySlideActive({ isActive: true, campaignId: 9 }, { status: "active", startsAt: null, endsAt: null }, now)).toBe(true);
    expect(isDisplaySlideActive({ isActive: true, campaignId: 9 }, { status: "ended", startsAt: null, endsAt: null }, now)).toBe(false);
    expect(isDisplaySlideActive({ isActive: false }, undefined, now)).toBe(false);
  });
});
