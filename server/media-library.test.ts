import { describe, expect, it } from "vitest";
import { resolveMediaContext } from "./routers";

describe("media library scope isolation", () => {
  it("keeps central admin scopes explicit", () => {
    expect(resolveMediaContext({ user: { id: 1, role: "admin" } }, { scope: "platform" })).toEqual({ scope: "platform", restaurantId: undefined, ownerUserId: undefined });
    expect(resolveMediaContext({ user: { id: 1, role: "admin" } }, { scope: "restaurant", restaurantId: 7 })).toEqual({ scope: "restaurant", restaurantId: 7, ownerUserId: undefined });
    expect(resolveMediaContext({ user: { id: 1, role: "admin" } }, { scope: "user" })).toEqual({ scope: "user", restaurantId: undefined, ownerUserId: 1 });
  });

  it("locks restaurant roles to their restaurant", () => {
    expect(resolveMediaContext({ user: { id: 4, testRole: "kitchen", restaurantId: 9 } }, { scope: "user" })).toEqual({ scope: "restaurant", restaurantId: 9, ownerUserId: undefined });
    expect(resolveMediaContext({ user: { id: 5, testRole: "driver" } }, {})).toEqual({ scope: "restaurant", restaurantId: 1, ownerUserId: undefined });
  });

  it("keeps customer files user-scoped and rejects anonymous access", () => {
    expect(resolveMediaContext({ user: { id: 12, testRole: "customer" } }, { scope: "restaurant", restaurantId: 99 })).toEqual({ scope: "user", restaurantId: undefined, ownerUserId: 12 });
    expect(() => resolveMediaContext({ user: null }, {})).toThrow();
  });
});
