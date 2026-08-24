import { describe, expect, it } from "vitest";
import { getStationSectionIds, isBarKitchenSection } from "./kitchenStation";

describe("kitchen station routing", () => {
  const sections = [
    { id: 1, name: "المطبخ الساخن" },
    { id: 2, name: "مشروبات" },
    { id: 3, name: "Coffee Bar" },
    { id: 4, name: "حلويات" },
  ];

  it("recognizes Arabic and English beverage section names", () => {
    expect(isBarKitchenSection("مشروبات باردة")).toBe(true);
    expect(isBarKitchenSection("Coffee Bar")).toBe(true);
    expect(isBarKitchenSection("المطبخ الساخن")).toBe(false);
  });

  it("keeps bar and kitchen section ids separated", () => {
    expect([...getStationSectionIds(sections, "bar")]).toEqual([2, 3]);
    expect([...getStationSectionIds(sections, "kitchen")]).toEqual([1, 4]);
    expect([...getStationSectionIds(sections)]).toEqual([1, 2, 3, 4]);
  });
});
