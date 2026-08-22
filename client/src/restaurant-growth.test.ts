import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("Restaurant growth contracts", () => {
  it("stores tenant-scoped menu and QR events and exposes protected summary", () => {
    const schema = read("drizzle/schema.ts");
    const router = read("server/routers.ts");
    expect(schema).toContain('mysqlTable("menuAnalyticsEvents"');
    expect(schema).toContain('eventType: mysqlEnum("eventType", ["menu_open", "qr_scan"])');
    expect(router).toContain("recordMenuAnalytics");
    expect(router).toContain("menuAnalytics");
    expect(router).toContain("pwaInstallMessage");
    expect(router).toContain("pwaInstallIconUrl");
    expect(router).toContain("assertRestaurantAccess(ctx, input.restaurantId)");
  });

  it("ships TV and mobile presets with safe responsive previews", () => {
    const studio = read("client/src/components/MediaTemplateStudio.tsx");
    expect(studio).toContain('id: "tv-cinematic"');
    expect(studio).toContain('id: "mobile-story"');
    expect(studio).toContain('ratio: "16 / 9"');
    expect(studio).toContain('ratio: "9 / 16"');
    expect(studio).toContain("backgroundSize: \"cover\"");
    expect(studio).toContain("selectTemplate");
    expect(studio).toContain("transition-[aspect-ratio,transform,opacity,box-shadow]");
    expect(studio).toContain("motion-reduce:transition-none");
  });

  it("contains a dismissible install experience for iOS and Android", () => {
    const menu = read("client/src/pages/RestaurantPublic.tsx");
    expect(menu).toContain("beforeinstallprompt");
    expect(menu).toContain("display-mode: standalone");
    expect(menu).toContain("من Safari: مشاركة");
    expect(menu).toContain("ثبّت منيو");
    expect(menu).toContain("nfood-install-dismissed");
    expect(menu).toContain("pwaInstallMessage");
    expect(menu).toContain("pwaInstallIconUrl");
  });
});
