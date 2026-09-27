export type PosOfflineEnvelope<T> = {
  id: string;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  status: "pending" | "retry" | "dead_letter";
  lastError: string | null;
  restaurantId: number | null;
  branchId: number | null;
  payload: T;
};

const DB_NAME = "nfood-pos";
const DB_VERSION = 2;
const STORE = "outbox";
const MAX_ATTEMPTS = 5;\nconst TERMINAL_CODES = new Set(["BAD_REQUEST", "FORBIDDEN", "UNAUTHORIZED", "NOT_FOUND", "PRECONDITION_FAILED", "UNPROCESSABLE_CONTENT"]);\n\nfunction getTrpcErrorCode(error: unknown) {\n  if (!error || typeof error !== "object") return undefined;\n  const candidate = error as { data?: { code?: string }; shape?: { data?: { code?: string } } };\n  return candidate.data?.code ?? candidate.shape?.data?.code;\n}\n\nexport function shouldRetryPosOffline(error: unknown) {\n  const code = getTrpcErrorCode(error);\n  if (!code) return true;\n  return !TERMINAL_CODES.has(code) && code !== "CONFLICT";\n}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      let store: IDBObjectStore;
      if (!db.objectStoreNames.contains(STORE)) {
        store = db.createObjectStore(STORE, { keyPath: "id" });
      } else {
        store = request.transaction!.objectStore(STORE);
      }
      if (!store.indexNames.contains("createdAt")) store.createIndex("createdAt", "createdAt");
      if (!store.indexNames.contains("restaurantId")) store.createIndex("restaurantId", "restaurantId");
      if (!store.indexNames.contains("status")) store.createIndex("status", "status");
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

function normalizeEnvelope<T>(item: Partial<PosOfflineEnvelope<T>> & { id: string; createdAt: string; payload: T }): PosOfflineEnvelope<T> {
  const payload = item.payload as T & { restaurantId?: number; branchId?: number };
  return {
    id: item.id,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt ?? item.createdAt,
    attempts: item.attempts ?? 0,
    status: item.status ?? "pending",
    lastError: item.lastError ?? null,
    restaurantId: item.restaurantId ?? payload?.restaurantId ?? null,
    branchId: item.branchId ?? payload?.branchId ?? null,
    payload: item.payload,
  };
}

export async function listPosOffline<T>(scope?: { restaurantId?: number; includeDeadLetter?: boolean }): Promise<Array<PosOfflineEnvelope<T>>> {
  if (typeof indexedDB === "undefined") return [];
  const rows = await transaction<Array<PosOfflineEnvelope<T>>>("readonly", (store, resolve, reject) => {
    const request = store.index("createdAt").getAll();
    request.onsuccess = () => resolve((request.result as Array<PosOfflineEnvelope<T>>).map(normalizeEnvelope));
    request.onerror = () => reject(request.error);
  });
  return rows.filter((item) => (scope?.restaurantId === undefined || item.restaurantId === scope.restaurantId) && (scope?.includeDeadLetter || item.status !== "dead_letter"));
}

export async function enqueuePosOffline<T extends { restaurantId?: number; branchId?: number }>(payload: T, id = crypto.randomUUID()): Promise<string> {
  if (typeof indexedDB === "undefined") throw new Error("IndexedDB is unavailable");
  const now = new Date().toISOString();
  const envelope: PosOfflineEnvelope<T> = { id, payload, createdAt: now, updatedAt: now, attempts: 0, status: "pending", lastError: null, restaurantId: payload.restaurantId ?? null, branchId: payload.branchId ?? null };
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

async function markPosOfflineFailure<T>(item: PosOfflineEnvelope<T>, error: unknown, terminal = false): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const attempts = item.attempts + 1;
  const message = error instanceof Error ? error.message.slice(0, 500) : "POS sync failed";
  await transaction<void>("readwrite", (store, resolve, reject) => {
    const request = store.put({ ...item, attempts, status: terminal || attempts >= MAX_ATTEMPTS ? "dead_letter" : "retry", lastError: message, updatedAt: new Date().toISOString() });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function replayPosOffline<T>(
  send: (payload: T) => Promise<unknown>,
  isOnline: () => boolean = () => navigator.onLine,
  scope?: { restaurantId?: number },
): Promise<{ synced: number; remaining: number; deadLetter: number }> {
  const queue = await listPosOffline<T>({ ...scope, includeDeadLetter: true });
  let synced = 0;
  for (const item of queue) {
    if (!isOnline()) break;
    if (item.status === "dead_letter") continue;
    try {
      await send(item.payload);
      await removePosOffline(item.id);
      synced += 1;
    } catch (error) {
      await markPosOfflineFailure(item, error);
      break;
    }
  }
  const after = await listPosOffline<T>({ ...scope, includeDeadLetter: true });
  return { synced, remaining: after.filter((item) => item.status !== "dead_letter").length, deadLetter: after.filter((item) => item.status === "dead_letter").length };
}
