export type QrPrintPaperSize = "58" | "80";

export type QrPrintTemplate = {
  size: QrPrintPaperSize;
  pageWidth: "58mm" | "80mm";
  qrPixels: 132 | 164;
  barcodeWidth: 150 | 205;
  cardPadding: "3mm" | "5mm";
};

export const QR_PRINT_TEMPLATES: Record<QrPrintPaperSize, QrPrintTemplate> = {
  "58": { size: "58", pageWidth: "58mm", qrPixels: 132, barcodeWidth: 150, cardPadding: "3mm" },
  "80": { size: "80", pageWidth: "80mm", qrPixels: 164, barcodeWidth: 205, cardPadding: "5mm" },
};

export function getQrPrintTemplate(size: QrPrintPaperSize): QrPrintTemplate {
  return QR_PRINT_TEMPLATES[size];
}
