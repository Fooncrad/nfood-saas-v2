import { BarChart3, Eye, QrCode, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

export function RestaurantMenuInsightsPanel({ restaurantId }: { restaurantId: number }) {
  const analytics = trpc.platform.menuAnalytics.useQuery({ restaurantId, days: 7 }, { refetchInterval: 60_000 });
  const totals = analytics.data?.totals ?? { menu_open: 0, qr_scan: 0 };
  const daily = analytics.data?.daily ?? [];
  const max = Math.max(1, ...daily.map((item) => item.count));

  return (
    <Card className="overflow-hidden rounded-[2rem] border-slate-200 bg-white shadow-[0_18px_60px_-35px_rgba(15,23,42,.35)]">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-l from-[#fff8f2] to-white px-5 py-5">
        <div>
          <div className="mb-2 flex items-center gap-2"><Badge className="border-0 bg-emerald-100 text-emerald-700">آخر 7 أيام</Badge><span className="text-xs font-bold text-slate-400">تتحدث تلقائيًا</span></div>
          <CardTitle className="flex items-center gap-2 text-lg font-black text-slate-900"><BarChart3 className="h-5 w-5 text-[#e76f3c]" /> نبض المنيو</CardTitle>
          <p className="mt-1 text-xs leading-5 text-slate-500">قياس مبسط لاهتمام العملاء بالمنيو ومصادر الوصول إليها، دون حفظ هويتهم.</p>
        </div>
        <TrendingUp className="h-7 w-7 text-emerald-500" />
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        {analytics.isLoading ? <div className="h-28 animate-pulse rounded-2xl bg-slate-100" /> : analytics.error ? <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">تعذر تحميل التحليلات. Request ID: menu-analytics-{restaurantId}</div> : <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4"><div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-500">فتح المنيو</span><Eye className="h-4 w-4 text-[#e76f3c]" /></div><p className="mt-2 text-3xl font-black text-slate-900">{totals.menu_open.toLocaleString("ar-EG")}</p><p className="mt-1 text-[11px] text-slate-500">زيارات فريدة كل 30 دقيقة</p></div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"><div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-500">مسح QR</span><QrCode className="h-4 w-4 text-emerald-600" /></div><p className="mt-2 text-3xl font-black text-slate-900">{totals.qr_scan.toLocaleString("ar-EG")}</p><p className="mt-1 text-[11px] text-slate-500">من الشاشة أو المواد المطبوعة</p></div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-black text-slate-800">النشاط اليومي</p><span className="text-[11px] text-slate-400">الحد الأقصى: {max}</span></div><div className="flex h-28 items-end gap-2 overflow-hidden">{Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); const key = date.toISOString().slice(0, 10); const count = daily.filter((item) => String(item.day).slice(0, 10) === key).reduce((sum, item) => sum + item.count, 0); return <div key={key} className="flex min-w-0 flex-1 flex-col items-center gap-2"><div className="flex h-20 w-full items-end rounded-t-xl bg-slate-100"><div className="w-full rounded-t-xl bg-gradient-to-t from-[#e76f3c] to-[#ffb36e] transition-all" style={{ height: `${Math.max(8, (count / max) * 100)}%` }} /></div><span className="text-[10px] text-slate-400">{date.toLocaleDateString("ar-EG", { weekday: "short" })}</span></div> })}</div></div>
        </>}
      </CardContent>
    </Card>
  );
}
