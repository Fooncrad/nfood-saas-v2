import { describe, expect, it } from "vitest";
import { registerPrinterHealthHeartbeat } from "./printerHealth";

describe("printer health heartbeat", () => {
  it("registers the scheduled printer health endpoint", () => {
    const paths: string[] = [];
    registerPrinterHealthHeartbeat({ post: (path) => { paths.push(path); return undefined; } });
    expect(paths).toEqual(["/api/scheduled/printer-health"]);
  });
});
