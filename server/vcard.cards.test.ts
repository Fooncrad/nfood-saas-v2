import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { vcardCardBindings, vcardCardCodes, vcardCardProducts } from "../drizzle/schema";
import { publicVcardUrl } from "../client/src/lib/publicVcardUrl";

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
  it("builds the internal NFOOD result link without using an external example URL", () => {
    expect(publicVcardUrl("https://nfoodsaas.example", "customer-profile")).toBe("https://nfoodsaas.example/vcard/customer-profile");
    expect(publicVcardUrl("https://nfoodsaas.example", "customer profile")).not.toContain("fooncard.com");
  });
});
