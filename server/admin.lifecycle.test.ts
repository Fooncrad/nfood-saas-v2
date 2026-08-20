import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function adminContext(): TrpcContext {
  return {
    user: { id: 7, openId: "admin-lifecycle-test", name: "اختبار إداري", email: "admin@nfood.local", loginMethod: "test", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("admin lifecycle guards", () => {
  it("rejects soft-delete for a missing restaurant without writing", async () => {
    await expect(appRouter.createCaller(adminContext()).admin.deleteRestaurant({ id: 999999999 })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects cancellation for a missing subscription without writing", async () => {
    await expect(appRouter.createCaller(adminContext()).admin.cancelSubscription({ id: 999999999 })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
