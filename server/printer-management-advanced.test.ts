import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("advanced printer management contracts", () => {
  const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
  const ui = readFileSync(resolve(process.cwd(), "client/src/components/KitchenPrinterSettings.tsx"), "utf8");

  it("exposes multilingual receipt and kitchen template fields", () => {
    expect(router).toContain("escPosReceiptLocalesJson");
    expect(router).toContain("escPosKitchenLocalesJson");
    expect(ui).toContain("قوالب متعددة اللغات");
    expect(ui).toContain("Français");
    expect(ui).toContain("اردو");
  });

  it("exposes printer performance aggregation and failure rate", () => {
    expect(router).toContain("printerPerformanceReport");
    expect(router).toContain("failureRate");
    expect(ui).toContain("تقرير أداء الطابعات");
    expect(ui).toContain("أعطال");
  });

  it("keeps Gateway probe and actual print actions explicit", () => {
    expect(router).toContain("testPrinterGateway");
    expect(router).toContain('mode: z.enum(["probe", "print"])');
    expect(ui).toContain("اختبار اتصال Gateway");
    expect(ui).toContain("طباعة فعلية عبر Gateway");
  });
});
