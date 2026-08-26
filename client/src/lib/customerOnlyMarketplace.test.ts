import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("customer-only content marketplace", () => {
  const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
  const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
  const studio = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerStudio.tsx"), "utf8");
  const market = readFileSync(resolve(process.cwd(), "client/src/pages/ContentMarketplace.tsx"), "utf8");

  it("rejects restaurant content selling and restaurant buyers", () => {
    expect(router).toContain("المطاعم تعرض نشاطها فقط ولا تملك صلاحية بيع المحتوى");
    expect(router).toContain("بيع وشراء المحتوى محصور بحسابات العملاء فقط");
    expect(router).not.toContain('buyerType: z.enum(["customer", "restaurant"])');
    expect(db).not.toContain('buyerType: "restaurant"');
  });

  it("supports public/friends visibility and controlled food tags", () => {
    expect(router).toContain('visibility: z.enum(["public", "friends"])');
    expect(router).toContain("foodTags: z.array");
    expect(studio).toContain("خاص للأصدقاء المدعوين");
    expect(studio).toContain("أصناف الطعام والهاشتاقات");
  });

  it("keeps public search tag-aware and customer purchase-only", () => {
    expect(market).toContain("foodTagsJson");
    expect(market).toContain("بيع حصري للعملاء");
    expect(market).toContain('purchase.mutate({ listingId })');
  });
});
