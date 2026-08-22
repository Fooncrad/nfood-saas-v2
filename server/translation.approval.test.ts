import { describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { appRouter, getTranslationTargetLanguages } from "./routers";
import { getDb } from "./db";
import { menuCategories, restaurants } from "../drizzle/schema";
import type { TrpcContext } from "./_core/context";

function context(restaurantId: number): TrpcContext {
  return {
    user: { id: 1, openId: "translation-approval-test", name: "اختبار", email: "translation@nfood.local", loginMethod: "test", role: "user", testRole: "restaurant_admin", restaurantId, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("translation directions", () => {
  it.each([
    ["ar", ["ar", "en", "fr"], ["en", "fr"]],
    ["en", ["ar", "en", "fr"], ["ar", "fr"]],
    ["fr", ["ar", "fr", "en", "en"], ["ar", "en"]],
  ])("keeps %s as source and returns the other languages", (source, languages, expected) => {
    expect(getTranslationTargetLanguages(source as "ar" | "en" | "fr", languages)).toEqual(expected);
  });
});

describe("translation approval", () => {
  it("approves only a translation belonging to the active restaurant", async () => {
    const db = await getDb();
    if (!db) return;
    const restaurant = (await db.select({ id: restaurants.id }).from(restaurants).where(eq(restaurants.status, "active")).limit(1))[0];
    if (!restaurant) return;
    const category = (await db.select({ id: menuCategories.id, translationsJson: menuCategories.translationsJson }).from(menuCategories).where(eq(menuCategories.restaurantId, restaurant.id)).limit(1))[0];
    if (!category) return;
    const original = category.translationsJson;
    await db.update(menuCategories).set({ translationsJson: JSON.stringify([{ language: "en", name: "Approved category", description: "Reviewed copy", status: "draft" }]) }).where(and(eq(menuCategories.id, category.id), eq(menuCategories.restaurantId, restaurant.id)));
    try {
      const caller = appRouter.createCaller(context(restaurant.id));
      await expect(caller.platform.approveMenuTranslation({ restaurantId: restaurant.id, entityType: "category", entityId: category.id })).resolves.toEqual({ success: true, approvedCount: 1 });
      const updated = (await db.select({ translationsJson: menuCategories.translationsJson }).from(menuCategories).where(eq(menuCategories.id, category.id)).limit(1))[0];
      const translations = JSON.parse(updated?.translationsJson ?? "[]") as Array<{ status?: string; approvedAt?: string }>;
      expect(translations[0]?.status).toBe("approved");
      expect(translations[0]?.approvedAt).toEqual(expect.any(String));
      await expect(caller.platform.approveMenuTranslation({ restaurantId: restaurant.id + 999999, entityType: "category", entityId: category.id })).rejects.toMatchObject({ code: "FORBIDDEN" });
    } finally {
      await db.update(menuCategories).set({ translationsJson: original }).where(eq(menuCategories.id, category.id));
    }
  });
});
