import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Trend Kitchen marketplace", () => {
  it("provides public discovery, food categories, limited interactions, and wallet purchase", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/ContentMarketplace.tsx"), "utf8");
    expect(source).toContain("سوق نفود للمحتوى");
    expect(source).toContain("وصفات جزئية");
    expect(source).toContain("Trend الشيف");
    expect(source).toContain("nfood-market-likes");
    expect(source).toContain("nfood-market-favorites");
    expect(source).toContain("purchaseContentWithWallet");
    expect(source).toContain("لا توجد تعليقات عامة");
  });

  it("exposes the market in the unified navigation", () => {
    const nav = readFileSync(resolve(process.cwd(), "client/src/components/homeNavigation.ts"), "utf8");
    const roles = readFileSync(resolve(process.cwd(), "client/src/lib/roleNavigation.ts"), "utf8");
    expect(nav).toContain('key: "trend"');
    expect(roles).toContain('"trend"');
  });
});
