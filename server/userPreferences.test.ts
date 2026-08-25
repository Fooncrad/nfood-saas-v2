import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { appRouter } from "./routers";
import { getDb, getTestAccountOpenId } from "./db";
import { userPreferences, users } from "../drizzle/schema";
import type { TrpcContext } from "./_core/context";

describe("user preference identity mapping", () => {
  it("maps negative test-session ids to the stable test openId", () => {
    expect(getTestAccountOpenId(-480001)).toBe("test_480001");
    expect(getTestAccountOpenId(-1)).toBe("test_1");
  });

  it("does not reinterpret persisted positive user ids", () => {
    expect(getTestAccountOpenId(1470001)).toBeNull();
    expect(getTestAccountOpenId(0)).toBeNull();
  });

  it("saves preferences for a negative test-session id without violating users FK", async () => {
    const db = await getDb();
    if (!db) return;
    const persistedUser = (await db.select().from(users).where(eq(users.openId, "test_480001")).limit(1))[0];
    if (!persistedUser) return;
    const before = (await db.select().from(userPreferences).where(eq(userPreferences.userId, persistedUser.id)).limit(1))[0];
    const context: TrpcContext = {
      user: { ...persistedUser, id: -480001, testRole: "admin" },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => undefined } as TrpcContext["res"],
    };
    try {
      await expect(appRouter.createCaller(context).platform.saveMyPreferences({
        language: "ar",
        themeMode: "system",
        themePreset: "olive-cream",
      })).resolves.toEqual(expect.objectContaining({ success: true }));
      const saved = (await db.select().from(userPreferences).where(eq(userPreferences.userId, persistedUser.id)).limit(1))[0];
      expect(saved).toEqual(expect.objectContaining({ language: "ar", themeMode: "system", themePreset: "olive-cream" }));
    } finally {
      if (before) {
        await db.update(userPreferences).set({ language: before.language, themeMode: before.themeMode, themePreset: before.themePreset, noteTemplatesJson: before.noteTemplatesJson, notificationPreferencesJson: before.notificationPreferencesJson, updatedAt: new Date() }).where(eq(userPreferences.userId, persistedUser.id));
      } else {
        await db.delete(userPreferences).where(eq(userPreferences.userId, persistedUser.id));
      }
    }
  });
});
