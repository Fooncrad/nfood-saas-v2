import { describe, expect, it, vi } from "vitest";
import { __marketingTest, registerMarketingHeartbeat } from "./marketing";

describe("marketing heartbeat endpoint contract", () => {
  it("registers only the required scheduled callback path", () => {
    const routes: string[] = [];
    registerMarketingHeartbeat({ post: (path) => { routes.push(path); return undefined; } });
    expect(routes).toEqual(["/api/scheduled/marketing"]);
  });
  it("matches birthday month and day in UTC", () => {
    expect(__marketingTest.sameMonthDay(new Date("2026-08-21T02:00:00Z"), new Date("2026-08-21T12:00:00Z"))).toBe(true);
    expect(__marketingTest.sameMonthDay(new Date("2026-08-20T23:00:00Z"), new Date("2026-08-21T12:00:00Z"))).toBe(false);
  });
});
