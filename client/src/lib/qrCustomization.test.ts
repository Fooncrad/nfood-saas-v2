import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const panel = readFileSync(new URL("../components/QROperationsPanel.tsx", import.meta.url), "utf8");
const router = readFileSync(new URL("../../../server/routers.ts", import.meta.url), "utf8");
const database = readFileSync(new URL("../../../server/db.ts", import.meta.url), "utf8");

describe("QR reference customization", () => {
  it("exposes the reference controls and live preview", () => {
    expect(panel).toContain('data-testid="qr-visual-customization"');
    expect(panel).toContain("لون المقدمة");
    expect(panel).toContain("لون الخلفية");
    expect(panel).toContain("الحشو:");
    expect(panel).toContain("الوضع");
    expect(panel).toContain("رابط الصورة");
    expect(panel).toContain("positionX");
    expect(panel).toContain("positionY");
    expect(panel).toContain("visualConfigJson");
  });

  it("keeps stable codes and offers a safe bulk reset", () => {
    expect(router).toContain("resetQrCodes");
    expect(router).toContain('status: "disabled"');
    expect(router).toContain("qrCodes.restaurantId");
    expect(router).toContain("qrCodes.branchId");
    expect(panel).toContain("دون حذف السجل");
  });

  it("creates and exposes one automatic branch menu QR", () => {
    expect(router).toContain("ensureMenuQrCode");
    expect(database).toContain("qr-${input.restaurantId}-${input.branchId}-menu-branch-default");
    expect(router).toContain("primaryLanguage: z.enum");
    expect(router).toContain("timezone: z.string");
    expect(panel).toContain('data-testid="menu-qr-auto-card"');
    expect(panel).toContain("يُنشأ عند إنشاء المطعم");
    expect(panel).toContain("نسخ الرابط");
  });
});
