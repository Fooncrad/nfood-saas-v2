import { useMemo, useState } from "react";
import { KeyRound, Mail, Search, ShieldCheck, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function RestaurantCustomersPanel({ restaurantId }: { restaurantId: number }) {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const query = trpc.platform.restaurantCustomers.useQuery({ restaurantId, search: search.trim() || undefined }, { retry: false });
  const resetPassword = trpc.platform.setRestaurantCustomerPassword.useMutation({
    onSuccess: async () => { toast.success("تم تعيين كلمة مرور العميل دون تعديل البريد"); setPassword(""); setSelectedUserId(null); await utils.platform.restaurantCustomers.invalidate({ restaurantId }); },
    onError: (error) => toast.error(error.message || "تعذر تعيين كلمة المرور"),
  });
  const customers = useMemo(() => query.data ?? [], [query.data]);
  return <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-100">
      <div><CardTitle className="flex items-center gap-2 text-base"><Users className="h-5 w-5 text-[#e76f3c]" /> عملاء المطعم</CardTitle><p className="mt-1 text-xs text-slate-500">قائمة معزولة لعملاء هذا المطعم. البريد للعرض فقط، وتعيين كلمة المرور إجراء منفصل ومدقق.</p></div>
      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#e76f3c]">{customers.length} عميل</span>
    </CardHeader>
    <CardContent className="space-y-4 p-4">
      <div className="relative"><Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالاسم أو البريد أو الجوال" className="rounded-xl pe-9" /></div>
      {selectedUserId !== null && <div className="grid gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:grid-cols-[1fr_auto_auto]"><label className="text-xs font-bold text-slate-700">كلمة المرور الجديدة<Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} placeholder="8 أحرف على الأقل" className="mt-1 rounded-xl bg-white" /></label><Button type="button" disabled={password.length < 8 || resetPassword.isPending} onClick={() => resetPassword.mutate({ restaurantId, userId: selectedUserId, password })} className="self-end rounded-xl bg-[#111c2e]">{resetPassword.isPending ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}</Button><Button type="button" variant="outline" onClick={() => { setSelectedUserId(null); setPassword(""); }} className="self-end rounded-xl">إلغاء</Button></div>}
      {query.isLoading ? <div className="h-24 animate-pulse rounded-xl bg-slate-100" /> : query.isError ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">تعذر تحميل عملاء المطعم. <button type="button" className="font-bold underline" onClick={() => void query.refetch()}>إعادة المحاولة</button></div> : customers.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">لا يوجد عملاء مرتبطون بهذا المطعم.</div> : <div className="space-y-2">{customers.map((customer) => <div key={customer.userId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"><div className="min-w-0"><p className="truncate text-sm font-bold">{customer.name || "عميل بلا اسم"}</p><div className="mt-1 flex flex-wrap gap-3 text-[11px] text-slate-500"><span><Mail className="me-1 inline h-3 w-3" />{customer.email || "لا يوجد بريد"}</span><span>{customer.loginMethod || "دخول غير محدد"}</span><span>{customer.lastSignedIn ? `آخر دخول ${new Date(customer.lastSignedIn).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn")}` : "لم يسجل الدخول"}</span></div></div><div className="flex items-center gap-2"><span className="hidden items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] text-emerald-700 sm:flex"><ShieldCheck className="h-3 w-3" /> البريد محمي</span><Button type="button" size="sm" variant="outline" onClick={() => setSelectedUserId(customer.userId)} className="rounded-lg text-xs"><KeyRound className="me-1 h-3 w-3" />تعيين كلمة المرور</Button></div></div>)}</div>}
    </CardContent>
  </Card>;
}
