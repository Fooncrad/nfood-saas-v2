export type DashboardNavKey = "overview" | "admin" | "branches" | "orders" | "pos" | "kds" | "menu" | "tables" | "inventory" | "team" | "marketing" | "reservations" | "remote" | "security" | "health";

export type DashboardRole = "admin" | "restaurant_admin" | "waiter" | "kitchen" | "cashier" | "customer" | "driver";
export type DashboardAction = "orders.create" | "orders.status.update" | "inventory.manage" | "marketing.manage" | "reservations.create";

export const roleActions: Record<DashboardRole, DashboardAction[]> = {
  admin: [],
  restaurant_admin: ["orders.create", "orders.status.update", "inventory.manage", "marketing.manage", "reservations.create"],
  waiter: ["orders.create", "reservations.create"],
  kitchen: ["orders.status.update"],
  cashier: ["orders.create", "orders.status.update"],
  customer: [],
  driver: [],
};

export const roleNavigation: Record<DashboardRole, DashboardNavKey[]> = {
  admin: ["overview", "admin", "security", "health"],
  restaurant_admin: ["overview", "branches", "orders", "pos", "kds", "menu", "tables", "inventory", "team", "marketing", "reservations", "remote", "security"],
  waiter: ["overview", "orders", "tables", "reservations", "remote", "security"],
  kitchen: ["overview", "kds", "orders", "security"],
  cashier: ["overview", "pos", "orders", "tables", "security"],
  customer: ["overview", "orders", "reservations", "security"],
  driver: ["overview", "orders", "remote", "security"],
};

export function getVisibleNavigation(role: DashboardRole | string | undefined, isCentralAdmin = false): DashboardNavKey[] {
  if (isCentralAdmin || role === "admin") return ["overview", "admin", "security", "health"];
  if (!role || !(role in roleNavigation)) return ["overview"];
  return roleNavigation[role as DashboardRole];
}

export function isRoleNavigationAllowed(role: DashboardRole | undefined, key: DashboardNavKey): boolean {
  if (!role) return false;
  return roleNavigation[role].includes(key);
}

export function isRoleActionAllowed(role: DashboardRole | undefined, action: DashboardAction): boolean {
  if (!role) return false;
  return roleActions[role].includes(action);
}
