import { describe, expect, it } from "vitest";
import { selectBirthdayAudience, selectCampaignAudience, selectReengagementAudience } from "./marketingAudience";

const now = new Date("2026-08-21T12:00:00.000Z");

describe("marketing audience helpers", () => {
  it("selects customers whose birthday matches the current UTC month and day", () => {
    expect(selectBirthdayAudience([
      { id: 1, birthDate: "1990-08-21T00:00:00.000Z" },
      { id: 2, birthDate: "1992-08-20T00:00:00.000Z" },
      { id: 3, birthDate: null },
      { id: 4, birthDate: "invalid" },
    ], now)).toEqual([1]);
  });

  it("selects customers at or beyond the re-engagement cutoff", () => {
    expect(selectReengagementAudience([
      { id: 1, lastOrderAt: "2026-07-22T12:00:00.000Z" },
      { id: 2, lastOrderAt: "2026-07-22T11:00:00.000Z" },
      { id: 3, lastOrderAt: "2026-08-01T12:00:00.000Z" },
      { id: 4, lastOrderAt: null },
    ], { now, reengagementDays: 30 })).toEqual([1, 2]);
  });

  it("returns no audience for an invalid re-engagement window", () => {
    expect(selectReengagementAudience([{ id: 1, lastOrderAt: "2020-01-01T00:00:00.000Z" }], { now, reengagementDays: 0 })).toEqual([]);
    expect(selectReengagementAudience([{ id: 1, lastOrderAt: "2020-01-01T00:00:00.000Z" }], { now, reengagementDays: 366 })).toEqual([]);
  });

  it("uses all valid customer ids for a general campaign", () => {
    expect(selectCampaignAudience("general", [{ id: 1 }, { id: 2 }], { now })).toEqual([1, 2]);
  });
});
