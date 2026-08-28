import { Clock3, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

function formatResponse(seconds: number, language: string) {
  if (language === "fr") return seconds < 60 ? `${seconds} s` : `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
  if (language === "en") return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return seconds < 60 ? `${seconds} ث` : `${Math.floor(seconds / 60)} د ${seconds % 60} ث`;
}

export function WaiterResponseStatsPanel({ restaurantId, branchId }: { restaurantId: number; branchId?: number }) {
  const { language } = useLanguage();
  const stats = trpc.platform.waiterResponseStats.useQuery({ restaurantId, branchId }, { enabled: Boolean(restaurantId), retry: false, staleTime: 30_000 });
  const copy = language === "fr"
    ? { title: "Temps de réponse des serveurs", subtitle: "Suivez le délai moyen de prise en charge des appels.", empty: "Aucune réponse enregistrée pour le moment.", calls: "appels", average: "moyenne", error: "Impossible de charger les statistiques." }
    : language === "en"
      ? { title: "Waiter response time", subtitle: "Track the average time to acknowledge table calls.", empty: "No acknowledged calls recorded yet.", calls: "calls", average: "average", error: "Unable to load response statistics." }
      : { title: "متوسط استجابة النادل", subtitle: "تابع متوسط زمن استلام نداءات الطاولات وتحسين جودة الخدمة.", empty: "لا توجد نداءات مستلمة مسجلة حتى الآن.", calls: "نداء", average: "المتوسط", error: "تعذر تحميل إحصاءات الاستجابة." };

  return <Card data-testid="waiter-response-stats" className="rounded-3xl border-orange-100 bg-white shadow-sm dark:border-orange-900/40 dark:bg-slate-900">
    <CardHeader className="p-4 pb-3">
      <CardTitle className="flex items-center gap-2 text-base"><Clock3 className="h-5 w-5 text-orange-600" />{copy.title}</CardTitle>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{copy.subtitle}</p>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      {stats.isLoading ? <div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" /> : stats.isError ? <p className="rounded-2xl bg-rose-50 p-4 text-xs text-rose-700">{copy.error}</p> : stats.data?.length ? <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{stats.data.map((item) => <div key={item.waiterUserId} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/70"><div className="min-w-0"><p className="truncate text-sm font-black text-slate-900 dark:text-white">{item.waiterName ?? `#${item.waiterUserId}`}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500"><Users className="h-3.5 w-3.5" />{item.totalCalls} {copy.calls}</p></div><div className="shrink-0 text-end"><p className="text-lg font-black text-orange-600">{formatResponse(item.averageResponseSeconds, language)}</p><p className="text-[10px] font-bold text-slate-400">{copy.average}</p></div></div>)}</div> : <p className="rounded-2xl bg-slate-50 p-5 text-center text-xs text-slate-500 dark:bg-slate-800">{copy.empty}</p>}
    </CardContent>
  </Card>;
}
