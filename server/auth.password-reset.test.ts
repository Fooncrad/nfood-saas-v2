import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function publicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {}, get: () => "nfood.test", ip: "127.0.0.1" } as unknown as TrpcContext["req"],
    res: { cookie: () => undefined, clearCookie: () => undefined } as unknown as TrpcContext["res"],
  };
}

describe("auth.passwordRecovery", () => {
  it("returns a generic response for an unknown email", async () => {
    const result = await appRouter.createCaller(publicContext()).auth.requestPasswordReset({ email: "unknown-password-reset@example.com" });
    expect(result.success).toBe(true);
    expect(result.message).toContain("إذا كان البريد مسجلًا");
    expect(result).not.toHaveProperty("resetToken");
  });

  it("rejects an invalid or expired reset token", async () => {
    await expect(appRouter.createCaller(publicContext()).auth.resetPassword({ token: "x".repeat(32), password: "new-password-123" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
