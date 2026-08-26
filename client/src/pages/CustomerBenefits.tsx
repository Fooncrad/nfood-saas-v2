import { useEffect, useMemo, useState } from "react";
import { Check, Crown, LockKeyhole, Sparkles, Zap } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

type CustomerPlanKey = "customer-start" | "customer-plus" | "customer-pro";

function BenefitsLoading() {
  return <main dir="rtl" className="min-h-screen bg-[#f7f8fb] p-5 text-slate-900 sm:p-8"><div className="mx-auto max-w-7xl"><Skeleton className="h-10 w-72" /><Skeleton className="mt-3 h-5 w-[min(100%,42rem)]" /><div className="mt-8 grid gap-4 lg:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-48 rounded-3xl" />)}</div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-40 rounded-2xl" />)}</div></div></main>;
}

export default function CustomerBenefits() {
  const benefits = trpc.platform.customerBenefits.useQuery();
  const utils = trpc.useUtils();
  const [plan, setPlan] = useState<CustomerPlanKey>("customer-start");
  const setPlanMutation = trpc.platform.setCustomerBenefitPlan.useMutation({ onSuccess: async (_, input) => { setPlan(input.planKey); await utils.platform.customerBenefits.invalidate(); toast.success("تم حفظ باقة العميل وتفعيل مزاياها"); }, onError: (error) => toast.error(error.message || "تعذر حفظ الباقة") });
  const requestMutation = trpc.platform.requestCustomerBenefit.useMutation({ onSuccess: async (result) => { await utils.platform.customerBenefits.invalidate(); toast.success(result.duplicate ? "لديك طلب قيد المراجعة لهذه الميزة" : "تم تسجيل طلب التفعيل للمراجعة"); }, onError: (error) => toast.error(error.message || "تعذر تسجيل طلب الميزة") });

  useEffect(() => {
    const activeKey = benefits.data?.activePlan?.key;
    if (activeKey === "customer-start" || activeKey === "customer-plus" || activeKey === "customer-pro") setPlan(activeKey);
  }, [benefits.data?.activePlan?.key]);

  const selectedPlan = useMemo(() => (benefits.data?.plans ?? []).find((item) => item.key === plan) ?? benefits.data?.plans?.[0], [benefits.data?.plans, plan]);

  if (benefits.isLoading) return <BenefitsLoading />;
  if (benefits.isError || !benefits.data) return <main dir="rtl" className="min-h-screen bg-[#f7f8fb] p-5 text-slate-900 sm:p-8"><div className="mx-auto max-w-2xl rounded-3xl border border-red-100 bg-red-50 p-6"><h1 className="text-xl font-black">تعذر تحميل مزايا حسابك</h1><p className="mt-2 text-sm leading-6 text-red-800">لم نتمكن من قراءة الباقات وطلبات التفعيل من الخادم. أعد المحاولة بعد لحظات.</p><Button className="mt-5 rounded-xl bg-slate-900" onClick={() => void benefits.refetch()}>إعادة المحاولة</Button></div></main>;

  const features = benefits.data.features;
  const plans = benefits.data.plans;
  const requestedCount = features.filter((feature) => feature.requested).length;
  const enabledCount = features.filter((feature) => feature.enabled).length;
  const requestFeature = (featureKey: string, label: string, enabled: boolean, requested: boolean) => {
    if (enabled) return toast.success(`ميزة «${label}» مفعلة ضمن باقتك الحالية`);
    if (requested) return toast.success(`طلب «${label}» موجود وقيد مراجعة الإدارة`);
    requestMutation.mutate({ featureKey });
  };

  return <main dir="rtl" className="min-h-screen bg-[#f7f8fb] p-5 text-slate-900 sm:p-8"><div className="mx-auto max-w-7xl"><header className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#e76f3c]">NFOOD · Customer Benefits</p><h1 className="mt-2 text-3xl font-black">مزايا حساب العميل</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">تُحفظ باقتك وطلبات التفعيل في حسابك مباشرة. تُمنح الميزات المشمولة تلقائيًا، ويمكنك طلب أي ميزة إضافية منفردة دون الاعتماد على جهاز واحد.</p></div><Link href="/customer-portal"><Button variant="outline" className="rounded-xl">العودة إلى حسابي</Button></Link></header><section className="mb-7 grid gap-4 lg:grid-cols-[1.2fr_.8fr]"><Card className="rounded-3xl border-orange-100 bg-gradient-to-l from-orange-50 via-white to-violet-50"><CardContent className="flex items-center gap-4 p-5"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-[#e76f3c]"><Crown className="h-7 w-7" /></div><div><p className="text-xs font-bold text-orange-700">الباقة الحالية</p><h2 className="mt-1 text-xl font-black">{selectedPlan?.name ?? "الأساسي"}</h2><p className="mt-1 text-xs leading-6 text-slate-600">{enabledCount} ميزة مفعلة من الكتالوج. لديك {requestedCount} طلب قيد المراجعة.</p></div></CardContent></Card><Card className="rounded-3xl border-slate-200 bg-white"><CardContent className="flex items-center justify-between gap-4 p-5"><div><p className="text-xs font-bold text-slate-500">المزايا في الكتالوج</p><p className="mt-1 text-3xl font-black">{features.length}</p></div><Sparkles className="h-9 w-9 text-violet-500" /></CardContent></Card></section><section className="mb-8 grid gap-4 lg:grid-cols-3">{plans.map((item) => { const isCurrent = item.key === plan; return <Card key={item.key} className={`rounded-3xl bg-white transition ${isCurrent ? "border-2 border-[#e76f3c] shadow-lg shadow-orange-100" : "border-slate-200"}`}><CardHeader><div className="flex items-start justify-between"><div><CardTitle className="text-xl font-black">{item.name}</CardTitle><p className="mt-1 text-xs text-slate-500">{item.description}</p></div><Badge className="rounded-full bg-slate-100 text-slate-700">{item.featureCount} ميزة</Badge></div><p className="mt-4 text-2xl font-black text-[#c75325]">{Number(item.monthlyPrice).toLocaleString("ar-SA")} ر.س <span className="text-xs font-bold text-slate-400">/ شهر</span></p></CardHeader><CardContent><Button type="button" disabled={setPlanMutation.isPending || isCurrent} onClick={() => setPlanMutation.mutate({ planKey: item.key as CustomerPlanKey })} className={`w-full rounded-xl ${isCurrent ? "bg-[#e76f3c]" : ""}`} variant={isCurrent ? "default" : "outline"}>{isCurrent ? "الباقة الحالية" : setPlanMutation.isPending ? "جارٍ الحفظ..." : "اختيار الباقة"}</Button><p className="mt-3 text-center text-[11px] text-slate-500">يُحفظ الاختيار في حسابك ويُطبق على كل أجهزتك.</p></CardContent></Card>; })}</section><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">كتالوج المزايا</h2><p className="mt-1 text-xs text-slate-500">المفعّل ضمن الباقة: {enabledCount} · الطلبات الفردية: {requestedCount}</p></div><Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">تفعيل محفوظ على الخادم</Badge></div><section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{features.map((feature) => { const active = feature.enabled; const isRequested = feature.requested; return <Card key={feature.key} className={`rounded-2xl bg-white transition hover:-translate-y-0.5 ${active ? "border-emerald-200" : "border-slate-200"}`}><CardContent className="flex min-h-40 flex-col p-4"><div className="flex items-start justify-between gap-2"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{active ? <Check className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}</div><Badge variant="outline" className={`rounded-full text-[10px] ${active ? "border-emerald-200 text-emerald-700" : "text-slate-500"}`}>{active ? "مفعلة" : isRequested ? "قيد الطلب" : "إضافية"}</Badge></div><h3 className="mt-3 font-black">{feature.label}</h3><p className="mt-1 flex-1 text-xs leading-5 text-slate-500">{feature.description}</p><Button type="button" size="sm" variant={active ? "outline" : "default"} disabled={requestMutation.isPending} onClick={() => requestFeature(feature.key, feature.label, active, isRequested)} className={`mt-3 w-full rounded-xl text-xs ${active ? "border-emerald-200 text-emerald-700" : "bg-slate-900"}`}>{active ? "مفعلة ضمن الباقة" : isRequested ? "طلب مسجل" : "طلب تفعيل الميزة"}</Button></CardContent></Card>; })}</section><footer className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 text-xs leading-6 text-slate-500"><p className="flex items-center gap-2 font-black text-slate-800"><Zap className="h-4 w-4 text-[#e76f3c]" />نظام مرن للعميل</p><p className="mt-1">تغيير الجهاز أو تسجيل الدخول من متصفح آخر لا يفقد اختياراتك. تبقى حالة كل طلب ظاهرة داخل حسابك إلى أن تعتمدها الإدارة أو ترفضها، مع سجل تدقيق لكل إجراء.</p></footer></div></main>;
}
