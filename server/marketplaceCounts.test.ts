import { describe, expect, it } from "vitest";
import { aggregateMarketplaceSectorCounts } from "./marketplaceCounts";

describe("aggregateMarketplaceSectorCounts", () => {
  it("adds available restaurant menu items to existing marketplace listings", () => {
    const counts = aggregateMarketplaceSectorCounts([[1, 2], [2, 4]], 1, 5);

    expect(counts.get(1)).toBe(7);
    expect(counts.get(2)).toBe(4);
  });

  it("shows menu inventory when a restaurant has no marketplace listings", () => {
    const counts = aggregateMarketplaceSectorCounts([], 9, 5);

    expect(counts.get(9)).toBe(5);
  });

  it("ignores invalid or non-positive counts", () => {
    const counts = aggregateMarketplaceSectorCounts([[1, 3], [1, -2], [2, Number.NaN]], 1, 0);

    expect([...counts.entries()]).toEqual([[1, 3]]);
  });
});
