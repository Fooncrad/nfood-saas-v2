import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Filter, ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order, OrderStatus } from "@/components/homeNavigation";
import { getStationLabel, getStationSectionIds, type KitchenStation } from "@/lib/kitchenStation";
import { actionPalette, getOrderStatusPalette } from "@/lib/statusPalette";
import { trpc } from "@/lib/trpc";

type FilterKey = "all" | OrderStatus;
type SortKey = "oldest" | "newest" | "longest" | "status";
type SectionFilter = "all" | number;
type KitchenSectionSla = { id: number; name: string; isEnabled: boolean; thresholdMinutes: number | null };

type Props = {
  restaurantId: number;
  orders: Order[];
  advanceOrder: (id: string) => void;
  orderUpdatePending: boolean;
  station?: KitchenStation;
};

const statusOrder: OrderStatus[] = ["new", "preparing", "ready", "completed"];
const nextStatus: Record<Exclude<OrderStatus, "completed">, OrderStatus> = { new: "preparing", preparing: "ready", ready: "completed" };

export function filterAndSortKdsOrders(orders: Order[], filter: FilterKey, sort: SortKey) {
  const filtered = filter === "all" ? orders : orders.filter((order) => order.status === filter);
  return [...filtered].sort((a, b) => {
    if (sort === "newest") return a.ageMinutes - b.ageMinutes;
    if (sort === "longest" || sort === "oldest") return b.ageMinutes - a.ageMinutes;
    return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status) || b.ageMinutes - a.ageMinutes;
  });
}

export function KdsOperationsBoard({ restaurantId, orders, advanceOrder, orderUpdatePending, station }: Props) {
  const [filter, setFilter] = useState<FilterKey>(() => {
    if (typeof window === "undefined") return "all";
    const saved = window.localStorage.getItem(`nfood-kds-filter-${restaurantId}-${station ?? "all"}`);
    return saved === "new" || saved === "preparing" || saved === "ready" || saved === "completed" ? saved : "all";
  });
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all");
  const [sort, setSort] = useState<SortKey>(() => {
    if (typeof window === "undefined") return "oldest";
    const saved = window.localStorage.getItem(`nfood-kds-sort-${restaurantId}-${station ?? "all"}`);
    return saved === "newest" || saved === "longest" || saved === "status" ? saved : "oldest";
  });
  const slaQuery = trpc.admin.kitchenSla.useQuery({ restaurantId }, { retry: false, staleTime: 30000 });
  const sections = (slaQuery.data ?? []) as KitchenSectionSla[];
  const stationSectionIds = useMemo(() => getStationSectionIds(sections, station), [sections, station]);
  const stationSections = useMemo(() => sections.filter((section) => stationSectionIds.has(section.id)), [sections, stationSectionIds]);
  const stationOrders = useMemo(() => station ? orders.filter((order) => order.kitchenSectionId !== null && order.kitchenSectionId !== undefined && stationSectionIds.has(order.kitchenSectionId)) : orders, [orders, station, stationSectionIds]);
  const sectionById = useMemo(() => new Map(sections.map((section) => [section.id, section])), [sections]);
  const thresholdFor = (order: Order) => order.kitchenSectionId ? Number(sectionById.get(order.kitchenSectionId)?.thresholdMinutes ?? 15) : 15;
  useEffect(() => { window.localStorage.setItem(`nfood-kds-filter-${restaurantId}-${station ?? "all"}`, filter); }, [filter, restaurantId, station]);
  useEffect(() => { window.localStorage.setItem(`nfood-kds-sort-${restaurantId}-${station ?? "all"}`, sort); }, [sort, restaurantId, station]);
  useEffect(() => { if (sectionFilter !== "all" && !stationSectionIds.has(sectionFilter)) setSectionFilter("all"); }, [sectionFilter, stationSectionIds]);
  const visibleOrders = useMemo(() => filterAndSortKdsOrders(sectionFilter === "all" ? stationOrders : stationOrders.filter((order) => order.kitchenSectionId === sectionFilter), filter, sort), [filter, stationOrders, sectionFilter, sort]);
  const grouped = useMemo(() => statusOrder.reduce<Record<OrderStatus, Order[]>>((result, status) => { result[status] = visibleOrders.filter((order) => order.status === status); return result; }, { new: [], preparing: [], ready: [], completed: [] }), [visibleOrders]);
  const delayedCount = visibleOrders.filter((order) => order.status !== "completed" && order.ageMinutes >= thresholdFor(order)).length;
  const stationLabel = station ? getStationLabel(station) : "كل محطات التشغيل";

  return <div className="space-y-4" dir="rtl">
    <Card className="rounded-2xl border-slate-200 bg-slate-50/80 shadow-sm"><CardContent className="flex flex-wrap items-center gap-3 p-3"><div className="flex items-center gap-2 text-xs font-bold text-slate-700"><Filter className="h-4 w-4 text-[#e76f3c]" />تصفية الحالة</div>{station && <Badge className="rounded-lg bg-[#111c2e] text-white">{stationLabel}</Badge>}<div className="flex flex-wrap gap-2" role="group" aria-label="تصفية حالات KDS">{(["all", ...statusOrder] as FilterKey[]).map((key) => { const label = key === "all" ? "الكل" : getOrderStatusPalette(key).label; const count = key === "all" ? stationOrders.length : stationOrders.filter((order) => order.status === key).length; return <button key={key} type="button" onClick={() => setFilter(key)} aria-pressed={filter === key} className={`rounded-lg border px-3 py-2 text-[11px] font-bold transition ${filter === key ? "border-[#e76f3c] bg-[#e76f3c] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:text-[#e76f3c]"}`}>{label} <span className="mr-1 opacity-75">{count}</span></button>; })}</div><label className="flex items-center gap-2 text-[11px] font-bold text-slate-600"><span>القسم</span><select value={sectionFilter === "all" ? "all" : String(sectionFilter)} onChange={(event) => setSectionFilter(event.target.value === "all" ? "all" : Number(event.target.value))} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-semibold text-slate-700 outline-none focus:border-[#e76f3c]" aria-label="تصفية قسم المطبخ"><option value="all">{station ? `كل أقسام ${station === "bar" ? "البار" : "المطبخ"}` : "كل الأقسام"}</option>{stationSections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}</select></label><label className="mr-auto flex items-center gap-2 text-[11px] font-bold text-slate-600"><ListFilter className="h-4 w-4 text-blue-600" /><span>ترتيب</span><select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-semibold text-slate-700 outline-none focus:border-[#e76f3c]" aria-label="ترتيب طلبات KDS"><option value="oldest">الأقدم أولاً</option><option value="newest">الأحدث أولاً</option><option value="longest">الأطول تحضيرًا</option><option value="status">حسب الحالة</option></select></label></CardContent></Card>
    {station && stationOrders.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">لا توجد طلبات موزعة على {stationLabel} حاليًا. اربط فئات المنيو بقسمها لتظهر هنا تلقائيًا.</div>}
    {delayedCount > 0 && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-800" role="alert"><AlertTriangle className="h-4 w-4 shrink-0" /><span>{delayedCount} طلب{delayedCount === 1 ? "" : "ات"} تجاوز وقت SLA الخاص بقسمه وتحتاج متابعة فورية.</span></div>}
    {visibleOrders.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">لا توجد طلبات مطابقة للتصفية الحالية.</div> : <div className="grid gap-4 md:grid-cols-4">{statusOrder.map((status) => <Card key={status} className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardHeader className={`px-4 pb-2 pt-4 ${getOrderStatusPalette(status).className}`}><CardTitle className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${getOrderStatusPalette(status).dotClassName}`} />{getOrderStatusPalette(status).label}</span><span className="rounded-full bg-white/80 px-2 py-0.5 text-xs">{grouped[status].length}</span></CardTitle></CardHeader><CardContent className="space-y-3 p-4 pt-2">{grouped[status].map((order) => <div key={order.id} className={`rounded-xl border p-3 ${order.status !== "completed" && order.ageMinutes >= thresholdFor(order) ? "border-red-200 bg-red-50/50" : "border-slate-100 bg-slate-50/70"}`}><div className="flex justify-between text-xs font-bold"><span>{order.id}</span><span className="text-slate-400">{order.time}</span></div><p className="mt-2 text-xs font-medium">{order.table}</p><p className="mt-1 text-[10px] font-semibold text-slate-400">{order.kitchenSectionId ? `قسم ${sectionById.get(order.kitchenSectionId)?.name ?? `#${order.kitchenSectionId}`}` : "غير موزع على قسم"} · SLA {thresholdFor(order)} د</p><div className="mt-1 flex items-center justify-between gap-2"><p className="min-w-0 truncate text-[11px] leading-5 text-slate-500">{order.items}</p><span className={`flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ${order.status !== "completed" && order.ageMinutes >= thresholdFor(order) ? "bg-red-100 text-red-800" : order.ageMinutes >= Math.max(1, thresholdFor(order) - 5) ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"}`}><Clock3 className="h-3 w-3" />منذ {order.ageMinutes} د</span></div>{order.status !== "completed" && <Button disabled={orderUpdatePending} onClick={() => advanceOrder(order.id)} size="sm" className={`mt-3 h-8 w-full rounded-lg text-xs ${actionPalette.operational}`}>{orderUpdatePending ? "جارٍ الحفظ..." : `نقل إلى ${getOrderStatusPalette(nextStatus[order.status]).label}`}</Button>}{order.status === "completed" && <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />تم الإكمال</div>}</div>)}</CardContent></Card>)}</div>}
  </div>;
}

export default KdsOperationsBoard;
