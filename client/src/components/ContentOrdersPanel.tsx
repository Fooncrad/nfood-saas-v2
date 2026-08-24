import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, ExternalLink, FileImage, Loader2, ReceiptText, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ContentOrderStatus = "unpaid" | "verifying" | "approved" | "rejected";
type ContentOrderItem = { listingId?: number; title?: string; price?: string; currencyCode?: string };

const statusMeta: Record<ContentOrderStatus, { label: string; className: string; icon: typeof Clock3 }> = {
  unpaid: { label: "غير مدفوع", className: "border-slate-200 bg-slate-50 text-slate-700", icon: Clock3 },
  verifying: { label: "قيد التحقق", className: "border-amber-200 bg-amber-50 text-amber-800", icon: ReceiptText },
  approved: { label: "مقبول", className: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: CheckCircle2 },
  rejected: { label: "مرفوض", className: "border-red-200 bg-red-50 text-red-800", icon: XCircle },
};

function parseItems(value: string): ContentOrderItem[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is ContentOrderItem => Boolean(item && typeof item === "object")) : [];
  } catch {
    return [];
  }
}

export function ContentOrdersPanel({ restaurantId }: { restaurantId: number }) {
  const utils = trpc.useUtils();
  const orders = trpc.restaurantContent.contentPurchaseOrders.useQuery({ restaurantId }, { retry: 1 });
  const updateStatus = trpc.restaurantContent.updateContentPurchaseOrderStatus.useMutation({
    onSuccess: async () => {
      toast.success("تم تحديث حالة طلب المحتوى");
      await utils.restaurantContent.contentPurchaseOrders.invalidate({ restaurantId });
    },
    onError: (error) => toast.error(`تعذر تحديث الطلب: ${error.message}`),
  });
  const summary = useMemo(() => {
    const values = orders.data ?? [];
    return { total: values.length, verifying: values.filter((order) => order.status === "verifying").length, approved: values.filter((order) => order.status === "approved").length };
  }, [orders.data]);
  const [statusFilter, setStatusFilter] = useState<ContentOrderStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const filteredOrders = useMemo(() => {
    const from = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
    const to = toDate ? new Date(`${toDate}T23:59:59.999`).getTime() : Number.POSITIVE_INFINITY;
    return (orders.data ?? []).filter((order) => { const timestamp = new Date(order.createdAt).getTime(); return (statusFilter === "all" || order.status === statusFilter) && timestamp >= from && timestamp <= to; }).sort((a, b) => { const aTime = new Date(a.createdAt).getTime(); const bTime = new Date(b.createdAt).getTime(); return sortOrder === "newest" ? bTime - aTime : aTime - bTime; });
  }, [orders.data, statusFilter, sortOrder, fromDate, toDate]);

  return <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
    <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 border-b border-slate-100">
      <div><CardTitle className="flex items-center gap-2 text-lg font-black text-slate-900"><ReceiptText className="h-5 w-5 text-[#e76f3c]" />سجل طلبات المحتوى المرئي</CardTitle><p className="mt-2 text-xs leading-5 text-slate-500">راجع طلبات شراء المقاطع، افتح إيصال التحويل، ثم حدّث الحالة بعد مطابقة المبلغ يدويًا.</p></div>
      <Button type="button" variant="outline" size="sm" onClick={() => void orders.refetch()} disabled={orders.isFetching} className="shrink-0 rounded-xl">{orders.isFetching ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <RefreshCw className="ml-2 h-4 w-4" />}تحديث</Button>
    </CardHeader>
    <CardContent className="space-y-4 p-5">
      <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[11px] font-bold text-slate-500">إجمالي الطلبات</p><p className="mt-1 text-2xl font-black text-slate-900">{summary.total}</p></div><div className="rounded-2xl bg-amber-50 p-4"><p className="text-[11px] font-bold text-amber-700">تحتاج مراجعة</p><p className="mt-1 text-2xl font-black text-amber-900">{summary.verifying}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><p className="text-[11px] font-bold text-emerald-700">مقبولة</p><p className="mt-1 text-2xl font-black text-emerald-900">{summary.approved}</p></div></div><div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4"><label className="text-xs font-bold text-slate-600">الحالة<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ContentOrderStatus | "all")} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-black"><option value="all">كل الحالات</option>{Object.entries(statusMeta).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</select></label><label className="text-xs font-bold text-slate-600">الفرز<select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as "newest" | "oldest")} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-black"><option value="newest">الأحدث أولًا</option><option value="oldest">الأقدم أولًا</option></select></label><label className="text-xs font-bold text-slate-600">من تاريخ<input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-black" /></label><label className="text-xs font-bold text-slate-600">إلى تاريخ<input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-black" /></label></div><p className="text-xs font-bold text-slate-400" aria-live="polite">عرض {filteredOrders.length} من {summary.total} طلب</p>
      {orders.isLoading && <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center text-sm text-slate-500">جارٍ تحميل سجل الطلبات...</div>}
      {orders.isError && <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">تعذر تحميل سجل طلبات المحتوى. حاول تحديث القسم مرة أخرى.</div>}
      {!orders.isLoading && !orders.isError && !orders.data?.length && <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center"><ReceiptText className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-600">لا توجد طلبات محتوى مرئية حتى الآن</p><p className="mt-1 text-xs text-slate-400">ستظهر الطلبات هنا بعد إرسال العميل طلبًا من المنيو.</p></div>}
      {!orders.isLoading && !orders.isError && orders.data?.length && filteredOrders.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">لا توجد طلبات مطابقة للفلاتر الحالية.</div>}
      <div className="space-y-3">{filteredOrders.map((order) => { const meta = statusMeta[order.status as ContentOrderStatus] ?? statusMeta.unpaid; const StatusIcon = meta.icon; const items = parseItems(order.itemsJson); return <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-black text-slate-900">طلب محتوى #{order.id}</h3><Badge className={`gap-1 rounded-full border ${meta.className}`}><StatusIcon className="h-3.5 w-3.5" />{meta.label}</Badge></div><p className="mt-1 text-xs text-slate-500">{order.customerName || "عميل بدون اسم"}{order.customerPhone ? ` · ${order.customerPhone}` : ""} · {new Date(order.createdAt).toLocaleString("ar-SA")}</p></div><div className="text-left"><p className="text-lg font-black text-[#e76f3c]">{order.total} {order.currencyCode}</p><p className="text-[11px] text-slate-400">{items.length} عنصر</p></div></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{items.map((item, index) => <div key={`${order.id}-${item.listingId ?? index}`} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs"><span className="truncate font-bold text-slate-700">{item.title || "محتوى مرئي"}</span><span className="shrink-0 font-black text-slate-500">{item.price} {item.currencyCode || order.currencyCode}</span></div>)}</div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3"><div className="flex flex-wrap items-center gap-2">{order.receiptUrl ? <Button type="button" variant="outline" size="sm" onClick={() => window.open(order.receiptUrl!, "_blank", "noopener,noreferrer")} className="rounded-xl"><FileImage className="ml-2 h-4 w-4" />فتح الإيصال<ExternalLink className="mr-2 h-3.5 w-3.5" /></Button> : <span className="text-xs font-bold text-slate-400">لم يرفق العميل إيصالًا بعد</span>}{order.note && <span className="max-w-full truncate text-xs text-slate-500" title={order.note}>ملاحظة: {order.note}</span>}</div><label className="flex items-center gap-2 text-xs font-bold text-slate-600">تحديث الحالة<select value={order.status} disabled={updateStatus.isPending} onChange={(event) => updateStatus.mutate({ restaurantId, id: order.id, status: event.target.value as ContentOrderStatus })} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-black outline-none focus:border-orange-400">{Object.entries(statusMeta).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</select></label></div></article>; })}</div>
    </CardContent>
  </Card>;
}
