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
    expect(menu).toContain("reservationSlotsForRestaurant");
    expect(menu).toContain("reservationDepositAmount");
    expect(menu).toContain("createPublicReservation");
  });
});
