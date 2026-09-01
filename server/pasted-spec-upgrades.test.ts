import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const addonsPanel = readFileSync(resolve(process.cwd(), "client/src/components/MenuAddonsPanel.tsx"), "utf8");
const driverView = readFileSync(resolve(process.cwd(), "client/src/components/DriverDeliveryView.tsx"), "utf8");

describe("pasted specification upgrades", () => {
  it("models add-on groups and validates their selection limits", () => {
    expect(schema).toContain('groupName: varchar("groupName"');
    expect(schema).toContain('isRequired: boolean("isRequired")');
    expect(schema).toContain('minSelections: int("minSelections")');
    expect(schema).toContain('maxSelections: int("maxSelections")');
    expect(schema).toContain('sortOrder: int("sortOrder")');
    expect(router).toContain("value.minSelections <= value.maxSelections");
    expect(router).toContain("الحد الأدنى للاختيارات يجب ألا يتجاوز الحد الأقصى");
  });

  it("exposes group, requirement, limits, ordering, and CSV management", () => {
    expect(addonsPanel).toContain("اسم المجموعة");
    expect(addonsPanel).toContain("مجموعة إلزامية");
    expect(addonsPanel).toContain("الحد الأدنى");
    expect(addonsPanel).toContain("الحد الأقصى");
    expect(addonsPanel).toContain("sortOrder");
    expect(addonsPanel).toContain("groupName,price,stockQuantity,isRequired,minSelections,maxSelections,sortOrder");
  });

  it("keeps driver logout visible and routes back to login", () => {
    expect(driverView).toContain("تسجيل الخروج");
    expect(driverView).toContain("await logout()");
    expect(driverView).toContain('window.location.href = "/login"');
    expect(driverView).toContain("loggingOut");
  });
});
