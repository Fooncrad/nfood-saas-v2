import { describe, expect, it } from "vitest";
import { getWorkspaceState } from "./workspace";

describe("workspace selection", () => {
  it("returns empty when the account has no restaurants", () => {
    expect(getWorkspaceState([], 1)).toBe("empty");
  });

  it("returns stale when localStorage points to an unavailable restaurant", () => {
    expect(getWorkspaceState([{ id: 7 }], 1)).toBe("stale");
  });

  it("returns ready for a selected restaurant in the available list", () => {
    expect(getWorkspaceState([{ id: 7 }], 7)).toBe("ready");
  });
});
