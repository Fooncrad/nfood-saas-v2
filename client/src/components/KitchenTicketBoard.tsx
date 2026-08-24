import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ChefHat, Layers3, Loader2, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getOrderStatusPalette } from "@/lib/statusPalette";

type TicketOrder = { id: string; table: string; time: string; status: string; ageMinutes?: number; kitchenSectionId?: number | null; reservationDate?: string | Date | null; reservationEventType?: string | null; partySize?: number | null; childrenCount?: number | null };

function ticketReservationDate(value: TicketOrder["reservationDate"]) { if (!value) return null; const date = new Date(value); return Number.isFinite(date.getTime()) ? date : null; }
function ticketIsDeferred(order: TicketOrder) { const date = ticketReservationDate(order.reservationDate); return Boolean(date && date.getTime() > Date.now() + 5 * 60_000); }
function ticketReservationLabel(order: TicketOrder) { const date = ticketReservationDate(order.reservationDate); if (!date) return null; return `${date.toLocaleDateString("ar-SA", { day: "numeric", month: "short" })} · ${date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}${order.partySize ? ` · ${order.partySize} ضيف` : ""}${order.childrenCount ? ` · ${order.childrenCount} طفل` : ""}`; }

export function KitchenTicketBoard({ restaurantId, orders }: { restaurantId: number; orders: TicketOrder[] }) {
  const activeOrders = useMemo(() => orders.filter((order) => order.status !== "completed"), [orders]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(() => Number(activeOrders[0]?.id.replace("#", "")) || null);
  const selectedOrder = activeOrders.find((order) => Number(order.id.replace("#", "")) === selectedOrderId);
  useEffect(() => { if (!selectedOrderId && activeOrders[0]) setSelectedOrderId(Number(activeOrders[0].id.replace("#", ""))); }, [activeOrders, selectedOrderId]);
  const slaQuery = trpc.admin.kitchenSla.useQuery({ restaurantId }, { staleTime: 30_000, retry: false });
  const ticketQuery = trpc.platform.kitchenTickets.useQuery({ restaurantId, orderId: selectedOrderId ?? 0 }, { enabled: Boolean(selectedOrderId), retry: false, refetchInterval: 5000 });
  const printTicket = () => {
    if (!ticketQuery.data || !selectedOrder) { toast.error("لا توجد تذكرة جاهزة للطباعة"); return; }
    const body = ticketQuery.data.sections.map((section) => `<section><h2>قسم ${section.kitchenSectionId ?? "غير معيّن"}</h2>${section.items.map((item) => `<p>${item.quantity} × ${item.itemName}</p>`).join("")}</section>`).join("");
    const popup = window.open("", "_blank", "width=420,height=640");
    if (!popup) { toast.error("اسمح بالنوافذ المنبثقة للطباعة"); return; }
    const deferredLabel = ticketIsDeferred(selectedOrder) ? `<p><strong>طلب مؤجل — لا يبدأ التحضير قبل الموعد</strong></p>` : "";
    const reservationLabel = ticketReservationLabel(selectedOrder);
    popup.document.write(`<html dir="rtl"><head><title>طلب ${selectedOrder.id}</title><style>body{font-family:Arial;padding:24px}h1{font-size:22px}h2{font-size:16px;border-bottom:1px solid #ddd;padding-bottom:8px}p{font-size:15px}.deferred{color:#a16207;background:#fef3c7;padding:8px;border-radius:6px}</style></head><body><h1>NFOOD · ${selectedOrder.id}</h1><p>${selectedOrder.table} · ${selectedOrder.time}</p>${reservationLabel ? `<p>موعد الحجز: ${reservationLabel}</p>` : ""}${deferredLabel ? `<div class="deferred">${deferredLabel}</div>` : ""}${body}<script>window.onload=()=>window.print()</script></body></html>`);
    popup.document.close();
  };
  return <Card className="mt-5 rounded-2xl border-slate-200 bg-white shadow-sm" dir="rtl">
    <CardHeader className="flex-row items-center justify-between border-b border-slate-100"><div><CardTitle className="flex items-center gap-2 text-base"><Layers3 className="h-5 w-5 text-[#e76f3c]" /> تذاكر أقسام المطبخ</CardTitle><p className="mt-1 text-xs text-slate-500">اختر طلبًا لعرض الأصناف موزعة على القسم أو التصنيف المرتبط به.</p></div><Button variant="outline" size="sm" onClick={printTicket} disabled={!ticketQuery.data} className="rounded-xl"><Printer className="ml-1 h-4 w-4" /> طباعة</Button></CardHeader>
    <CardContent className="p-4">
      {activeOrders.length === 0 ? <div className="py-8 text-center text-sm text-slate-500"><ChefHat className="mx-auto mb-2 h-8 w-8 text-slate-300" />لا توجد طلبات مفتوحة لتقسيمها على أقسام المطبخ.</div> : <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <div className="space-y-2">{activeOrders.map((order) => { const numericId = Number(order.id.replace("#", "")); const thresholdMinutes = order.kitchenSectionId ? slaQuery.data?.find((section) => section.id === order.kitchenSectionId)?.thresholdMinutes ?? 15 : 15; const isDelayed = (order.ageMinutes ?? 0) >= thresholdMinutes; return <button key={order.id} onClick={() => setSelectedOrderId(numericId)} className={`w-full rounded-xl border p-3 text-right ${selectedOrderId === numericId ? "border-[#e76f3c] bg-orange-50" : "border-slate-100 bg-slate-50/70 hover:border-orange-200"}`}><div className="flex items-center justify-between text-xs font-bold"><span>{order.id}</span><Badge variant="outline" className={`rounded-md text-[10px] ${getOrderStatusPalette(order.status).className}`}><span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />{getOrderStatusPalette(order.status).label}</Badge></div><p className="mt-2 text-xs text-slate-500">{order.table} · {order.time}</p>{ticketIsDeferred(order) && <Badge className="mt-2 rounded-md bg-amber-500 text-[10px] text-white">مؤجل{ticketReservationLabel(order) ? ` · ${ticketReservationLabel(order)}` : ""}</Badge>}<span className={`mt-2 inline-flex rounded-md px-2 py-1 text-[10px] font-bold ${isDelayed && !ticketIsDeferred(order) ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-500"}`}>منذ {order.ageMinutes ?? 0} د · SLA {thresholdMinutes} د</span></button>; })}</div>
        <div>{ticketQuery.isLoading ? <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-8 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />جارٍ تقسيم عناصر الطلب...</div> : ticketQuery.isError ? <div className="flex items-start gap-2 rounded-xl bg-red-50 p-5 text-sm text-red-700"><AlertTriangle className="mt-0.5 h-4 w-4" />تعذر تحميل تذكرة الطلب. Request ID: kitchen-ticket-{selectedOrderId}</div> : ticketQuery.data?.sections.length ? <div className="grid gap-3 sm:grid-cols-2">{ticketQuery.data.sections.map((section) => <div key={section.kitchenSectionId ?? "unassigned"} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"><div className="mb-3 flex items-center justify-between"><div><h4 className="text-sm font-bold">{section.printer?.name || (section.kitchenSectionId ? `قسم المطبخ #${section.kitchenSectionId}` : "غير معيّن")}</h4><p className="mt-1 text-[10px] text-slate-400">{section.printer ? `${section.printer.printerType} · ${section.printer.printerAddress || "بدون عنوان"}` : section.routeSource === "unassigned" ? "بدون قاعدة توجيه" : `مصدر التوجيه: ${section.routeSource}`}</p></div><span className="text-[10px] text-slate-400">{section.items.length} أصناف</span></div><div className="space-y-2">{section.items.map((item) => <div key={item.orderItemId} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs"><span className="font-semibold">{item.itemName}</span><span className="font-bold text-[#e76f3c]">× {item.quantity}</span></div>)}</div>{!section.kitchenSectionId && <p className="mt-3 text-[10px] text-amber-700">عيّن القسم من المنيو لتوجيه هذا الصنف.</p>}</div>)}</div> : <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">لا توجد بنود محفوظة لهذا الطلب.</div>}</div>
      </div>}
    </CardContent>
  </Card>;
}

export default KitchenTicketBoard;
