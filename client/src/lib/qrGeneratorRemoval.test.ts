import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../components/QROperationsPanel.tsx", import.meta.url), "utf8");

describe("QR generator removal", () => {
  it("keeps only automatic menu QR and visual customization", () => {
    expect(source).toContain('data-testid="menu-qr-auto-card"');
    expect(source).toContain('data-testid="qr-visual-customization"');
    expect(source).not.toContain('data-testid="qr-table-builder"');
    expect(source).not.toContain("createTableQrCodes");
    expect(source).not.toContain("createWaiterCallQrCodes");
    expect(source).not.toContain("createOrderQrCode");
    expect(source).not.toContain("custom-qr-builder");
  });
});
