export type ManagedAccountRole = "admin" | "restaurant_admin" | "waiter" | "kitchen" | "bar" | "cashier" | "customer" | "driver";
export type ManagedAccount = { id: number; restaurantId: number | null; email: string; displayName: string; role: ManagedAccountRole; isActive: boolean; createdAt: Date | string | number };
export type ManagedAccountFilters = { search?: string; role?: "all" | ManagedAccountRole; status?: "all" | "active" | "inactive" };

export function filterManagedAccounts(accounts: ManagedAccount[], filters: ManagedAccountFilters) {
  const query = filters.search?.trim().toLocaleLowerCase() ?? "";
  return accounts.filter((account) => {
    const haystack = `${account.displayName} ${account.email} ${account.role} ${account.restaurantId ?? ""}`.toLocaleLowerCase();
    const matchesSearch = !query || haystack.includes(query);
    const matchesRole = !filters.role || filters.role === "all" || account.role === filters.role;
    const matchesStatus = !filters.status || filters.status === "all" || (filters.status === "active" ? account.isActive : !account.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });
}

export function summarizeManagedAccounts(accounts: ManagedAccount[]) {
  return {
    total: accounts.length,
    active: accounts.filter((account) => account.isActive).length,
    inactive: accounts.filter((account) => !account.isActive).length,
    restaurants: new Set(accounts.filter((account) => account.restaurantId !== null).map((account) => account.restaurantId)).size,
  };
}

export function formatManagedAccountNumber(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
