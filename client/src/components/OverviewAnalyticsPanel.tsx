import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpLeft, ArrowUpRight, BarChart3, CircleDollarSign, Clock3, Download, FileSpreadsheet, FileText, Loader2, ShoppingBag, Store, Table2, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import type { Order } from "@/components/homeNavigation";
import { useLanguage } from "@/contexts/LanguageContext";

type RangeKey = "hour" | "day" | "week" | "month" | "year";
type AnalyticsOrder = { id?: string | number; channel?: string; time?: string; createdAt?: string | Date | null; status: Order["status"] | "cancelled"; total: number; paymentMethod?: string | null; currencyCode?: string | null; itemDetails?: { itemName: string; quantity: number; categoryName?: string | null }[] };
type RangeOption = { key: RangeKey; label: string };
type Bucket = { date: Date; label: string; sales: number; orders: number };
type Copy = (typeof COPY)[keyof typeof COPY];
type TooltipEntry = { name?: string; value?: number | string; color?: string };

const RANGE_OPTIONS: RangeOption[] = [
  { key: "hour", label: "" },
  { key: "day", label: "" },
  { key: "week", label: "" },
  { key: "month", label: "" },
  { key: "year", label: "" },
];

const COPY = {
  ar: { analytics: "مركز التحليلات", overview: "النظرة العامة", subtitle: "بيانات الطلبات الفعلية ضمن النطاق المحدد، بأرقام إنجليزية صحيحة.", ranges: { hour: "الساعة", day: "اليوم", week: "الأسبوع", month: "الشهر", year: "السنة" }, revenue: "الإيرادات", totalOrders: "إجمالي الطلبات", averageOrder: "متوسط الطلب", activeTables: "الطاولات النشطة", activeRestaurants: "المطاعم النشطة", bestBranch: "الفرع الأفضل", currentBranch: "الفرع الحالي", allBranches: "كل الفروع", selectedScope: "النطاق المحدد", centralScope: "النطاق المركزي", direct: "بيانات مباشرة", noData: "لا توجد بيانات", checking: "جارٍ التحقق", order: "طلب", orders: "الطلبات", revenueAndOrders: "الإيرادات والطلبات", timeDistribution: "توزيع زمني حقيقي حسب الفترة المختارة", orderVolume: "حجم الطلبات", peakPeriods: "تحديد ساعات وفترات الذروة", viewOrders: "عرض الطلبات", categories: "توزيع الأصناف حسب الفئة", categoriesHint: "يُعرض عند توفر فئات محفوظة في بنود الطلبات.", payments: "طرق الدفع", paymentsHint: "توزيع الطلبات حسب طريقة الدفع المحفوظة.", recentOrders: "آخر الطلبات", recentOrdersHint: "العرض المختصر من نفس بيانات التشغيل.", openOrders: "فتح الطلبات", noSales: "لا توجد مبيعات أو طلبات ضمن الفترة المختارة بعد.", noPeak: "لا توجد طلبات كافية لرسم ساعات الذروة.", noCategories: "لا تتوفر فئات فعلية في بنود الطلبات الحالية.", noPayments: "لا تتوفر طرق دفع محفوظة ضمن الطلبات الحالية.", noOrders: "لا توجد طلبات محفوظة للعرض.", uncategorized: "غير مصنف", status: { new: "جديد", preparing: "قيد التحضير", ready: "جاهز", completed: "مكتمل", cancelled: "ملغى" }, payment: { card: "بطاقة", bank_transfer: "تحويل بنكي", online: "دفع إلكتروني", other: "أخرى", cash: "نقدي" }, summaryError: "تعذر تحميل ملخص الدور، لكن بقية رسوم الطلبات ما زالت متاحة.", comparison: "مقارنة بالفترة السابقة", comparisonHint: "مقارنة فعلية مع الفترة السابقة من نفس الطول", growth: "النمو", decline: "انخفاض", noBaseline: "بداية جديدة", noComparison: "لا توجد مقارنة", unchanged: "بدون تغيير", loading: "جارٍ تحديث الرسوم", exportExcel: "تصدير Excel", exportPdf: "تصدير PDF", exporting: "جارٍ التصدير", exportDone: "تم إنشاء التقرير بنجاح", exportFailed: "تعذر إنشاء التقرير، حاول مرة أخرى", exportRows: "صفوف التقرير", period: "الفترة", previousRevenue: "إيرادات الفترة السابقة", previousOrders: "طلبات الفترة السابقة", current: "الحالي", previous: "السابق", categoriesSheet: "الفئات", paymentsSheet: "طرق الدفع", channel: "القناة", date: "التاريخ", total: "الإجمالي", statusLabel: "الحالة", newPeriod: "جديد" },
  en: { analytics: "Analytics Center", overview: "Overview", subtitle: "Real order data for the selected range, with English digits.", ranges: { hour: "Hour", day: "Today", week: "Week", month: "Month", year: "Year" }, revenue: "Revenue", totalOrders: "Total orders", averageOrder: "Average order", activeTables: "Active tables", activeRestaurants: "Active restaurants", bestBranch: "Top branch", currentBranch: "Current branch", allBranches: "All branches", selectedScope: "Selected scope", centralScope: "Central scope", direct: "Live data", noData: "No data", checking: "Checking", order: "order", orders: "Orders", revenueAndOrders: "Revenue & orders", timeDistribution: "Real time distribution for the selected range", orderVolume: "Order volume", peakPeriods: "Peak-hour distribution", viewOrders: "View orders", categories: "Items by category", categoriesHint: "Shown when saved categories exist in order items.", payments: "Payment methods", paymentsHint: "Order distribution by the saved payment method.", recentOrders: "Recent orders", recentOrdersHint: "A compact view of the same operational data.", openOrders: "Open orders", noSales: "No sales or orders in the selected range yet.", noPeak: "Not enough orders to draw peak hours.", noCategories: "No saved item categories are available yet.", noPayments: "No saved payment methods are available yet.", noOrders: "No saved orders to display.", uncategorized: "Uncategorized", status: { new: "New", preparing: "Preparing", ready: "Ready", completed: "Completed", cancelled: "Cancelled" }, payment: { card: "Card", bank_transfer: "Bank transfer", online: "Online", other: "Other", cash: "Cash" }, summaryError: "The role summary is unavailable, but the remaining order charts are still available.", comparison: "Previous-period comparison", comparisonHint: "Actual comparison with the previous period of the same length", growth: "Growth", decline: "Decline", noBaseline: "New baseline", noComparison: "No comparison", unchanged: "No change", loading: "Updating charts", exportExcel: "Export Excel", exportPdf: "Export PDF", exporting: "Exporting", exportDone: "Report created successfully", exportFailed: "Unable to create the report. Try again.", exportRows: "Report rows", period: "Period", previousRevenue: "Previous revenue", previousOrders: "Previous orders", current: "Current", previous: "Previous", categoriesSheet: "Categories", paymentsSheet: "Payment methods", channel: "Channel", date: "Date", total: "Total", statusLabel: "Status", newPeriod: "New" },
} as const;

const CHART_COLORS = ["#e76f3c", "#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
const integerFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function integer(value: number) { return integerFormatter.format(Math.round(Number.isFinite(value) ? value : 0)); }
function money(value: number, currency = "SAR") { return `${integer(value)} ${currency}`; }
function dateOf(value?: string | Date | null) { if (!value) return null; const date = value instanceof Date ? value : new Date(value); return Number.isFinite(date.getTime()) ? date : null; }
function startOfBucket(date: Date, range: RangeKey) {
  const next = new Date(date);
  if (range === "hour") next.setMinutes(0, 0, 0);
  if (range === "day") next.setHours(0, 0, 0, 0);
  if (range === "week") { next.setHours(0, 0, 0, 0); next.setDate(next.getDate() - next.getDay()); }
  if (range === "month") { next.setHours(0, 0, 0, 0); next.setDate(1); }
  if (range === "year") { next.setHours(0, 0, 0, 0); next.setMonth(0, 1); }
  return next;
}
function shiftBucket(date: Date, range: RangeKey, amount: number) {
  const next = new Date(date);
  if (range === "hour") next.setHours(next.getHours() + amount);
  if (range === "day") next.setDate(next.getDate() + amount);
  if (range === "week") next.setDate(next.getDate() + amount * 7);
  if (range === "month") next.setMonth(next.getMonth() + amount);
  if (range === "year") next.setFullYear(next.getFullYear() + amount);
  return next;
}
function bucketCount(range: RangeKey) { return range === "hour" ? 24 : range === "day" ? 7 : range === "week" ? 8 : range === "month" ? 12 : 5; }
function bucketLabel(date: Date, range: RangeKey) {
  if (range === "hour") return date.toLocaleTimeString("en-US", { hour: "2-digit", hour12: false });
  if (range === "year") return date.toLocaleDateString("en-US", { year: "numeric" });
  return date.toLocaleDateString("en-US", { month: "short", day: range === "week" ? undefined : "numeric" });
}
function sameBucket(a: Date, b: Date, range: RangeKey) { return startOfBucket(a, range).getTime() === startOfBucket(b, range).getTime(); }
function buildBucketsEnding(orders: AnalyticsOrder[], range: RangeKey, end: Date): Bucket[] {
  const count = bucketCount(range);
  const buckets: Bucket[] = Array.from({ length: count }, (_, index) => {
    const date = shiftBucket(end, range, index - count + 1);
    return { date, label: bucketLabel(date, range), sales: 0, orders: 0 };
  });
  for (const order of orders) {
    const createdAt = dateOf(order.createdAt);
    if (!createdAt || order.status === "cancelled") continue;
    const bucket = buckets.find((item) => sameBucket(item.date, createdAt, range));
    if (bucket) { bucket.sales += Number(order.total || 0); bucket.orders += 1; }
  }
  return buckets;
}
export function buildBuckets(orders: AnalyticsOrder[], range: RangeKey) { return buildBucketsEnding(orders, range, startOfBucket(new Date(), range)); }
export function buildPreviousBuckets(orders: AnalyticsOrder[], range: RangeKey, reference = new Date()) { const currentEnd = startOfBucket(reference, range); return buildBucketsEnding(orders, range, shiftBucket(currentEnd, range, -bucketCount(range))); }
export function calculateGrowthPercent(current: number, previous: number) { if (!Number.isFinite(previous) || previous === 0) return null; return Math.round(((current - previous) / previous) * 100); }
export function comparisonSummary(currentRevenue: number, previousRevenue: number, currentOrders: number, previousOrders: number) { const currentAverage = currentOrders ? currentRevenue / currentOrders : 0; const previousAverage = previousOrders ? previousRevenue / previousOrders : 0; return { revenueGrowth: calculateGrowthPercent(currentRevenue, previousRevenue), orderGrowth: calculateGrowthPercent(currentOrders, previousOrders), averageGrowth: calculateGrowthPercent(currentAverage, previousAverage) }; }

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${28 - (value / max) * 24}`).join(" ");
  return <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-20" aria-hidden="true"><polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function MetricCard({ label, value, change, icon: Icon, color, spark }: { label: string; value: string; change: string; icon: typeof CircleDollarSign; color: string; spark: number[] }) {
  return <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700/80 dark:bg-slate-900/90"><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18`, color }}><Icon className="h-5 w-5" /></div><Badge variant="outline" className="rounded-full border-slate-200 px-2 py-1 text-[10px] text-slate-500">{change}</Badge></div><p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-300">{label}</p><div className="mt-1 flex items-end justify-between gap-2"><p className="text-xl font-black tracking-tight text-slate-950 dark:text-white">{value}</p><MiniSparkline values={spark} color={color} /></div></CardContent></Card>;
}
function EmptyChart({ label }: { label: string }) { return <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-center text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/40">{label}</div>; }
function InteractiveTooltip({ active, payload, label, currency, copy }: { active?: boolean; payload?: TooltipEntry[]; label?: string; currency: string; copy: Copy }) {
  if (!active || !payload?.length) return null;
  return <div className="min-w-44 rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"><p className="mb-2 border-b border-slate-100 pb-2 font-bold text-slate-900 dark:border-slate-800 dark:text-white">{label}</p>{payload.map((entry, index) => <div key={`${entry.name ?? "value"}-${index}`} className="flex items-center justify-between gap-4 py-1"><span className="flex items-center gap-2 text-slate-500 dark:text-slate-300"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color ?? CHART_COLORS[index] }} />{entry.name}</span><strong className="text-slate-900 dark:text-white">{entry.name === copy.revenue ? money(Number(entry.value ?? 0), currency) : integer(Number(entry.value ?? 0))}</strong></div>)}</div>;
}

export function OverviewAnalyticsPanel({ restaurantId, orders, summary, summaryLoading, summaryError, onNavigate, isCentralAdmin = false }: { restaurantId: number; orders: Order[]; summary?: { available: boolean; sales: number; orders: number; average: number; avgFulfillmentMinutes: number; newOrders: number; preparing: number; ready: number; completed: number; tables: number }; summaryLoading: boolean; summaryError: boolean; onNavigate: (key: "orders" | "pos" | "tables" | "branches") => void; isCentralAdmin?: boolean }) {
  const [range, setRange] = useState<RangeKey>("day");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reportRootRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const copy = language === "ar" ? COPY.ar : COPY.en;
  const direction = language === "ar" ? "rtl" : "ltr";
  const rangeOptions = RANGE_OPTIONS.map((option) => ({ ...option, label: copy.ranges[option.key] }));
  const platformSummary = trpc.admin.platformSummary.useQuery(undefined, { enabled: isCentralAdmin, retry: false });
  const analyticsOrders = useMemo<AnalyticsOrder[]>(() => isCentralAdmin ? (platformSummary.data?.orderSeries ?? []).map((row) => ({ total: Number(row.total ?? 0), status: row.status, createdAt: row.createdAt, paymentMethod: row.paymentMethod, currencyCode: row.currencyCode })) : orders, [isCentralAdmin, orders, platformSummary.data?.orderSeries]);
  const buckets = useMemo(() => buildBuckets(analyticsOrders, range), [analyticsOrders, range]);
  const previousBuckets = useMemo(() => buildPreviousBuckets(analyticsOrders, range), [analyticsOrders, range]);
  const currentStart = buckets[0]?.date;
  const currentEnd = buckets.length ? shiftBucket(buckets[buckets.length - 1].date, range, 1) : new Date();
  const selectedOrders = useMemo(() => analyticsOrders.filter((order) => { const createdAt = dateOf(order.createdAt); return createdAt && currentStart && createdAt >= currentStart && createdAt < currentEnd && order.status !== "cancelled"; }), [analyticsOrders, currentEnd, currentStart]);
  const totalRevenue = buckets.reduce((sum, bucket) => sum + bucket.sales, 0);
  const totalOrders = buckets.reduce((sum, bucket) => sum + bucket.orders, 0);
  const previousRevenue = previousBuckets.reduce((sum, bucket) => sum + bucket.sales, 0);
  const previousOrders = previousBuckets.reduce((sum, bucket) => sum + bucket.orders, 0);
  const previousAverage = previousOrders ? previousRevenue / previousOrders : 0;
  const averageOrder = totalOrders ? totalRevenue / totalOrders : 0;
  const currency = analyticsOrders.find((order) => order.currencyCode)?.currencyCode ?? "SAR";
  const salesValues = buckets.map((bucket) => bucket.sales);
  const orderValues = buckets.map((bucket) => bucket.orders);
  const { revenueGrowth, orderGrowth, averageGrowth } = comparisonSummary(totalRevenue, previousRevenue, totalOrders, previousOrders);
  const growthText = (current: number, previous: number, percent: number | null) => percent === null ? (current > 0 ? copy.noBaseline : copy.noComparison) : `${percent > 0 ? "+" : ""}${percent}%`;
  const growthTone = (percent: number | null) => percent === null ? "text-slate-500" : percent > 0 ? "text-emerald-600" : percent < 0 ? "text-rose-600" : "text-slate-500";
  const categoryData = useMemo(() => { const values = new Map<string, number>(); for (const order of selectedOrders) for (const item of order.itemDetails ?? []) { const name = item.categoryName?.trim() || copy.uncategorized; values.set(name, (values.get(name) ?? 0) + Number(item.quantity || 0)); } return Array.from(values.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value })); }, [copy.uncategorized, selectedOrders]);
  const paymentData = useMemo(() => { const values = new Map<string, number>(); for (const order of selectedOrders) { const key = order.paymentMethod === "card" ? copy.payment.card : order.paymentMethod === "bank_transfer" ? copy.payment.bank_transfer : order.paymentMethod === "online" ? copy.payment.online : order.paymentMethod === "other" ? copy.payment.other : copy.payment.cash; values.set(key, (values.get(key) ?? 0) + 1); } return Array.from(values.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value })); }, [copy.payment.bank_transfer, copy.payment.card, copy.payment.cash, copy.payment.online, copy.payment.other, selectedOrders]);
  const kpiData = [
    { label: copy.revenue, value: money(totalRevenue, currency), change: growthText(totalRevenue, previousRevenue, revenueGrowth), icon: CircleDollarSign, color: "#e76f3c", spark: salesValues },
    { label: copy.totalOrders, value: integer(totalOrders), change: growthText(totalOrders, previousOrders, orderGrowth), icon: ShoppingBag, color: "#0ea5e9", spark: orderValues },
    { label: copy.averageOrder, value: money(averageOrder, currency), change: growthText(averageOrder, previousAverage, averageGrowth), icon: WalletCards, color: "#8b5cf6", spark: salesValues.map((value, index) => orderValues[index] ? value / orderValues[index] : 0) },
    { label: isCentralAdmin ? copy.activeRestaurants : copy.activeTables, value: integer(isCentralAdmin ? (platformSummary.data?.restaurants.active ?? 0) : (summary?.tables ?? 0)), change: summaryLoading && !isCentralAdmin ? copy.checking : isCentralAdmin ? copy.centralScope : copy.currentBranch, icon: isCentralAdmin ? Store : Table2, color: "#10b981", spark: orderValues.map(() => summary?.tables ?? 0) },
    { label: copy.bestBranch, value: isCentralAdmin ? copy.allBranches : copy.currentBranch, change: copy.selectedScope, icon: Store, color: "#f59e0b", spark: orderValues },
  ];
  const chartTooltip = { content: <InteractiveTooltip currency={currency} copy={copy} />, cursor: { stroke: "#e76f3c", strokeDasharray: "4 4", strokeOpacity: 0.35 }, wrapperStyle: { outline: "none" } };
  const statusLabel = (status: string) => copy.status[status as keyof typeof copy.status] ?? status;

  useEffect(() => () => { if (transitionTimer.current) clearTimeout(transitionTimer.current); }, []);

  const handleRangeChange = (next: RangeKey) => {
    if (next === range) return;
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    setIsTransitioning(true);
    setRange(next);
    transitionTimer.current = setTimeout(() => setIsTransitioning(false), 260);
  };

  const handleExportExcel = async () => {
    setExporting("excel");
    try {
      const XLSX = await import("xlsx");
      const rows = buckets.map((bucket, index) => ({ [copy.period]: bucket.label, [copy.current]: Math.round(bucket.sales), [copy.previous]: Math.round(previousBuckets[index]?.sales ?? 0), [copy.orders]: bucket.orders, [copy.previousOrders]: previousBuckets[index]?.orders ?? 0 }));
      const summaryRows = [{ metric: copy.revenue, current: Math.round(totalRevenue), previous: Math.round(previousRevenue), growth: growthText(totalRevenue, previousRevenue, revenueGrowth) }, { metric: copy.totalOrders, current: totalOrders, previous: previousOrders, growth: growthText(totalOrders, previousOrders, orderGrowth) }, { metric: copy.averageOrder, current: Math.round(averageOrder), previous: Math.round(previousAverage), growth: growthText(averageOrder, previousAverage, averageGrowth) }];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryRows), "Summary");
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Timeline");
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(categoryData.map((item) => ({ category: item.name, quantity: item.value }))), copy.categoriesSheet);
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(paymentData.map((item) => ({ method: item.name, orders: item.value }))), copy.paymentsSheet);
      XLSX.writeFile(workbook, `nfood-overview-${restaurantId}-${range}-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success(copy.exportDone);
    } catch { toast.error(copy.exportFailed); } finally { setExporting(null); }
  };

  const handleExportPdf = async () => {
    if (!reportRootRef.current) return;
    setExporting("pdf");
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const canvas = await html2canvas(reportRootRef.current, { backgroundColor: "#ffffff", scale: Math.min(2, window.devicePixelRatio || 1), useCORS: true, logging: false });
      const pdf = new jsPDF({ orientation: canvas.width > canvas.height ? "landscape" : "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      const image = canvas.toDataURL("image/png");
      for (let offset = 0; offset < imageHeight; offset += pageHeight) { if (offset > 0) pdf.addPage(); pdf.addImage(image, "PNG", 0, -offset, pageWidth, imageHeight); }
      pdf.save(`nfood-overview-${restaurantId}-${range}-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success(copy.exportDone);
    } catch { toast.error(copy.exportFailed); } finally { setExporting(null); }
  };

  return <div ref={reportRootRef} dir={direction} className="space-y-3" data-testid="overview-analytics-panel" aria-busy={isTransitioning}>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90"><div><p className="text-xs font-bold text-[#e76f3c]">{copy.analytics}</p><h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">{copy.overview}</h2><p className="mt-1 text-[11px] text-slate-500">{copy.subtitle}</p></div><div className="flex flex-wrap items-center justify-end gap-2"><div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="tablist" aria-label={copy.ranges.day}>{rangeOptions.map((option) => <button key={option.key} type="button" role="tab" aria-selected={range === option.key} onClick={() => handleRangeChange(option.key)} className={`rounded-lg px-3 py-2 text-[11px] font-bold transition-all duration-200 ${range === option.key ? "bg-white text-[#c75325] shadow-sm dark:bg-slate-700 dark:text-orange-200" : "text-slate-500 hover:text-slate-800 dark:text-slate-300"}`}>{option.label}</button>)}</div><Button variant="outline" size="sm" className="rounded-lg text-[11px]" onClick={handleExportExcel} disabled={!!exporting}><FileSpreadsheet className="ml-1 h-3.5 w-3.5 text-emerald-600" />{exporting === "excel" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : copy.exportExcel}</Button><Button variant="outline" size="sm" className="rounded-lg text-[11px]" onClick={handleExportPdf} disabled={!!exporting}><FileText className="ml-1 h-3.5 w-3.5 text-rose-600" />{exporting === "pdf" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : copy.exportPdf}</Button></div></div>
    {summaryError && !isCentralAdmin && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">{copy.summaryError}</div>}
    <div className={`relative space-y-3 transition-opacity duration-200 ${isTransitioning ? "opacity-60" : "opacity-100"}`}>
      {isTransitioning && <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center"><div className="flex items-center gap-2 rounded-full border border-orange-200 bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#c75325] shadow-sm dark:border-orange-900/60 dark:bg-slate-900/95"><Loader2 className="h-3.5 w-3.5 animate-spin" />{copy.loading}</div></div>}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{kpiData.map((item) => <MetricCard key={item.label} {...item} />)}</div>
      <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90"><CardContent className="flex flex-wrap items-center justify-between gap-3 p-3"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#e76f3c] dark:bg-orange-950/40"><TrendingUp className="h-4 w-4" /></div><div><p className="text-xs font-bold text-slate-900 dark:text-white">{copy.comparison}</p><p className="text-[10px] text-slate-500">{copy.comparisonHint}</p></div></div><div className="flex flex-wrap items-center gap-2 text-[11px]"><span className={`inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1.5 font-bold dark:bg-slate-800 ${growthTone(revenueGrowth)}`}>{revenueGrowth !== null && revenueGrowth < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}{copy.revenue}: {growthText(totalRevenue, previousRevenue, revenueGrowth)}</span><span className={`inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1.5 font-bold dark:bg-slate-800 ${growthTone(orderGrowth)}`}>{orderGrowth !== null && orderGrowth < 0 ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}{copy.orders}: {growthText(totalOrders, previousOrders, orderGrowth)}</span><span className="rounded-full bg-slate-50 px-2.5 py-1.5 font-bold text-slate-500 dark:bg-slate-800">{copy.current}: {money(totalRevenue, currency)} · {copy.previous}: {money(previousRevenue, currency)}</span></div></CardContent></Card>
      <div className="grid gap-3 xl:grid-cols-[1.55fr_1fr]">
        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90"><CardHeader className="flex-row items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800"><div><CardTitle className="flex items-center gap-2 text-sm"><BarChart3 className="h-4 w-4 text-[#e76f3c]" />{copy.revenueAndOrders}</CardTitle><p className="mt-1 text-[10px] text-slate-500">{copy.timeDistribution}</p></div><Badge variant="outline" className="rounded-full text-[10px]">{integer(totalOrders)} {copy.order}</Badge></CardHeader><CardContent className="p-3">{buckets.some((bucket) => bucket.sales || bucket.orders) ? <ResponsiveContainer width="100%" height={220}><AreaChart data={buckets}><defs><linearGradient id="overviewSalesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e76f3c" stopOpacity={0.28} /><stop offset="95%" stopColor="#e76f3c" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} /><YAxis yAxisId="sales" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(value) => integer(Number(value))} /><YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(value) => integer(Number(value))} /><Tooltip {...chartTooltip} /><Area yAxisId="sales" type="monotone" dataKey="sales" stroke="#e76f3c" fill="url(#overviewSalesFill)" strokeWidth={2.5} name={copy.revenue} animationDuration={260} /><Area yAxisId="orders" type="monotone" dataKey="orders" stroke="#0ea5e9" fill="none" strokeWidth={2} name={copy.orders} animationDuration={260} /></AreaChart></ResponsiveContainer> : <EmptyChart label={copy.noSales} />}</CardContent></Card>
        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90"><CardHeader className="flex-row items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800"><div><CardTitle className="flex items-center gap-2 text-sm"><Clock3 className="h-4 w-4 text-[#0ea5e9]" />{copy.orderVolume}</CardTitle><p className="mt-1 text-[10px] text-slate-500">{copy.peakPeriods}</p></div><Button variant="ghost" size="sm" className="text-[11px] text-[#e76f3c]" onClick={() => onNavigate("orders")}>{copy.viewOrders} <ArrowUpLeft className="mr-1 h-3 w-3" /></Button></CardHeader><CardContent className="p-3">{buckets.some((bucket) => bucket.orders) ? <ResponsiveContainer width="100%" height={220}><BarChart data={buckets}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} /><YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} allowDecimals={false} tickFormatter={(value) => integer(Number(value))} /><Tooltip {...chartTooltip} /><Bar dataKey="orders" name={copy.orders} fill="#0ea5e9" radius={[5, 5, 0, 0]} animationDuration={260} /></BarChart></ResponsiveContainer> : <EmptyChart label={copy.noPeak} />}</CardContent></Card>
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90"><CardHeader className="px-4 py-3"><CardTitle className="text-sm">{copy.categories}</CardTitle><p className="mt-1 text-[10px] text-slate-500">{copy.categoriesHint}</p></CardHeader><CardContent className="p-3">{categoryData.length ? <div className="flex items-center gap-3"><ResponsiveContainer width="52%" height={190}><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={76} paddingAngle={3}>{categoryData.map((item, index) => <Cell key={item.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}</Pie><Tooltip {...chartTooltip} /></PieChart></ResponsiveContainer><div className="min-w-0 flex-1 space-y-2">{categoryData.map((item, index) => <div key={item.name} className="flex items-center justify-between gap-2 text-xs"><span className="flex min-w-0 items-center gap-2 truncate"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />{item.name}</span><strong className="shrink-0 text-slate-800 dark:text-slate-100">{integer(item.value)}</strong></div>)}</div></div> : <EmptyChart label={copy.noCategories} />}</CardContent></Card>
        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90"><CardHeader className="px-4 py-3"><CardTitle className="text-sm">{copy.payments}</CardTitle><p className="mt-1 text-[10px] text-slate-500">{copy.paymentsHint}</p></CardHeader><CardContent className="p-3">{paymentData.length ? <div className="flex items-center gap-3"><ResponsiveContainer width="52%" height={190}><PieChart><Pie data={paymentData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={76} paddingAngle={3}>{paymentData.map((item, index) => <Cell key={item.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}</Pie><Tooltip {...chartTooltip} /></PieChart></ResponsiveContainer><div className="min-w-0 flex-1 space-y-2">{paymentData.map((item, index) => <div key={item.name} className="flex items-center justify-between gap-2 text-xs"><span className="flex min-w-0 items-center gap-2 truncate"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />{item.name}</span><strong className="shrink-0 text-slate-800 dark:text-slate-100">{integer(item.value)}</strong></div>)}</div></div> : <EmptyChart label={copy.noPayments} />}</CardContent></Card>
      </div>
      <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90"><CardHeader className="flex-row items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800"><div><CardTitle className="text-sm">{copy.recentOrders}</CardTitle><p className="mt-1 text-[10px] text-slate-500">{copy.recentOrdersHint}</p></div><Button variant="outline" size="sm" className="rounded-lg text-[11px]" onClick={() => onNavigate("orders")}>{copy.openOrders} <ArrowUpLeft className="mr-1 h-3 w-3" /></Button></CardHeader><CardContent className="overflow-x-auto p-0"><table className="w-full min-w-[620px] text-right text-xs"><thead className="bg-slate-50/70 text-[10px] text-slate-500 dark:bg-slate-800/60"><tr><th className="px-4 py-2.5 font-medium">{copy.totalOrders}</th><th className="px-4 py-2.5 font-medium">{copy.channel}</th><th className="px-4 py-2.5 font-medium">{copy.date}</th><th className="px-4 py-2.5 font-medium">{copy.total}</th><th className="px-4 py-2.5 font-medium">{copy.statusLabel}</th></tr></thead><tbody>{selectedOrders.slice(0, 5).map((order) => <tr key={order.id} className="border-t border-slate-100 dark:border-slate-800"><td className="px-4 py-2.5 font-bold">{order.id ?? "—"}</td><td className="px-4 py-2.5 text-slate-500">{order.channel ?? "—"}</td><td className="px-4 py-2.5 text-slate-500">{order.time ?? (dateOf(order.createdAt)?.toLocaleDateString("en-US") ?? "—")}</td><td className="px-4 py-2.5 font-bold">{money(order.total, order.currencyCode ?? currency)}</td><td className="px-4 py-2.5"><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600">{statusLabel(order.status)}</span></td></tr>)}</tbody></table>{!selectedOrders.length && <div className="p-8"><EmptyChart label={copy.noOrders} /></div>}</CardContent></Card>
    </div>
  </div>;
}
