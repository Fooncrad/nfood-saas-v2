import { Activity, Database, Server } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function SystemHealthView() {
  const query = trpc.admin.systemHealth.useQuery(undefined, { retry: false, refetchInterval: 30000 });
  const data = query.data;
  return <section dir="rtl" className="space-y-5">
    <div><p className="text-xs font-bold text-orange-500">NFOOD PLATFORM</p><h1 className="mt-1 text-2xl font-black text-slate-100">صحة النظام</h1><p className="mt-1 text-sm text-slate-400">قراءة مباشرة من خدمة صحة النظام، وتتحدث كل 30 ثانية.</p></div>
    {query.isError ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">تعذر تحميل صحة النظام. لا يتم عرض حالة تقديرية أو وهمية. <button className="font-bold underline" onClick={() => void query.refetch()}>إعادة المحاولة</button></div> :
    query.isLoading ? <div className="h-32 animate-pulse rounded-2xl bg-slate-900/50" /> :
    <div className="grid gap-3 md:grid-cols-3">
      <HealthCard icon={Server} label="API" value={String(data?.api ?? data?.status ?? "غير متاح")} />
      <HealthCard icon={Database} label="Database" value={String(data?.database ?? data?.db ?? "غير متاح")} />
      <HealthCard icon={Activity} label="آخر فحص" value={new Date().toLocaleTimeString("ar-SA")} />
    </div>}
  </section>;
}
function HealthCard({icon:Icon,label,value}:{icon:typeof Server;label:string;value:string}) {
  return <article className="rounded-2xl border border-slate-700/60 bg-slate-900/45 p-5"><Icon className="h-5 w-5 text-orange-400"/><p className="mt-4 text-xs text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-100">{value}</p></article>;
}
