import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { testAccounts, users } from "../drizzle/schema";
import type { TrpcContext } from "./_core/context";
import { randomBytes, scryptSync } from "node:crypto";
import { eq } from "drizzle-orm";

function context(role: "admin" | "user" = "user", testRole?: "customer" | "driver", userId = 7): TrpcContext {
  return { user: { id: userId, openId: "account-test", name: "اختبار", email: "test@nfood.local", loginMethod: "test", role, testRole, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => undefined } as TrpcContext["res"] };
}

describe("admin account management", () => {
  it("restricts the directory and updates accounts without exposing passwordHash", async () => {
    const db = await getDb();
    if (!db) return;
    const actor = (await db.select({ id: users.id }).from(users).limit(1))[0];
    if (!actor) return;
    const salt = randomBytes(16).toString("base64");
    const email = `account-${Date.now()}@nfood.local`;
    const inserted = await db.insert(testAccounts).values({ email, displayName: "حساب إدارة اختبار", role: "customer", passwordHash: `scrypt$${salt}$${scryptSync("123456", Buffer.from(salt, "base64"), 64).toString("base64")}` });
    const id = Number(inserted[0].insertId);
    try {
      await expect(appRouter.createCaller(context("user", "customer", actor.id)).admin.accountDirectory()).rejects.toMatchObject({ code: "FORBIDDEN" });
      const admin = appRouter.createCaller(context("admin", undefined, actor.id));
      const directory = await admin.admin.accountDirectory();
      const account = directory.find((item) => item.id === id);
      expect(account).toEqual(expect.objectContaining({ id, email, isActive: true, role: "customer" }));
      expect(account).not.toHaveProperty("passwordHash");
      await admin.admin.updateManagedAccount({ id, email, displayName: "حساب معدل", role: "driver", isActive: false, password: "654321" });
      const updated = (await db.select().from(testAccounts).where(eq(testAccounts.id, id)).limit(1))[0];
      expect(updated).toEqual(expect.objectContaining({ email, displayName: "حساب معدل", role: "driver", isActive: false }));
    } finally {
      await db.delete(testAccounts).where(eq(testAccounts.id, id));
    }
  });
});
