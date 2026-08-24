import { describe, expect, it } from "vitest";
import { SUPPORT_ROUTE, SUPPORT_WHATSAPP_URL } from "./FloatingSupportActions";

describe("floating support actions", () => {
  it("keeps direct admin chat and support routes available", () => {
    expect(SUPPORT_WHATSAPP_URL).toContain("wa.me/966569867000");
    expect(SUPPORT_WHATSAPP_URL).toContain("NFOOD%20Support");
    expect(SUPPORT_ROUTE).toBe("/support");
  });
});
