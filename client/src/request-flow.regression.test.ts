import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd(), "client/src");
const publicMenu = readFileSync(resolve(root, "pages/RestaurantPublic.tsx"), "utf8");
const languagePanel = readFileSync(resolve(root, "components/HomeModules.tsx"), "utf8");
const alerts = readFileSync(resolve(root, "components/OrderRealtimeAlerts.tsx"), "utf8");
const driver = readFileSync(resolve(root, "components/DriverDeliveryView.tsx"), "utf8");

describe("request flow regression", () => {
  it("supports two-step reservation and table ordering", () => {
    expect(publicMenu).toContain("reservationStep");
    expect(publicMenu).toContain("متابعة لاختيار اليوم والوقت");
    expect(publicMenu).toContain('value="dineIn"');
    expect(publicMenu).toContain("أو أدخل رقم الطاولة");
  });

  it("persists a restaurant default menu language", () => {
    expect(languagePanel).toContain("defaultLanguage");
    expect(languagePanel).toContain("orderedLanguages");
    expect(languagePanel).toContain("languagesJson");
  });

  it("uses a persisted alert volume slider", () => {
    expect(alerts).toContain('type="range"');
    expect(alerts).toContain("nfood-order-alert-volume-");
    expect(alerts).toContain("alertVolume");
  });

  it("shows newly assigned driver orders", () => {
    expect(driver).toContain('deliveryStatus === "assigned"');
    expect(driver).toContain("طلب جديد");
    expect(driver).toContain("refetchInterval: 3000");
  });
});
