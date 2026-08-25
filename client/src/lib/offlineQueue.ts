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
