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
    expect(menu).toContain("nfood-waiter-dialog");
    expect(menu).toContain("اختر الطاولة");
    expect(menu).not.toContain("waiterCallEnabled !== false");
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

  it("renders a live cooldown timer and follows waiter acknowledgement for the customer", () => {
    const db = read(`${root}/server/db.ts`);
    const menu = read(`${root}/client/src/pages/RestaurantPublic.tsx`);
    expect(db).toContain("publicToken");
    expect(db).toContain("getPublicWaiterCallStatus");
    expect(db).toContain('status === "acknowledged"');
    expect(menu).toContain("waiterCallRemainingSeconds");
    expect(menu).toContain("waiterCallStatus");
    expect(menu).toContain('role="status"');
    expect(menu).toContain("waiterCallStorageKey");
    expect(menu).toContain("disabled={waiterCallCooldownActive");
  });

  it("marks blackout days visibly before the customer submits a reservation", () => {
    const menu = read(`${root}/client/src/pages/RestaurantPublic.tsx`);
    expect(menu).toContain("reservationBlackoutDates.filter");
    expect(menu).toContain("bg-rose-50");
    expect(menu).toContain("selectedReservationBlackout &&");
    expect(menu).toContain("disabled={Boolean(selectedReservationBlackout)");
  });

  it("renders manager response statistics without exposing them to waiter views", () => {
    const statsPanel = read(`${root}/client/src/components/WaiterResponseStatsPanel.tsx`);
    const home = read(`${root}/client/src/pages/Home.tsx`);
    const panel = read(`${root}/client/src/components/WaiterCallsPanel.tsx`);
    expect(statsPanel).toContain("waiterResponseStats.useQuery");
    expect(statsPanel).toContain("averageResponseSeconds");
    expect(home).toContain('role === "restaurant_admin" && <WaiterResponseStatsPanel');
    expect(panel).not.toContain("waiterResponseStats.useQuery");
  });

  it("supports optional sound and vibration when the waiter acknowledges a call", () => {
    const menu = read(`${root}/client/src/pages/RestaurantPublic.tsx`);
    expect(menu).toContain("WaiterCallAlertSettings");
    expect(menu).toContain("waiterCallAlertStorageKey");
    expect(menu).toContain("navigator.vibrate?.([120, 60, 120])");
    expect(menu).toContain("AudioContextClass");
    expect(menu).toContain("Confirmation alert");
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
