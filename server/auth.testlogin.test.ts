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

  it.each([
    ["admin", "admin"],
    ["restaurant", "restaurant_admin"],
    ["waiter", "waiter"],
    ["kitchen", "kitchen"],
    ["bar", "bar"],
    ["cashier", "cashier"],
    ["customer", "customer"],
    ["driver", "driver"],
  ] as const)("accepts the username alias %s", async (username, role) => {
    const caller = appRouter.createCaller(loginContext());
    const result = await caller.auth.testLogin({ email: username, password: "123456" });
    expect(result).toMatchObject({ success: true, role });
  });

  it("rejects an invalid password", async () => {
    const caller = appRouter.createCaller(loginContext());
    await expect(caller.auth.testLogin({ email: "nfood@ret.com", password: "wrong-password" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it.each([
    ["nfood@ret.com", "restaurant_admin"],
    ["nfood.waiter@ret.com", "waiter"],
    ["nfood.kitchen@ret.com", "kitchen"],
    ["nfood.bar@ret.com", "bar"],
    ["nfood.cashier@ret.com", "cashier"],
    ["nfood.client@ret.com", "customer"],
    ["nfood.driver@ret.com", "driver"],
  ] as const)("returns the correct dashboard role for %s", async (email, role) => {
    const caller = appRouter.createCaller(loginContext());
    const result = await caller.auth.testLogin({ email, password: "123456" });
    expect(result).toMatchObject({ success: true, role });
  });
});
