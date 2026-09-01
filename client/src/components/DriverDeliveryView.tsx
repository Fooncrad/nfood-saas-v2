import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, LogOut, MapPin, Truck } from "lucide-react";

const DRIVER_REFUSAL_REASONS = ["العميل لم يرد", "العميل غير متواجد", "العنوان غير واضح", "تعذر الوصول للموقع", "الطلب غير جاهز من المطعم", "مشكلة في المركبة", "سبب آخر"] as const;
type DriverRefusalReason = typeof DRIVER_REFUSAL_REASONS[number];
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CompactModuleSummary } from "@/components/CompactModuleSummary";
import { toast } from "sonner";
import { actionPalette, getDeliveryStatusPalette } from "@/lib/statusPalette";
import { SecureDeliveryChat } from "@/components/SecureDeliveryChat";
import { useAuth } from "@/_core/hooks/useAuth";

export function DriverDeliveryView({ restaurantId }: { restaurantId: number }) {
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [eta, setEta] = useState("20");
  const [failureReason, setFailureReason] = useState<DriverRefusalReason | "">("");
  const [note, setNote] = useState("");
  const [locationSharing, setLocationSharing] = useState(false);
  const orders = trpc.platform.driverDeliveryOrders.useQuery({ restaurantId }, { retry: false, refetchInterval: 30000 });
  const updateDriverLocation = trpc.platform.updateDriverLocation.useMutation({ onError: (error) => toast.error(`تعذر تحديث موقعك: ${error.message}`) });
  useEffect(() => { if (!locationSharing) return; if (!navigator.geolocation) { toast.error("المتصفح لا يدعم مشاركة الموقع"); setLocationSharing(false); return; } const watchId = navigator.geolocation.watchPosition((position) => { updateDriverLocation.mutate({ restaurantId, latitude: position.coords.latitude, longitude: position.coords.longitude }); }, () => toast.error("اسمح بالوصول إلى الموقع لتفعيل التتبع الحي"), { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }); return () => navigator.geolocation.clearWatch(watchId); }, [locationSharing, restaurantId, updateDriverLocation]);
  const updateStatus = trpc.platform.updateDeliveryStatus.useMutation({ onSuccess: async () => { await orders.refetch(); setFailureReason(""); setNote(""); toast.success("تم تحديث حالة التوصيل"); }, onError: (error) => toast.error(error.message) });
  const deliveryOrders = orders.data ?? [];
  const selected = deliveryOrders.find((item) => item.id === selectedId);
  const deliveryCounts = useMemo(() => deliveryOrders.reduce((counts, item) => {
    counts.total += 1;
    if (item.deliveryStatus === "picked_up" || item.deliveryStatus === "out_for_delivery") counts.inTransit += 1;
    if (item.deliveryStatus === "delivered") counts.delivered += 1;
    if (item.deliveryStatus === "failed" || item.deliveryStatus === "returned") counts.failed += 1;
    return counts;
  }, { total: 0, inTransit: 0, delivered: 0, failed: 0 }), [deliveryOrders]);
  const summary = [
    { label: "الطلبات المخصصة", value: deliveryCounts.total, hint: "في قائمة السائق", icon: Truck, tone: "orange" as const },
    { label: "قيد التوصيل", value: deliveryCounts.inTransit, hint: "تحتاج متابعة", icon: MapPin, tone: "blue" as const },
    { label: "تم التسليم", value: deliveryCounts.delivered, hint: "مكتملة", icon: CheckCircle2, tone: "emerald" as const },
    { label: "فشل أو مرتجع", value: deliveryCounts.failed, hint: "تحتاج مراجعة", icon: AlertTriangle, tone: "violet" as const },
  ];
  const update = (status: "picked_up" | "out_for_delivery" | "delivered" | "failed" | "returned") => { if (!selected) return; updateStatus.mutate({ restaurantId, orderId: selected.id, status, etaMinutes: Number(eta) > 0 ? Number(eta) : null, failureReason: status === "failed" ? (failureReason || null) : null, note: note || null }); };

  return <div dir="rtl" className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-black">مركز السائق والتوصيل</h2><p className="mt-1 text-sm text-slate-500">طلباتك المعينة فقط، مع ETA وحالات الفشل والمرتجع.</p></div>
      <div className="flex flex-wrap items-center gap-2"><Button type="button" variant="outline" onClick={() => setLocationSharing((current) => !current)} className={`rounded-xl text-xs ${locationSharing ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600"}`}><MapPin className="ml-1 h-4 w-4" />{locationSharing ? "موقعك قيد المشاركة" : "مشاركة الموقع"}</Button><Badge className="rounded-xl bg-sky-50 px-3 py-2 text-sky-700"><Truck className="ml-1 h-4 w-4" /> تحديث تلقائي</Badge><Button type="button" variant="outline" disabled={loggingOut} onClick={async () => { setLoggingOut(true); try { await logout(); window.location.href = "/login"; } finally { setLoggingOut(false); } }} className="rounded-xl border-red-200 bg-white text-xs font-black text-red-700 hover:bg-red-50"><LogOut className="ml-1 h-4 w-4" />{loggingOut ? "جارٍ الخروج..." : "تسجيل الخروج"}</Button></div>
    </div>
    <CompactModuleSummary metrics={summary} />
    {orders.isError && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">تعذر تحميل طلباتك. Request ID: driver-orders-{restaurantId}<Button variant="outline" onClick={() => void orders.refetch()} className="mr-3 rounded-lg">إعادة المحاولة</Button></div>}
    {!orders.isLoading && deliveryOrders.length === 0 && <Card className="rounded-2xl border-slate-200"><CardContent className="flex min-h-40 flex-col items-center justify-center p-6 text-center"><MapPin className="mb-3 h-9 w-9 text-slate-300" /><p className="font-bold text-slate-700">لا توجد طلبات توصيل معينة لك</p><p className="mt-2 text-sm text-slate-500">ستظهر الطلبات هنا بعد أن يعيّنك المطعم عليها.</p></CardContent></Card>}
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_300px]">
      <div className="space-y-2">{deliveryOrders.map((order) => <button key={order.id} type="button" onClick={() => { setSelectedId(order.id); setEta(String(order.deliveryEtaMinutes ?? 20)); }} className={`w-full rounded-2xl border p-3 text-right transition ${selectedId === order.id ? "border-sky-400 bg-sky-50/60 shadow-sm" : "border-slate-200 bg-white hover:border-sky-200"}`}><div className="flex items-start justify-between gap-3"><div><p className="font-black">طلب #{order.id}</p><p className="mt-1 text-xs text-slate-500">{order.guestName || "عميل"} · {order.guestPhone || "بدون هاتف"}</p></div><Badge variant="outline" className={`rounded-lg text-[10px] ${getDeliveryStatusPalette(order.deliveryStatus).className}`}><span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />{getDeliveryStatusPalette(order.deliveryStatus).label}</Badge></div><div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500"><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> ETA: {order.deliveryEtaMinutes ? `${order.deliveryEtaMinutes} دقيقة` : "غير محدد"}</span><span>الإجمالي: {order.total} SAR</span></div></button>)}</div>
      <Card className="rounded-2xl border-slate-200"><CardHeader className="px-4 pb-2 pt-4"><CardTitle className="text-base">إدارة التسليم</CardTitle></CardHeader><CardContent className="space-y-2.5 p-4 pt-2">{!selected ? <p className="py-6 text-center text-sm text-slate-500">اختر طلبًا لإدارة حالته.</p> : <><div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">الطلب #{selected.id} · {selected.guestName || "عميل"}</div><label className="block text-xs font-bold">ETA بالدقائق<Input value={eta} onChange={(event) => setEta(event.target.value)} type="number" min={1} max={1440} className="mt-1.5 h-9 rounded-xl" /></label><label className="block text-xs font-bold">ملاحظة التسليم<Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="مثال: الوصول من البوابة الخلفية" className="mt-1.5 h-9 rounded-xl" /></label><SecureDeliveryChat orderId={selected.id} /><div className="grid grid-cols-2 gap-2"><Button disabled={updateStatus.isPending} onClick={() => update("picked_up")} className={`h-9 rounded-xl text-xs ${actionPalette.operational}`}>استلام الطلب</Button><Button disabled={updateStatus.isPending} onClick={() => update("out_for_delivery")} className="h-9 rounded-xl bg-blue-600 text-xs text-white hover:bg-blue-700">في الطريق</Button><Button disabled={updateStatus.isPending} onClick={() => update("delivered")} className={`h-9 rounded-xl text-xs ${actionPalette.success}`}><CheckCircle2 className="ml-1 h-4 w-4" />تم التسليم</Button><Button disabled={updateStatus.isPending} onClick={() => update("returned")} variant="outline" className={`h-9 rounded-xl text-xs ${actionPalette.destructive}`}>مرتجع</Button></div><div className="border-t border-slate-100 pt-2.5"><label className="block text-xs font-bold text-red-700">سبب رفض/فشل التوصيل<select value={failureReason} onChange={(event) => setFailureReason(event.target.value as DriverRefusalReason | "")} className="mt-1.5 h-9 w-full rounded-xl border border-red-200 bg-white px-2 text-xs text-slate-700"><option value="">اختر السبب قبل الإرسال</option>{DRIVER_REFUSAL_REASONS.map((reason) => <option key={reason} value={reason}>{reason}</option>)}</select></label><Button disabled={updateStatus.isPending || !failureReason} onClick={() => update("failed")} variant="outline" className={`mt-2 h-9 w-full rounded-xl text-xs ${actionPalette.destructive}`}><AlertTriangle className="ml-1 h-4 w-4" />تسجيل رفض التوصيل وإبلاغ المطعم</Button></div></>}</CardContent></Card>
    </div>
  </div>;
}
