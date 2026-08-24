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
    expect(quickAccess).toContain('className="grid gap-3 xl:grid-cols-2"');
    expect(quickAccess).toContain("nfood-quick-card");
    expect(quickAccess).toContain("text-xs font-bold");
  });

  it("uses compact, readable sidebar controls", () => {
    const sidebar = source("client/src/components/HomeSidebar.tsx");
    expect(sidebar).toContain('nfood-unified-sidebar');
    expect(sidebar).toContain('text-[13px] text-white');
    expect(sidebar).toContain('nfood-sidebar-nav nfood-scroll-area min-h-0 flex-1 space-y-1 overflow-y-auto');
  });

  it("reduces shell chrome without removing mobile support", () => {
    const home = source("client/src/pages/Home.tsx");
    expect(home).toContain('h-14 shrink-0');
    expect(home).toContain('h-dvh min-h-0 overflow-hidden');
    expect(home).toContain('nfood-dashboard-content nfood-scroll-area');
    expect(home).toContain('lg:hidden');
  });
});
