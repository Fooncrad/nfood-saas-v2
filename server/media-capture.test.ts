import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("mobile media capture and fallback menu contract", () => {
  it("keeps camera capture, one-minute recording, and client-side optimization safeguards", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/MediaLibraryPanel.tsx"), "utf8");
    expect(source).toContain("navigator.mediaDevices.getUserMedia");
    expect(source).toContain("next >= 60");
    expect(source).toContain("videoBitsPerSecond: 850_000");
    expect(source).toContain("function compressImage");
    expect(source).toContain("preparedFile.size > 8 * 1024 * 1024");
    expect(source).toContain("setCameraOpen(true)");
  });

  it("keeps restaurant-level control for public media showcase", () => {
    const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
    const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    const panel = readFileSync(resolve(process.cwd(), "client/src/components/MediaLibraryPanel.tsx"), "utf8");
    expect(schema).toContain("mediaShowcaseEnabled: boolean");
    expect(router).toContain("updateMediaShowcase");
    expect(panel).toContain("عرض الوسائط التسويقية");
  });

  it("offers a text-only RTL menu print flow for PDF fallback without public menu sharing", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/RestaurantPublic.tsx"), "utf8");
    expect(source).toContain("downloadMenuPdf");
    expect(source).toContain("بدون صور");
    expect(source).toContain("اختر «حفظ كملف PDF»");
    expect(source).not.toContain("shareMenuLink");
    expect(source).toContain("downloadMenuPdf");
    expect(source).not.toContain("menuQrOpen");
    expect(source).toContain("QRCodeSVG");
    expect(source).toContain('aria-label="QR المنيو"');
    expect(source).not.toContain("qrMenuUrl");
  });
});
