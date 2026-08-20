import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAnonymousContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("security router", () => {
  it("protects session listing from anonymous callers", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    await expect(caller.security.sessions()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("protects revoke-all-sessions from anonymous callers", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    await expect(caller.security.revokeAllSessions()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("protects 2FA changes from anonymous callers", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    await expect(caller.security.setTwoFactor({ enabled: true })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
