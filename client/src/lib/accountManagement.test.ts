import { describe, expect, it } from "vitest";
import { filterManagedAccounts, formatManagedAccountNumber, summarizeManagedAccounts, type ManagedAccount } from "./accountManagement";

const accounts: ManagedAccount[] = [
  { id: 1, restaurantId: 10, email: "admin@nfood.test", displayName: "Admin", role: "admin", isActive: true, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: 2, restaurantId: 10, email: "driver@nfood.test", displayName: "D Driver", role: "driver", isActive: false, createdAt: "2026-01-02T00:00:00.000Z" },
  { id: 3, restaurantId: null, email: "customer@nfood.test", displayName: "S Customer", role: "customer", isActive: true, createdAt: "2026-01-03T00:00:00.000Z" },
];

describe("account management model", () => {
  it("filters by search, role, and status", () => {
    expect(filterManagedAccounts(accounts, { search: "driver" }).map((account) => account.id)).toEqual([2]);
    expect(filterManagedAccounts(accounts, { role: "customer", status: "active" }).map((account) => account.id)).toEqual([3]);
    expect(filterManagedAccounts(accounts, { status: "inactive" }).map((account) => account.id)).toEqual([2]);
  });

  it("summarizes accounts using real tenant links", () => {
    expect(summarizeManagedAccounts(accounts)).toEqual({ total: 3, active: 2, inactive: 1, restaurants: 1 });
  });

  it("formats identifiers with English numerals and no decimal tail", () => {
    expect(formatManagedAccountNumber(480001)).toBe("480,001");
  });
});
