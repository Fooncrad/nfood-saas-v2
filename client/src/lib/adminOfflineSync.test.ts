import { describe, expect, it } from "vitest";
import { ADMIN_OFFLINE_QUEUE_KEY, enqueueAdminOfflineOperation, isAdminOfflineOperation, readAdminOfflineQueue, replayAdminOfflineQueue } from "@/lib/adminOfflineSync";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
}

describe("admin offline sync", () => {
  it("accepts only explicitly allowed non-sensitive admin operations", () => {
    expect(isAdminOfflineOperation({ procedure: "admin.updatePackagePlan", input: { id: 4, isActive: true } })).toBe(true);
    expect(isAdminOfflineOperation({ procedure: "admin.setPackagePlanFeature", input: { planId: 4, featureId: 8, enabled: true, featureLimit: 20 } })).toBe(true);
    expect(isAdminOfflineOperation({ procedure: "admin.upsertIntegrationSetting", input: { secret: "do-not-queue" } })).toBe(false);
    expect(isAdminOfflineOperation({ procedure: "admin.updatePackagePlan", input: null })).toBe(false);
  });

  it("queues operations with an id and timestamp under the admin namespace", () => {
    const storage = memoryStorage();
    const queue = enqueueAdminOfflineOperation(storage, { procedure: "admin.updateFeatureDefinition", input: { id: 9, label: "المخزون" } });
    expect(queue).toHaveLength(1);
    expect(queue[0]).toEqual(expect.objectContaining({ procedure: "admin.updateFeatureDefinition", offlineId: expect.any(String), queuedAt: expect.any(String) }));
    expect(storage.getItem(ADMIN_OFFLINE_QUEUE_KEY)).toContain("المخزون");
  });

  it("removes successful operations and keeps the first failed operation plus the rest", async () => {
    const storage = memoryStorage();
    enqueueAdminOfflineOperation(storage, { procedure: "admin.updatePackagePlan", input: { id: 1, name: "Growth" } });
    enqueueAdminOfflineOperation(storage, { procedure: "admin.setPackagePlanFeature", input: { planId: 1, featureId: 2, enabled: true } });
    const result = await replayAdminOfflineQueue(storage, async (operation) => {
      if (operation.procedure === "admin.setPackagePlanFeature") throw new Error("temporary network failure");
    });
    expect(result).toEqual({ syncedCount: 1, remainingCount: 1 });
    expect(readAdminOfflineQueue(storage)).toHaveLength(1);
    expect(readAdminOfflineQueue(storage)[0].procedure).toBe("admin.setPackagePlanFeature");
  });
});
