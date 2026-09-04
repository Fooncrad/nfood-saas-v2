import { describe, expect, it } from "vitest";
import {
  buildMenuTemplateCron,
  normalizeMenuTemplateSchedule,
  resolveActiveMenuTemplate,
  isValidTime,
} from "./menuTemplateSchedule";

describe("menu template scheduling", () => {
  const eveningSchedule = {
    enabled: true,
    timezone: "Asia/Riyadh",
    fallbackTemplate: "editorial" as const,
    rules: [
      {
        days: [0, 1, 2, 3, 4, 5, 6],
        start: "18:00",
        end: "02:00",
        template: "glass" as const,
      },
    ],
  };

  it("uses the Glass template during an evening window in Riyadh", () => {
    expect(resolveActiveMenuTemplate(eveningSchedule, new Date("2026-08-23T15:00:00.000Z"))).toBe("glass");
  });

  it("keeps an overnight rule active after midnight on the following day", () => {
    expect(resolveActiveMenuTemplate(eveningSchedule, new Date("2026-08-23T22:30:00.000Z"))).toBe("glass");
  });

  it("returns the fallback outside the scheduled window", () => {
    expect(resolveActiveMenuTemplate(eveningSchedule, new Date("2026-08-23T10:00:00.000Z"))).toBe("editorial");
  });

  it("normalizes invalid schedule entries and caps the rule count", () => {
    const normalized = normalizeMenuTemplateSchedule({
      enabled: true,
      timezone: " Asia/Riyadh ",
      fallbackTemplate: "unknown",
      rules: [
        { days: [0, 0, 8], start: "18:00", end: "02:00", template: "glass" },
        { days: [], start: "18:00", end: "02:00", template: "glass" },
      ],
    });
    expect(normalized.timezone).toBe("Asia/Riyadh");
    expect(normalized.fallbackTemplate).toBe("editorial");
    expect(normalized.rules).toHaveLength(1);
    expect(normalized.rules[0]?.days).toEqual([0]);
  });

  it("accepts strict 24-hour HH:mm values", () => {
    expect(isValidTime("09:00")).toBe(true);
    expect(isValidTime("23:45")).toBe(true);
    expect(isValidTime("24:00")).toBe(false);
    expect(isValidTime("9:00")).toBe(false);
    expect(isValidTime("12:60")).toBe(false);
    expect(isValidTime("09:00 ")).toBe(false);
  });

  it("uses a six-field five-minute Heartbeat cron", () => {
    expect(buildMenuTemplateCron()).toBe("0 */5 * * * *");
  });
});


  it("accepts the customer showcase template", () => {
    const normalized = normalizeMenuTemplateSchedule({
      enabled: false,
      fallbackTemplate: "customer",
      rules: [],
    });
    expect(normalized.fallbackTemplate).toBe("customer");
  });
