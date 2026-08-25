import { describe, expect, it } from "vitest";
import { getVisibleTables, hasRecentAutoCancellation } from "./tableViewModel";

const now = Date.parse("2026-08-25T12:00:00Z");
const tables = [
  { id: 1, name: "A", seats: 2, status: "available", minimumCharge: "50", tableFee: "5", tableType: "standard" },
  { id: 2, name: "B", seats: 6, status: "reserved", minimumCharge: "120", tableFee: "10", tableType: "dinner" },
];

describe("table view model", () => {
  it("detects only recent automatic cancellations", () => {
    expect(hasRecentAutoCancellation(1, [{ assignedTableId: 1, status: "cancelled", noShowNotifiedAt: "2026-08-25T08:00:00Z" }], now)).toBe(true);
    expect(hasRecentAutoCancellation(1, [{ assignedTableId: 1, status: "cancelled", noShowNotifiedAt: "2026-08-23T08:00:00Z" }], now)).toBe(false);
    expect(hasRecentAutoCancellation(1, [{ assignedTableId: 1, status: "cancelled", noShowNotifiedAt: null }], now)).toBe(false);
  });

  it("filters by auto-cancelled tables and sorts by seats or minimum charge", () => {
    const reservations = [{ assignedTableId: 1, status: "cancelled", noShowNotifiedAt: "2026-08-25T08:00:00Z" }];
    expect(getVisibleTables(tables, reservations, "auto_cancelled", "name", now).map(table => table.id)).toEqual([1]);
    expect(getVisibleTables(tables, [], "all", "seats", now).map(table => table.id)).toEqual([2, 1]);
    expect(getVisibleTables(tables, [], "all", "minimumCharge", now).map(table => table.id)).toEqual([2, 1]);
  });
});
