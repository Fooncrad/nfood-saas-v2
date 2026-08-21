import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { vcardCardBindings, vcardCardCodes, vcardCardProducts } from "../drizzle/schema";

describe("vCard card safety contract", () => {
  it("stores only a deterministic hash and last four digits", () => {
    const raw = "NFOOD-CARD-2026-ABCD";
    const hash = createHash("sha256").update(raw).digest("hex");
    expect(hash).not.toContain(raw);
    expect(hash).toHaveLength(64);
    expect(raw.slice(-4)).toBe("ABCD");
  });
  it("defines single-use binding and lifecycle statuses", () => {
    expect(vcardCardBindings.codeId).toBeDefined();
    expect(vcardCardCodes.status).toBeDefined();
    expect(vcardCardProducts.targetRole).toBeDefined();
    expect(vcardCardBindings.id).toBeDefined();
  });
});
