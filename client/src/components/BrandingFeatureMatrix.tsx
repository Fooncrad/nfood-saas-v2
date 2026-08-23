import { LockKeyhole, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

const statusLabel: Record<string, string> = {
  ON: "متاحة",
  LIMITED: "محدودة",
  ADD_ON: "إضافة",
  ENTERPRISE_ONLY: "Enterprise",
};

export function BrandingFeatureMatrix({ restaurantId }: { restaurantId: number }) {
  const query = trpc.platform.branding.useQuery({ restaurantId });
  if (query.isLoading) return <Card className="rounded-2xl border-slate-200"><CardContent className="p-4 text-sm text-slate-500">جارٍ تحميل مصفوفة الهوية...</CardContent></Card>;
  if (query.isError || !query.data) return <Card className="rounded-2xl border-red-100 bg-red-50"><CardContent className="p-4 text-sm text-red-700">تعذر تحميل ميزات الهوية. أعد المحاولة من إعدادات المطعم.</CardContent></Card>;

  const accessByKey = new Map(query.data.featureAccess.map((feature) => [feature.key, feature]));
  return <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
      <div><CardTitle className="text-base">هوية المطعم حسب الباقة</CardTitle><p className="mt-1 text-xs text-slate-500">الخطة الحالية: <strong>{query.data.plan}</strong> — تُحسم الصلاحيات من الخادم.</p></div>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><Sparkles className="h-5 w-5" /></div>
    </CardHeader>
    <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {query.data.brandingFeatures.map((feature) => {
        const access = accessByKey.get(feature.key);
        const enabled = access?.enabled ?? false;
        return <div key={feature.key} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${enabled ? "border-emerald-100 bg-emerald-50/60" : "border-slate-200 bg-slate-50"}`}>
          <div className="min-w-0"><p className="truncate text-xs font-bold text-slate-800">{feature.label}</p><p className="mt-0.5 text-[10px] text-slate-500">{enabled ? statusLabel[feature.status] ?? "متاحة" : "متاحة بعد الترقية"}</p></div>
          {enabled ? <Badge className="shrink-0 rounded-lg bg-emerald-600 text-[10px] text-white">مفعلة</Badge> : <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold text-slate-400"><LockKeyhole className="h-3.5 w-3.5" /> مقفلة</span>}
        </div>;
      })}
    </CardContent>
  </Card>;
}
