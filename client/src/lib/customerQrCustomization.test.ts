import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { customerProfiles } from "../../../drizzle/schema";

const profileSource = readFileSync(new URL("../pages/CustomerProfileSettings.tsx", import.meta.url), "utf8");

describe("customer QR customization", () => {
  it("uses QR for the customer profile and does not render Barcode", () => {
    expect(profileSource).toContain("QRCodeSVG");
    expect(profileSource).toContain("qrVisualConfig");
    expect(profileSource).toContain("تخصيص QR الخاص بملفك");
    expect(profileSource).not.toContain("Barcode");
    expect(profileSource).not.toContain("barcode");
  });

  it("persists visual QR settings on customer profiles", () => {
    expect(customerProfiles.qrVisualConfigJson).toBeDefined();
  });
});

export {};

// Keep the file as a client-side contract test; runtime QR rendering remains in the page.
void 0;
