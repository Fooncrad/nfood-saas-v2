import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("kitchen SLA and order performance reporting", () => {
  it("defines isolated SLA and order history tables with reporting indexes", () => {
    const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
    expect(schema).toContain('mysqlTable("kitchenSectionSla"');
    expect(schema).toContain('uniqueIndex("kitchenSectionSla_restaurant_section_uidx"');
    expect(schema).toContain('mysqlTable("orderStatusHistory"');
    expect(schema).toContain('index("orderStatusHistory_order_created_idx"');
  });

  it("exposes protected admin procedures and records transitions", () => {
    const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    expect(router).toContain("kitchenSla: protectedProcedure");
    expect(router).toContain('kitchenTickets: testRoleProcedure("restaurant_admin", "kitchen", "bar")');
    expect(router).toContain("isBarKitchenSectionName");
    expect(router).toContain('saveKitchenSla: testRoleProcedure("restaurant_admin")');
    expect(router).toContain("orderStatusHistory: protectedProcedure");
    expect(router).toContain("dailyOrderPerformance: protectedProcedure");
    expect(router).toContain("recordOrderStatusTransition");
  });

  it("links new menu categories to kitchen sections during synchronization", () => {
    const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    expect(db).toContain("syncMenuCategoriesToKitchenSections");
    expect(db).toContain("db.update(menuCategories).set({ kitchenSectionId: section.id })");
    expect(db).toContain("isBarKitchenSectionName");
  });

  it("keeps the Arabic timeline and both export paths visible in KDS", () => {
    const panel = readFileSync(resolve(process.cwd(), "client/src/components/KitchenPerformancePanel.tsx"), "utf8");
    expect(panel).toContain("وقت التأخير حسب قسم المطبخ");
    expect(panel).toContain("السجل الزمني للطلبات");
    expect(panel).toContain("downloadCsv");
    expect(panel).toContain("تقرير أداء الطلبات");
    expect(panel).toContain("fromValue");
    expect(panel).toContain("bySection");
    expect(panel).toContain("byHour");
    expect(panel).toContain("toLocaleString(\"ar-SA\")");
    const kds = readFileSync(resolve(process.cwd(), "client/src/components/KdsOperationsBoard.tsx"), "utf8");
    expect(kds).toContain("getStationSectionIds");
    expect(kds).toContain("getStationLabel");
    expect(kds).toContain('station === "bar"');
  });
});
