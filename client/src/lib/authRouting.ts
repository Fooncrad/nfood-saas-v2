export type AuthRouteUser = {
  role?: string | null;
  testRole?: string | null;
  accountRole?: string | null;
};

export const RESTAURANT_AREA_ROLES = new Set([
  "restaurant_admin",
  "waiter",
  "kitchen",
  "bar",
  "cashier",
  "driver",
  "accountant",
]);

export function effectiveAccountRole(user?: AuthRouteUser | null) {
  if (!user) return "";
  if (user.role === "admin" || user.testRole === "admin" || user.accountRole === "admin") return "admin";
  return String(user.testRole ?? user.accountRole ?? user.role ?? "");
}

export function isRestaurantAreaAccount(user?: AuthRouteUser | null) {
  return RESTAURANT_AREA_ROLES.has(effectiveAccountRole(user));
}

function safeInternalPath(path?: string | null) {
  return path?.startsWith("/") && !path.startsWith("//") ? path : undefined;
}

export function authenticatedLandingPath(user: AuthRouteUser, requestedPath?: string | null) {
  const role = effectiveAccountRole(user);
  const requested = safeInternalPath(requestedPath);
  if (role === "admin") return requested?.startsWith("/admin") ? requested : "/admin";
  if (RESTAURANT_AREA_ROLES.has(role)) {
    return requested?.startsWith("/restaurant/") ? requested : "/restaurant/dashboard";
  }
  if (requested?.startsWith("/admin") || requested?.startsWith("/restaurant/")) return "/customer-portal";
  return requested ?? "/customer-portal";
}
