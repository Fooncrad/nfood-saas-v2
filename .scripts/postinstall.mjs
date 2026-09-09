import { chmodSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

if (process.platform === "linux" || process.platform === "darwin") {
  const pnpmStore = join(process.cwd(), "node_modules", ".pnpm");
  if (!existsSync(pnpmStore)) {
    process.exit(0);
  }
  const binaries = new Set(["esbuild", "oxide"]);
  const fixed = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry);
      let stat;
      try {
        stat = statSync(full);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        walk(full);
      } else if (stat.isFile() && binaries.has(entry)) {
        try {
          chmodSync(full, 0o755);
          fixed.push(full);
        } catch {
          /* ignore per-file failures */
        }
      }
    }
  };
  walk(pnpmStore);
  if (fixed.length > 0) {
    console.log(`[postinstall] set executable bit on ${fixed.length} native binary(ies)`);
  } else {
    console.log("[postinstall] no esbuild/oxide native binaries found to fix");
  }
}