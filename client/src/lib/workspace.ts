export type WorkspaceState = "empty" | "ready" | "stale";

export function getWorkspaceState(restaurants: Array<{ id: number }>, selectedRestaurantId: number): WorkspaceState {
  if (restaurants.length === 0) return "empty";
  return restaurants.some((restaurant) => restaurant.id === selectedRestaurantId) ? "ready" : "stale";
}
