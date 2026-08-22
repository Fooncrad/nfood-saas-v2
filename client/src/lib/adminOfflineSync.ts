import { enqueueOfflineItem, readOfflineQueue, writeOfflineQueue, type OfflineQueueItem } from "@/lib/offlineQueue";

export const ADMIN_OFFLINE_QUEUE_KEY = "nfood-offline-admin";

export type AdminOfflineOperation =
  | {
      procedure: "admin.updateFeatureDefinition";
      input: {
        id: number;
        label?: string;
        dependencyKey?: string | null;
        defaultLimit?: number | null;
        isAddOn?: boolean;
        addonPrice?: string | null;
      };
    }
  | {
      procedure: "admin.updatePackagePlan";
      input: {
        id: number;
        name?: string;
        description?: string | null;
        planType?: "free" | "monthly" | "yearly" | "trial" | "enterprise";
        monthlyPrice?: string;
        yearlyPrice?: string;
        isActive?: boolean;
      };
    }
  | {
      procedure: "admin.setPackagePlanFeature";
      input: {
        planId: number;
        featureId: number;
        enabled: boolean;
        featureLimit?: number | null;
      };
    };

export type QueuedAdminOfflineOperation = OfflineQueueItem<AdminOfflineOperation> & { queuedAt: string };

const allowedProcedures = new Set<AdminOfflineOperation["procedure"]>([
  "admin.updateFeatureDefinition",
  "admin.updatePackagePlan",
  "admin.setPackagePlanFeature",
]);

function createOfflineId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `admin-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isAdminOfflineOperation(value: unknown): value is AdminOfflineOperation {
  if (!value || typeof value !== "object") return false;
  const operation = value as Partial<AdminOfflineOperation>;
  return typeof operation.procedure === "string" && allowedProcedures.has(operation.procedure as AdminOfflineOperation["procedure"]) && typeof operation.input === "object" && operation.input !== null;
}

export function readAdminOfflineQueue(storage: Pick<Storage, "getItem">): Array<QueuedAdminOfflineOperation> {
  return readOfflineQueue<AdminOfflineOperation & { queuedAt: string }>(storage, ADMIN_OFFLINE_QUEUE_KEY).filter((operation): operation is QueuedAdminOfflineOperation => isAdminOfflineOperation(operation) && typeof operation.queuedAt === "string");
}

export function enqueueAdminOfflineOperation(storage: Pick<Storage, "getItem" | "setItem">, operation: AdminOfflineOperation) {
  const queued: QueuedAdminOfflineOperation = { ...operation, offlineId: createOfflineId(), queuedAt: new Date().toISOString() };
  const current = readAdminOfflineQueue(storage);
  const next = [...current, queued];
  writeOfflineQueue(storage, ADMIN_OFFLINE_QUEUE_KEY, next);
  return next;
}

export async function replayAdminOfflineQueue(storage: Pick<Storage, "getItem" | "setItem">, execute: (operation: AdminOfflineOperation) => Promise<void>) {
  const queue = readAdminOfflineQueue(storage);
  let remaining = [...queue];
  let syncedCount = 0;
  for (const queued of queue) {
    try {
      await execute(queued);
      remaining = remaining.slice(1);
      syncedCount += 1;
      writeOfflineQueue(storage, ADMIN_OFFLINE_QUEUE_KEY, remaining);
    } catch {
      break;
    }
  }
  return { syncedCount, remainingCount: remaining.length };
}
