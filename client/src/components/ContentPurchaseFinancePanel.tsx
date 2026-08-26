import { BarChart3, CircleDollarSign, LockKeyhole, WalletCards } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export function ContentPurchaseFinancePanel() {
  const report = trpc.admin.contentPurchaseFinanceSummary.useQuery(undefined, { retry: false, refetchInterval: 30000 });
  const purchases = report.data?.purchases;
  const funding = report.data?.funding;
  const bars = [
    { label: "مدفوع", value: purchases?.paid ?? 0, tone: "bg-emerald-500" },
    { label: "معلق", value: purchases?.pending ?? 0, tone: "bg-amber-500" },
    { label: "غير مدفوع", value: purchases?.unpaid ?? 0, tone: "bg-slate-400" },
    { label: "مسترد", value: purchases?.refunded ?? 0, tone: "bg-violet-500" },
  ];
  const max = Math.max(...bars.map((bar) => bar.value), 1);
  return <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90" dir="rtl">
    <CardHeader className="flex flex-row items-start justify-between gap-3">
      <div><CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-white"><BarChart3 className="h-5 w-5 text-[#e76f3c]" />تقرير مشتريات المحتوى</CardTitle><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">تقرير مستقل عن تشغيل المطاعم وإيراداتها.</p></div>
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"><LockKeyhole className="h-3 w-3" />معزول ماليًا</span>
    </CardHeader>
    <CardContent className="space-y-4">
      {report.isError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">تعذر تحميل التقرير المالي المستقل. Request ID: content-finance-summary</div>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[{ label: "إجمالي المشتريات", value: purchases?.total ?? 0, icon: CircleDollarSign }, { label: "المبلغ المدفوع", value: `${(purchases?.paidAmount ?? 0).toFixed(2)} ر.س`, icon: WalletCards }, { label: "حسابات التمويل", value: funding?.activeAccounts ?? 0, icon: LockKeyhole }, { label: "الرصيد المخصص", value: `${(funding?.availableBalance ?? 0).toFixed(2)} ر.س`, icon: CircleDollarSign }].map((item) => { const Icon = item.icon; return <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60"><div className="flex items-center justify-between text-slate-500"><span className="text-[11px]">{item.label}</span><Icon className="h-4 w-4 text-[#e76f3c]" /></div><p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{report.isLoading ? "…" : item.value}</p></div>; })}
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold text-slate-700 dark:text-slate-200">توزيع حالات الدفع</p><span className="text-[10px] text-slate-400">آخر 500 عملية</span></div><div className="flex h-28 items-end gap-3">{bars.map((bar) => <div key={bar.label} className="flex min-w-0 flex-1 flex-col items-center gap-1"><div className={`w-full rounded-t-md ${bar.tone} transition-all`} style={{ height: `${Math.max(5, (bar.value / max) * 82)}px` }} title={`${bar.label}: ${bar.value}`} /><span className="truncate text-[10px] text-slate-500 dark:text-slate-400">{bar.label}</span><strong className="text-xs text-slate-800 dark:text-slate-200">{bar.value}</strong></div>)}</div></div>
      <div className="flex items-start gap-2 rounded-xl border border-orange-100 bg-orange-50 p-3 text-xs leading-6 text-orange-900 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-100"><WalletCards className="mt-1 h-4 w-4 shrink-0" /><p><strong>قاعدة العزل:</strong> لا يدخل هذا التقرير في إيرادات المطعم ولا يُخصم من محفظته التشغيلية. تتم التسوية من حساب المشتريات المستقل وبفاتورة منفصلة.</p></div>
    </CardContent>
  </Card>;
}
