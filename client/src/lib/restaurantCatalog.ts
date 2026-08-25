export type RestaurantCatalogFilter = "الكل" | "نشط" | "تجربة" | "معلّق";

export type RestaurantCatalogPlan = { key: string; name: string };
export type RestaurantCatalogRow = { id: number; name: string; slug: string | null; plan: string | null; status: string; branchCount?: number };

export function formatCatalogMoney(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);
  return Math.round(Number.isFinite(amount) ? amount : 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

export function filterRestaurantRows(restaurants: RestaurantCatalogRow[], query: string, statusFilter: RestaurantCatalogFilter, planFilter: string, plans: RestaurantCatalogPlan[]) {
  const normalizedQuery = query.trim().toLowerCase();
  const selectedPlan = plans.find((plan) => plan.name === planFilter || plan.key === planFilter);
  return restaurants.filter((restaurant) => {
    const status = restaurant.status === "active" ? "نشط" : restaurant.status === "trial" ? "تجربة" : "معلّق";
    const matchesStatus = statusFilter === "الكل" || statusFilter === status;
    const matchesPlan = planFilter === "الكل" || (restaurant.plan ?? "غير محددة") === planFilter || Boolean(selectedPlan && (restaurant.plan === selectedPlan.key || restaurant.plan === selectedPlan.name));
    const searchableText = `${restaurant.name} ${restaurant.slug ?? ""} ${restaurant.plan ?? ""}`.toLowerCase();
    return matchesStatus && matchesPlan && searchableText.includes(normalizedQuery);
  });
}
