import { describe, expect, it } from "vitest";
import { enqueueOfflineItem, isOfflineDuplicateError, readOfflineQueue, replayOfflineQueue, writeOfflineQueue } from "./offlineQueue";

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

  it("removes successful and duplicate requests but preserves a transient failure", async () => {
    const local = storage();
    enqueueOfflineItem(local, "orders", { total: "10" }, "a");
    enqueueOfflineItem(local, "orders", { total: "20" }, "b");
    enqueueOfflineItem(local, "orders", { total: "30" }, "c");
    const result = await replayOfflineQueue(local, "orders", async (payload) => {
      if (payload.total === "20") throw { data: { code: "CONFLICT" } };
      if (payload.total === "30") throw new Error("temporary network failure");
    });
    expect(result).toEqual({ attempted: 3, syncedCount: 2, remainingCount: 1, stoppedOnError: true });
    expect(readOfflineQueue(local, "orders")).toEqual([{ total: "30", offlineId: "c" }]);
    expect(isOfflineDuplicateError({ data: { code: "CONFLICT" } })).toBe(true);
    expect(isOfflineDuplicateError(new Error("temporary network failure"))).toBe(false);
  });

  it("does not delete a new item appended while an older queue is replaying", async () => {
    const local = storage();
    enqueueOfflineItem(local, "orders", { total: "10" }, "a");
    enqueueOfflineItem(local, "orders", { total: "20" }, "b");
    let calls = 0;
    const result = await replayOfflineQueue(local, "orders", async (payload) => {
      calls += 1;
      if (calls === 1) enqueueOfflineItem(local, "orders", { total: "30" }, "c");
      expect(payload.total).not.toBe("30");
    });
    expect(result.syncedCount).toBe(2);
    expect(result.remainingCount).toBe(1);
    expect(readOfflineQueue(local, "orders")).toEqual([{ total: "30", offlineId: "c" }]);
  });

  it("stops before sending when the connection becomes unavailable", async () => {
    const local = storage();
    enqueueOfflineItem(local, "orders", { total: "10" }, "a");
    let online = false;
    const send = async () => { throw new Error("should not send while offline"); };
    const result = await replayOfflineQueue(local, "orders", send, () => online);
    expect(result).toEqual({ attempted: 0, syncedCount: 0, remainingCount: 1, stoppedOnError: true });
    online = true;
  });
});
