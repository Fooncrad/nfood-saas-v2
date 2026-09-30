export function aggregateMarketplaceSectorCounts(
  listingCounts: ReadonlyArray<readonly [number, number]>,
  restaurantSectorId: number | null | undefined,
  restaurantMenuCount: number,
) {
  const counts = new Map<number, number>();

  for (const [sectorId, count] of listingCounts) {
    if (!Number.isFinite(sectorId) || !Number.isFinite(count) || count <= 0) continue;
    counts.set(sectorId, (counts.get(sectorId) ?? 0) + Math.trunc(count));
  }

  if (
    restaurantSectorId != null
    && Number.isFinite(restaurantSectorId)
    && Number.isFinite(restaurantMenuCount)
    && restaurantMenuCount > 0
  ) {
    counts.set(
      restaurantSectorId,
      (counts.get(restaurantSectorId) ?? 0) + Math.trunc(restaurantMenuCount),
    );
  }

  return counts;
}
