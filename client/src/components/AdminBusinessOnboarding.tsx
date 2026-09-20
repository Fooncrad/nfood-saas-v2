import { useMemo, useState } from "react";
import { Globe2, Plus, Store, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const SECTORS = [
  ["restaurant","مطاعم وأطعمة ومقاهي"],["sweets","حلويات ومخبوزات"],["fashion","موضة وأزياء"],["beauty_salon","صالونات ومراكز تجميل"],
  ["grocery","بقالات وأسواق"],["vegetables","خضار وفواكه"],["laundry","مغاسل وتنظيف"],["automotive","خدمات السيارات"],["public_works","مقاولات وصيانة"],
] as const;
const PLANS = ["Basic","Pro","Enterprise"] as const;

export default function AdminBusinessOnboarding() {
  const utils=trpc.useUtils();
  const localization=trpc.marketplace.adminLocalizationCatalog.useQuery(undefined,{retry:1});
  const [open,setOpen]=useState(false);
  const [draft,setDraft]=useState({customerName:"",email:"",countryCode:"SA",sector:"restaurant" as typeof SECTORS[number][0],plan:"Basic" as typeof PLANS[number],taxId:"",city:"",status:true});
  const countries=localization.data?.countries ?? [];
  const country=useMemo(()=>countries.find(x=>x.code===draft.countryCode) ?? countries.find(x=>x.code==="SA") ?? countries[0],[countries,draft.countryCode]);
  const createStore=trpc.marketplace.adminCreateStore.useMutation({
    onSuccess:()=>{void utils.marketplace.adminStores.invalidate();setOpen(false);setDraft({customerName:"",email:"",countryCode:"SA",sector:"restaurant",plan:"Basic",taxId:"",city:"",status:true});},
  });
  const submit=()=>{if(!country)return;createStore.mutate({...draft,currencyCode:country.currencyCode,timezone:country.code==="SA"?"Asia/Riyadh":"UTC",primaryLanguage:country.primaryLanguage});};
  return <section dir="rtl" className="space-y-5">
    <Card className="rounded-3xl border-orange-100 bg-gradient-to-l from-orange-50 to-white shadow-sm">
      <CardHeader><CardTitle className="flex items-center gap-2"><Globe2 className="h-5 w-5 text-[#e76f3c]"/>تسجيل منشأة جديدة</CardTitle></CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="font-bold">الدولة تحدد العملة والمنطقة الزمنية واللغة الافتراضية</p><p className="mt-1 text-sm text-slate-500">ثم يحدد النشاط الوحدات المناسبة للمتجر. يمكن تعديل الوحدات والصلاحيات لاحقًا من الإدارة.</p></div>
        <Button onClick={()=>setOpen(true)} className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"><Plus className="ml-2 h-4 w-4"/>إضافة متجر / منشأة</Button>
      </CardContent>
    </Card>
    <div className="grid gap-3 md:grid-cols-4">
      {["الدولة والعملات","النشاط والوحدات","المالك والباقة","النشر والإدارة"].map((x,i)=><div key={x} className="rounded-2xl border border-slate-200 bg-white p-4"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-xs font-black text-[#e76f3c]">{i+1}</span><p className="mt-3 text-sm font-bold">{x}</p><p className="mt-1 text-xs text-slate-500">{i===0?"تعيين تلقائي للعملة":i===1?"مطعم، متجر، صالون وغيرها":i===2?"ربط بيانات الاشتراك": "جاهز للظهور في السوق"}</p></div>)}
    </div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-2xl">
      <DialogHeader><DialogTitle>إضافة منشأة إلى NFOOD</DialogTitle><DialogDescription>إنشاء المنشأة وربط إعدادات الدولة والنشاط من خطوة واحدة.</DialogDescription></DialogHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">اسم المنشأة<Input className="mt-2 rounded-xl" value={draft.customerName} onChange={e=>setDraft({...draft,customerName:e.target.value})}/></label>
        <label className="text-sm font-semibold">بريد المالك<Input dir="ltr" type="email" className="mt-2 rounded-xl" value={draft.email} onChange={e=>setDraft({...draft,email:e.target.value})}/></label>
        <label className="text-sm font-semibold">الدولة<select className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3" value={draft.countryCode} onChange={e=>setDraft({...draft,countryCode:e.target.value})}>{countries.map(x=><option key={x.code} value={x.code}>{x.nameAr} · {x.code}</option>)}</select></label>
        <label className="text-sm font-semibold">النشاط<select className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3" value={draft.sector} onChange={e=>setDraft({...draft,sector:e.target.value as typeof draft.sector})}>{SECTORS.map(x=><option key={x[0]} value={x[0]}>{x[1]}</option>)}</select></label>
        <label className="text-sm font-semibold">المدينة<Input className="mt-2 rounded-xl" value={draft.city} onChange={e=>setDraft({...draft,city:e.target.value})}/></label>
        <label className="text-sm font-semibold">الرقم/السجل الضريبي<Input dir="ltr" className="mt-2 rounded-xl" value={draft.taxId} onChange={e=>setDraft({...draft,taxId:e.target.value})}/></label>
        <label className="text-sm font-semibold">الباقة<select className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3" value={draft.plan} onChange={e=>setDraft({...draft,plan:e.target.value as typeof draft.plan})}>{PLANS.map(x=><option key={x}>{x}</option>)}</select></label>
        <div className="rounded-xl bg-slate-50 p-3 text-sm"><p className="font-bold">إعدادات تلقائية</p><div className="mt-2 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-white px-2 py-1">العملة: {country?.currencyCode ?? "—"}</span><span className="rounded-full bg-white px-2 py-1">اللغة: {country?.primaryLanguage ?? "—"}</span><span className="rounded-full bg-white px-2 py-1">{country?.locale ?? "—"}</span></div></div>
      </div>
      <label className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm font-semibold">تفعيل المنشأة مباشرة<input type="checkbox" checked={draft.status} onChange={e=>setDraft({...draft,status:e.target.checked})}/></label>
      {createStore.isError&&<p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{createStore.error.message}</p>}
      <Button onClick={submit} disabled={createStore.isPending||localization.isLoading||!country||draft.customerName.trim().length<2||!draft.email.includes("@")} className="w-full rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]">{createStore.isPending?"جارٍ الإنشاء...":<><CheckCircle2 className="ml-2 h-4 w-4"/>إنشاء وربط المنشأة</>}</Button>
    </DialogContent></Dialog>
  </section>;
}