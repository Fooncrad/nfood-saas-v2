export type DashboardNavKey = "overview" | "admin" | "branches" | "orders" | "pos" | "kds" | "menu" | "tables" | "inventory" | "team" | "marketing" | "reservations" | "remote" | "security" | "health";

export type DashboardRole = "restaurant_admin" | "waiter" | "kitchen" | "cashier" | "customer" | "driver";

export const roleNavigation: Record<DashboardRole, DashboardNavKey[]> = {
  restaurant_admin: ["overview", "admin", "branches", "orders", "pos", "kds", "menu", "tables", "inventory", "team", "marketing", "reservations", "remote", "security", "health"],
  waiter: ["overview", "orders", "tables", "reservations", "remote", "security"],
  kitchen: ["overview", "kds", "orders", "security"],
  cashier: ["overview", "pos", "orders", "tables", "security"],
  customer: ["overview", "orders", "reservations", "security"],
  driver: ["overview", "orders", "remote", "security"],
};

export function isRoleNavigationAllowed(role: DashboardRole | undefined, key: DashboardNavKey): boolean {
  if (!role) return false;
  return roleNavigation[role].includes(key);
}
