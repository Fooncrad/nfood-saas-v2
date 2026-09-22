import { ShieldCheck, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function SecurityView() {
  const roles = trpc.admin.roles.useQuery({}, { retry: false });
  const permissions = trpc.admin.permissions.useQuery(undefined, { retry: false });
  const failed = roles.isError || permissions.isError;
  return <section dir="rtl" className="space-y-5">
    <div><p className="text-xs font-bold text-orange-500">NFOOD SECURITY</p><h1 className="mt-1 text-2xl font-black text-slate-100">الأمان والصلاحيات</h1><p className="mt-1 text-sm text-slate-400">كتالوج الأدوار والصلاحيات الفعلي للمنصة. إدارة الجلسات ستظهر هنا فقط عند توفر API موثوق لها.</p></div>
    {failed ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">تعذر تحميل بيانات RBAC. <button className="font-bold underline" onClick={() => { void roles.refetch(); void permissions.refetch(); }}>إعادة المحاولة</button></div> :
    <div className="grid gap-3 md:grid-cols-2">
      <SecurityCard icon={Users} label="الأدوار" value={roles.isLoading ? "..." : String(roles.data?.length ?? 0)} />
      <SecurityCard icon={ShieldCheck} label="الصلاحيات" value={permissions.isLoading ? "..." : String(permissions.data?.length ?? 0)} />
    </div>}
  </section>;
}
function SecurityCard({icon:Icon,label,value}:{icon:typeof ShieldCheck;label:string;value:string}) {
  return <article className="rounded-2xl border border-slate-700/60 bg-slate-900/45 p-5"><Icon className="h-5 w-5 text-orange-400"/><p className="mt-4 text-xs text-slate-500">{label}</p><p className="mt-1 text-3xl font-black text-slate-100">{value}</p></article>;
}
