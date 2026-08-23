import { CircleDollarSign, Store, TrendingDown, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { DashboardQuickAccess, type DashboardQuickAccessItem } from "@/components/DashboardQuickAccess";

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
  const cards = [
    { label: "المطاعم النشطة", value: activeRestaurants, icon: Store, tint: "emerald" },
    { label: "المطاعم غير النشطة", value: inactiveRestaurants, icon: TrendingDown, tint: "slate" },
    { label: "مبيعات الباقات اليوم", value: `${dailySubscriptionSales.toLocaleString("ar-SA")} ر.س`, icon: CircleDollarSign, tint: "orange" },
    { label: "الإيراد الشهري المتكرر", value: `${monthlyRecurringRevenue.toLocaleString("ar-SA")} ر.س`, icon: WalletCards, tint: "violet" },
  ];
  const loading = !restaurantsQuery.data || !subscriptionsQuery.data;
  const error = restaurantsQuery.isError || subscriptionsQuery.isError;

  return (
    <div className="space-y-5">
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">تعذر تحميل مؤشرات المنصة. Request ID: platform-overview</div>}
      <Card className="rounded-[1.6rem] border-orange-100 bg-gradient-to-l from-orange-50 via-white to-white shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div><p className="text-xs font-semibold text-[#e76f3c]">نظرة عامة للمنصة</p><h3 className="mt-1 text-lg font-bold">مركز نشاط NFOOD</h3><p className="mt-1 text-sm text-slate-500">راقب تشغيل المطاعم، نمو الاشتراكات، والإيراد المتكرر من مركز قيادة واحد.</p></div>
          <Button onClick={() => onNavigate("admin")} className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]">إدارة المنصة</Button>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map((card) => { const Icon = card.icon; return <Card key={card.label} className="rounded-2xl border-slate-200/80 bg-white shadow-sm"><CardContent className="p-4 md:p-5"><div className="flex items-start justify-between"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.tint === "orange" ? "bg-orange-50 text-orange-600" : card.tint === "violet" ? "bg-violet-50 text-violet-600" : card.tint === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"}`}><Icon className="h-5 w-5" /></div><span className="text-[11px] font-bold text-slate-400">من البيانات</span></div><p className="mt-4 text-xs font-medium text-slate-500">{card.label}</p><p className="mt-1 text-xl font-bold tracking-tight md:text-2xl">{loading ? "جارٍ..." : card.value}</p></CardContent></Card>; })}
      </div>
      <DashboardQuickAccess items={quickItems} onNavigate={onNavigate} title="كل أدوات المنصة في مكان واحد" description="الوحدات مرتبة حسب الأولوية. اضغط على أي بطاقة للوصول المباشر دون البحث في الشريط الجانبي." />
      <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm"><CardContent className="p-5"><p className="text-sm font-bold">نبض المنصة</p><p className="mt-1 text-xs text-slate-500">تعود هذه النظرة عند الضغط على «نظرة عامة»، بينما تفتح البطاقات الوحدات الفعلية مباشرة.</p></CardContent></Card>
    </div>
  );
}
