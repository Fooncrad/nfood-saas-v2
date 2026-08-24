import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), "client/src", relativePath), "utf8");

describe("dashboard loading and density", () => {
  it("keeps auth loading compact and viewport-bound", () => {
    const home = read("pages/Home.tsx");
    expect(home).toContain("h-dvh items-center justify-center overflow-hidden");
    expect(home).toContain("min-h-28 items-center justify-center");
    expect(home).not.toContain("min-h-[380px]");
  });

  it("uses a compact dashboard content shell", () => {
    const layout = read("components/DashboardLayout.tsx");
    const skeleton = read("components/DashboardLayoutSkeleton.tsx");
    expect(layout).toContain("min-w-0 flex-1 p-3 sm:p-4");
    expect(skeleton).toContain("h-dvh overflow-hidden");
    expect(skeleton).toContain("h-40 rounded-xl");
  });
});
