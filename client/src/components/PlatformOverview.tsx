import {
  CircleDollarSign,
  CheckCircle2,
  Store,
  TrendingDown,
  WalletCards,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { SuperAdminRestaurantCatalog } from "@/components/SuperAdminRestaurantCatalog";
import { SuperAdminCustomerCatalog } from "@/components/SuperAdminCustomerCatalog";
import { UiTranslationAdminPanel } from "@/components/UiTranslationAdminPanel";
import { ProfileGovernanceCenter } from "@/components/ProfileGovernanceCenter";
import { ContentPurchaseFinancePanel } from "@/components/ContentPurchaseFinancePanel";
import { WhiteLabelWorkspacePanel } from "@/components/WhiteLabelWorkspacePanel";
import { useLanguage } from "@/contexts/LanguageContext";

type SparklineProps = {
  values: number[];
  tone: "emerald" | "orange" | "violet" | "slate";
  emptyLabel?: string;
};

function Sparkline({ values, tone, emptyLabel = "No historical series available" }: SparklineProps) {
  const points =
    values.length > 1 && values.some(value => value > 0) ? values : [];
  if (!points.length)
    return (
      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
        {emptyLabel}
      </span>
    );
  const max = Math.max(...points, 1);
  const coordinates = points
    .map(
      (value, index) =>
        `${(index / Math.max(points.length - 1, 1)) * 100},${28 - (value / max) * 24}`
    )
    .join(" ");
  const stroke =
    tone === "emerald"
      ? "#10b981"
      : tone === "orange"
        ? "#f97316"
        : tone === "violet"
          ? "#a78bfa"
          : "#94a3b8";
  return (
    <svg
      aria-label="Historical trend"
      role="img"
      viewBox="0 0 100 30"
      className="h-8 w-28"
      preserveAspectRatio="none"
    >
      <polyline
        points={coordinates}
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="0"
        y1="29"
        x2="100"
        y2="29"
        stroke="currentColor"
        strokeOpacity="0.12"
      />
    </svg>
  );
}

function FeatureRequestInbox() {
  const { language } = useLanguage();
  const copy = language === "ar" ? { title: "طلبات المميزات المدفوعة", empty: "لا توجد طلبات بانتظار المراجعة.", pending: "قيد المراجعة", approve: "اعتماد", reject: "رفض", delivery: "إدارة التوصيل من المنصة", loading: "جارٍ…", error: "تعذر تحميل طلبات المميزات." } : { title: "Paid feature requests", empty: "No pending feature requests.", pending: "Pending review", approve: "Approve", reject: "Reject", delivery: "Platform delivery management", loading: "Loading…", error: "Unable to load feature requests." };
  const requests = trpc.platform.adminFeatureRequests.useQuery({ status: "pending" }, { retry: 1 });
  const review = trpc.platform.reviewFeatureRequest.useMutation({ onSuccess: () => void requests.refetch() });
  if (requests.isError) return <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200">{copy.error}</div>;
  return <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90"><CardContent className="p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-black text-slate-950 dark:text-white">{copy.title}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{requests.isLoading ? copy.loading : `${requests.data?.length ?? 0} ${copy.pending}`}</p></div><span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">{requests.data?.length ?? 0}</span></div>{!requests.isLoading && !(requests.data?.length) ? <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">{copy.empty}</p> : <div className="mt-4 space-y-2">{(requests.data ?? []).slice(0, 6).map((request) => <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60"><div><p className="text-xs font-black text-slate-900 dark:text-white">{request.featureKey === "platform_delivery" ? copy.delivery : request.featureLabel}</p><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">مطعم #{request.restaurantId}{request.requestedPrice ? ` · ${request.requestedPrice} ${request.currencyCode}` : ""}</p></div><div className="flex items-center gap-2"><button type="button" disabled={review.isPending} onClick={() => review.mutate({ id: request.id, status: "rejected" })} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-[11px] font-black text-red-700 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"><XCircle className="h-3.5 w-3.5" />{copy.reject}</button><button type="button" disabled={review.isPending} onClick={() => review.mutate({ id: request.id, status: "approved" })} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"><CheckCircle2 className="h-3.5 w-3.5" />{copy.approve}</button></div></div>)}</div>}</CardContent></Card>;
}

function formatPlatformMoney(value: number) { return `${Math.round(Number.isFinite(value) ? value : 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} SAR`; }

function dailySeries<T>(
  rows: T[],
  getDate: (row: T) => Date | string | number | null | undefined,
  getValue: (row: T) => number
) {
  const now = new Date();
  const values = Array.from({ length: 7 }, (_, index) => ({
    day: new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - (6 - index)
    ),
    value: 0,
  }));
  rows.forEach(row => {
    const raw = getDate(row);
    const date = raw ? new Date(raw) : null;
    if (!date || Number.isNaN(date.getTime())) return;
    const index = values.findIndex(
      ({ day }) => day.toDateString() === date.toDateString()
    );
    if (index >= 0) values[index].value += getValue(row);
  });
  return values.map(({ value }) => value);
}

export function PlatformOverview({ onNavigate }: { onNavigate: (key: "admin") => void }) {
  const { language } = useLanguage();
  const copy = language === "ar"
    ? { total: "إجمالي المطاعم", active: "المطاعم النشطة", inactive: "المطاعم غير النشطة", sales: "مبيعات الباقات اليوم", recurring: "الإيراد الشهري المتكرر", report: "تفاصيل التقرير", noHistory: "لا توجد سلسلة تاريخية كافية", error: "تعذر تحميل مؤشرات المنصة حاليًا." }
    : language === "fr"
      ? { total: "Total des restaurants", active: "Restaurants actifs", inactive: "Restaurants inactifs", sales: "Ventes des offres aujourd’hui", recurring: "Revenu mensuel récurrent", report: "Détails du rapport", noHistory: "Historique insuffisant", error: "Impossible de charger les indicateurs de la plateforme." }
      : language === "ur"
        ? { total: "کل ریستوران", active: "فعال ریستوران", inactive: "غیر فعال ریستوران", sales: "آج کی پیکیج فروخت", recurring: "ماہانہ بار بار آمدنی", report: "رپورٹ کی تفصیل", noHistory: "کافی تاریخی سلسلہ موجود نہیں", error: "پلیٹ فارم کے اشاریے لوڈ نہیں ہو سکے۔" }
        : { total: "Total restaurants", active: "Active restaurants", inactive: "Inactive restaurants", sales: "Plan sales today", recurring: "Monthly recurring revenue", report: "Report details", noHistory: "Not enough historical data", error: "Unable to load platform metrics right now." };
  const restaurantsQuery = trpc.admin.restaurants.useQuery(undefined, {
    retry: 2,
  });
  const subscriptionsQuery = trpc.admin.subscriptions.useQuery(
    {},
    { retry: 2 }
  );
  const restaurants = restaurantsQuery.data ?? [];
  const subscriptions = subscriptionsQuery.data ?? [];
  const activeRestaurants = restaurants.filter(
    restaurant => restaurant.status === "active"
  ).length;
  const inactiveRestaurants = restaurants.filter(
    restaurant => restaurant.status !== "active"
  ).length;
  const todayKey = new Date().toISOString().slice(0, 10);
  const dailySubscriptionSales = subscriptions
    .filter(
      subscription =>
        new Date(subscription.startedAt).toISOString().slice(0, 10) === todayKey
    )
    .reduce(
      (sum, subscription) => sum + Number(subscription.monthlyPrice ?? 0),
      0
    );
  const monthlyRecurringRevenue = subscriptions
    .filter(subscription => subscription.status === "active")
    .reduce(
      (sum, subscription) => sum + Number(subscription.monthlyPrice ?? 0),
      0
    );
  const totalHistory = dailySeries(
    restaurants,
    restaurant => restaurant.createdAt,
    () => 1
  );
  const activeHistory = dailySeries(
    restaurants,
    restaurant => restaurant.createdAt,
    restaurant => (restaurant.status === "active" ? 1 : 0)
  );
  const inactiveHistory = dailySeries(
    restaurants,
    restaurant => restaurant.createdAt,
    restaurant => (restaurant.status === "active" ? 0 : 1)
  );
  const dailySalesHistory = dailySeries(
    subscriptions,
    subscription => subscription.startedAt,
    subscription => Number(subscription.monthlyPrice ?? 0)
  );
  const recurringHistory = dailySeries(
    subscriptions.filter(subscription => subscription.status === "active"),
    subscription => subscription.startedAt,
    subscription => Number(subscription.monthlyPrice ?? 0)
  );
  const cards = [
    {
      label: copy.total,
      value: restaurants.length,
      icon: Store,
      tint: "slate" as const,
      history: totalHistory,
    },
    {
      label: copy.active,
      value: activeRestaurants,
      icon: Store,
      tint: "emerald" as const,
      history: activeHistory,
    },
    {
      label: copy.inactive,
      value: inactiveRestaurants,
      icon: TrendingDown,
      tint: "slate" as const,
      history: inactiveHistory,
    },
    {
      label: copy.sales,
      value: formatPlatformMoney(dailySubscriptionSales),
      icon: CircleDollarSign,
      tint: "orange" as const,
      history: dailySalesHistory,
    },
    {
      label: copy.recurring,
      value: formatPlatformMoney(monthlyRecurringRevenue),
      icon: WalletCards,
      tint: "violet" as const,
      history: recurringHistory,
    },
  ];
  const loading = !restaurantsQuery.data || !subscriptionsQuery.data;
  const error = restaurantsQuery.isError || subscriptionsQuery.isError;

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200">
          {copy.error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 max-[1100px]:gap-2 xl:grid-cols-5">
        {cards.map(card => {
          const Icon = card.icon;
          const tone =
            card.tint === "orange"
              ? "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300"
              : card.tint === "violet"
                ? "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
                : card.tint === "emerald"
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300";
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => onNavigate("admin")}
              className="group text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e76f3c] focus-visible:ring-offset-2"
            >
              <Card className="h-full min-h-[132px] rounded-2xl border-slate-200/80 bg-white text-right shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg max-[1100px]:min-h-[118px] max-[900px]:min-h-[104px] dark:border-slate-700/80 dark:bg-slate-900/90">
                <CardContent className="p-4 md:p-5 max-[1100px]:p-3 max-[900px]:p-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm transition-transform duration-200 group-hover:scale-105 max-[900px]:h-9 max-[900px]:w-9 ${tone}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {copy.report}
                    </span>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {card.label}
                      </p>
                      <p className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white md:text-2xl">
                        {loading ? (language === "ar" ? "جارٍ…" : language === "fr" ? "Chargement…" : language === "ur" ? "لوڈ ہو رہا ہے…" : "Loading…") : card.value}
                      </p>
                    </div>
                    <Sparkline values={card.history} tone={card.tint} emptyLabel={copy.noHistory} />
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <SuperAdminRestaurantCatalog />
        <SuperAdminCustomerCatalog />
      </div>
      <ProfileGovernanceCenter />
      <ContentPurchaseFinancePanel />
      <WhiteLabelWorkspacePanel />
      <UiTranslationAdminPanel />
      <FeatureRequestInbox />
    </div>
  );
}
