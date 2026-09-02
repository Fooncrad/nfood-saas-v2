import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const restaurantPublic = readFileSync("client/src/pages/RestaurantPublic.tsx", "utf8");
const homeModules = readFileSync("client/src/components/HomeModules.tsx", "utf8");
const profileGovernance = readFileSync("client/src/components/ProfileGovernanceCenter.tsx", "utf8");
const moderation = readFileSync("client/src/pages/PlatformContentModeration.tsx", "utf8");
const routers = readFileSync("server/routers.ts", "utf8");
const db = readFileSync("server/db.ts", "utf8");

describe("QR menu, image upload, Profile plans and NFC upgrades", () => {
  it("replaces the full-width barcode with a compact QR inside restaurant identity", () => {
    expect(restaurantPublic).toContain('import { QRCodeSVG } from "qrcode.react"');
    expect(restaurantPublic).toContain('aria-label="QR المنيو"');
    expect(restaurantPublic).toContain("<QRCodeSVG");
    expect(restaurantPublic).not.toContain('import Barcode from "react-barcode"');
    expect(restaurantPublic).not.toContain('format="CODE128"');
  });

  it("auto-crops large menu photos and offers AI generation with safe errors", () => {
    expect(homeModules).toContain("20 * 1024 * 1024");
    expect(homeModules).toContain("قص وضغط تلقائي إلى مربع");
    expect(homeModules).not.toContain("image.naturalWidth > 1000");
    expect(homeModules).toContain("trpc.media.generateMenuImage.useMutation");
    expect(homeModules).toContain("توليد صورة بالذكاء الاصطناعي");
    expect(homeModules).toContain("Service Unavailable");
    expect(routers).toContain("generateMenuImage: protectedProcedure");
    expect(routers).toContain('input.category === "menu"');
    expect(routers).toContain('virusScan.status === "unavailable" ? "unavailable" : "clean"');
  });

  it("accepts normal decimal Profile prices and normalizes them before save", () => {
    expect(routers).toContain("price: z.string().regex(/^\\d+(\\.\\d{1,2})?$/)");
    expect(profileGovernance).toContain("plans.map((plan) => ({ ...plan, price:");
    expect(profileGovernance).toContain("اختر Profile العميل بالاسم");
    expect(profileGovernance).toContain("customerAccounts.data?.customers");
  });

  it("shows the Profile owner and generates a one-time NFC key on approval", () => {
    expect(db).toContain("profileDisplayName: customerProfiles.displayName");
    expect(db).toContain("customerProfileId: profile.id");
    expect(routers).toContain('rawCode = `NF-${randomBytes(18).toString("base64url")}`');
    expect(routers).toContain('targetRole: "customer", customerProfileId: request.customerProfileId');
    expect(moderation).toContain("request.profileDisplayName");
    expect(moderation).toContain("generatedCardCode");
    expect(moderation).toContain("يظهر مرة واحدة فقط");
  });
});
