import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../components/QROperationsPanel.tsx", import.meta.url), "utf8");

describe("QR generator removal", () => {
  it("removes only the custom generator while preserving operational QR tools", () => {
    expect(source).not.toContain('data-testid="custom-qr-builder"');
    expect(source).not.toContain("createCustomQrCode");
    expect(source).toContain('data-testid="qr-table-builder"');
    expect(source).toContain("printCodes(grouped.table)");
    expect(source).toContain("createTableQrCodes");
    expect(source).toContain("createWaiterCallQrCodes");
  });
});
