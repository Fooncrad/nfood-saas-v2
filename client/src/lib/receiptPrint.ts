type PrintableReceipt = {
  orderId: number;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
  pricing: { subtotal: string; discountPercent: number; discountAmount: string; taxPercent: number; taxAmount: string; total: string; couponCode?: string | null };
};

type ReceiptBranding = { restaurantName?: string | null; headerText?: string | null; footerText?: string | null; logoUrl?: string | null };

function escapePrintText(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

function money(value: number) {
  return `${value.toLocaleString("ar-SA")} ر.س`;
}

export function printReceipt(receipt: PrintableReceipt, template: "thermal" | "detailed", branding: ReceiptBranding = {}) {
  const popup = window.open("", "nfood-thermal-receipt", "width=420,height=720");
  if (!popup) { window.print(); return; }
  const title = escapePrintText(branding.headerText?.trim() || branding.restaurantName?.trim() || "NFOOD");
  const footer = escapePrintText(branding.footerText?.trim() || "شكرًا لزيارتكم");
  const logo = branding.logoUrl ? `<img class="logo" src="${escapePrintText(branding.logoUrl)}" alt="شعار المطعم" />` : "";
  const items = receipt.items.map((item) => `<div class="row"><span>${escapePrintText(item.name)} × ${item.quantity}</span><strong>${money(item.unitPrice * item.quantity)}</strong></div>`).join("");
  const extra = template === "detailed" ? `<div class="row muted"><span>نسبة الخصم</span><span>${receipt.pricing.discountPercent}%${receipt.pricing.couponCode ? ` · ${escapePrintText(receipt.pricing.couponCode)}` : ""}</span></div><div class="row muted"><span>نسبة الضريبة</span><span>${receipt.pricing.taxPercent}%</span></div>` : "";
  popup.document.write(`<html dir="rtl"><head><title>إيصال #${receipt.orderId}</title><style>body{font-family:Arial,sans-serif;width:80mm;margin:0 auto;padding:8px;color:#111;font-size:12px}.logo{display:block;max-width:42mm;max-height:22mm;object-fit:contain;margin:0 auto 8px}.title{text-align:center;font-size:17px;font-weight:800;margin-bottom:4px}.order{text-align:center;color:#666;margin-bottom:8px}.row{display:flex;justify-content:space-between;gap:8px;border-bottom:1px dashed #bbb;padding:7px 0}.muted{color:#666}.total{font-size:16px;font-weight:800;border-top:2px solid #111;margin-top:8px}.small{text-align:center;color:#666;margin-top:14px;font-size:10px;white-space:pre-wrap}@media print{body{width:80mm}}</style></head><body>${logo}<div class="title">${title}</div><div class="order">إيصال الطلب #${receipt.orderId}</div>${items}<div class="row muted"><span>قبل الخصم</span><span>${escapePrintText(money(Number(receipt.pricing.subtotal)))}</span></div><div class="row muted"><span>الخصم</span><span>- ${escapePrintText(money(Number(receipt.pricing.discountAmount)))}</span></div>${extra}<div class="row total"><span>الإجمالي</span><span>${escapePrintText(money(Number(receipt.pricing.total)))}</span></div><div class="small">${footer}</div><script>window.onload=()=>{window.focus();window.print();}</script></body></html>`);
  popup.document.close();
}
