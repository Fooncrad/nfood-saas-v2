export type OfflineQueueItem<T> = T & { offlineId?: string };

export function readOfflineQueue<T>(storage: Pick<Storage, "getItem">, key: string): Array<OfflineQueueItem<T>> {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as Array<OfflineQueueItem<T>>) : [];
  } catch {
    return [];
  }
}

export function writeOfflineQueue<T>(storage: Pick<Storage, "setItem">, key: string, queue: Array<OfflineQueueItem<T>>) {
  storage.setItem(key, JSON.stringify(queue));
}

export function enqueueOfflineItem<T>(storage: Pick<Storage, "getItem" | "setItem">, key: string, payload: T, offlineId: string) {
  const queue = readOfflineQueue<T>(storage, key);
  if (queue.some((item) => item.offlineId === offlineId)) return queue;
  const next = [...queue, { ...payload, offlineId }];
  writeOfflineQueue(storage, key, next);
  return next;
}

export type OfflineReplayResult = {
  attempted: number;
  syncedCount: number;
  remainingCount: number;
  stoppedOnError: boolean;
};

function errorCode(error: unknown) {
  return error && typeof error === "object" && "data" in error
    ? (error as { data?: { code?: string } }).data?.code
    : undefined;
}

export function isOfflineDuplicateError(error: unknown) {
  return errorCode(error) === "CONFLICT";
}

export async function replayOfflineQueue<T extends object>(
  storage: Pick<Storage, "getItem" | "setItem">,
  key: string,
  send: (payload: T) => Promise<unknown>,
  isOnline: () => boolean = () => true,
): Promise<OfflineReplayResult> {
  const initialQueue = readOfflineQueue<T>(storage, key);
  let attempted = 0;
  let syncedCount = 0;
  let stoppedOnError = false;

  for (const queuedItem of initialQueue) {
    if (!isOnline()) {
      stoppedOnError = true;
      break;
    }
    attempted += 1;
    const offlineId = queuedItem.offlineId;
    const { offlineId: _offlineId, ...payload } = queuedItem;
    try {
      await send(payload as T);
      syncedCount += 1;
    } catch (error) {
      if (isOfflineDuplicateError(error)) {
        syncedCount += 1;
      } else {
        stoppedOnError = true;
        break;
      }
    }
    const currentQueue = readOfflineQueue<T>(storage, key);
    const nextQueue = offlineId
      ? currentQueue.filter((item) => item.offlineId !== offlineId)
      : currentQueue.slice(1);
    writeOfflineQueue(storage, key, nextQueue);
  }

  return {
    attempted,
    syncedCount,
    remainingCount: readOfflineQueue<T>(storage, key).length,
    stoppedOnError,
  };
}
