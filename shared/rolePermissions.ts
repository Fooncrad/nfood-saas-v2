export const TEAM_PERMISSION_CATALOG = [
  { key: "orders.read", label: "عرض الطلبات", group: "الطلبات" },
  { key: "orders.update", label: "تغيير حالات الطلبات", group: "الطلبات" },
  { key: "orders.cancel", label: "إلغاء الطلبات", group: "الطلبات" },
  { key: "kds.manage", label: "إدارة شاشة المطبخ", group: "التشغيل" },
  { key: "menu.read", label: "عرض المنيو", group: "المنيو" },
  { key: "menu.manage", label: "إدارة الأصناف والمنيو", group: "المنيو" },
  { key: "inventory.manage", label: "إدارة المخزون", group: "المخزون" },
  { key: "reservations.manage", label: "إدارة الحجوزات", group: "الحجوزات" },
  { key: "reports.read", label: "عرض التقارير", group: "التقارير" },
  { key: "finance.read", label: "عرض البيانات المالية", group: "المالية" },
  { key: "team.manage", label: "إدارة الفريق والحسابات", group: "الإدارة" },
  { key: "settings.manage", label: "إدارة إعدادات المطعم", group: "الإدارة" },
] as const;

export type TeamPermission = (typeof TEAM_PERMISSION_CATALOG)[number]["key"];
export const DEFAULT_TEAM_ROLE_PERMISSIONS: Record<string, TeamPermission[]> = {
  restaurant_admin: TEAM_PERMISSION_CATALOG.map((permission) => permission.key),
  waiter: ["orders.read", "orders.update", "menu.read", "reservations.manage"],
  kitchen: ["orders.read", "orders.update", "kds.manage", "menu.read"],
  cashier: ["orders.read", "orders.update", "orders.cancel", "menu.read"],
  driver: ["orders.read", "orders.update"],
  customer: ["menu.read", "orders.read"],
};

export function roleHasDefaultPermission(role: string | undefined, permission: TeamPermission) {
  return Boolean(role && DEFAULT_TEAM_ROLE_PERMISSIONS[role]?.includes(permission));
}
