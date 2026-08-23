import { describe, expect, it } from "vitest";
import { resolvePublicDisplayLookup } from "./routers";

describe("short public display links", () => {
  it("resolves numeric links as screen ids", () => {
    expect(resolvePublicDisplayLookup("30002")).toEqual({ kind: "id", id: 30002 });
  });

  it("keeps long public tokens as token lookups", () => {
    expect(resolvePublicDisplayLookup("display-60001-example-token")).toEqual({
      kind: "token",
      token: "display-60001-example-token",
    });
  });
});
