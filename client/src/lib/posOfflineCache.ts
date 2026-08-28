export function readPosCache<T>(storage: Pick<Storage, "getItem">, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writePosCache<T>(storage: Pick<Storage, "setItem">, key: string, value: T) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
