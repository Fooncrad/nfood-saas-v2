import { describe, expect, it } from "vitest";
import { QR_PRINT_TEMPLATES, getQrPrintTemplate } from "./qrPrintTemplates";

describe("QR print templates", () => {
  it("defines thermal templates for 58mm and 80mm paper", () => {
    expect(QR_PRINT_TEMPLATES["58"]).toMatchObject({ pageWidth: "58mm", qrPixels: 132, barcodeWidth: 150, cardPadding: "3mm" });
    expect(QR_PRINT_TEMPLATES["80"]).toMatchObject({ pageWidth: "80mm", qrPixels: 164, barcodeWidth: 205, cardPadding: "5mm" });
  });

  it("returns the selected template without changing its stable QR data contract", () => {
    expect(getQrPrintTemplate("58").pageWidth).toBe("58mm");
    expect(getQrPrintTemplate("80").pageWidth).toBe("80mm");
    expect(getQrPrintTemplate("58").size).not.toBe(getQrPrintTemplate("80").size);
  });
});
