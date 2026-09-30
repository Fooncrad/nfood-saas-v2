import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("accountant team role persistence", () => {
  it("keeps accountant in both persisted role enums and the non-destructive migration", () => {
    expect(read("drizzle/schema.ts")).toContain('"cashier", "accountant", "customer"');
    expect(read("drizzle/0196_test_accounts_accountant_role.sql")).toContain("'cashier','accountant','customer'");
    expect(read("drizzle/0196_test_accounts_accountant_role.sql")).not.toMatch(/DROP|DELETE|TRUNCATE/i);
  });

  it("persists accountRole when users are created or refreshed", () => {
    const db = read("server/db.ts");
    const routers = read("server/routers.ts");
    expect(db).toContain("values.accountRole = user.accountRole");
    expect(db).toContain("updateSet.accountRole = user.accountRole");
    expect(routers).toContain("accountRole: account.role");
    expect(routers).toContain("accountRole: input.role");
    expect(routers).toContain("set({ accountRole: input.role");
  });

  it("allows managers to create and edit accountant accounts from the team UI", () => {
    const routers = read("server/routers.ts");
    const panel = read("client/src/components/RestaurantTeamAccountsPanel.tsx");
    expect(routers.match(/z\.enum\(\["restaurant_admin", "waiter", "kitchen", "bar", "cashier", "accountant", "driver"\]\)/g)).toHaveLength(2);
    expect(panel).toContain('accountant: "محاسب"');
    expect(panel).toContain('"cashier", "accountant"');
  });
});
