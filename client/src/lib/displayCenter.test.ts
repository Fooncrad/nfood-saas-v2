import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../components/RestaurantDisplayMarketingPanel.tsx", import.meta.url), "utf8");

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
    expect(source).toContain("تعبئة 20 شريحة تجريبية");
    expect(source).toContain("demoMarketingLines");
    expect(source).toContain("durationSeconds: 7");
    expect(source).toContain("menuItemId: item.id");
    expect(source).toContain("صور أصناف المنيو");
  });

  it("keeps connection, content, campaign and preview panels scoped to their tabs", () => {
    expect(source).toContain('displaySection === "connections"');
    expect(source).toContain('displaySection === "content"');
    expect(source).toContain('displaySection === "campaigns"');
    expect(source).toContain('displaySection === "preview"');
    expect(source).toContain("معاينة وتشغيل الشاشة");
  });
});
