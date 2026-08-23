import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");

function source(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("dashboard density and hierarchy", () => {
  it("keeps overview groups in a responsive dense grid", () => {
    const quickAccess = source("client/src/components/DashboardQuickAccess.tsx");
    expect(quickAccess).toContain('className="grid gap-3 xl:grid-cols-3"');
    expect(quickAccess).toContain("min-h-[72px]");
    expect(quickAccess).toContain("text-[13px] font-bold");
  });

  it("uses compact, readable sidebar controls", () => {
    const sidebar = source("client/src/components/HomeSidebar.tsx");
    expect(sidebar).toContain('h-[68px]');
    expect(sidebar).toContain('text-[13px] text-white');
    expect(sidebar).toContain('grid grid-cols-2 gap-1.5');
  });

  it("reduces shell chrome without removing mobile support", () => {
    const home = source("client/src/pages/Home.tsx");
    expect(home).toContain('h-[68px]');
    expect(home).toContain('p-4 pb-20 md:p-5 xl:p-6');
    expect(home).toContain('lg:hidden');
  });
});
