import { describe, expect, it } from "vitest";
import { orderAgeMinutes } from "./orderTiming";

describe("orderAgeMinutes", () => {
  const now = new Date("2026-09-30T09:00:00.000Z").getTime();

  it("calculates completed minutes since the order was created", () => {
    expect(orderAgeMinutes("2026-09-30T08:42:15.000Z", now)).toBe(17);
  });

  it("accepts Date values", () => {
    expect(orderAgeMinutes(new Date("2026-09-30T08:00:00.000Z"), now)).toBe(60);
  });

  it("clamps future, missing, and invalid timestamps to zero", () => {
    expect(orderAgeMinutes("2026-09-30T09:01:00.000Z", now)).toBe(0);
    expect(orderAgeMinutes(null, now)).toBe(0);
    expect(orderAgeMinutes("not-a-date", now)).toBe(0);
  });
});
