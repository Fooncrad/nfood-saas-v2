import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("NFOOD PWA contract", () => {
  it("registers the production service worker and forwards sync messages", () => {
    const main = read("client/src/main.tsx");
    expect(main).toContain('navigator.serviceWorker.register("/sw.js")');
    expect(main).toContain('new CustomEvent("nfood:sync-request")');
  });

  it("contains install, activation, cache fallback, and background sync handlers", () => {
    const worker = read("client/public/sw.js");
    expect(worker).toContain('addEventListener("install"');
    expect(worker).toContain('addEventListener("activate"');
    expect(worker).toContain('addEventListener("sync"');
    expect(worker).toContain('addEventListener("fetch"');
    expect(worker).toContain("nfood-data-sync");
    expect(worker).toContain("caches.match(request)");
  });

  it("ships role-specific manifests with maskable icon support", () => {
    for (const role of ["bar", "cashier", "customer", "driver", "kitchen", "restaurant_admin", "waiter"]) {
      const manifestPath = `client/public/manifest.${role}.webmanifest`;
      expect(existsSync(resolve(root, manifestPath))).toBe(true);
      const manifest = read(manifestPath);
      expect(manifest).toContain("nfood-icon-512");
      expect(manifest).toContain("nfood-icon-192");
      expect(manifest).toContain('"purpose": "any maskable"');
    }
  });
});
