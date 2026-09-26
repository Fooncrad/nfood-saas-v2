import { trpc } from "@/lib/trpc";

export type FeatureAccess = {
  key: string;
  enabled: boolean;
  limit: number | null;
  reason: string;
};

export function useRestaurantFeatures(restaurantId?: number) {
  const query = trpc.features.allAccess.useQuery(
    { restaurantId: restaurantId ?? 0 },
    { enabled: Boolean(restaurantId), staleTime: 30_000 }
  );

  const access = new Map<string, FeatureAccess>(
    (query.data ?? []).map((feature: any) => [
      feature.key,
      {
        key: feature.key,
        enabled: Boolean(feature.access?.enabled),
        limit: feature.access?.limit ?? null,
        reason: feature.access?.reason ?? "unavailable",
      },
    ])
  );

  const can = (key: string) => access.get(key)?.enabled === true;
  const limit = (key: string) => access.get(key)?.limit ?? null;

  return { ...query, access, can, limit };
}
