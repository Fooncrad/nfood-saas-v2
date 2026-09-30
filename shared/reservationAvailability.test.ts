import { describe, expect, it } from "vitest";
import { availableReservationTimes, localDateKey, normalizeBranchReservationWindow, reservationSlotForTime, reservationSlotsForDate } from "./reservationAvailability";

const slots = [
  { id: 10, dayOfWeek: 3, startTime: "18:00", endTime: "23:00", slotDurationMinutes: 60 },
  { id: 20, dayOfWeek: 4, startTime: "12:00", endTime: "15:00", slotDurationMinutes: 60 },
];

describe("reservation availability", () => {
  it("treats equal branch hours as a full-day reservation window", () => {
    expect(normalizeBranchReservationWindow("00:00", "00:00")).toEqual({ startTime: "00:00", endTime: "23:59" });
  });

  it("keeps local calendar dates instead of shifting them through UTC", () => {
    expect(localDateKey(new Date(2026, 8, 30, 0, 15))).toBe("2026-09-30");
  });

  it("matches only the selected weekday and its real times", () => {
    expect(reservationSlotsForDate(slots, "2026-09-30").map((slot) => slot.id)).toEqual([10]);
    expect(availableReservationTimes(slots, "2026-09-30")).toEqual(["19:00", "20:00", "21:00", "22:00"]);
    expect(reservationSlotForTime(slots, "2026-09-30", "20:00")?.id).toBe(10);
  });

  it("does not advertise times for a day without a reservation rule", () => {
    expect(availableReservationTimes(slots, "2026-10-02")).toEqual([]);
  });
});
