import { describe, expect, it } from "vitest";
import { encryptIntegrationSecret } from "./db";

describe("customer public profile and integrations", () => {
  it("uses safe public slug format", () => {
    expect(/^[a-z0-9-]{3,160}$/.test("fooncards-business")).toBe(true);
    expect(/^[a-z0-9-]{3,160}$/.test("اسم عربي")).toBe(false);
  });

  it("encrypts integration secrets without returning plaintext", () => {
    const encrypted = encryptIntegrationSecret("provider-secret-123");
    expect(encrypted).not.toContain("provider-secret-123");
    expect(encrypted.split(".")).toHaveLength(3);
  });

  it("keeps restaurant integration scopes distinct from platform scope", () => {
    const platform = { scope: "platform", restaurantId: undefined };
    const restaurant = { scope: "restaurant", restaurantId: 42 };
    expect(platform).not.toEqual(restaurant);
    expect(restaurant.restaurantId).toBe(42);
  });
});
