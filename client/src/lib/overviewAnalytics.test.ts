import { describe, expect, it } from "vitest";
import { buildBuckets, calculateGrowthPercent, comparisonSummary, integer } from "@/components/OverviewAnalyticsPanel";
import type { Order } from "@/components/homeNavigation";

const order = (overrides: Partial<Order>): Order => ({
  id: "#1",
  table: "A1",
  items: "1 × Latte",
  total: 1250.75,
  status: "new",
  time: "12:00",
  channel: "داخل المطعم",
  ageMinutes: 5,
  createdAt: new Date(),
  currencyCode: "SAR",
  ...overrides,
});

describe("Overview analytics", () => {
  it("uses English digits and rounds monetary values to integers", () => {
    expect(integer(1250.75)).toBe("1,251");
    expect(integer(5000.01)).toBe("5,000");
    expect(integer(Number.NaN)).toBe("0");
    expect(integer(1200)).not.toMatch(/[٠-٩]/);
  });

  it("calculates growth against the previous period using rounded percentages", () => {
    expect(calculateGrowthPercent(125, 100)).toBe(25);
    expect(calculateGrowthPercent(75, 100)).toBe(-25);
    expect(calculateGrowthPercent(25, 0)).toBeNull();
    expect(comparisonSummary(1500, 1000, 15, 10)).toEqual({ revenueGrowth: 50, orderGrowth: 50, averageGrowth: 0 });
  });

  it("creates the requested number of time buckets from real orders", () => {
    expect(buildBuckets([], "hour")).toHaveLength(24);
    expect(buildBuckets([], "day")).toHaveLength(7);
    expect(buildBuckets([], "week")).toHaveLength(8);
    expect(buildBuckets([], "month")).toHaveLength(12);
    expect(buildBuckets([], "year")).toHaveLength(5);
  });

  it("includes completed orders and excludes cancelled orders from revenue", () => {
    const now = new Date();
    const buckets = buildBuckets([
      order({ id: "#active", createdAt: now, status: "new", total: 200 }),
      order({ id: "#completed", createdAt: now, status: "completed", total: 900 }),
      order({ id: "#cancelled", createdAt: now, status: "cancelled" as never, total: 700 }),
    ], "day");
    expect(buckets.reduce((sum, bucket) => sum + bucket.orders, 0)).toBe(2);
    expect(buckets.reduce((sum, bucket) => sum + bucket.sales, 0)).toBe(1100);
  });
});
