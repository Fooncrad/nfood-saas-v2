import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function loginContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {}, get: () => undefined, ip: "127.0.0.1" } as unknown as TrpcContext["req"],
    res: { cookie: () => undefined, clearCookie: () => undefined } as unknown as TrpcContext["res"],
  };
}

describe("auth.testLogin", () => {
  it("logs in a valid restaurant test account without returning a password", async () => {
    const caller = appRouter.createCaller(loginContext());
    const result = await caller.auth.testLogin({ email: "nfood@ret.com", password: "123456" });
    expect(result).toMatchObject({ success: true, role: "restaurant_admin" });
    expect(result).not.toHaveProperty("password");
  });

  it("rejects an invalid password", async () => {
    const caller = appRouter.createCaller(loginContext());
    await expect(caller.auth.testLogin({ email: "nfood@ret.com", password: "wrong-password" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
