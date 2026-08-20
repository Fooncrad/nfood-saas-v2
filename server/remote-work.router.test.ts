import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(): TrpcContext {
  return {
    user: { id: 7, openId: "remote-test", name: "اختبار", email: "remote@nfood.local", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("remote work procedures", () => {
  it("protects tasks, messages, and notifications from unauthenticated access", async () => {
    const caller = appRouter.createCaller({ ...context(), user: null } as TrpcContext);
    await expect(caller.remote.tasks({ restaurantId: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.remote.messages({ taskId: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.notifications.mine()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("validates task value and title before attempting persistence", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.remote.createTask({ restaurantId: 1, type: "orders", title: "x", amount: "not-money", currency: "SAR", paymentMethod: "manual" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
