import { useEffect, useMemo, useRef, useState } from "react";
import { BellRing, CheckCircle2, Radio, ShoppingBag, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export type RealtimeOrder = { id: string; status: string; table: string; time: string };
type Props = { orders: RealtimeOrder[]; mode: "pos" | "kds" };

type Copy = { syncPos: string; syncKds: string; lastUpdate: string; connected: string; activeOrders: string; newAlert: string; statusAlert: string; arrived: string; statusChanged: string; close: string; empty: string; status: Record<string, string> };
const copy: Record<Language, Copy> = {
  ar: { syncPos: "مزامنة نقاط البيع", syncKds: "مزامنة شاشة المطبخ", lastUpdate: "آخر تحديث", connected: "متصل", activeOrders: "طلب نشط", newAlert: "طلب جديد يحتاج المتابعة", statusAlert: "تم تحديث حالة طلب", arrived: "وصل {id} إلى النظام", statusChanged: "{id}: {status}", close: "إغلاق التنبيه", empty: "لا توجد طلبات نشطة حاليًا.", status: { new: "طلب جديد", preparing: "قيد التحضير", ready: "جاهز", completed: "مكتمل", cancelled: "ملغى" } },
  en: { syncPos: "POS sync", syncKds: "Kitchen display sync", lastUpdate: "Last update", connected: "Connected", activeOrders: "active orders", newAlert: "New order needs attention", statusAlert: "Order status updated", arrived: "{id} arrived in the system", statusChanged: "{id}: {status}", close: "Dismiss alert", empty: "There are no active orders right now.", status: { new: "New order", preparing: "Preparing", ready: "Ready", completed: "Completed", cancelled: "Cancelled" } },
  fr: { syncPos: "Synchronisation POS", syncKds: "Synchronisation cuisine", lastUpdate: "Dernière mise à jour", connected: "Connecté", activeOrders: "commande(s) active(s)", newAlert: "Une nouvelle commande nécessite votre attention", statusAlert: "Statut de commande mis à jour", arrived: "{id} est arrivée dans le système", statusChanged: "{id} : {status}", close: "Fermer l’alerte", empty: "Aucune commande active pour le moment.", status: { new: "Nouvelle commande", preparing: "En préparation", ready: "Prête", completed: "Terminée", cancelled: "Annulée" } },
  ur: { syncPos: "POS ہم وقت سازی", syncKds: "کچن ڈسپلے ہم وقت سازی", lastUpdate: "آخری اپ ڈیٹ", connected: "منسلک", activeOrders: "فعال آرڈرز", newAlert: "نیا آرڈر توجہ کا منتظر ہے", statusAlert: "آرڈر کی حالت اپ ڈیٹ ہو گئی", arrived: "{id} سسٹم میں موصول ہوا", statusChanged: "{id}: {status}", close: "تنبیہ بند کریں", empty: "اس وقت کوئی فعال آرڈر نہیں ہے۔", status: { new: "نیا آرڈر", preparing: "تیاری جاری", ready: "تیار", completed: "مکمل", cancelled: "منسوخ" } },
};

export function OrderRealtimeAlerts({ orders, mode }: Props) {
  const { language, direction, locale } = useLanguage();
  const text = copy[language];
  const previous = useRef<Map<string, string> | null>(null);
  const [event, setEvent] = useState<{ type: "new" | "status"; order: RealtimeOrder } | null>(null);
  const [lastSync, setLastSync] = useState(() => new Date());
  const snapshot = useMemo(() => new Map(orders.map((order) => [order.id, order.status])), [orders]);
  useEffect(() => {
    setLastSync(new Date());
    if (!previous.current) { previous.current = snapshot; return; }
    const old = previous.current;
    const added = orders.find((order) => !old.has(order.id));
    const changed = orders.find((order) => old.has(order.id) && old.get(order.id) !== order.status);
    const nextEvent = added ? { type: "new" as const, order: added } : changed ? { type: "status" as const, order: changed } : null;
    if (nextEvent) {
      setEvent(nextEvent);
      const status = text.status[nextEvent.order.status] ?? nextEvent.order.status;
      toast.success((nextEvent.type === "new" ? text.arrived : text.statusChanged).replace("{id}", nextEvent.order.id).replace("{status}", status));
    }
    previous.current = snapshot;
  }, [orders, snapshot, text]);
  const activeCount = orders.filter((order) => !["completed", "cancelled"].includes(order.status)).length;
  return <div dir={direction} className="space-y-3">
    <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="flex flex-wrap items-center justify-between gap-3 p-3"><div className="flex items-center gap-2"><span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Radio className="h-4 w-4" /><span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" /></span><div><p className="text-xs font-bold text-slate-800">{mode === "kds" ? text.syncKds : text.syncPos}</p><p className="text-[10px] text-slate-500">{text.lastUpdate} {lastSync.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p></div></div><div className="flex items-center gap-2"><Badge className="rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-50">{text.connected}</Badge><span className="text-xs font-semibold text-slate-500">{activeCount} {text.activeOrders}</span></div></CardContent></Card>
    {event && <div className={`flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${event.type === "new" ? "border-orange-200 bg-orange-50 text-orange-900" : "border-sky-200 bg-sky-50 text-sky-900"}`} role="status"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${event.type === "new" ? "bg-orange-500 text-white" : "bg-sky-500 text-white"}`}>{event.type === "new" ? <ShoppingBag className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}</div><div className="min-w-0 flex-1"><p className="text-sm font-bold">{event.type === "new" ? text.newAlert : text.statusAlert}</p><p className="mt-1 text-xs">{event.order.id} · {event.order.table} · {text.status[event.order.status] ?? event.order.status}</p></div><button type="button" aria-label={text.close} onClick={() => setEvent(null)} className="rounded-lg p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"><X className="h-4 w-4" /></button></div>}
    {activeCount === 0 && <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500"><CheckCircle2 className="h-4 w-4 text-emerald-500" />{text.empty}</div>}
  </div>;
}

export default OrderRealtimeAlerts;
