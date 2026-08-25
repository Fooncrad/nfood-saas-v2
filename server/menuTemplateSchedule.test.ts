import { describe, expect, it } from "vitest";
import { isValidTime, normalizeMenuTemplateSchedule } from "../shared/menuTemplateSchedule";

describe("menu template schedule input", () => {
  it("accepts valid HH:mm values and rejects malformed values", () => {
    expect(isValidTime("09:00")).toBe(true);
    expect(isValidTime("23:45")).toBe(true);
    expect(isValidTime("24:00")).toBe(false);
    expect(isValidTime("9:00")).toBe(false);
    expect(isValidTime("12:60")).toBe(false);
  });

  it("keeps valid rules after normalization", () => {
    const schedule = normalizeMenuTemplateSchedule({
      enabled: true,
      timezone: "Asia/Riyadh",
      fallbackTemplate: "editorial",
      rules: [{ days: [0], start: "09:00", end: "23:45", template: "glass" }],
    });
    expect(schedule.rules).toEqual([{ days: [0], start: "09:00", end: "23:45", template: "glass" }]);
  });
});
