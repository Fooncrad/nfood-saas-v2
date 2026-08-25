import { describe, expect, it } from "vitest";
import { buildStableQrMenuUrl } from "./qrUrl";

describe("stable QR menu URLs", () => {
  it("uses the restaurant identifier and token, not a mutable slug", () => {
    expect(buildStableQrMenuUrl("https://nfood.example///", "42", "table-1-a/b")).toBe("https://nfood.example/menu/42?qr=table-1-a%2Fb");
  });

  it("encodes identifiers and tokens safely", () => {
    const url = buildStableQrMenuUrl("https://nfood.example", "42", "waiter call?table=2");
    expect(url).toContain("/menu/42?");
    expect(url).toContain("waiter%20call%3Ftable%3D2");
  });
});
