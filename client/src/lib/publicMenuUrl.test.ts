import { describe, expect, it } from "vitest";
import { publicMenuUrl } from "./publicMenuUrl";

describe("publicMenuUrl", () => {
  it("builds a direct public menu route and encodes the restaurant slug", () => {
    expect(publicMenuUrl("https://nfood.io/", "nfood-main branch")).toBe("https://nfood.io/restaurant/nfood-main%20branch");
  });

  it("removes trailing slashes from the origin", () => {
    expect(publicMenuUrl("https://restaurant.example.com///", "flavor-house")).toBe("https://restaurant.example.com/restaurant/flavor-house");
  });
});
