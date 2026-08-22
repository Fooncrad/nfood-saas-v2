import { and, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { getDb, getOrCreateRestaurantArchiveFolder } from "./db";
import { mediaFolders, restaurants } from "../drizzle/schema";

describe("restaurant media archive", () => {
  it("resolves a valid creator when the session user id is temporary", async () => {
    const db = await getDb();
    if (!db) return;
    const restaurant = (await db.select({ id: restaurants.id }).from(restaurants).limit(1))[0];
    if (!restaurant) return;
    const existing = (await db.select({ id: mediaFolders.id }).from(mediaFolders).where(and(eq(mediaFolders.restaurantId, restaurant.id), eq(mediaFolders.name, "Menu Archive"))).limit(1))[0];
    const folderId = await getOrCreateRestaurantArchiveFolder(restaurant.id, -2730017);
    expect(folderId).toBeGreaterThan(0);
    const folder = (await db.select({ restaurantId: mediaFolders.restaurantId, name: mediaFolders.name }).from(mediaFolders).where(eq(mediaFolders.id, folderId)).limit(1))[0];
    expect(folder).toEqual({ restaurantId: restaurant.id, name: "Menu Archive" });
    if (!existing) await db.delete(mediaFolders).where(eq(mediaFolders.id, folderId));
  });
});
