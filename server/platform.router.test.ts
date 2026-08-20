import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(role: "admin" | "user" = "user", testRole?: "restaurant_admin" | "waiter"): TrpcContext {
  return {
    user: { id: 7, openId: "platform-test", name: "اختبار", email: "test@nfood.local", loginMethod: "test", role, testRole, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("platform procedures", () => {
  it("allows an authenticated user to read the platform collections", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.platform.restaurants()).resolves.toBeDefined();
    await expect(caller.platform.branches({ restaurantId: 1 })).resolves.toBeDefined();
    await expect(caller.platform.menuItems({})).resolves.toBeDefined();
  });

  it("blocks a test-role user from another restaurant tenant", async () => {
    const caller = appRouter.createCaller(context("user", "waiter"));
    await expect(caller.platform.restaurantById({ id: 2 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.platform.menuItems({ restaurantId: 2 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects unauthenticated access to protected platform procedures", async () => {
    const unauthenticated = { ...context(), user: null } as TrpcContext;
    const caller = appRouter.createCaller(unauthenticated);
    await expect(caller.platform.restaurants()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("accepts the POS/KDS order lifecycle statuses", async () => {
    const caller = appRouter.createCaller(context("admin"));
    await expect(caller.platform.updateOrderStatus({ orderId: 999999, status: "ready" })).resolves.toMatchObject({ success: true, status: "ready" });
  });
});
