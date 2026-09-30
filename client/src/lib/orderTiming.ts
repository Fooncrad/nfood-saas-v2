export function orderAgeMinutes(
  createdAt: string | Date | null | undefined,
  now = Date.now(),
) {
  if (!createdAt || !Number.isFinite(now)) return 0;
  const createdTime = createdAt instanceof Date ? createdAt.getTime() : new Date(createdAt).getTime();
  if (!Number.isFinite(createdTime) || createdTime >= now) return 0;
  return Math.floor((now - createdTime) / 60_000);
}
