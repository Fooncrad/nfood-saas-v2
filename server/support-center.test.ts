import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function anonymousContext(): TrpcContext {
  return { user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("support center access", () => {
  it("requires a signed-in user to list tickets", async () => {
    await expect(appRouter.createCaller(anonymousContext()).platform.supportTickets()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("requires a signed-in user to create a ticket", async () => {
    await expect(appRouter.createCaller(anonymousContext()).platform.createSupportTicket({ subject: "مشكلة اختبار", description: "وصف مشكلة اختبار واضح", priority: "normal" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
