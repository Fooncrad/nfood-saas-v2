export type OAuthRouteUser = {
  role?: string | null;
  testRole?: string | null;
  accountRole?: string | null;
};

const RESTAURANT_ACCOUNT_ROLES = new Set([
  "restaurant",
  "restaurant_admin",
  "waiter",
  "kitchen",
  "bar",
  "cashier",
  "driver",
  "accountant",
  "merchant",
]);

function effectiveOAuthRole(user?: OAuthRouteUser | null) {
  if (!user) return "";
  if (user.role === "admin" || user.testRole === "admin" || user.accountRole === "admin") return "admin";
  return String(user.testRole ?? user.accountRole ?? user.role ?? "");
}

function safeRequestedPath(path?: string | null) {
  return path?.startsWith("/") && !path.startsWith("//") && !path.includes("\\") && !/[\r\n]/.test(path)
    ? path
    : null;
}

export function oauthLandingPath(
  user: OAuthRouteUser | null | undefined,
  restaurantId: number | null | undefined,
  requestedPath?: string | null,
  customerFallback = "/customer-portal",
) {
  const role = effectiveOAuthRole(user);
  const requested = safeRequestedPath(requestedPath);
  if (role === "admin") return requested?.startsWith("/admin") ? requested : "/admin";
  if (RESTAURANT_ACCOUNT_ROLES.has(role) || restaurantId) {
    return requested?.startsWith("/restaurant/") ? requested : "/restaurant/dashboard";
  }
  if (!requested || /^\/login(?:[/?#]|$)/.test(requested) || requested.startsWith("/admin") || requested.startsWith("/restaurant/")) {
    return customerFallback;
  }
  return requested;
}
