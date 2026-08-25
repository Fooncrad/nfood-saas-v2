import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getVisibleNavigation } from "./roleNavigation";

const homeModules = readFileSync(new URL("../components/HomeModules.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../pages/Home.tsx", import.meta.url), "utf8");
const qrPanel = readFileSync(new URL("../components/QROperationsPanel.tsx", import.meta.url), "utf8");

describe("restaurant operations hub", () => {
  it("exposes the hub to restaurant managers and places it in operations navigation", () => {
    expect(getVisibleNavigation("restaurant_admin")).toContain("operations");
    expect(home).toContain('["operations", "orders", "pos", "kds"');
  });

  it("keeps the requested settings together as separate tabs", () => {
    expect(homeModules).toContain('data-restaurant-operations-hub');
    expect(homeModules).toContain('label: "الطاولات"');
    expect(homeModules).toContain('label: "الحجوزات"');
    expect(homeModules).toContain('label: "واجهة المنيو والقوالب"');
    expect(homeModules).toContain('key: "qr"');
    expect(homeModules).toContain('label: "QR المنيو"');
    expect(qrPanel).toContain('data-testid="menu-qr-auto-card"');
    expect(homeModules).toContain('label: "الفتحات وساعات العمل"');
    expect(homeModules).toContain('data-operations-tab={activeTab}');
  });

  it("formats dashboard money values through the shared normalizer", () => {
    expect(home).toContain('import { formatMoney } from "@shared/currencies";');
    expect(home).toContain('formatMoney("12840", "SAR", "en-US")');
    expect(home).toContain('formatMoney("8460", "SAR", "en-US")');
  });

  it("syncs table creation with saved sections and one branch fee", () => {
    expect(homeModules).toContain("trpc.platform.seatingSections.useQuery");
    expect(homeModules).toContain("اختر القسم المحفوظ");
    expect(homeModules).toContain("الفرع المحدد تلقائيًا");
    expect(homeModules).toContain("حفظ الرسم الثابت");
    expect(homeModules).toContain("seatingSectionId: seatingSections.find");
    expect(homeModules).toContain("updateBranchTableFee");
  });

  it("renders each operational unit behind its own tab", () => {
    expect(homeModules).toContain('activeTab === "tables" && <TablesView');
    expect(homeModules).toContain('activeTab === "reservations" && <ReservationsView');
    expect(homeModules).toContain('activeTab === "menu" && <BrandingPanel');
    expect(homeModules).toContain('activeTab === "hours" && <BranchesView');
  });
});

