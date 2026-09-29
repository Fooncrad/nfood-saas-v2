import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("waiter call and reservation operational flows", () => {
  it("keeps waiter calls scoped to assigned tables and closes active calls when released", () => {
    const db = read("server/db.ts");
    const router = read("server/routers.ts");
    const panel = read("client/src/components/WaiterCallsPanel.tsx");
    expect(db).toContain("waiterTableAssignments");
    expect(db).toContain("closeActiveWaiterCallsForTable");
    expect(router).toContain("notifyWaiterCall: publicProcedure");
    expect(router).toContain("isWaiterAssignedToTable");
    expect(panel).toContain("waiterCallsMine.useQuery");
    expect(panel).toContain("acknowledgeWaiterCall.useMutation");
  });

  it("exposes unified reservation schedules, blackout management, and waiter cooldown policy", () => {
    const schedule = read("client/src/components/ReservationSchedulePanel.tsx");
    const router = read("server/routers.ts");
    expect(schedule).toContain("waiterCallCooldownMinutes");
    expect(schedule).toContain("reservationHelpText");
    expect(schedule).toContain("saveReservationBlackoutDate");
    expect(schedule).toContain("deleteReservationBlackoutDate");
    expect(router).toContain("reservationBlackoutDatesManage");
    expect(router).toContain("saveReservationBlackoutDate");
    expect(router).toContain("deleteReservationBlackoutDate");
  });

  it("keeps the modern public menu wired to reservation slots and deposits", () => {
    const menu = read("client/src/pages/RestaurantMenu.tsx");
    expect(menu).toContain("reservationSlots");
    expect(menu).toContain("reservationDepositAmount");
    expect(menu).toContain("createPublicReservation");
    expect(menu).toContain("اختر التاريخ والوقت المناسبين من الخيارات أعلاه.");
    expect(menu).not.toContain("لا توجد فترة حجز متاحة لهذا الفرع.");
  });

  it("normalizes Saudi WhatsApp links and hides branch selection for a single branch", () => {
    const menu = read("client/src/pages/RestaurantMenu.tsx");
    expect(menu).toContain("normalizeWhatsAppNumber");
    expect(menu).toContain("/^05\\d{8}$/");
    expect(menu).toContain('digits = `966${digits.slice(1)}`');
    expect(menu).toContain('href={`https://wa.me/${whatsappTarget}`}');
    expect(menu).toContain('branches.length > 1 && <div className="mt-5">');
  });
});
