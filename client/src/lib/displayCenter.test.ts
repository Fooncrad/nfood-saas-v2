import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../components/RestaurantDisplayMarketingPanel.tsx", import.meta.url), "utf8");
const publicDisplaySource = readFileSync(new URL("../pages/PublicDisplay.tsx", import.meta.url), "utf8");

describe("display center organization", () => {
  it("defines one internal navigation model for the display center", () => {
    expect(source).toContain('useState<"overview" | "connections" | "content" | "campaigns" | "preview">');
    expect(source).toContain("نظرة عامة");
    expect(source).toContain("الروابط وKiosk");
    expect(source).toContain("المحتوى والشرائح");
    expect(source).toContain("الحملات والتسويق");
    expect(source).toContain("المعاينة");
  });

  it("adds a one-click demo playlist from real menu items", () => {
    expect(source).toContain("تعبئة 50 شريحة تجريبية");
    expect(source).toContain("seedExternalSlides");
    expect(source).toContain("35 صورة خارجية");
    expect(publicDisplaySource).toContain("nfood-display-copy-panel");
    expect(source).toContain("تعذر حفظ الصورة الخارجية");
    expect(source).toContain("/manus-storage/nasser-outside-01");
    expect(source).toContain("transitionEffect");
    expect(source).toContain("badgeText");
    expect(source).toContain("slideDuration");
    expect(source).toContain("demoMarketingLines");
    expect(source).toContain("durationSeconds: 7");
    expect(source).toContain("menuItemId: item.id");
    expect(source).toContain("صور أصناف المنيو");
    expect(source).toContain("imageUrl");
    expect(publicDisplaySource).toContain("Nasser Cafe · شاشة النكهات");
    expect(publicDisplaySource).toContain("صورة الصنف قيد الاعتماد");
    expect(publicDisplaySource).toContain("slide?.menuItem?.imageUrl");
    expect(publicDisplaySource).toContain("displayCacheKey");
    expect(publicDisplaySource).toContain("nfood-display-slide-enter");
    expect(publicDisplaySource).toContain("العرض يستعد للحظتك");
    expect(publicDisplaySource).toContain("نعود إليك بعد لحظات");
    expect(publicDisplaySource).toContain('message.type === "display.updated"');
    expect(publicDisplaySource).toContain("playback.refetch()");
  });

  it("keeps connection, content, campaign and preview panels scoped to their tabs", () => {
    expect(source).toContain('displaySection === "connections"');
    expect(source).toContain('displaySection === "content"');
    expect(source).toContain('displaySection === "campaigns"');
    expect(source).toContain('displaySection === "preview"');
    expect(source).toContain("معاينة وتشغيل الشاشة");
  });
});
