import { CircleDollarSign, Store, TrendingDown, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { DashboardQuickAccess, type DashboardQuickAccessItem } from "@/components/DashboardQuickAccess";
import { SuperAdminRestaurantCatalog } from "@/components/SuperAdminRestaurantCatalog";

type SparklineProps = { values: number[]; tone: "emerald" | "orange" | "violet" | "slate" };

function Sparkline({ values, tone }: SparklineProps) {
  const points = values.length > 1 && values.some((value) => value > 0) ? values : [];
  if (!points.length) return <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">لا توجد سلسلة تاريخية كافية</span>;
  const max = Math.max(...points, 1);
  const coordinates = points.map((value, index) => `${(index / Math.max(points.length - 1, 1)) * 100},${28 - (value / max) * 24}`).join(" ");
  const stroke = tone === "emerald" ? "#10b981" : tone === "orange" ? "#f97316" : tone === "violet" ? "#a78bfa" : "#94a3b8";
  return <svg aria-label="اتجاه تاريخي فعلي" role="img" viewBox="0 0 100 30" className="h-8 w-28" preserveAspectRatio="none"><polyline points={coordinates} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><line x1="0" y1="29" x2="100" y2="29" stroke="currentColor" strokeOpacity="0.12" /></svg>;
}

function dailySeries<T>(rows: T[], getDate: (row: T) => Date | string | number | null | undefined, getValue: (row: T) => number) {
  const now = new Date();
  const values = Array.from({ length: 7 }, (_, index) => ({ day: new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index)), value: 0 }));
  rows.forEach((row) => {
    const raw = getDate(row);
    const date = raw ? new Date(raw) : null;
    if (!date || Number.isNaN(date.getTime())) return;
    const index = values.findIndex(({ day }) => day.toDateString() === date.toDateString());
    if (index >= 0) values[index].value += getValue(row);
  });
  return values.map(({ value }) => value);
}

export function PlatformOverview({ onNavigate, quickItems }: { onNavigate: (key: "admin" | DashboardQuickAccessItem["key"]) => void; quickItems: DashboardQuickAccessItem[] }) {
  const restaurantsQuery = trpc.admin.restaurants.useQuery(undefined, { retry: 2 });
  const subscriptionsQuery = trpc.admin.subscriptions.useQuery({}, { retry: 2 });
  const restaurants = restaurantsQuery.data ?? [];
  const subscriptions = subscriptionsQuery.data ?? [];
  const activeRestaurants = restaurants.filter((restaurant) => restaurant.status === "active").length;
  const inactiveRestaurants = restaurants.filter((restaurant) => restaurant.status !== "active").length;
  const todayKey = new Date().toISOString().slice(0, 10);
  const dailySubscriptionSales = subscriptions.filter((subscription) => new Date(subscription.startedAt).toISOString().slice(0, 10) === todayKey).reduce((sum, subscription) => sum + Number(subscription.monthlyPrice ?? 0), 0);
  const monthlyRecurringRevenue = subscriptions.filter((subscription) => subscription.status === "active").reduce((sum, subscription) => sum + Number(subscription.monthlyPrice ?? 0), 0);
  const activeHistory = dailySeries(restaurants, (restaurant) => restaurant.createdAt, (restaurant) => restaurant.status === "active" ? 1 : 0);
  const inactiveHistory = dailySeries(restaurants, (restaurant) => restaurant.createdAt, (restaurant) => restaurant.status === "active" ? 0 : 1);
  const dailySalesHistory = dailySeries(subscriptions, (subscription) => subscription.startedAt, (subscription) => Number(subscription.monthlyPrice ?? 0));
  const recurringHistory = dailySeries(subscriptions.filter((subscription) => subscription.status === "active"), (subscription) => subscription.startedAt, (subscription) => Number(subscription.monthlyPrice ?? 0));
  const cards = [
    { label: "المطاعم النشطة", value: activeRestaurants, icon: Store, tint: "emerald" as const, history: activeHistory },
    { label: "المطاعم غير النشطة", value: inactiveRestaurants, icon: TrendingDown, tint: "slate" as const, history: inactiveHistory },
    { label: "مبيعات الباقات اليوم", value: `${dailySubscriptionSales.toLocaleString("ar-SA")} ر.س`, icon: CircleDollarSign, tint: "orange" as const, history: dailySalesHistory },
    { label: "الإيراد الشهري المتكرر", value: `${monthlyRecurringRevenue.toLocaleString("ar-SA")} ر.س`, icon: WalletCards, tint: "violet" as const, history: recurringHistory },
  ];
  const loading = !restaurantsQuery.data || !subscriptionsQuery.data;
  const error = restaurantsQuery.isError || subscriptionsQuery.isError;

  return (
    <div className="space-y-5">
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200">تعذر تحميل مؤشرات المنصة. Request ID: platform-overview</div>}
      <Card className="overflow-hidden rounded-[1.6rem] border-orange-100 bg-gradient-to-l from-orange-50 via-white to-white shadow-sm dark:border-orange-500/25 dark:bg-slate-900/90 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div><p className="text-xs font-semibold text-[#e76f3c]">نظرة عامة للمنصة</p><h3 className="mt-1 text-lg font-black text-slate-950 dark:text-white">مركز نشاط NFOOD</h3><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">راقب تشغيل المطاعم، الاشتراكات، والإيراد المتكرر من مركز قيادة واحد.</p></div>
          <Button onClick={() => onNavigate("admin")} className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]">إدارة المنصة</Button>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map((card) => { const Icon = card.icon; const tone = card.tint === "orange" ? "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300" : card.tint === "violet" ? "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300" : card.tint === "emerald" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300"; return <button key={card.label} type="button" onClick={() => onNavigate("admin")} className="group text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e76f3c] focus-visible:ring-offset-2"><Card className="h-full rounded-2xl border-slate-200/80 bg-white text-right shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg dark:border-slate-700/80 dark:bg-slate-900/90"><CardContent className="p-4 md:p-5"><div className="flex items-start justify-between gap-3"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm transition-transform duration-200 group-hover:scale-105 ${tone}`}><Icon className="h-5 w-5" /></div><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">تفاصيل التقرير</span></div><div className="mt-4 flex items-end justify-between gap-3"><div><p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{card.label}</p><p className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white md:text-2xl">{loading ? "جارٍ..." : card.value}</p></div><Sparkline values={card.history} tone={card.tint} /></div></CardContent></Card></button>; })}
      </div>
      <DashboardQuickAccess items={quickItems} onNavigate={onNavigate} title="كل أدوات المنصة في مكان واحد" description="الوحدات مرتبة حسب الأولوية. اضغط على أي بطاقة للوصول المباشر دون البحث في الشريط الجانبي." />
      <SuperAdminRestaurantCatalog />
    </div>
  );
}
