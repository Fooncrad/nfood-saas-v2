import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Nasser Cafe test data provisioning", () => {
  const source = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");

  it("provisions ten menu items per category idempotently with image URLs", () => {
    expect(source).toContain("provisionNasserTestCatalog");
    expect(source).toContain("for (let index = 1; index <= 10; index += 1)");
    expect(source).toContain("nasser-test-burger_881b5d4f.jpg");
    expect(source).toContain("if (existing)");
  });

  it("places the demo driver at a Riyadh coordinate separated from Kingdom Tower", () => {
    expect(source).toContain('branchLatitude = "24.7136000"');
    expect(source).toContain('latitude = "24.8200000"');
    expect(source).toContain('longitude = "46.7000000"');
    expect(source).toContain("ضمن نطاق الاختبار 10–20 كم");
  });

  it("keeps delivery provisioning scoped to the requested restaurant", () => {
    expect(source).toContain("provisionDeliveryDemoAccounts(restaurantId)");
    expect(source).toContain("eq(remoteWorkers.restaurantId, restaurantId)");
    expect(source).toContain("isAvailable: true");
  });
});
