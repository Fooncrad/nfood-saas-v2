export type OfflineQueueItem<T> = T & { offlineId?: string; offlineAttempts?: number; offlineLastError?: string };
export type OfflineDeadLetterItem<T> = OfflineQueueItem<T> & { deadLetteredAt: string; deadLetterReason: string };

const TERMINAL_OFFLINE_CODES = new Set(["BAD_REQUEST", "CONFLICT", "FORBIDDEN", "UNAUTHORIZED", "NOT_FOUND", "PRECONDITION_FAILED", "UNPROCESSABLE_CONTENT"]);

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
  discardedCount: number;
  remainingCount: number;
  stoppedOnError: boolean;
};

function errorCode(error: unknown) {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as {
    data?: { code?: string };
    shape?: { data?: { code?: string } };
  };
  return candidate.data?.code ?? candidate.shape?.data?.code;
}

export function isOfflineTerminalError(error: unknown) {
  const code = errorCode(error);
  return typeof code === "string" && TERMINAL_OFFLINE_CODES.has(code);
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
  let discardedCount = 0;
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
      if (isOfflineTerminalError(error)) {
        discardedCount += 1;
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
    discardedCount,
    remainingCount: readOfflineQueue<T>(storage, key).length,
    stoppedOnError,
  };
}
