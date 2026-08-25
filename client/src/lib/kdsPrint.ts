import type { Order } from "@/components/homeNavigation";

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>\"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character] ?? character);
}

export function buildKdsPrintMarkup(order: Order, stationLabel = "Kitchen") {
  const notes = [order.customerNote && `Customer: ${order.customerNote}`, order.cashierNotes && `Cashier: ${order.cashierNotes}`, order.deliveryNote && `Delivery: ${order.deliveryNote}`].filter(Boolean);
  return `<!doctype html><html><head><meta charset="utf-8"><title>KDS ${escapeHtml(order.id)}</title><style>@page{size:58mm auto;margin:3mm}body{width:52mm;margin:0;font-family:Arial,sans-serif;color:#111;font-size:11px}h1{font-size:16px;margin:0 0 5px;text-align:center}p{margin:3px 0}.meta{border-bottom:1px dashed #777;padding-bottom:5px;margin-bottom:5px}.items{font-weight:700;line-height:1.5}.note{border-top:1px dashed #777;margin-top:5px;padding-top:5px;font-size:10px}.footer{border-top:1px dashed #777;margin-top:7px;padding-top:5px;text-align:center;font-size:9px}</style></head><body dir="ltr"><h1>${escapeHtml(stationLabel)}</h1><div class="meta"><p><strong>Ticket:</strong> ${escapeHtml(order.id)}</p><p><strong>Table:</strong> ${escapeHtml(order.table)}</p><p><strong>Time:</strong> ${escapeHtml(order.time)}</p></div><div class="items">${escapeHtml(order.items || "No item details")}</div>${notes.length ? `<div class="note">${notes.map((note) => `<p>${escapeHtml(note)}</p>`).join("")}</div>` : ""}<div class="footer">Reprinted from NFOOD KDS</div><script>window.onload=function(){window.focus();window.print();};</script></body></html>`;
}
