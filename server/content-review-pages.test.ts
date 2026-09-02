import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("content review experience", () => {
  it("exposes creator status and platform moderation routes", () => {
    const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    const creator = readFileSync(resolve(process.cwd(), "client/src/pages/CreatorContentStatus.tsx"), "utf8");
    const platform = readFileSync(resolve(process.cwd(), "client/src/pages/PlatformContentModeration.tsx"), "utf8");
    expect(app).toContain("/creator-content");
    expect(app).toContain("/admin/content-moderation");
    expect(router).toContain("myContentReviewStatus");
    expect(router).toContain("contentModerationQueue");
    expect(router).toContain("reviewContent");
    expect(router).toContain("purchaseContentWithWallet");
    expect(router).toContain("buyerType");
    expect(router).toContain("content.wallet.purchase");
    expect(creator).toContain("قيد المراجعة");
    expect(creator).toContain("سبب:");
    expect(platform).toContain("خريطة مواقع الالتقاط");
    expect(platform).toContain("اعتماد ونشر");
    expect(platform).toContain("رفض بسبب");
    expect(db).toContain("paymentSource: \"wallet\"");
    expect(db).toContain("content_reward");
    expect(router).toContain("NODE_ENV !== \"production\"");
    expect(router).toContain("hasValidImageSignature");
    expect(router).toContain("scanBufferWithClamAV");
    expect(router).toContain("لم يتم تخزينها");
    expect(router).toContain('virusScanStatus: virusScan.status === "unavailable" ? "unavailable" : "clean"');
    expect(router.indexOf("scanBufferWithClamAV(buffer)")).toBeLessThan(router.indexOf("storagePut(`media/"));
  });
});
