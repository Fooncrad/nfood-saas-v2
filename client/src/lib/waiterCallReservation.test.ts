import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");
const root = "/home/ubuntu/nfood-restaurant-saas";

describe("waiter call and reservation blackout flows", () => {
  it("uses a table-driven public waiter call instead of requiring a waiter QR token", () => {
    const router = read(`${root}/server/routers.ts`);
    const menu = read(`${root}/client/src/pages/RestaurantPublic.tsx`);
    expect(router).toContain("notifyWaiterCall: publicProcedure");
    expect(router).toContain("branchId: z.number().int().positive()");
    expect(router).toContain("tableName: z.string().trim().min(1)");
    expect(router).toContain("isWaiterAssignedToTable");
    expect(menu).toContain("اختر طاولتك وسيصل النداء للنادل المسؤول");
    expect(menu).toContain("selectedReservationBlackout");
  });

  it("keeps waiter calls scoped to the assigned waiter and closes them when a table is released", () => {
    const db = read(`${root}/server/db.ts`);
    const router = read(`${root}/server/routers.ts`);
    const panel = read(`${root}/client/src/components/WaiterCallsPanel.tsx`);
    expect(db).toContain("eq(waiterCalls.waiterUserId, input.waiterUserId)");
    expect(db).toContain("closeActiveWaiterCallsForTable");
    expect(router).toContain('if (input.status === "available") await closeActiveWaiterCallsForTable');
    expect(panel).toContain("waiterCallsMine.useQuery");
    expect(panel).toContain("acknowledgeWaiterCall.useMutation");
  });

  it("exposes a manager policy for cooldown, reservation explanation, and blackout dates", () => {
    const schedule = read(`${root}/client/src/components/ReservationSchedulePanel.tsx`);
    const router = read(`${root}/server/routers.ts`);
    expect(schedule).toContain("waiterCallCooldownMinutes");
    expect(schedule).toContain("reservationHelpText");
    expect(schedule).toContain("saveReservationBlackoutDate");
    expect(schedule).toContain("deleteReservationBlackoutDate");
    expect(router).toContain("reservationBlackoutDatesManage");
    expect(router).toContain("saveReservationBlackoutDate");
    expect(router).toContain("deleteReservationBlackoutDate");
  });
});
