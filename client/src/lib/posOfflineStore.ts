export type PosOfflineEnvelope<T> = {
  id: string;
  createdAt: string;
  attempts: number;
  payload: T;
};

const DB_NAME = "nfood-pos";
const DB_VERSION = 1;
const STORE = "outbox";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open POS offline database"));
  });
}

function transaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: unknown) => void) => void): Promise<T> {
  return openDb().then((db) => new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    run(tx.objectStore(STORE), resolve, reject);
    tx.oncomplete = () => db.close();
    tx.onerror = () => { db.close(); reject(tx.error ?? new Error("POS offline transaction failed")); };
  }));
}

export async function listPosOffline<T>(): Promise<Array<PosOfflineEnvelope<T>>> {
  if (typeof indexedDB === "undefined") return [];
  return transaction("readonly", (store, resolve, reject) => {
    const request = store.index("createdAt").getAll();
    request.onsuccess = () => resolve(request.result as Array<PosOfflineEnvelope<T>>);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueuePosOffline<T>(payload: T, id = crypto.randomUUID()): Promise<string> {
  if (typeof indexedDB === "undefined") throw new Error("IndexedDB is unavailable");
  const envelope: PosOfflineEnvelope<T> = { id, payload, createdAt: new Date().toISOString(), attempts: 0 };
  await transaction<void>("readwrite", (store, resolve, reject) => {
    const request = store.put(envelope);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  return id;
}

export async function removePosOffline(id: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  await transaction<void>("readwrite", (store, resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function incrementPosOfflineAttempt<T>(item: PosOfflineEnvelope<T>): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  await transaction<void>("readwrite", (store, resolve, reject) => {
    const request = store.put({ ...item, attempts: item.attempts + 1 });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function replayPosOffline<T>(
  send: (payload: T) => Promise<unknown>,
  isOnline: () => boolean = () => navigator.onLine,
): Promise<{ synced: number; remaining: number }> {
  const queue = await listPosOffline<T>();
  let synced = 0;
  for (const item of queue) {
    if (!isOnline()) break;
    try {
      await send(item.payload);
      await removePosOffline(item.id);
      synced += 1;
    } catch {
      await incrementPosOfflineAttempt(item);
      break;
    }
  }
  return { synced, remaining: (await listPosOffline<T>()).length };
}
