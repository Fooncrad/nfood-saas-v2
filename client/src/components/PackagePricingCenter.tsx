import { useMemo, useState } from "react";
import { Check, ChevronDown, Package, Plus, Save, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function PackagePricingCenter() {
  const utils = trpc.useUtils();
  const plansQuery = trpc.admin.packagePlans.useQuery();
  const definitionsQuery = trpc.admin.featureDefinitions.useQuery();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [draft, setDraft] = useState<Record<number, { monthly: string; yearly: string }>>({});
  const plans = plansQuery.data ?? [];
  const definitions = definitionsQuery.data ?? [];
  const updatePlan = trpc.admin.updatePackagePlan.useMutation({
    onSuccess: () => { void utils.admin.packagePlans.invalidate(); toast.success("تم حفظ أسعار الباقة"); },
    onError: e => toast.error(e.message),
  });
  const setFeature = trpc.admin.setPackagePlanFeature.useMutation({
    onSuccess: () => void utils.admin.packagePlans.invalidate(),
    onError: e => toast.error(e.message),
  });
  const createPlan = trpc.admin.createPackagePlan.useMutation({
    onSuccess: () => { void utils.admin.packagePlans.invalidate(); toast.success("تم إنشاء الباقة"); },
    onError: e => toast.error(e.message),
  });
  const totals = useMemo(() => ({
    active: plans.filter(p => p.isActive).length,
    addons: definitions.filter(f => f.isAddOn).length,
    features: definitions.length,
  }), [plans, definitions]);

  const createHospitalityPlan = () => {
    const stamp = Date.now().toString().slice(-6);
    createPlan.mutate({ key: `hospitality_${stamp}`, name: "باقة مطاعم ومقاهي جديدة", description: "باقة ضيافة قابلة للتخصيص للمطاعم والمقاهي", planType: "monthly", monthlyPrice: "0", yearlyPrice: "0" });
  };

  return <div dir="rtl" className="space-y-5 text-slate-950 dark:text-white">
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-l from-orange-50 via-white to-sky-50 p-5 dark:border-slate-800 dark:from-orange-950/20 dark:via-slate-950 dark:to-sky-950/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><Badge className="mb-3 rounded-full bg-[#e76f3c]">NFOOD Packages</Badge><h1 className="text-2xl font-black">الباقات والحزم والأسعار</h1><p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">مركز موحد لتسعير باقات المطاعم والمقاهي وبقية الأنشطة، وإدارة المميزات والإضافات وحدود الاستخدام.</p></div>
        <Button onClick={createHospitalityPlan} disabled={createPlan.isPending} className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"><Plus className="ml-2 h-4 w-4"/>باقة مطاعم/مقاهي</Button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[["الباقات النشطة", totals.active],["المميزات",totals.features],["الإضافات المدفوعة",totals.addons]].map(([label,value])=><div key={String(label)} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>)}
      </div>
    </section>

    <Card className="overflow-hidden rounded-[26px] border-slate-200 dark:border-slate-800">
      <CardHeader className="border-b dark:border-slate-800"><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-[#e76f3c]"/>كتالوج الباقات</CardTitle></CardHeader>
      <CardContent className="p-0">
        {plansQuery.isLoading ? <p className="p-6 text-sm text-slate-500">جارٍ تحميل الباقات…</p> : plans.map(plan => {
          const open=expanded===plan.id; const enabled=plan.features.filter(f=>f.enabled).length;
          const price=draft[plan.id] ?? {monthly:String(plan.monthlyPrice),yearly:String(plan.yearlyPrice)};
          return <div key={plan.id} className="border-b last:border-0 dark:border-slate-800">
            <button onClick={()=>setExpanded(open?null:plan.id)} className="flex w-full items-center justify-between gap-3 p-4 text-right hover:bg-slate-50 dark:hover:bg-slate-900">
              <div><div className="flex items-center gap-2"><span className="font-black">{plan.name}</span><Badge variant="outline">{plan.planType}</Badge><Badge className={plan.isActive?"bg-emerald-100 text-emerald-700":"bg-slate-100 text-slate-500"}>{plan.isActive?"نشطة":"متوقفة"}</Badge></div><p className="mt-1 text-xs text-slate-500">{plan.key} · {enabled} مميزات مفعلة</p></div>
              <ChevronDown className={`h-5 w-5 transition ${open?"rotate-180":""}`}/>
            </button>
            {open && <div className="space-y-5 bg-slate-50/70 p-4 dark:bg-slate-950/60">
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
                <label className="text-xs font-bold">السعر الشهري (SAR)<Input value={price.monthly} onChange={e=>setDraft(x=>({...x,[plan.id]:{...price,monthly:e.target.value}}))} className="mt-2"/></label>
                <label className="text-xs font-bold">السعر السنوي (SAR)<Input value={price.yearly} onChange={e=>setDraft(x=>({...x,[plan.id]:{...price,yearly:e.target.value}}))} className="mt-2"/></label>
                <Button className="mt-6 rounded-xl" onClick={()=>updatePlan.mutate({id:plan.id,monthlyPrice:price.monthly,yearlyPrice:price.yearly})}><Save className="ml-2 h-4 w-4"/>حفظ الأسعار</Button>
                <Button variant="outline" className="mt-6 rounded-xl" onClick={()=>updatePlan.mutate({id:plan.id,isActive:!plan.isActive})}>{plan.isActive?"إيقاف الباقة":"تفعيل الباقة"}</Button>
              </div>
              <div><div className="mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#e76f3c]"/><h3 className="text-sm font-black">المميزات والحزم</h3></div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{definitions.map(def=>{
                  const link=plan.features.find(f=>f.featureId===def.id); const on=link?.enabled===true;
                  return <button key={def.id} onClick={()=>setFeature.mutate({planId:plan.id,featureId:def.id,enabled:!on,featureLimit:link?.featureLimit??null})} className={`flex items-center justify-between rounded-xl border p-3 text-right transition ${on?"border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20":"border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}>
                    <span><span className="block text-xs font-bold">{def.label}</span><span className="mt-1 block text-[10px] text-slate-500">{def.category}{def.isAddOn?` · إضافة ${def.addonPrice??0} SAR`:""}</span></span>{on?<Check className="h-4 w-4 text-emerald-600"/>:<span className="h-4 w-4 rounded-full border"/>}
                  </button>})}</div>
              </div>
            </div>}
          </div>
        })}
      </CardContent>
    </Card>
  </div>;
}
