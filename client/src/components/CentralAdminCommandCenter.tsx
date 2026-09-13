import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bell,
  CheckCircle2,
  CircleDollarSign,
  HardDrive,
  HelpCircle,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Sun,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { trpc } from "@/lib/trpc";
import type { Order } from "@/components/homeNavigation";

export type CentralAdminNavKey = "overview" | "admin" | "accounts" | "settings" | "languages" | "files" | "trend" | "security" | "health";

const NAV_ORDER: CentralAdminNavKey[] = ["overview", "admin", "accounts", "settings", "languages", "files", "trend", "security", "health"];

const NAV_LABELS: Record<CentralAdminNavKey, { ar: string; en: string }> = {
  overview: { ar: "نظرة عامة", en: "Overview" },
  admin: { ar: "Super Admin", en: "Super Admin" },
  accounts: { ar: "الحسابات", en: "Accounts" },
  settings: { ar: "الإعدادات العامة", en: "General settings" },
  languages: { ar: "اللغة والترجمة", en: "Languages" },
  files: { ar: "مكتبة الملفات", en: "Media library" },
  trend: { ar: "Trend Kitchen · سوق نفود", en: "Trend Kitchen" },
  security: { ar: "أمان الحساب والجلسات", en: "Security" },
  health: { ar: "صحة النظام", en: "System health" },
};

const NAV_ICONS: Record<CentralAdminNavKey, LucideIcon> = {
  overview: LayoutDashboard,
  admin: ShieldCheck,
  accounts: Users,
  settings: Settings2,
  languages: Languages,
  files: HardDrive,
  trend: Sparkles,
  security: ShieldCheck,
  health: Activity,
};

type AdminOrderStatus = "review" | "pending" | "payment" | "completed";

const ORDER_STATUS_MAP: Record<Order["status"], AdminOrderStatus> = {
  new: "review",
  preparing: "pending",
  ready: "payment",
  completed: "completed",
};

const STATUS_META: Record<AdminOrderStatus, { label: { ar: string; en: string }; badge: string; dot: string }> = {
  review: { label: { ar: "مراجعة", en: "Review" }, badge: "border-amber-200 bg-amber-50 text-amber-600", dot: "bg-amber-500" },
  pending: { label: { ar: "قيد المعالجة", en: "Processing" }, badge: "border-sky-200 bg-sky-50 text-sky-600", dot: "bg-sky-500" },
  payment: { label: { ar: "بانتظار الدفع", en: "Awaiting payment" }, badge: "border-violet-200 bg-violet-50 text-violet-600", dot: "bg-violet-500" },
  completed: { label: { ar: "مكتمل", en: "Completed" }, badge: "border-emerald-200 bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" },
};

const COPY_AR = {
  searchNav: "بحث في القائمة...",
  searchOrders: "بحث في الطلبات...",
  centralAdmin: "CENTRAL ADMIN",
  sales: "إجمالي المبيعات",
  ordersToday: "طلبات اليوم",
  avgOrder: "متوسط الطلب",
  activeRestaurants: "المطاعم النشطة",
  platformCustomers: "عملاء المنصة",
  mrr: "الإيراد الشهري المتكرر",
  tabOrders: "الطلبات",
  tabCustomers: "العملاء",
  tabPurchases: "المشتريات",
  tabNfc: "NFC · Profile",
  ordersTitle: "الطلبات الأخيرة",
  ordersOverline: "نشاط آخر 200 طلب",
  noOrders: "لا توجد طلبات بعد",
  ordersHint: "ستظهر الطلبات الحية من المطاعم هنا فور استقبالها.",
  orderId: "رقم الطلب",
  channel: "القناة / المائدة",
  items: "الأصناف",
  total: "الإجمالي",
  status: "الحالة",
  time: "الوقت",
  salesTitle: "أداء المبيعات",
  salesSubtitle: "آخر 14 يومًا",
  ordersChartTitle: "الطلبات اليومية",
  managementTitle: "أدوات إدارة المنصة",
  managementSubtitle: "الكشوف والكتالوجات والضوابط التفصيلية",
  noNotifications: "لا توجد إشعارات",
  markAllRead: "قراءة الكل",
  deleteAll: "حذف الكل",
  help: "تحتاج مساعدة؟",
  helpBody: "تواصل مع فريق نفود عبر مركز المساعدة أو الدردشة المباشرة.",
  logout: "تسجيل الخروج",
  adminAccount: "حساب الإدارة",
  notifications: "الإشعارات",
  noTransactions: "لا توجد صفقات مسجلة",
  noCustomers: "لا يوجد عملاء بعد",
  nfcTitle: "أداء الاشتراكات حسب الباقة",
  arr: "الإيراد السنوي (ARR)",
  churn: "معدل التوقف (30 يوم)",
  recent: "آخر الإشعارات",
};

const COPY_EN = {
  searchNav: "Search navigation...",
  searchOrders: "Search orders...",
  centralAdmin: "CENTRAL ADMIN",
  sales: "Total sales",
  ordersToday: "Orders today",
  avgOrder: "Average order",
  activeRestaurants: "Active restaurants",
  platformCustomers: "Platform customers",
  mrr: "Monthly recurring revenue",
  tabOrders: "Orders",
  tabCustomers: "Customers",
  tabPurchases: "Purchases",
  tabNfc: "NFC · Profile",
  ordersTitle: "Recent orders",
  ordersOverline: "Last 200 orders activity",
  noOrders: "No orders yet",
  ordersHint: "Live orders from restaurants will appear here as they arrive.",
  orderId: "Order",
  channel: "Channel / Table",
  items: "Items",
  total: "Total",
  status: "Status",
  time: "Time",
  salesTitle: "Sales performance",
  salesSubtitle: "Last 14 days",
  ordersChartTitle: "Daily orders",
  managementTitle: "Platform management tools",
  managementSubtitle: "Reports, catalogs and detailed controls",
  noNotifications: "No notifications",
  markAllRead: "Mark all read",
  deleteAll: "Delete all",
  help: "Need help?",
  helpBody: "Reach the NFOOD team via the help center or live chat.",
  logout: "Sign out",
  adminAccount: "Admin account",
  notifications: "Notifications",
  noTransactions: "No transactions recorded",
  noCustomers: "No customers yet",
  nfcTitle: "Subscriptions by plan",
  arr: "Annual recurring revenue",
  churn: "Churn (30 days)",
  recent: "Recent notifications",
};

function Sparkline({ points, stroke }: { points: number[]; stroke: string }) {
  const safe = points.length > 1 ? points : [0, 0];
  const width = 120;
  const height = 34;
  const max = Math.max(...safe, 1);
  const min = Math.min(...safe, 0);
  const range = max - min || 1;
  const step = width / Math.max(safe.length - 1, 1);
  const path = safe
    .map((value, index) => `${index === 0 ? "M" : "L"}${(index * step).toFixed(1)},${(height - ((value - min) / range) * (height - 6) - 3).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-9 w-full" preserveAspectRatio="none" aria-hidden="true">
      <path d={path} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
    </svg>
  );
}

function MiniBars({ points, stroke, height = 120 }: { points: number[]; stroke: string; height?: number }) {
  const max = Math.max(...points, 1);
  return (
    <div className="flex h-[120px] items-end gap-1" aria-hidden="true">
      {points.map((value, index) => (
        <div
          key={index}
          className="min-w-1 flex-1 rounded-t"
          style={{
            height: `${Math.max((value / max) * 100, value > 0 ? 8 : 3)}%`,
            background: stroke,
            opacity: 0.3 + 0.7 * (points.length > 1 ? index / (points.length - 1) : 1),
          }}
        />
      ))}
    </div>
  );
}

function dailySeries<T>(rows: T[], dateOf: (row: T) => Date | string | null | undefined, valueOf: (row: T) => number, days = 14): number[] {
  const series = Array.from({ length: days }, () => 0);
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  for (const row of rows) {
    const raw = dateOf(row);
    if (!raw) continue;
    const dayIndex = Math.floor((new Date(raw).getTime() - start.getTime()) / 86400000);
    if (dayIndex >= 0 && dayIndex < days) series[dayIndex] += valueOf(row) || 0;
  }
  return series;
}

interface CentralAdminCommandCenterProps {
  active: CentralAdminNavKey;
  onNavigate: (key: CentralAdminNavKey) => void;
  orders: Order[];
  notificationCount?: number;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  pendingTransferCount?: number;
  transferBannerDismissed?: boolean;
  onOpenTransfers?: () => void;
  onDismissTransfers?: () => void;
  children?: ReactNode;
  overviewChildren?: ReactNode;
}

export function CentralAdminCommandCenter({
  active,
  onNavigate,
  orders,
  notificationCount = 0,
  userName,
  userEmail,
  onLogout,
  pendingTransferCount = 0,
  transferBannerDismissed = false,
  onOpenTransfers,
  onDismissTransfers,
  children,
  overviewChildren,
}: CentralAdminCommandCenterProps) {
  const { theme, toggleTheme } = useTheme();
  const { direction, language, locale } = useLanguage();
  const copy = language === "ar" ? COPY_AR : COPY_EN;
  const dark = theme === "dark";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [navQuery, setNavQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<AdminOrderStatus | "all">("all");
  const [dashboardTab, setDashboardTab] = useState<"orders" | "customers" | "purchases" | "nfc">("orders");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const restaurantsQuery = trpc.admin.restaurants.useQuery(undefined, { retry: 2 });
  const subscriptionsQuery = trpc.admin.subscriptions.useQuery({}, { retry: 2 });
  const customersQuery = trpc.admin.customers.useQuery(undefined, { retry: 1 });
  const metricsQuery = trpc.admin.saasMetrics.useQuery(undefined, { retry: 1 });
  const notificationsQuery = trpc.notifications.mine.useQuery(undefined, { retry: 1, refetchInterval: 20000 });
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: () => void notificationsQuery.refetch() });
  const markAllRead = trpc.notifications.markAllRead.useMutation({ onSuccess: () => void notificationsQuery.refetch() });
  const deleteAll = trpc.notifications.deleteAll.useMutation({ onSuccess: () => void notificationsQuery.refetch() });

  const restaurants = restaurantsQuery.data ?? [];
  const subscriptions = subscriptionsQuery.data ?? [];
  const activeRestaurants = restaurants.filter((restaurant) => restaurant.status === "active").length;
  const customerCount = customersQuery.data?.length ?? 0;
  const mrr = Number(metricsQuery.data?.mrr ?? 0);
  const arr = Number(metricsQuery.data?.arr ?? 0);
  const churn = Number(metricsQuery.data?.churnRate ?? 0) || 0;
  const byPlan = metricsQuery.data?.byPlan ?? {};

  const totalSales = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const todayOrders = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const today = orders.filter((order) => order.createdAt && new Date(order.createdAt).getTime() >= startOfDay.getTime()).length;
    return today || orders.length;
  }, [orders]);
  const avgOrder = orders.length ? totalSales / orders.length : 0;

  const salesSpark = useMemo(
    () => dailySeries(subscriptions, (subscription) => subscription.startedAt, (subscription) => Number(subscription.monthlyPrice ?? 0)),
    [subscriptions]
  );
  const restaurantsSpark = useMemo(
    () => dailySeries(restaurants, (restaurant) => restaurant.createdAt, () => 1),
    [restaurants]
  );
  const customersSpark = useMemo(() => dailySeries(customersQuery.data ?? [], (customer) => customer.createdAt, () => 1), [customersQuery.data]);
  const ordersSpark = useMemo(
    () => dailySeries(orders, (order) => order.createdAt ?? null, (order) => Number(order.total) || 1),
    [orders]
  );

  const money = (value: number) => `${Math.round(Number.isFinite(value) ? value : 0).toLocaleString("en-US")} SAR`;

  const cards = [
    { label: copy.sales, value: money(totalSales), icon: CircleDollarSign, spark: salesSpark, stroke: "#f97316", tone: "bg-orange-500/10 text-orange-500" },
    { label: copy.ordersToday, value: todayOrders.toLocaleString("en-US"), icon: ShoppingBag, spark: ordersSpark, stroke: "#0ea5e9", tone: "bg-sky-500/10 text-sky-500" },
    { label: copy.avgOrder, value: money(avgOrder), icon: WalletCards, spark: ordersSpark, stroke: "#8b5cf6", tone: "bg-violet-500/10 text-violet-500" },
    { label: copy.activeRestaurants, value: activeRestaurants.toLocaleString("en-US"), icon: Store, spark: restaurantsSpark, stroke: "#22c55e", tone: "bg-emerald-500/10 text-emerald-500" },
    { label: copy.platformCustomers, value: customerCount.toLocaleString("en-US"), icon: Users, spark: customersSpark, stroke: "#eab308", tone: "bg-yellow-500/10 text-yellow-500" },
    { label: copy.mrr, value: money(mrr), icon: TrendingUp, spark: salesSpark, stroke: "#f97316", tone: "bg-orange-500/10 text-orange-500" },
  ];

  const orderRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders
      .map((order) => ({ order, status: ORDER_STATUS_MAP[order.status] }))
      .filter((row) => orderFilter === "all" || row.status === orderFilter)
      .filter((row) => !query || `${row.order.id} ${row.order.table} ${row.order.items} ${row.order.guestName ?? ""}`.toLowerCase().includes(query))
      .slice(0, 60);
  }, [orders, search, orderFilter]);

  const filteredNav = NAV_ORDER.filter((key) => !navQuery.trim() || NAV_LABELS[key].ar.includes(navQuery.trim()) || NAV_LABELS[key].en.toLowerCase().includes(navQuery.trim().toLowerCase()));

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notificationCount > 0 ? notificationCount : notifications.filter((item) => !item.readAt).length;

  const label = (item: { ar: string; en: string }) => (language === "ar" ? item.ar : item.en);

  const pageBg = dark ? "#071525" : "#f6f8fb";
  const cardBg = dark ? "#0d2038" : "#ffffff";
  const cardBorder = dark ? "rgba(148,163,184,0.14)" : "rgba(241,245,249,1)";
  const textPrimary = dark ? "#e2e8f0" : "#0f172a";
  const textSecondary = dark ? "#94a3b8" : "#64748b";
  const divider = dark ? "rgba(148,163,184,0.12)" : "rgba(226,232,240,0.9)";
  const headerBg = dark ? "rgba(7,21,37,0.92)" : "rgba(255,255,255,0.88)";

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-black text-white shadow-lg shadow-orange-500/20">
          N
        </div>
        <div>
          <p className="text-sm font-black tracking-[0.18em] text-white">NFOOD</p>
          <p className="mt-0.5 text-[10px] font-bold tracking-wider text-orange-300">{copy.centralAdmin}</p>
        </div>
      </div>
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
          <Search className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <input
            value={navQuery}
            onChange={(event) => setNavQuery(event.target.value)}
            placeholder={copy.searchNav}
            className="w-full bg-transparent text-xs font-semibold text-white outline-none placeholder:text-slate-500"
          />
        </div>
      </div>
      <nav className="nfood-command-scroll mt-3 flex-1 space-y-1 overflow-y-auto px-4 pb-4">
        {filteredNav.map((key) => {
          const Icon = NAV_ICONS[key];
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                onNavigate(key);
                setMobileOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${isActive ? "bg-orange-500/15 text-orange-400" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-orange-400" : "text-slate-400"}`} />
              <span className="truncate">{NAV_LABELS[key][language === "ar" ? "ar" : "en"]}</span>
              {isActive && <span className="ms-auto h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />}
            </button>
          );
        })}
        {filteredNav.length === 0 && <p className="px-3 py-2 text-xs text-slate-500">لا نتائج</p>}
      </nav>
      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <HelpCircle className="h-4 w-4 text-orange-400" />
            {copy.help}
          </div>
          <p className="mt-1 text-[11px] leading-5 text-slate-400">{copy.helpBody}</p>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl px-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
            {(userName ?? "A").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">{userName ?? "Admin"}</p>
            <p className="truncate text-[10px] text-slate-400" dir="ltr">
              {userEmail ?? ""}
            </p>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title={copy.logout}
              aria-label={copy.logout}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const tabButton = (key: "orders" | "customers" | "purchases" | "nfc", label: string, icon: LucideIcon) => {
    const Icon = icon;
    const isActive = dashboardTab === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => setDashboardTab(key)}
        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${isActive ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25" : ""}`}
        style={isActive ? {} : { color: textSecondary }}
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    );
  };

  const renderOrders = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: divider, background: dark ? "#0b1f3a" : "#f8fafc" }}>
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={copy.searchOrders}
            className="min-w-0 flex-1 bg-transparent text-xs font-semibold outline-none placeholder:text-slate-400"
            style={{ color: textPrimary }}
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border p-1" style={{ borderColor: divider }}>
          {(["all", "review", "pending", "payment", "completed"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setOrderFilter(key)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${orderFilter === key ? "bg-orange-500 text-white" : ""}`}
              style={orderFilter === key ? {} : { color: textSecondary }}
            >
              {key === "all" ? (language === "ar" ? "الكل" : "All") : label(STATUS_META[key].label)}
            </button>
          ))}
        </div>
      </div>

      {orderRows.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl px-6 py-14 text-center" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <ShoppingBag className="h-9 w-9 text-slate-400" />
          <p className="mt-3 text-sm font-bold" style={{ color: textPrimary }}>
            {copy.noOrders}
          </p>
          <p className="mt-1 max-w-sm text-xs leading-6" style={{ color: textSecondary }}>
            {copy.ordersHint}
          </p>
        </div>
      ) : (
        <div className="nfood-command-scroll overflow-x-auto rounded-2xl" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <table className="w-full min-w-[760px] border-collapse text-right text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: divider }}>
                {[copy.orderId, copy.channel, copy.items, copy.total, copy.status, copy.time].map((heading) => (
                  <th key={heading} className="px-5 py-3 text-[11px] font-semibold" style={{ color: textSecondary }}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orderRows.map(({ order, status }) => (
                <tr key={order.id} className="border-b transition hover:bg-orange-500/5" style={{ borderColor: divider }}>
                  <td className="px-5 py-4">
                    <p className="font-bold" style={{ color: textPrimary }}>
                      {order.id}
                    </p>
                    <p className="mt-0.5 text-[10px]" style={{ color: textSecondary }}>
                      {order.time}
                    </p>
                  </td>
                  <td className="max-w-40 px-5 py-4">
                    <p className="truncate font-semibold" style={{ color: textPrimary }}>
                      {order.channel}
                    </p>
                    <p className="mt-0.5 truncate text-[11px]" style={{ color: textSecondary }}>
                      {order.table}
                    </p>
                  </td>
                  <td className="max-w-56 px-5 py-4">
                    <p className="truncate text-xs leading-6" style={{ color: textPrimary }}>
                      {order.items}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-bold" style={{ color: textPrimary }}>
                    {money(Number(order.total) || 0)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_META[status].badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[status].dot}`} />
                      {label(STATUS_META[status].label)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs" style={{ color: textSecondary }}>
                    {order.guestName ?? order.paymentMethod ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCustomers = (
    <div className="grid gap-3 md:grid-cols-2">
      {(customersQuery.data ?? []).slice(0, 8).map((customer) => (
        <div key={customer.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xs font-bold text-orange-500">
            {(customer.name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold" style={{ color: textPrimary }}>
              {customer.name}
            </p>
            <p className="truncate text-[11px]" style={{ color: textSecondary }} dir="ltr">
              {customer.email ?? "—"}
            </p>
            <p className="mt-0.5 text-[10px]" style={{ color: textSecondary }}>
              {new Date(customer.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : locale)}
            </p>
          </div>
        </div>
      ))}
      {(customersQuery.data ?? []).length === 0 && (
        <div className="col-span-full rounded-2xl px-6 py-12 text-center text-sm" style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: textSecondary }}>
          {copy.noCustomers}
        </div>
      )}
    </div>
  );

  const renderPurchases = (
    <div className="nfood-command-scroll overflow-x-auto rounded-2xl" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
      <table className="w-full min-w-[720px] border-collapse text-right text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: divider }}>
            {[copy.orderId, "Plan", copy.status, copy.total, copy.time].map((heading) => (
              <th key={heading} className="px-5 py-3 text-[11px] font-semibold" style={{ color: textSecondary }}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subscriptions.slice(0, 30).map((subscription) => (
            <tr key={subscription.id} className="border-b transition hover:bg-orange-500/5" style={{ borderColor: divider }}>
              <td className="px-5 py-4 font-bold" style={{ color: textPrimary }}>
                #{subscription.id}
              </td>
              <td className="px-5 py-4 font-semibold" style={{ color: textPrimary }}>
                {subscription.plan}
              </td>
              <td className="px-5 py-4">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                    subscription.status === "active"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                      : subscription.status === "trial"
                        ? "border-amber-200 bg-amber-50 text-amber-600"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  {subscription.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-5 py-4 font-bold" style={{ color: textPrimary }}>
                {money(Number(subscription.monthlyPrice ?? 0))}
              </td>
              <td className="px-5 py-4 text-xs" style={{ color: textSecondary }}>
                {new Date(subscription.startedAt).toLocaleDateString(language === "ar" ? "ar-EG" : locale)}
              </td>
            </tr>
          ))}
          {subscriptions.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: textSecondary }}>
                {copy.noTransactions}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderNfc = (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 rounded-2xl p-4" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <p className="text-[11px] font-semibold" style={{ color: textSecondary }}>
            {copy.mrr}
          </p>
          <p className="mt-1 text-lg font-black text-orange-500">{money(mrr)}</p>
        </div>
        <div className="flex-1 rounded-2xl p-4" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <p className="text-[11px] font-semibold" style={{ color: textSecondary }}>
            {copy.arr}
          </p>
          <p className="mt-1 text-lg font-black" style={{ color: textPrimary }}>
            {money(arr)}
          </p>
        </div>
        <div className="flex-1 rounded-2xl p-4" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <p className="text-[11px] font-semibold" style={{ color: textSecondary }}>
            {copy.churn}
          </p>
          <p className="mt-1 text-lg font-black" style={{ color: textPrimary }}>
            {churn.toFixed(1)}%
          </p>
        </div>
      </div>
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
        <p className="text-sm font-bold" style={{ color: textPrimary }}>
          {copy.nfcTitle}
        </p>
        <div className="mt-4 space-y-3">
          {Object.entries(byPlan).map(([plan, info]) => (
            <div key={plan} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-xs font-bold" style={{ color: textPrimary }}>
                {plan}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-orange-400 to-orange-600"
                  style={{ width: `${Math.min((Number(info.mrr) / Math.max(mrr, 1)) * 100, 100)}%` }}
                />
              </div>
              <span className="w-24 shrink-0 text-end text-[11px] font-semibold" style={{ color: textSecondary }}>
                {info.active} · {money(Number(info.mrr))}
              </span>
            </div>
          ))}
          {Object.keys(byPlan).length === 0 && (
            <p className="text-xs" style={{ color: textSecondary }}>
              {copy.noTransactions}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div dir={direction} lang={language} className="nfood-command-center h-dvh min-h-0 overflow-hidden" style={{ background: pageBg }}>
      <aside
        className={`fixed inset-y-0 z-40 hidden w-[272px] flex-col shadow-2xl lg:flex ${direction === "rtl" ? "right-0 border-l" : "left-0 border-r"} border-white/10`}
      >
        <div className="min-h-0 flex-1 bg-[#0b1d35]">{sidebarContent}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/60" />
          <aside
            className={`absolute inset-y-0 flex w-[280px] flex-col shadow-2xl ${direction === "rtl" ? "right-0" : "left-0"}`}
          >
            <div className="relative min-h-0 flex-1 bg-[#0b1d35]">
              {sidebarContent}
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
                className="absolute end-3 top-3 rounded-lg bg-white/10 p-1.5 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className={`flex h-dvh min-h-0 flex-col ${direction === "rtl" ? "lg:mr-[272px]" : "lg:ml-[272px]"}`}>
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-3 backdrop-blur-xl md:px-6" style={{ borderColor: divider, background: headerBg }}>
          <div className="flex min-w-0 items-center gap-3">
            {onOpenTransfers && pendingTransferCount > 0 && !transferBannerDismissed && (
              <button
                type="button"
                onClick={onOpenTransfers}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-orange-500 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-orange-500/25"
              >
                <Bell className="h-3.5 w-3.5" />
                {pendingTransferCount}
              </button>
            )}
            <button type="button" aria-label="Open navigation" onClick={() => setMobileOpen(true)} className="rounded-xl border p-2 lg:hidden" style={{ borderColor: divider, color: textPrimary }}>
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: textSecondary }}>
                {copy.centralAdmin}
              </p>
              <h1 className="truncate text-base font-black md:text-lg" style={{ color: textPrimary }}>
                {NAV_LABELS[active][language === "ar" ? "ar" : "en"]}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
            <div className="relative">
              <button
                type="button"
                aria-expanded={notificationsOpen}
                aria-label={copy.notifications}
                onClick={() => setNotificationsOpen((current) => !current)}
                className="relative rounded-xl border p-2.5 transition hover:bg-orange-500/10"
                style={{ borderColor: divider, color: textPrimary }}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -end-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 py-0.5 text-[9px] font-black text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute end-0 top-12 z-30 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border shadow-2xl" style={{ background: cardBg, borderColor: divider, color: textPrimary }}>
                  <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: divider }}>
                    <p className="text-xs font-black">{copy.notifications}</p>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => markAllRead.mutate()} className="text-[10px] font-semibold text-orange-500">
                        {copy.markAllRead}
                      </button>
                      {deleteAll.isPending ? null : (
                        <button type="button" onClick={() => deleteAll.mutate()} className="text-[10px] font-semibold text-slate-400">
                          {copy.deleteAll}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="nfood-command-scroll max-h-80 overflow-y-auto">
                    {notifications.slice(0, 8).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (!item.readAt) markRead.mutate({ notificationId: item.id });
                        }}
                        className="block w-full border-b px-4 py-3 text-start transition hover:bg-orange-500/5"
                        style={{ borderColor: divider }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-bold" style={{ color: textPrimary }}>
                            {item.title}
                          </p>
                          {!item.readAt && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />}
                        </div>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-5" style={{ color: textSecondary }}>
                          {item.body}
                        </p>
                      </button>
                    ))}
                    {notifications.length === 0 && (
                      <div className="px-4 py-10 text-center text-xs" style={{ color: textSecondary }}>
                        <Bell className="mx-auto h-6 w-6 opacity-40" />
                        <p className="mt-2">{copy.noNotifications}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label={dark ? "Light mode" : "Dark mode"}
              onClick={() => toggleTheme?.()}
              className="rounded-xl border p-2.5 transition hover:bg-orange-500/10"
              style={{ borderColor: divider, color: textPrimary }}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <LanguageSwitcher compact />

            <div className="relative">
              <button
                type="button"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((current) => !current)}
                className="flex items-center gap-2 rounded-xl border p-1.5 transition hover:bg-orange-500/10"
                style={{ borderColor: divider }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-xs font-black text-white">
                  {(userName ?? "A").charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-28 truncate text-xs font-bold sm:block" style={{ color: textPrimary }}>
                  {userName ?? "Admin"}
                </span>
              </button>
              {profileOpen && (
                <div className="absolute end-0 top-12 z-30 w-60 overflow-hidden rounded-2xl border shadow-2xl" style={{ background: cardBg, borderColor: divider, color: textPrimary }}>
                  <div className="border-b px-4 py-3" style={{ borderColor: divider }}>
                    <p className="text-xs font-black">{copy.adminAccount}</p>
                    <p className="mt-0.5 truncate text-[11px]" style={{ color: textSecondary }} dir="ltr">
                      {userEmail ?? ""}
                    </p>
                  </div>
                  {onLogout && (
                    <button type="button" onClick={onLogout} className="flex w-full items-center gap-2 px-4 py-3 text-xs font-bold text-red-500 transition hover:bg-red-500/5">
                      <LogOut className="h-4 w-4" />
                      {copy.logout}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="nfood-command-scroll min-h-0 flex-1 overflow-y-auto p-3 md:p-6">
          {pendingTransferCount > 0 && !transferBannerDismissed && onOpenTransfers && (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200">
              <ShoppingBag className="h-4 w-4" />
              <p className="flex-1 font-bold">
                {language === "ar" ? `${pendingTransferCount} إيصالات تحويل بانتظار المراجعة` : `${pendingTransferCount} transfer receipts awaiting review`}
              </p>
              <button type="button" onClick={onOpenTransfers} className="rounded-lg bg-orange-500 px-3 py-1.5 font-bold text-white">
                {language === "ar" ? "مراجعة" : "Review"}
              </button>
              {onDismissTransfers && (
                <button type="button" onClick={onDismissTransfers} aria-label={language === "ar" ? "إغلاق" : "Close"} style={{ color: textSecondary }}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {active === "overview" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                {cards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="rounded-2xl p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.tone}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: textSecondary }}>
                          {card.label}
                        </span>
                      </div>
                      <p className="mt-3 truncate text-lg font-black" style={{ color: textPrimary }}>
                        {card.value}
                      </p>
                      <div className="mt-2">
                        <Sparkline points={card.spark} stroke={card.stroke} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl shadow-sm" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 md:px-6" style={{ borderColor: divider }}>
                  <div>
                    <h2 className="text-sm font-black md:text-base" style={{ color: textPrimary }}>
                      {copy.ordersTitle}
                    </h2>
                    <p className="mt-0.5 text-[11px]" style={{ color: textSecondary }}>
                      {copy.ordersOverline}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 rounded-xl border p-1" style={{ borderColor: divider }}>
                    {tabButton("orders", copy.tabOrders, ShoppingBag)}
                    {tabButton("customers", copy.tabCustomers, Users)}
                    {tabButton("purchases", copy.tabPurchases, WalletCards)}
                    {tabButton("nfc", copy.tabNfc, TrendingUp)}
                  </div>
                </div>
                <div className="p-4 md:p-6">
                  {dashboardTab === "orders" && renderOrders}
                  {dashboardTab === "customers" && renderCustomers}
                  {dashboardTab === "purchases" && renderPurchases}
                  {dashboardTab === "nfc" && renderNfc}
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl p-5 shadow-sm" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black" style={{ color: textPrimary }}>
                        {copy.salesTitle}
                      </h3>
                      <p className="mt-0.5 text-[11px]" style={{ color: textSecondary }}>
                        {copy.salesSubtitle}
                      </p>
                    </div>
                    <span className="rounded-full bg-orange-500/10 px-3 py-1.5 text-[11px] font-bold text-orange-500">
                      {money(totalSales)}
                    </span>
                  </div>
                  <div className="mt-4">
                    <MiniBars points={salesSpark} stroke="#f97316" />
                  </div>
                </div>
                <div className="rounded-2xl p-5 shadow-sm" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black" style={{ color: textPrimary }}>
                        {copy.ordersChartTitle}
                      </h3>
                      <p className="mt-0.5 text-[11px]" style={{ color: textSecondary }}>
                        {copy.ordersOverline}
                      </p>
                    </div>
                    <span className="rounded-full bg-sky-500/10 px-3 py-1.5 text-[11px] font-bold text-sky-500">
                      {todayOrders.toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="mt-4">
                    <MiniBars points={ordersSpark} stroke="#0ea5e9" />
                  </div>
                </div>
              </div>

              {overviewChildren && (
                <section className="space-y-3" aria-label={copy.managementTitle}>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black md:text-base" style={{ color: textPrimary }}>
                        {copy.managementTitle}
                      </h2>
                      <p className="text-[11px]" style={{ color: textSecondary }}>
                        {copy.managementSubtitle}
                      </p>
                    </div>
                  </div>
                  {overviewChildren}
                </section>
              )}
            </div>
          ) : (
            children ?? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl px-6 text-center" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <CheckCircle2 className="h-8 w-8 text-orange-500" />
                <p className="mt-3 text-sm font-bold" style={{ color: textPrimary }}>
                  {NAV_LABELS[active][language === "ar" ? "ar" : "en"]}
                </p>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}