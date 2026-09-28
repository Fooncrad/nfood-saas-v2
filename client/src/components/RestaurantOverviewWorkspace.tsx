import { OverviewAnalyticsPanel } from "@/components/OverviewAnalyticsPanel";
import { ClipboardList, LayoutGrid, MonitorSmartphone, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MerchantCommerceFundingPanel } from "@/components/MerchantCommerceFundingPanel";
import type { NavKey } from "@/components/homeNavigation";

type RestaurantOverviewWorkspaceProps = {
  restaurantId: number;
  orders: Parameters<typeof OverviewAnalyticsPanel>[0]["orders"];
  summary: Parameters<typeof OverviewAnalyticsPanel>[0]["summary"];
  summaryLoading: boolean;
  summaryError: boolean;
  onNavigate: (key: NavKey) => void;
  role?: string | null;
};

export function RestaurantOverviewWorkspace({ restaurantId, orders, summary, summaryLoading, summaryError, onNavigate, role }: RestaurantOverviewWorkspaceProps) {
  const { language, direction } = useLanguage();
  const copy = language === "ar"
    ? { title: "مركز تشغيل المتجر", subtitle: "ابدأ من المهام اليومية الأكثر استخدامًا، ثم انتقل للتقارير عند الحاجة.", orders: "إدارة الطلبات", ordersHint: "راجع الجديد وحالات التحضير والتسليم", pos: "فتح نقطة البيع", posHint: "ابدأ طلبًا مباشرًا من الكاشير", tables: "الطاولات والحجوزات", tablesHint: "تابع الإشغال والحجوزات وخدمة الطاولات", menu: "إدارة المنيو", menuHint: "حدّث الأصناف والأسعار والتوفر" }
    : language === "fr"
      ? { title: "Centre d’exploitation", subtitle: "Commencez par les tâches quotidiennes, puis consultez les rapports si nécessaire.", orders: "Gérer les commandes", ordersHint: "Suivez nouvelles commandes, préparation et livraison", pos: "Ouvrir le point de vente", posHint: "Démarrez une commande depuis la caisse", tables: "Tables et réservations", tablesHint: "Suivez occupation, réservations et service", menu: "Gérer le menu", menuHint: "Mettez à jour articles, prix et disponibilité" }
      : { title: "Store operations", subtitle: "Start with the daily tasks you use most, then move into reporting when needed.", orders: "Manage orders", ordersHint: "Review new, preparing, and delivery orders", pos: "Open POS", posHint: "Start a counter order", tables: "Tables & bookings", tablesHint: "Track occupancy, bookings, and table service", menu: "Manage menu", menuHint: "Update items, pricing, and availability" };
  const actions = [
    { key: "orders" as NavKey, label: copy.orders, hint: copy.ordersHint, icon: ShoppingBag },
    { key: "pos" as NavKey, label: copy.pos, hint: copy.posHint, icon: MonitorSmartphone },
    { key: "tables" as NavKey, label: copy.tables, hint: copy.tablesHint, icon: LayoutGrid },
    { key: "menu" as NavKey, label: copy.menu, hint: copy.menuHint, icon: UtensilsCrossed },
  ];
  return <div dir={direction} className="space-y-4">
    <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-5">
        <div><p className="text-xs font-black text-orange-500">{copy.title}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{copy.subtitle}</p></div>
        <ClipboardList className="h-5 w-5 text-slate-300" />
      </div>
      <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map(({ key, label, hint, icon: Icon }) => <button key={key} type="button" onClick={() => onNavigate(key)} className="group flex min-h-20 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-start transition hover:border-orange-200 hover:bg-orange-50/60 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-orange-900/60 dark:hover:bg-orange-950/20"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-orange-500 shadow-sm dark:bg-slate-900"><Icon className="h-5 w-5" /></span><span className="min-w-0"><strong className="block text-sm text-slate-900 dark:text-white">{label}</strong><span className="mt-1 block text-[11px] leading-5 text-slate-500">{hint}</span></span></button>)}
      </div>
    </section>
    <OverviewAnalyticsPanel restaurantId={restaurantId} orders={orders} summary={summary} summaryLoading={summaryLoading} summaryError={summaryError} onNavigate={onNavigate} />
    {["restaurant_admin", "merchant"].includes(String(role ?? "")) && <MerchantCommerceFundingPanel restaurantId={restaurantId} />}
  </div>;
}
