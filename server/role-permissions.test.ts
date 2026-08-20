import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(testRole: "restaurant_admin" | "waiter" | "kitchen"): TrpcContext {
  return {
    user: { id: 10, openId: `role-${testRole}`, name: testRole, email: `${testRole}@nfood.local`, loginMethod: "test", role: "user", testRole, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

function adminContext(): TrpcContext {
  return {
    user: { id: 1, openId: "admin", name: "Admin", email: "admin@nfood.local", loginMethod: "test", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("role-based backend permissions", () => {
  it("allows central admin to read platform settings and blocks waiter", async () => {
    const admin = appRouter.createCaller(adminContext());
    const settings = await admin.platform.platformSettings();
    expect(settings).toEqual(expect.objectContaining({ defaultCurrency: expect.any(String), defaultTimezone: expect.any(String) }));
    const waiter = appRouter.createCaller(context("waiter"));
    await expect(waiter.platform.platformSettings()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(waiter.platform.updatePlatformSetting({ key: "supportEmail", value: "blocked@example.com" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks waiter from changing feature overrides", async () => {
    const caller = appRouter.createCaller(context("waiter"));
    await expect(caller.features.setOverride({ restaurantId: 1, featureId: 1, enabled: true })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks kitchen from changing feature overrides", async () => {
    const caller = appRouter.createCaller(context("kitchen"));
    await expect(caller.features.setOverride({ restaurantId: 1, featureId: 1, enabled: true })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows restaurant admin to reach the override procedure contract", async () => {
    const caller = appRouter.createCaller(context("restaurant_admin"));
    await expect(caller.features.setOverride({ restaurantId: 2, featureId: 1, enabled: true })).rejects.not.toMatchObject({ code: "FORBIDDEN" });
  });

  it.each(["cashier", "customer", "driver"] as const)("blocks %s from changing feature overrides", async (role) => {
    const caller = appRouter.createCaller(context(role));
    await expect(caller.features.setOverride({ restaurantId: 1, featureId: 1, enabled: true })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks waiter from creating a remote worker", async () => {
    const caller = appRouter.createCaller(context("waiter"));
    await expect(caller.remote.createWorker({ restaurantId: 1, userId: 22, role: "social-media", isAvailable: true })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows restaurant admin to reach remote worker creation contract", async () => {
    const caller = appRouter.createCaller(context("restaurant_admin"));
    await expect(caller.remote.createWorker({ restaurantId: 1, userId: 22, role: "social-media", isAvailable: true })).rejects.not.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows the central admin to read another restaurant's audit trail", async () => {
    const caller = appRouter.createCaller(adminContext());
    await expect(caller.platform.auditLogs({ restaurantId: 99 })).resolves.toBeDefined();
  });

  it("blocks a waiter from reading another restaurant's audit trail", async () => {
    const caller = appRouter.createCaller(context("waiter"));
    await expect(caller.platform.auditLogs({ restaurantId: 99 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
