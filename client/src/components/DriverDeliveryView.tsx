import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, MapPin, Truck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CompactModuleSummary } from "@/components/CompactModuleSummary";
import { toast } from "sonner";

const statusLabels: Record<string, string> = { assigned: "تم التعيين", picked_up: "تم الاستلام", out_for_delivery: "في الطريق", delivered: "تم التسليم", failed: "فشل التوصيل", returned: "مرتجع" };

export function DriverDeliveryView({ restaurantId }: { restaurantId: number }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [demoTrackingTick, setDemoTrackingTick] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setDemoTrackingTick((value) => (value + 1) % 4), 3000); return () => window.clearInterval(timer); }, []);
  const [eta, setEta] = useState("20");
  const [failureReason, setFailureReason] = useState("");
  const [note, setNote] = useState("");
  const orders = trpc.platform.driverDeliveryOrders.useQuery({ restaurantId }, { retry: false, refetchInterval: 30000 });
  const updateStatus = trpc.platform.updateDeliveryStatus.useMutation({ onSuccess: async () => { await orders.refetch(); setFailureReason(""); setNote(""); toast.success("تم تحديث حالة التوصيل"); }, onError: (error) => toast.error(error.message) });
  const deliveryOrders = orders.data ?? [];
  const selected = deliveryOrders.find((item) => item.id === selectedId);
  const summary = [
    { label: "الطلبات المخصصة", value: deliveryOrders.length, hint: "في قائمة السائق", icon: Truck, tone: "orange" as const },
    { label: "قيد التوصيل", value: deliveryOrders.filter((item) => item.deliveryStatus === "picked_up" || item.deliveryStatus === "out_for_delivery").length, hint: "تحتاج متابعة", icon: MapPin, tone: "blue" as const },
    { label: "تم التسليم", value: deliveryOrders.filter((item) => item.deliveryStatus === "delivered").length, hint: "مكتملة", icon: CheckCircle2, tone: "emerald" as const },
    { label: "فشل أو مرتجع", value: deliveryOrders.filter((item) => item.deliveryStatus === "failed" || item.deliveryStatus === "returned").length, hint: "تحتاج مراجعة", icon: AlertTriangle, tone: "violet" as const },
  ];
  const update = (status: "picked_up" | "out_for_delivery" | "delivered" | "failed" | "returned") => { if (!selected) return; updateStatus.mutate({ restaurantId, orderId: selected.id, status, etaMinutes: Number(eta) > 0 ? Number(eta) : null, failureReason: status === "failed" ? failureReason : null, note: note || null }); };

  return <div dir="rtl" className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-black">مركز السائق والتوصيل</h2><p className="mt-1 text-sm text-slate-500">طلباتك المعينة فقط، مع ETA وحالات الفشل والمرتجع.</p></div>
      <Badge className="rounded-xl bg-sky-50 px-3 py-2 text-sky-700"><Truck className="ml-1 h-4 w-4" /> تحديث تلقائي</Badge>
    </div>
    <CompactModuleSummary metrics={summary} />
    <Card className="rounded-2xl border-dashed border-sky-200 bg-sky-50/60"><CardContent className="flex flex-wrap items-center justify-between gap-3 p-3"><div><p className="text-xs font-black text-sky-900">تتبع حي · Demo Preview</p><p className="mt-1 text-xs leading-5 text-sky-700">معاينة محلية لمسار السائق، لا تُرسل موقعًا حقيقيًا حتى استبدال DEMO_REPLACE_REALTIME_KEY.</p></div><div className="flex items-center gap-2 text-xs font-bold text-sky-900"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sky-500" />نقطة تجريبية {demoTrackingTick + 1}/4</div></CardContent></Card>
    {orders.isError && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">تعذر تحميل طلباتك. Request ID: driver-orders-{restaurantId}<Button variant="outline" onClick={() => void orders.refetch()} className="mr-3 rounded-lg">إعادة المحاولة</Button></div>}
    {!orders.isLoading && deliveryOrders.length === 0 && <Card className="rounded-2xl border-slate-200"><CardContent className="flex min-h-40 flex-col items-center justify-center p-6 text-center"><MapPin className="mb-3 h-9 w-9 text-slate-300" /><p className="font-bold text-slate-700">لا توجد طلبات توصيل معينة لك</p><p className="mt-2 text-sm text-slate-500">ستظهر الطلبات هنا بعد أن يعيّنك المطعم عليها.</p></CardContent></Card>}
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_300px]">
      <div className="space-y-2">{deliveryOrders.map((order) => <button key={order.id} type="button" onClick={() => { setSelectedId(order.id); setEta(String(order.deliveryEtaMinutes ?? 20)); }} className={`w-full rounded-2xl border p-3 text-right transition ${selectedId === order.id ? "border-sky-400 bg-sky-50/60 shadow-sm" : "border-slate-200 bg-white hover:border-sky-200"}`}><div className="flex items-start justify-between gap-3"><div><p className="font-black">طلب #{order.id}</p><p className="mt-1 text-xs text-slate-500">{order.guestName || "عميل"} · {order.guestPhone || "بدون هاتف"}</p></div><Badge variant="outline" className="rounded-lg text-[10px]">{statusLabels[order.deliveryStatus] || order.deliveryStatus}</Badge></div><div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500"><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> ETA: {order.deliveryEtaMinutes ? `${order.deliveryEtaMinutes} دقيقة` : "غير محدد"}</span><span>الإجمالي: {order.total} ر.س</span></div></button>)}</div>
      <Card className="rounded-2xl border-slate-200"><CardHeader className="px-4 pb-2 pt-4"><CardTitle className="text-base">إدارة التسليم</CardTitle></CardHeader><CardContent className="space-y-2.5 p-4 pt-2">{!selected ? <p className="py-6 text-center text-sm text-slate-500">اختر طلبًا لإدارة حالته.</p> : <><div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">الطلب #{selected.id} · {selected.guestName || "عميل"}</div><label className="block text-xs font-bold">ETA بالدقائق<Input value={eta} onChange={(event) => setEta(event.target.value)} type="number" min={1} max={1440} className="mt-1.5 h-9 rounded-xl" /></label><label className="block text-xs font-bold">ملاحظة التسليم<Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="مثال: الوصول من البوابة الخلفية" className="mt-1.5 h-9 rounded-xl" /></label><div className="grid grid-cols-2 gap-2"><Button disabled={updateStatus.isPending} onClick={() => update("picked_up")} className="h-9 rounded-xl bg-slate-700 text-xs">استلام الطلب</Button><Button disabled={updateStatus.isPending} onClick={() => update("out_for_delivery")} className="h-9 rounded-xl bg-sky-600 text-xs">في الطريق</Button><Button disabled={updateStatus.isPending} onClick={() => update("delivered")} className="h-9 rounded-xl bg-emerald-600 text-xs"><CheckCircle2 className="ml-1 h-4 w-4" />تم التسليم</Button><Button disabled={updateStatus.isPending} onClick={() => update("returned")} variant="outline" className="h-9 rounded-xl text-xs">مرتجع</Button></div><div className="border-t border-slate-100 pt-2.5"><label className="block text-xs font-bold text-red-700">سبب فشل التوصيل عند الحاجة<Input value={failureReason} onChange={(event) => setFailureReason(event.target.value)} placeholder="لم يرد العميل، عنوان غير صحيح..." className="mt-1.5 h-9 rounded-xl" /></label><Button disabled={updateStatus.isPending || !failureReason.trim()} onClick={() => update("failed")} variant="outline" className="mt-2 h-9 w-full rounded-xl border-red-200 text-xs text-red-700"><AlertTriangle className="ml-1 h-4 w-4" />تسجيل فشل التوصيل</Button></div></>}</CardContent></Card>
    </div>
  </div>;
}
