export type TableViewRow = {
  id: number;
  name: string;
  seats: number;
  status: string;
  minimumCharge: string | number | null;
  tableFee: string | number | null;
  tableType: string;
};

export type TableReservationSignal = {
  assignedTableId: number | null;
  status: string;
  noShowNotifiedAt: Date | string | number | null;
};

export type TableFilter = "all" | "available" | "occupied" | "reserved" | "auto_cancelled";
export type TableSort = "name" | "seats" | "minimumCharge";

export function hasRecentAutoCancellation(
  tableId: number,
  reservations: TableReservationSignal[],
  now = Date.now(),
  windowMs = 24 * 60 * 60 * 1000,
) {
  return reservations.some((reservation) => {
    if (reservation.assignedTableId !== tableId || reservation.status !== "cancelled" || !reservation.noShowNotifiedAt) return false;
    const timestamp = new Date(reservation.noShowNotifiedAt).getTime();
    return Number.isFinite(timestamp) && timestamp <= now && now - timestamp <= windowMs;
  });
}

export function getVisibleTables(
  tables: TableViewRow[],
  reservations: TableReservationSignal[],
  filter: TableFilter,
  sort: TableSort,
  now = Date.now(),
) {
  const visible = tables.filter((table) => {
    const autoCancelled = hasRecentAutoCancellation(table.id, reservations, now);
    return filter === "all" || (filter === "auto_cancelled" ? autoCancelled : table.status === filter);
  });
  return [...visible].sort((a, b) => {
    if (sort === "seats") return b.seats - a.seats || a.name.localeCompare(b.name, "ar");
    if (sort === "minimumCharge") return Number(b.minimumCharge ?? 0) - Number(a.minimumCharge ?? 0) || a.name.localeCompare(b.name, "ar");
    return a.name.localeCompare(b.name, "ar");
  });
}
