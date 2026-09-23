import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const admin = readFileSync(new URL("./ActivitiesSectorsAdmin.tsx", import.meta.url), "utf8");
const view = readFileSync(new URL("./ActivitiesSectorsView.tsx", import.meta.url), "utf8");
const shell = readFileSync(new URL("./CentralAdminCommandCenter.tsx", import.meta.url), "utf8");

describe("Super Admin activities and sectors", () => {
  it("uses live sector sources and real mutations", () => {
    expect(admin).toContain("trpc.admin.sectorCatalog.useQuery");
    expect(admin).toContain("trpc.marketplace.adminSectors.useQuery");
    expect(admin).toContain("trpc.marketplace.createSector.useMutation");
    expect(admin).toContain("trpc.admin.updateSectorMeta.useMutation");
  });

  it("keeps the September 21 reference controls and responsive activity cards", () => {
    expect(view).toContain('dir={lang === "ar" ? "rtl" : "ltr"}');
    expect(view).toContain("grid grid-cols-2 gap-3 xl:grid-cols-4");
    expect(view).toContain("min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4");
    expect(view).toContain("onPreview");
    expect(view).toContain("onEdit");
    expect(view).toContain("onToggle");
    expect(view).toContain('value="registered"');
    expect(view).toContain('value="active"');
    expect(view).toContain('value="inactive"');
    expect(view).toContain("min-h-[230px]");
    expect(view).toContain("border-dashed border-slate-600");
  });

  it("keeps the reference admin shell RTL, sidebar, header and mobile navigation", () => {
    expect(shell).toContain('dir={direction}');
    expect(shell).toContain('direction === "rtl" ? "right-0 border-l" : "left-0 border-r"');
    expect(shell).toContain('w-[248px]');
    expect(shell).toContain('xl:w-[272px]');
    expect(shell).toContain('bg-[#07182b]');
    expect(shell).toContain('lg:mr-[248px] xl:mr-[272px]');
    expect(shell).toContain('lg:ml-[248px] xl:ml-[272px]');
    expect(shell).toContain('className="sticky top-0 z-20');
    expect(shell).toContain('lg:hidden');
    expect(shell).toContain('w-[280px]');
    expect(shell).toContain('NAV_LABELS[active]');
  });
});
