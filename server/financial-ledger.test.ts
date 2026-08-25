import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import { createFinancialLedgerEntry, getDb, getOrCreateDriverSecurityDeposit, listFinancialLedgerEntries, recordDriverSecurityDepositTransaction } from "./db";
import { driverSecurityDepositTransactions, driverSecurityDeposits, financialLedgerEntries, restaurants, users } from "../drizzle/schema";

const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const ui = readFileSync(resolve(process.cwd(), "client/src/components/HomeModules.tsx"), "utf8");

describe("financial ledger and driver deposits", () => {
  it("defines tenant-scoped ledger and driver deposit tables", () => {
    expect(schema).toContain('mysqlTable("financialLedgerEntries"');
    expect(schema).toContain('mysqlTable("driverSecurityDeposits"');
    expect(schema).toContain('mysqlTable("driverSecurityDepositTransactions"');
    expect(schema).toContain('uniqueIndex("financial_ledger_idempotency_unique"');
    expect(schema).toContain('uniqueIndex("driver_security_deposits_driver_restaurant_unique"');
  });

  it("persists a ledger entry once and enforces driver balance rules", async () => {
    const db = await getDb();
    if (!db) return;
    const restaurant = (await db.select({ id: restaurants.id }).from(restaurants).limit(1))[0];
    const user = (await db.select({ id: users.id }).from(users).limit(1))[0];
    if (!restaurant || !user) return;
    const key = `financial-test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let depositId: number | undefined;
    try {
      const ledgerId = await createFinancialLedgerEntry({ restaurantId: restaurant.id, userId: user.id, createdByUserId: user.id, section: "test", entryType: "payment", direction: "credit", amount: "125.50", idempotencyKey: key, referenceType: "test" });
      expect(await createFinancialLedgerEntry({ restaurantId: restaurant.id, section: "test", entryType: "payment", direction: "credit", amount: "125.50", idempotencyKey: key })).toBe(ledgerId);
      const rows = await listFinancialLedgerEntries({ restaurantId: restaurant.id, section: "test", limit: 20 });
      expect(rows.some(row => row.id === ledgerId && row.amount === "125.50")).toBe(true);
      const account = await getOrCreateDriverSecurityDeposit({ restaurantId: restaurant.id, driverUserId: user.id, createdByUserId: user.id, openingBalance: "25.00" });
      depositId = account?.id;
      const movement = await recordDriverSecurityDepositTransaction({ restaurantId: restaurant.id, driverUserId: user.id, createdByUserId: user.id, type: "deposit", amount: "5.00" });
      expect(movement.balanceAfter).toBe("30.00");
      await expect(recordDriverSecurityDepositTransaction({ restaurantId: restaurant.id, driverUserId: user.id, createdByUserId: user.id, type: "withdrawal", amount: "31.00" })).rejects.toThrow("cannot be negative");
    } finally {
      if (depositId) {
        await db.delete(driverSecurityDepositTransactions).where(eq(driverSecurityDepositTransactions.depositAccountId, depositId));
        await db.delete(driverSecurityDeposits).where(eq(driverSecurityDeposits.id, depositId));
      }
      await db.delete(financialLedgerEntries).where(eq(financialLedgerEntries.idempotencyKey, key));
    }
  });

  it("protects routes and exposes the operations hub UI", () => {
    expect(router).toContain("financialLedger:");
    expect(router).toContain("driverSecurityDeposit:");
    expect(router).toContain("recordDriverSecurityDeposit:");
    expect(router).toContain('assertTeamPermission(ctx, "finance.read")');
    expect(ui).toContain("السجل المالي والودائع");
    expect(ui).toContain("السجل المالي الموحد");
    expect(ui).toContain("ودائع السائقين والأرصدة السابقة");
  });
});
