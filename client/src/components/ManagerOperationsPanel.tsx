import { useMemo } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock3, RefreshCw, ServerCog, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import type { Order, OrderStatus } from "@/components/homeNavigation";

type Props = {
  orders: Order[];
  ordersLoading: boolean;
  ordersError: boolean;
  summaryLoading: boolean;
  summaryError: boolean;
  lastUpdatedAt?: number;
  onNavigate: (key: "orders" | "kds") => void;
};

type Copy = {
  title: string;
  live: string;
  delayed: string;
  active: string;
  system: string;
  healthy: string;
  degraded: string;
  syncing: string;
  lastSync: string;
  noData: string;
  orders: string;
  kds: string;
  viewOrders: string;
  openKds: string;
  attention: string;
  status: Record<OrderStatus, string>;
};

const copy: Record<Language, Copy> = {
  ar: { title: "مركز التشغيل", live: "مراقبة مباشرة", delayed: "طلب متأخر", active: "الطلبات النشطة", system: "حالة النظام", healthy: "الخدمات تستجيب", degraded: "تحتاج المراجعة", syncing: "جارٍ التحقق", lastSync: "آخر مزامنة", noData: "لا توجد بيانات تشغيلية بعد", orders: "إدارة الطلبات", kds: "فتح شاشة المطبخ", viewOrders: "عرض الطلبات", openKds: "فتح KDS", attention: "تحتاج متابعة", status: { new: "جديد", preparing: "قيد التحضير", ready: "جاهز", completed: "مكتمل" } },
  en: { title: "Operations center", live: "Live monitoring", delayed: "Delayed order", active: "Active orders", system: "System status", healthy: "Services responding", degraded: "Needs review", syncing: "Checking", lastSync: "Last sync", noData: "No operational data yet", orders: "Orders", kds: "Open kitchen display", viewOrders: "View orders", openKds: "Open KDS", attention: "Needs attention", status: { new: "New", preparing: "Preparing", ready: "Ready", completed: "Completed" } },
  fr: { title: "Centre des opérations", live: "Surveillance en direct", delayed: "Commande en retard", active: "commandes actives", system: "État du système", healthy: "Services disponibles", degraded: "À vérifier", syncing: "Vérification", lastSync: "Dernière synchro", noData: "Aucune donnée opérationnelle", orders: "Commandes", kds: "Écran cuisine", viewOrders: "Voir les commandes", openKds: "Ouvrir KDS", attention: "À suivre", status: { new: "Nouvelle", preparing: "En préparation", ready: "Prête", completed: "Terminée" } },
  ur: { title: "آپریشنز سنٹر", live: "لائیو نگرانی", delayed: "تاخیر والا آرڈر", active: "فعال آرڈرز", system: "سسٹم کی حالت", healthy: "سروسز جواب دے رہی ہیں", degraded: "جائزہ درکار", syncing: "جانچ جاری", lastSync: "آخری ہم وقت سازی", noData: "ابھی آپریشنل ڈیٹا نہیں", orders: "آرڈرز", kds: "کچن ڈسپلے", viewOrders: "آرڈرز دیکھیں", openKds: "KDS کھولیں", attention: "توجہ درکار", status: { new: "نیا", preparing: "تیاری", ready: "تیار", completed: "مکمل" } },
};

export function ManagerOperationsPanel({ orders, ordersLoading, ordersError, summaryLoading, summaryError, lastUpdatedAt, onNavigate }: Props) {
  const { language, direction, locale } = useLanguage();
  const text = copy[language];
  const stats = useMemo(() => {
    const active = orders.filter((order) => order.status !== "completed");
    const delayed = active.filter((order) => order.ageMinutes >= 15);
    const byStatus = (Object.keys(text.status) as OrderStatus[]).reduce<Record<OrderStatus, number>>((result, status) => {
      result[status] = orders.filter((order) => order.status === status).length;
      return result;
    }, { new: 0, preparing: 0, ready: 0, completed: 0 });
    return { active, delayed, byStatus };
  }, [orders, text.status]);
  const hasError = ordersError || summaryError;
  const isChecking = ordersLoading || summaryLoading;
  const syncLabel = lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";

  return <Card dir={direction} className={`mb-5 overflow-hidden rounded-3xl shadow-sm ${stats.delayed.length ? "border-red-200" : "border-slate-200/80"}`}>
    <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div className="flex items-center gap-3"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${hasError ? "bg-red-50 text-red-700" : "bg-[#111c2e] text-white"}`}><ServerCog className="h-5 w-5" /></div><div><CardTitle className="text-base">{text.title}</CardTitle><p className="mt-1 flex items-center gap-2 text-xs text-slate-500"><span className={`h-2 w-2 rounded-full ${hasError ? "bg-red-500" : isChecking ? "bg-amber-500" : "bg-emerald-500"}`} />{text.live} · {text.lastSync}: {syncLabel}</p></div></div>
      <div className="flex items-center gap-2"><Badge variant="outline" className={`rounded-lg ${hasError ? "border-red-200 bg-red-50 text-red-700" : isChecking ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{hasError ? text.degraded : isChecking ? text.syncing : text.healthy}</Badge><Button type="button" size="sm" variant="outline" onClick={() => onNavigate("orders")} className="rounded-xl text-xs"><RefreshCw className="ml-1 h-3.5 w-3.5" />{text.viewOrders}</Button></div>
    </CardHeader>
    <CardContent className="space-y-4 p-5">
      {stats.active.length === 0 ? <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500"><ShoppingBag className="mx-auto mb-2 h-5 w-5 text-slate-400" />{text.noData}</div> : <>
        <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">{text.active}</span><Activity className="h-4 w-4 text-blue-600" /></div><p className="mt-2 text-2xl font-black text-slate-900">{stats.active.length}</p></div><div className={`rounded-2xl border p-4 ${stats.delayed.length ? "border-red-200 bg-red-50" : "border-emerald-100 bg-emerald-50/60"}`}><div className="flex items-center justify-between"><span className={`text-xs font-semibold ${stats.delayed.length ? "text-red-700" : "text-emerald-700"}`}>{text.delayed}</span>{stats.delayed.length ? <AlertTriangle className="h-4 w-4 text-red-600" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}</div><p className={`mt-2 text-2xl font-black ${stats.delayed.length ? "text-red-800" : "text-emerald-800"}`}>{stats.delayed.length}</p></div><div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-orange-800">{text.attention}</span><Clock3 className="h-4 w-4 text-[#e76f3c]" /></div><p className="mt-2 text-2xl font-black text-orange-900">{stats.byStatus.new + stats.byStatus.preparing}</p></div></div>
        <div className="flex flex-wrap items-center gap-2 text-xs">{(Object.keys(text.status) as OrderStatus[]).map((status) => <span key={status} className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-slate-600"><strong className="text-slate-900">{stats.byStatus[status]}</strong> {text.status[status]}</span>)}<Button type="button" size="sm" onClick={() => onNavigate("kds")} className="mr-auto rounded-xl bg-[#e76f3c] text-xs text-white hover:bg-[#d85f2e]">{text.openKds}</Button></div>
      </>}
    </CardContent>
  </Card>;
}

export default ManagerOperationsPanel;
