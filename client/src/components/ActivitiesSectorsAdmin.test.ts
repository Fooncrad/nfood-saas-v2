import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const admin = readFileSync(new URL("./ActivitiesSectorsAdmin.tsx", import.meta.url), "utf8");
const view = readFileSync(new URL("./ActivitiesSectorsView.tsx", import.meta.url), "utf8");

describe("Super Admin activities and sectors", () => {
  it("uses live sector sources and real mutations", () => {
    expect(admin).toContain("trpc.admin.sectorCatalog.useQuery");
    expect(admin).toContain("trpc.marketplace.adminSectors.useQuery");
    expect(admin).toContain("trpc.marketplace.createSector.useMutation");
    expect(admin).toContain("trpc.admin.updateSectorMeta.useMutation");
  });

  it("keeps reference controls and responsive activity cards", () => {
    expect(view).toContain("min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4");
    expect(view).toContain("onPreview");
    expect(view).toContain("onToggle");
    expect(view).toContain('value="registered"');
    expect(view).toContain("min-h-[260px]");
  });
});
