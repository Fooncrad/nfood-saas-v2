import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("driver section navigation", () => {
  it("keeps drivers in a dedicated restaurant sidebar group", () => {
    const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    expect(home).toContain('id: "restaurant-drivers"');
    expect(home).toContain('keys: ["drivers"]');
    expect(home).toContain("السائقون والتوصيل");
  });

  it("keeps the driver module focused on driver operations", () => {
    const modules = readFileSync(resolve(process.cwd(), "client/src/components/HomeModules.tsx"), "utf8");
    expect(modules).toContain('active === "drivers"');
    expect(modules).toContain('data-testid="drivers-management-page"');
    expect(modules).toContain('focusRole="driver"');
    expect(modules).toContain("DeliveryOperationsPanel");
  });
});
