import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("attachment implementation wiring", () => {
  it("keeps the attachment reference and audit in the project", () => {
    expect(read("docs/NFOOD-global-dashboard-branding-requirements.md")).toContain("Global Dashboard & Subscription-Based Branding");
    expect(read("docs/NFOOD-attachment-gap-audit.md")).toContain("Branding Editor");
  });

  it("wires the plan matrix and editor into restaurant settings", () => {
    const modules = read("client/src/components/HomeModules.tsx");
    expect(modules).toContain("BrandingFeatureMatrix");
    expect(modules).toContain("BrandingEditorPanel");
    const editor = read("client/src/components/BrandingEditorPanel.tsx");
    expect(editor).toContain("المعاينة الحية");
    expect(editor).toContain("uploadBrandAsset");
    expect(editor).toContain("رفع الشعار");
  });

  it("wires secure brand asset upload and drag-drop widget ordering", () => {
    const router = read("server/routers.ts");
    const quickAccess = read("client/src/components/DashboardQuickAccess.tsx");
    expect(router).toContain("uploadBrandAsset");
    expect(router).toContain("storagePut");
    expect(quickAccess).toContain("draggable");
    expect(quickAccess).toContain("nfood.dashboard.widget-order");
  });

  it("keeps dashboard density choices persistent", () => {
    const quickAccess = read("client/src/components/DashboardQuickAccess.tsx");
    expect(quickAccess).toContain("nfood.dashboard.density");
    expect(quickAccess).toContain("مضغوط");
    expect(quickAccess).toContain("واسع");
  });
});
