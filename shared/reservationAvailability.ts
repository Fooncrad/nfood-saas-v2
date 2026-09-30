export type ReservationSlotRule = {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number | null;
};

export const RESERVATION_TIME_CHOICES = ["12:00", "14:00", "17:00", "19:00", "20:00", "21:00", "22:00", "23:00"] as const;

function validTime(value?: string | null) {
  const candidate = value?.slice(0, 5) ?? "";
  return /^([01]\\d|2[0-3]):[0-5]\\d$/.test(candidate) ? candidate : null;
}

export function normalizeBranchReservationWindow(openingTime?: string | null, closingTime?: string | null) {
  const startTime = validTime(openingTime) ?? "09:00";
  const endTime = validTime(closingTime) ?? "23:00";
  return startTime === endTime ? { startTime: "00:00", endTime: "23:59" } : { startTime, endTime };
}

export function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function reservationDayOfWeek(dateKey: string) {
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(dateKey)) return null;
  const date = new Date(`${dateKey}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date.getDay();
}

export function reservationSlotsForDate<T extends ReservationSlotRule>(slots: T[], dateKey: string) {
  const day = reservationDayOfWeek(dateKey);
  return day === null ? [] : slots.filter((slot) => slot.dayOfWeek === day);
}

export function timeInsideReservationSlot(time: string, slot: ReservationSlotRule) {
  const start = validTime(slot.startTime);
  const end = validTime(slot.endTime);
  const candidate = validTime(time);
  if (!start || !end || !candidate) return false;
  if (start === end) return true;
  return start < end ? candidate >= start && candidate < end : candidate >= start || candidate < end;
}

export function availableReservationTimes(slots: ReservationSlotRule[], dateKey: string, candidates: readonly string[] = RESERVATION_TIME_CHOICES) {
  const matching = reservationSlotsForDate(slots, dateKey);
  return candidates.filter((time) => matching.some((slot) => timeInsideReservationSlot(time, slot)));
}

export function reservationSlotForTime<T extends ReservationSlotRule>(slots: T[], dateKey: string, time: string) {
  return reservationSlotsForDate(slots, dateKey).find((slot) => timeInsideReservationSlot(time, slot));
}
