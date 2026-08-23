import { CheckCircle2, Clock3, Eye, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompactModuleSummary } from "@/components/CompactModuleSummary";
import { statusLabels, statusStyles, type Order, type OrderStatus } from "@/components/homeNavigation";

type CompactOrdersBoardProps = {
  orders: Order[];
  advanceOrder: (id: string) => void;
  orderUpdatePending: boolean;
  ordersLoading: boolean;
  ordersError: boolean;
  restaurantId: number;
  mode?: "orders" | "kds";
};

export function CompactOrdersBoard({ orders, advanceOrder, orderUpdatePending, ordersLoading, ordersError, restaurantId, mode = "orders" }: CompactOrdersBoardProps) {
  const counts = (status: OrderStatus) => orders.filter((order) => order.status === status).length;
  const metrics = [
    { label: "إجمالي الطلبات", value: orders.length, hint: "في الفرع الحالي", icon: ShoppingBag, tone: "orange" as const },
    { label: "طلبات جديدة", value: counts("new"), hint: "تحتاج قبولًا", icon: Clock3, tone: "violet" as const },
    { label: "قيد التنفيذ", value: counts("preparing"), hint: "تحت المتابعة", icon: ShoppingBag, tone: "blue" as const },
    { label: "جاهزة أو مكتملة", value: counts("ready") + counts("completed"), hint: "منتهية أو للتسليم", icon: CheckCircle2, tone: "emerald" as const },
  ];
  const nextStatus = (status: OrderStatus): OrderStatus | null => status === "new" ? "preparing" : status === "preparing" ? "ready" : status === "ready" ? "completed" : null;

  return <div dir="rtl" className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold text-[#e76f3c]">مساحة التشغيل</p><h2 className="text-xl font-black">{mode === "kds" ? "شاشة المطبخ KDS" : "إدارة الطلبات"}</h2><p className="mt-1 text-sm text-slate-500">مؤشرات مختصرة وإجراءات الحالة من نفس الشاشة.</p></div><Badge className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">تحديث مباشر</Badge></div>
    <CompactModuleSummary metrics={metrics} />
    {ordersLoading && <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">جارٍ تحميل الطلبات من قاعدة البيانات...</div>}
    {ordersError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">تعذر تحميل الطلبات. Request ID: orders-{restaurantId}</div>}
    {!ordersLoading && !ordersError && orders.length === 0 && <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600"><ShoppingBag className="h-5 w-5 text-slate-400" />لا توجد طلبات محفوظة لهذا الفرع بعد.</div>}
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm"><CardHeader className="flex-row items-center justify-between border-b border-slate-100 px-4 py-3"><div><CardTitle className="text-base">الطلبات الحالية</CardTitle><p className="mt-0.5 text-xs font-normal text-slate-500">تحديث الحالة من الجدول مباشرة دون فتح بطاقة أخرى.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">{orders.length} طلب</span></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-right text-sm"><thead className="bg-slate-50/80 text-[11px] text-slate-500"><tr><th className="px-4 py-2.5 font-semibold">الطلب</th><th className="px-4 py-2.5 font-semibold">الطاولة / القناة</th><th className="px-4 py-2.5 font-semibold">الأصناف</th><th className="px-4 py-2.5 font-semibold">الإجمالي</th><th className="px-4 py-2.5 font-semibold">الحالة</th><th className="px-4 py-2.5 font-semibold">الإجراء</th></tr></thead><tbody>{orders.map((order) => { const next = nextStatus(order.status); return <tr key={order.id} className="border-t border-slate-100 transition-colors hover:bg-orange-50/30"><td className="px-4 py-3 font-bold">#{order.id}<div className="mt-0.5 flex items-center gap-1 text-[10px] font-normal text-slate-400"><Clock3 className="h-3 w-3" />{order.time}</div></td><td className="px-4 py-3"><span className="font-medium">{order.table}</span><span className="mr-2 text-[11px] text-slate-400">{order.channel}</span></td><td className="max-w-[240px] truncate px-4 py-3 text-xs text-slate-500">{order.items}</td><td className="px-4 py-3 font-bold">{order.total.toLocaleString("ar-SA")} ر.س</td><td className="px-4 py-3"><Badge variant="outline" className={`rounded-lg px-2 py-1 text-[10px] ${statusStyles[order.status]}`}>{statusLabels[order.status]}</Badge><div className="mt-1 text-[10px] text-slate-400">منذ {order.ageMinutes} د</div></td><td className="px-4 py-3">{next ? <Button type="button" disabled={orderUpdatePending} onClick={() => advanceOrder(order.id)} className="h-8 rounded-lg bg-[#e76f3c] px-3 text-[11px] hover:bg-[#d85f2e]">{orderUpdatePending ? "جارٍ..." : `نقل إلى ${statusLabels[next]}`}</Button> : <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600"><Eye className="h-3.5 w-3.5" /> مكتمل</span>}</td></tr>; })}</tbody></table></div></CardContent></Card>
  </div>;
}
