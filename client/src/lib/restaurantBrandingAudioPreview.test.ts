import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("restaurant branding, audio, and live preview", () => {
  const modules = readFileSync(resolve(process.cwd(), "client/src/components/HomeModules.tsx"), "utf8");
  const alerts = readFileSync(resolve(process.cwd(), "client/src/components/OrderRealtimeAlerts.tsx"), "utf8");
  const driver = readFileSync(resolve(process.cwd(), "client/src/components/DriverDeliveryView.tsx"), "utf8");

  it("supports a validated custom restaurant logo upload", () => {
    expect(modules).toContain("uploadBrandLogo");
    expect(modules).toContain('category: "logo"');
    expect(modules).toContain("5 * 1024 * 1024");
    expect(modules).toContain("brandLogoUrl: result.url");
  });

  it("exposes live preview before saving", () => {
    expect(modules).toContain("معاينة مباشرة قبل الحفظ");
    expect(modules).toContain("لا تُعتمد للزوار حتى تضغط حفظ الهوية");
  });

  it("keeps restaurant and driver audio controls connected", () => {
    expect(alerts).toContain("playOrderAlertSound");
    expect(alerts).toContain("تجربة الصوت");
    expect(driver).toContain("testDriverSound");
    expect(driver).toContain("playOrderAlertSound");
  });
});
