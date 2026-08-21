import { describe, expect, it } from "vitest";
import { legacyCustomerUrl, publicVcardUrl } from "./publicVcardUrl";

describe("publicVcardUrl", () => {
  it("builds the canonical vcard route and encodes the slug", () => {
    expect(publicVcardUrl("https://nfood.io///", "foon cards")).toBe("https://nfood.io/vcard/foon%20cards");
  });

  it("keeps the legacy customer route available", () => {
    expect(legacyCustomerUrl("https://nfood.io/", "foon-cards")).toBe("https://nfood.io/customer/foon-cards");
  });
});
