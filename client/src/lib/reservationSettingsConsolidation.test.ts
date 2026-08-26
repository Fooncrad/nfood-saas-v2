import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const homeModules = readFileSync(new URL("../components/HomeModules.tsx", import.meta.url), "utf8");
const navigation = readFileSync(new URL("../components/homeNavigation.ts", import.meta.url), "utf8");

describe("reservation settings consolidation", () => {
  it("uses one reservations-and-hours entry point", () => {
    expect(homeModules).toContain('title="الحجوزات والأوقات"');
    expect(homeModules).toContain("<ReservationSchedulePanel");
    expect(homeModules).toContain("defaultTab=\"reservations\"");
  });

  it("removes the duplicate operations item from the sidebar", () => {
    expect(navigation).not.toContain('key: "operations", label: "مركز تشغيل المطعم"');
    expect(navigation).toContain('key: "reservations", label: "الحجوزات والانتظار"');
  });
});
