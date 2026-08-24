import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { and, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { walletAccounts, walletTopupRequests, users } from "../drizzle/schema";
import { getDb } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(testRole: "customer" | "admin", userId: number): TrpcContext {
  return {
    user: { id: userId, openId: `wallet-test-${userId}`, name: "Wallet test", email: "wallet-test@nfood.local", loginMethod: "test", role: testRole === "admin" ? "admin" : "user", testRole, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("wallet top-up flow", () => {
  it("creates an authenticated top-up request and preserves its receipt reference", async () => {
    const db = await getDb();
    if (!db) return;
    const customer = (await db.select({ id: users.id }).from(users).limit(1))[0];
    if (!customer) return;
    const existingAccount = (await db.select({ id: walletAccounts.id }).from(walletAccounts).where(eq(walletAccounts.customerId, customer.id)).limit(1))[0];
    const caller = appRouter.createCaller(context("customer", customer.id));
    const receiptUrl = "https://storage.example.test/wallet-receipt.png";
    const created = await caller.platform.createWalletTopup({ amount: 17.5, currencyCode: "SAR", paymentMethod: "bank_transfer", receiptUrl });
    expect(created).toEqual(expect.objectContaining({ id: expect.any(Number), status: "pending" }));
    const row = (await db.select().from(walletTopupRequests).where(and(eq(walletTopupRequests.id, created.id), eq(walletTopupRequests.customerId, customer.id))).limit(1))[0];
    expect(row).toEqual(expect.objectContaining({ amount: "17.50", receiptUrl, status: "pending" }));
    await db.delete(walletTopupRequests).where(eq(walletTopupRequests.id, created.id));
    if (!existingAccount) await db.delete(walletAccounts).where(eq(walletAccounts.id, row.walletAccountId));
  });

  it("keeps the receipt upload contract wired to external storage", () => {
    const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    const panel = readFileSync(resolve(process.cwd(), "client/src/components/CustomerRewardsWalletPanel.tsx"), "utf8");
    expect(router).toContain("receiptBase64");
    expect(router).toContain("storagePut(`wallet-topups/");
    expect(router).toContain("receiptContentType");
    expect(panel).toContain("FileReader");
    expect(panel).toContain("إرفاق صورة أو PDF للإيصال");
    expect(panel).toContain("createWalletTopup");
  });
});
