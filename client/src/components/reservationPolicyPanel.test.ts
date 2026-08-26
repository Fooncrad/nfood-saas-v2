import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const policySource = readFileSync(new URL("./ReservationPolicyPanel.tsx", import.meta.url), "utf8");
const modulesSource = readFileSync(new URL("./HomeModules.tsx", import.meta.url), "utf8");
const scheduleSource = readFileSync(new URL("./ReservationSchedulePanel.tsx", import.meta.url), "utf8");

describe("reservation policy placement", () => {
  it("keeps booking intake and fees in the reservations section", () => {
    expect(modulesSource).toContain("<ReservationPolicyPanel restaurantId={restaurantId} />");
    expect(policySource).toContain("استقبال الحجوزات العامة");
    expect(policySource).toContain("تفعيل الإكرامية");
    expect(policySource).toContain("نسبة الإكرامية (%)");
    expect(policySource).toContain("تفعيل رسوم الخدمة");
    expect(policySource).toContain("نسبة رسوم الخدمة (%)");
  });

  it("documents every booking input and explains day/channel capacity rules", () => {
    expect(policySource).toContain("Help");
    expect(scheduleSource).toContain("الفتحات حسب اليوم والقناة");
    expect(scheduleSource).toContain("السعة");
    expect(scheduleSource).toContain("المدة بالدقائق");
    expect(policySource).toContain("إعدادات السائقين التشغيلية تبقى في قسم السائقين");
  });

  it("does not keep the moved fee block in the identity panel", () => {
    expect(modulesSource).not.toContain("تفعيل الإكرامية</span>");
    expect(modulesSource).not.toContain("تفعيل رسوم الخدمة</span>");
  });
});
