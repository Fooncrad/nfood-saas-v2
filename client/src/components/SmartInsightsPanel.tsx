import { AlertTriangle, ArrowUpLeft, Lightbulb, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export function SmartInsightsPanel({ restaurantId }: { restaurantId: number }) {
  const query = trpc.platform.activitySummary.useQuery({ restaurantId }, { retry: false, refetchInterval: 30000 });
  if (query.isLoading) return <Card className="mb-5 rounded-2xl border-slate-200"><CardContent className="p-4 text-xs text-slate-500">جارٍ تحليل مؤشرات اليوم...</CardContent></Card>;
  if (query.isError || !query.data) return null;
  const days = query.data.days ?? [];
  const today = days.at(-1);
  const yesterday = days.at(-2);
  const salesDelta = yesterday?.sales ? ((today?.sales ?? 0) - yesterday.sales) / yesterday.sales * 100 : 0;
  const attention = [
    query.data.totals.active > 0 ? { tone: "orange", text: `${query.data.totals.active} طلبات تحتاج متابعة الآن`, icon: AlertTriangle } : null,
    query.data.totals.orders === 0 ? { tone: "slate", text: "لم تُسجل طلبات تشغيلية بعد اليوم", icon: Lightbulb } : null,
  ].filter(Boolean) as Array<{ tone: string; text: string; icon: typeof AlertTriangle }>;
  return <Card className="mb-5 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm"><CardHeader className="flex flex-row items-center justify-between gap-3 pb-3"><div><CardTitle className="text-base">مركز ما يحتاج انتباهك</CardTitle><p className="mt-1 text-xs text-slate-500">ملخص ذكي من بيانات التشغيل الحالية، بدون رسوم ثقيلة.</p></div><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><Lightbulb className="h-5 w-5" /></div></CardHeader><CardContent className="grid gap-3 md:grid-cols-3">{attention.map((item) => { const Icon = item.icon; return <div key={item.text} className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50/60 p-3"><Icon className="h-5 w-5 shrink-0 text-orange-600" /><p className="text-xs font-bold text-slate-700">{item.text}</p></div>; })}<div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3"><TrendingUp className="h-5 w-5 shrink-0 text-emerald-600" /><p className="text-xs font-bold text-slate-700">{salesDelta >= 0 ? `المبيعات أعلى بنسبة ${Math.round(salesDelta)}% من أمس` : `المبيعات أقل بنسبة ${Math.round(Math.abs(salesDelta))}% من أمس`}</p></div><div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"><div><p className="text-[10px] text-slate-500">إجمالي الطلبات</p><p className="text-lg font-black text-slate-900">{query.data.totals.orders}</p></div><ArrowUpLeft className="h-4 w-4 text-slate-400" /></div></CardContent></Card>;
}
