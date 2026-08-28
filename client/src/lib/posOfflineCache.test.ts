import { describe, expect, it } from "vitest";
import { readPosCache, writePosCache } from "./posOfflineCache";

function storage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
}

describe("POS offline cache", () => {
  it("round-trips the last known menu and branch snapshot", () => {
    const local = storage();
    const snapshot = { menu: [{ id: 7, name: "طبق تجريبي" }], branches: [{ id: 3, name: "الفرع الرئيسي" }] };
    expect(writePosCache(local, "pos:7", snapshot)).toBe(true);
    expect(readPosCache<typeof snapshot>(local, "pos:7")).toEqual(snapshot);
  });

  it("returns null instead of crashing on invalid persisted data", () => {
    const local = storage({ "pos:7": "not-json" });
    expect(readPosCache(local, "pos:7")).toBeNull();
  });
});
