import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Columns3, Eye, List, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompactModuleSummary } from "@/components/CompactModuleSummary";
import { type Order, type OrderStatus } from "@/components/homeNavigation";
import { actionPalette, getOrderStatusPalette } from "@/lib/statusPalette";

type CompactOrdersBoardProps = {
  orders: Order[];
  advanceOrder: (id: string) => void;
  orderUpdatePending: boolean;
  ordersLoading: boolean;
  ordersError: boolean;
  restaurantId: number;
  mode?: "orders" | "kds";
};

const columns: OrderStatus[] = ["new", "preparing", "ready", "completed"];

export function CompactOrdersBoard({ orders, advanceOrder, orderUpdatePending, ordersLoading, ordersError, restaurantId, mode = "orders" }: CompactOrdersBoardProps) {
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  useEffect(() => {
    const saved = window.localStorage.getItem("nfood:orders-view");
    if (saved === "table" || saved === "kanban") setViewMode(saved);
  }, []);
  useEffect(() => { window.localStorage.setItem("nfood:orders-view", viewMode); }, [viewMode]);

  const ordersByStatus = useMemo(() => columns.reduce<Record<OrderStatus, Order[]>>((groups, status) => {
    groups[status] = orders.filter((order) => order.status === status);
    return groups;
  }, { new: [], preparing: [], ready: [], completed: [] }), [orders]);
  const counts = (status: OrderStatus) => ordersByStatus[status].length;
  const metrics = [
    { label: "إجمالي الطلبات", value: orders.length, hint: "في الفرع الحالي", icon: ShoppingBag, tone: "orange" as const },
    { label: "طلبات جديدة", value: counts("new"), hint: "تحتاج قبولًا", icon: Clock3, tone: "violet" as const },
    { label: "قيد التنفيذ", value: counts("preparing"), hint: "تحت المتابعة", icon: ShoppingBag, tone: "blue" as const },
    { label: "جاهزة أو مكتملة", value: counts("ready") + counts("completed"), hint: "منتهية أو للتسليم", icon: CheckCircle2, tone: "emerald" as const },
  ];
  const nextStatus = (status: OrderStatus): OrderStatus | null => status === "new" ? "preparing" : status === "preparing" ? "ready" : status === "ready" ? "completed" : null;

  const orderAction = (order: Order) => {
    const next = nextStatus(order.status);
    return next ? <Button type="button" disabled={orderUpdatePending} onClick={() => advanceOrder(order.id)} className={`h-8 rounded-lg px-3 text-[11px] ${actionPalette.operational}`}>{orderUpdatePending ? "جارٍ..." : `نقل إلى ${getOrderStatusPalette(next).label}`}</Button> : <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600"><Eye className="h-3.5 w-3.5" /> مكتمل</span>;
  };

  const orderCard = (order: Order) => { const statusTone = getOrderStatusPalette(order.status); return <div key={order.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-black">#{order.id}</p><p className="mt-1 text-[11px] text-slate-500">{order.table} · {order.channel}</p></div><Badge variant="outline" className={`rounded-lg px-2 py-1 text-[10px] ${statusTone.className}`}><span className={`ml-1 inline-block h-1.5 w-1.5 rounded-full ${statusTone.dotClassName}`} />{statusTone.label}</Badge></div><p className="mt-2 truncate text-[11px] text-slate-500">{order.items}</p><div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-slate-400"><span className="flex items-center gap-1"><Clock3 className="h-3 w-3" />منذ {order.ageMinutes} د</span><strong className="text-slate-700">{order.total.toLocaleString("ar-SA")} ر.س</strong></div><div className="mt-2">{orderAction(order)}</div></div>; };

  return <div dir="rtl" className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold text-[#e76f3c]">مساحة التشغيل</p><h2 className="text-xl font-black">{mode === "kds" ? "شاشة المطبخ KDS" : "إدارة الطلبات"}</h2><p className="mt-1 text-sm text-slate-500">مؤشرات مختصرة وإجراءات الحالة من نفس الشاشة.</p></div><div className="flex items-center gap-2"><div role="group" aria-label="طريقة عرض الطلبات" className="flex rounded-xl border border-slate-200 bg-white p-1"><button type="button" aria-pressed={viewMode === "table"} onClick={() => setViewMode("table")} className={`flex h-8 items-center gap-1 rounded-lg px-2.5 text-[11px] font-bold transition ${viewMode === "table" ? "bg-[#111c2e] text-white" : "text-slate-500 hover:bg-slate-50"}`}><List className="h-3.5 w-3.5" />جدول</button><button type="button" aria-pressed={viewMode === "kanban"} onClick={() => setViewMode("kanban")} className={`flex h-8 items-center gap-1 rounded-lg px-2.5 text-[11px] font-bold transition ${viewMode === "kanban" ? "bg-[#111c2e] text-white" : "text-slate-500 hover:bg-slate-50"}`}><Columns3 className="h-3.5 w-3.5" />Kanban</button></div><Badge className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">تحديث مباشر</Badge></div></div>
    <CompactModuleSummary metrics={metrics} />
    {ordersLoading && <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">جارٍ تحميل الطلبات من قاعدة البيانات...</div>}
    {ordersError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">تعذر تحميل الطلبات. Request ID: orders-{restaurantId}</div>}
    {!ordersLoading && !ordersError && orders.length === 0 && <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600"><ShoppingBag className="h-5 w-5 text-slate-400" />لا توجد طلبات محفوظة لهذا الفرع بعد.</div>}
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm"><CardHeader className="flex-row items-center justify-between border-b border-slate-100 px-4 py-3"><div><CardTitle className="text-base">{viewMode === "table" ? "الطلبات الحالية" : "مراحل الطلبات"}</CardTitle><p className="mt-0.5 text-xs font-normal text-slate-500">{viewMode === "table" ? "تحديث الحالة من الجدول مباشرة دون فتح بطاقة أخرى." : "اسحب بصريًا بين المراحل وحدّث حالة الطلب من البطاقة."}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">{orders.length} طلب</span></CardHeader><CardContent className="p-0">{viewMode === "table" ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-right text-sm"><thead className="bg-slate-50/80 text-[11px] text-slate-500"><tr><th className="px-4 py-2.5 font-semibold">الطلب</th><th className="px-4 py-2.5 font-semibold">الطاولة / القناة</th><th className="px-4 py-2.5 font-semibold">الأصناف</th><th className="px-4 py-2.5 font-semibold">الإجمالي</th><th className="px-4 py-2.5 font-semibold">الحالة</th><th className="px-4 py-2.5 font-semibold">الإجراء</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-t border-slate-100 transition-colors hover:bg-orange-50/30"><td className="px-4 py-3 font-bold">#{order.id}<div className="mt-0.5 flex items-center gap-1 text-[10px] font-normal text-slate-400"><Clock3 className="h-3 w-3" />{order.time}</div></td><td className="px-4 py-3"><span className="font-medium">{order.table}</span><span className="mr-2 text-[11px] text-slate-400">{order.channel}</span></td><td className="max-w-[240px] truncate px-4 py-3 text-xs text-slate-500">{order.items}</td><td className="px-4 py-3 font-bold">{order.total.toLocaleString("ar-SA")} ر.س</td><td className="px-4 py-3"><Badge variant="outline" className={`rounded-lg px-2 py-1 text-[10px] ${getOrderStatusPalette(order.status).className}`}><span className={`ml-1 inline-block h-1.5 w-1.5 rounded-full ${getOrderStatusPalette(order.status).dotClassName}`} />{getOrderStatusPalette(order.status).label}</Badge><div className="mt-1 text-[10px] text-slate-400">منذ {order.ageMinutes} د</div></td><td className="px-4 py-3">{orderAction(order)}</td></tr>)}</tbody></table></div> : <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-4">{columns.map((status) => <div key={status} className="min-w-0 rounded-2xl bg-slate-50/70 p-2.5"><div className="mb-2 flex items-center justify-between px-1"><p className="text-xs font-black text-slate-700">{getOrderStatusPalette(status).label}</p><span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500">{counts(status)}</span></div><div className="space-y-2">{ordersByStatus[status].map(orderCard)}{counts(status) === 0 && <p className="rounded-xl border border-dashed border-slate-200 bg-white px-2 py-5 text-center text-[10px] text-slate-400">لا توجد طلبات</p>}</div></div>)}</div>}</CardContent></Card>
  </div>;
}
