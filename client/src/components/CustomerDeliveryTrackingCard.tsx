import { useEffect, useRef, useState } from "react";
import { BellRing, Clock3, MapPin, Navigation, Radio, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type DeliveryStatus = "unassigned" | "assigned" | "picked_up" | "out_for_delivery" | "delivered" | "failed" | "returned";

const statusMeta: Record<DeliveryStatus, { label: string; description: string; className: string }> = {
  unassigned: { label: "بانتظار الإسناد", description: "سيتم إسناد الطلب إلى سائق متاح قريبًا.", className: "bg-slate-100 text-slate-700" },
  assigned: { label: "تم تعيين السائق", description: "تم تعيين سائق لطلبك ويستعد للتوصيل.", className: "bg-violet-100 text-violet-700" },
  picked_up: { label: "استلم السائق الطلب", description: "استلم السائق الطلب من المطعم.", className: "bg-amber-100 text-amber-800" },
  out_for_delivery: { label: "السائق في الطريق", description: "يتجه السائق إلى عنوان التوصيل.", className: "bg-blue-100 text-blue-700" },
  delivered: { label: "تم التسليم", description: "تم تسجيل تسليم الطلب.", className: "bg-emerald-100 text-emerald-700" },
  failed: { label: "تعذر التوصيل", description: "راجع ملاحظة المطعم أو تواصل معه.", className: "bg-red-100 text-red-700" },
  returned: { label: "تم إرجاع الطلب", description: "تم إرجاع الطلب إلى المطعم.", className: "bg-rose-100 text-rose-700" },
};

function formatLocationTime(value: string | Date | null | undefined) {
  if (!value) return "لم يُحدّث بعد";
  return new Date(value).toLocaleTimeString("ar-SA-u-ca-gregory-nu-latn", { hour: "2-digit", minute: "2-digit" });
}

export function CustomerDeliveryTrackingCard({ orderId }: { orderId: number }) {
  const tracking = trpc.platform.deliveryTracking.useQuery({ orderId }, { retry: false, refetchInterval: 5000 });
  const previousStatus = useRef<string | null>(null);
  const driverMap = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const status = tracking.data?.deliveryStatus as DeliveryStatus | undefined;
  const meta = status ? statusMeta[status] ?? statusMeta.unassigned : statusMeta.unassigned;

  useEffect(() => {
    if (!status) return;
    if (previousStatus.current && previousStatus.current !== status) {
      toast.success(`تحديث التوصيل: ${statusMeta[status]?.label ?? status}`);
    }
    previousStatus.current = status;
  }, [status]);

  useEffect(() => {
    const map = driverMap.current;
    if (!mapReady || !map) return;
    markers.current.forEach((marker) => { marker.map = null; });
    markers.current = [];
    const driver = tracking.data?.driver;
    const latitude = Number(driver?.latitude);
    const longitude = Number(driver?.longitude);
    if (!driver || !Number.isFinite(latitude) || !Number.isFinite(longitude) || !window.google?.maps?.marker) return;
    const position = { lat: latitude, lng: longitude };
    const marker = new window.google.maps.marker.AdvancedMarkerElement({ map, position, title: driver.name ? `السائق: ${driver.name}` : "السائق" });
    markers.current = [marker];
    map.panTo(position);
  }, [mapReady, tracking.data?.driver?.latitude, tracking.data?.driver?.longitude, tracking.data?.driver?.name]);

  useEffect(() => () => { markers.current.forEach((marker) => { marker.map = null; }); }, []);

  if (tracking.isLoading) return <Card className="rounded-3xl border-sky-100 bg-sky-50/60"><CardContent className="flex items-center gap-2 p-4 text-sm font-bold text-sky-800"><Radio className="h-4 w-4 animate-pulse" />جارٍ تحميل تتبع السائق...</CardContent></Card>;
  if (tracking.isError || !tracking.data) return <Card className="rounded-3xl border-amber-200 bg-amber-50"><CardContent className="p-4 text-sm font-bold text-amber-800">تعذر تحميل التتبع الحي الآن. ستستمر صفحة الطلب في تحديث الحالة تلقائيًا.</CardContent></Card>;

  return <Card className="overflow-hidden rounded-3xl border-sky-100 bg-white shadow-sm" data-delivery-tracking={orderId}>
    <CardHeader className="border-b border-slate-100 pb-3"><div className="flex flex-wrap items-center justify-between gap-2"><CardTitle className="flex items-center gap-2 text-base font-black"><Navigation className="h-4 w-4 text-sky-600" />تتبع التوصيل الحي</CardTitle><Badge className={`rounded-xl ${meta.className}`}><BellRing className="ml-1 h-3.5 w-3.5" />{meta.label}</Badge></div><p className="mt-1 text-xs leading-5 text-slate-500">{meta.description} آخر مزامنة: {formatLocationTime(tracking.data.updatedAt)}</p></CardHeader>
    <CardContent className="space-y-3 p-4"><div className="grid gap-2 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-3"><p className="text-[11px] font-bold text-slate-500">الوقت المتوقع</p><p className="mt-1 flex items-center gap-1 text-sm font-black text-slate-800"><Clock3 className="h-4 w-4 text-sky-600" />{tracking.data.deliveryEtaMinutes ? `${tracking.data.deliveryEtaMinutes} دقيقة` : "غير محدد"}</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-[11px] font-bold text-slate-500">السائق</p><p className="mt-1 flex items-center gap-1 text-sm font-black text-slate-800"><Truck className="h-4 w-4 text-sky-600" />{tracking.data.driver?.name || "بانتظار الإسناد"}</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-[11px] font-bold text-slate-500">آخر موقع</p><p className="mt-1 flex items-center gap-1 text-sm font-black text-slate-800"><MapPin className="h-4 w-4 text-sky-600" />{formatLocationTime(tracking.data.driver?.lastLocationAt)}</p></div></div><div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"><MapView className="h-64 w-full" initialCenter={{ lat: Number(tracking.data.driver?.latitude) || Number(tracking.data.deliveryLatitude) || 24.7136, lng: Number(tracking.data.driver?.longitude) || Number(tracking.data.deliveryLongitude) || 46.6753 }} initialZoom={14} onMapReady={(map) => { driverMap.current = map; setMapReady(true); }} />{!tracking.data.driver?.latitude && <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl bg-slate-950/75 px-3 py-2 text-center text-xs font-bold text-white">ستظهر حركة السائق بعد تفعيل مشاركة الموقع من جهازه.</div>}</div>{tracking.data.deliveryAddress && <p className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-800">عنوان التوصيل: {tracking.data.deliveryAddress}</p>}{tracking.data.deliveryFailureReason && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">ملاحظة: {tracking.data.deliveryFailureReason}</p>}{tracking.data.deliveryNote && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">ملاحظة السائق: {tracking.data.deliveryNote}</p>}</CardContent>
  </Card>;
}

export default CustomerDeliveryTrackingCard;
