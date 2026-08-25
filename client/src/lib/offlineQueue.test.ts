import { describe, expect, it } from "vitest";
import { enqueueOfflineItem, readOfflineQueue, writeOfflineQueue } from "./offlineQueue";

function storage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
}

describe("offline POS queue", () => {
  it("returns an empty queue for missing or invalid JSON", () => {
    const local = storage({ orders: "not-json" });
    expect(readOfflineQueue(local, "missing")).toEqual([]);
    expect(readOfflineQueue(local, "orders")).toEqual([]);
  });

  it("appends a scoped order with an offline id and persists it", () => {
    const local = storage();
    const queue = enqueueOfflineItem(local, "restaurant:7:branch:3", { restaurantId: 7, branchId: 3, total: "25.00" }, "offline-1");
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({ restaurantId: 7, branchId: 3, offlineId: "offline-1" });
    expect(readOfflineQueue(local, "restaurant:7:branch:3")).toHaveLength(1);
    expect(readOfflineQueue(local, "restaurant:8:branch:3")).toEqual([]);
  });

  it("does not enqueue the same offline id twice", () => {
    const local = storage();
    enqueueOfflineItem(local, "orders", { total: "10" }, "offline-1");
    const queue = enqueueOfflineItem(local, "orders", { total: "10" }, "offline-1");
    expect(queue).toHaveLength(1);
  });

  it("replaces the persisted queue after a successful drain", () => {
    const local = storage();
    writeOfflineQueue(local, "orders", [{ offlineId: "a", total: "10" }, { offlineId: "b", total: "20" }]);
    writeOfflineQueue(local, "orders", [{ offlineId: "b", total: "20" }]);
    expect(readOfflineQueue(local, "orders")).toEqual([{ offlineId: "b", total: "20" }]);
  });
});
