import { useState } from "react";
import { Gift, History, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function LoyaltyPanel({ restaurantId }: { restaurantId: number }) {
  const [customerId, setCustomerId] = useState("");
  const [points, setPoints] = useState("");
  const [note, setNote] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const parsedCustomerId = Number(customerId);
  const canQuery = Number.isInteger(parsedCustomerId) && parsedCustomerId > 0;
  const summary = trpc.platform.loyaltySummary.useQuery({ restaurantId, customerId: parsedCustomerId }, { enabled: canQuery, retry: false });
  const referrals = trpc.platform.referrals.useQuery({ restaurantId, customerId: canQuery ? parsedCustomerId : undefined }, { enabled: canQuery, retry: false });
  const adjustPoints = trpc.platform.adjustLoyaltyPoints.useMutation({
    onSuccess: () => { toast.success("تم تحديث نقاط الولاء"); setPoints(""); setNote(""); void summary.refetch(); },
    onError: (error) => toast.error(error.message || "تعذر تحديث النقاط"),
  });
  const createReferral = trpc.platform.createReferral.useMutation({
    onSuccess: () => { toast.success("تم إنشاء رمز الإحالة"); setReferralCode(""); void referrals.refetch(); },
    onError: (error) => toast.error(error.message || "تعذر إنشاء الإحالة"),
  });
  const submitPoints = () => {
    const value = Number(points);
    if (!canQuery || !Number.isInteger(value) || value === 0) { toast.error("أدخل رقم عميل ونقاطًا صحيحة غير صفرية"); return; }
    adjustPoints.mutate({ restaurantId, customerId: parsedCustomerId, points: value, type: "adjust", note: note.trim() || undefined });
  };
  const submitReferral = () => {
    if (!canQuery || referralCode.trim().length < 3) { toast.error("أدخل رقم العميل ورمز إحالة من 3 أحرف على الأقل"); return; }
    createReferral.mutate({ restaurantId, referrerCustomerId: parsedCustomerId, code: referralCode.trim() });
  };
  return <Card className="mt-5 rounded-2xl border-slate-200 bg-white shadow-sm" dir="rtl">
    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Gift className="h-5 w-5 text-[#e76f3c]" /> الولاء والإحالات</CardTitle><p className="text-sm text-slate-500">حساب الولاء مع ترقية وتخفيض تلقائيين حسب الرصيد، ومكافأة إحالة بعد أول طلب مكتمل ومدفوع.</p></CardHeader>
    <CardContent className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]"><Input value={customerId} onChange={(event) => setCustomerId(event.target.value.replace(/\D/g, ""))} placeholder="رقم العميل في النظام" inputMode="numeric" /><div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-500">{canQuery ? "جارٍ تحميل الحساب" : "أدخل رقم العميل لعرض الحساب"}</div></div>
      {canQuery && <div className="grid gap-3 md:grid-cols-3"><div className="rounded-2xl bg-orange-50 p-4"><p className="text-xs text-slate-500">الرصيد</p><p className="mt-2 text-2xl font-bold text-slate-900">{summary.isLoading ? "…" : summary.data?.account?.pointsBalance ?? 0}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">المستوى</p><p className="mt-2 text-lg font-bold text-slate-900">{summary.data?.account?.tier === "gold" ? "ذهبي Gold" : summary.data?.account?.tier === "silver" ? "فضي Silver" : "قياسي Standard"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">الإحالات</p><p className="mt-2 text-lg font-bold text-slate-900">{referrals.data?.length ?? 0}</p></div></div>}
      <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4 text-sm text-slate-600"><p className="font-semibold text-slate-800">قواعد المستويات</p><p className="mt-1">قياسي: 0–499 نقطة · فضي: 500–999 نقطة · ذهبي: 1000 نقطة فأكثر.</p><p className="mt-1 text-xs text-slate-500">تُعاد محاسبة المستوى بعد كل إضافة أو خصم؛ لذلك قد ينخفض المستوى تلقائيًا عند انخفاض الرصيد.</p></div>
      {canQuery && <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"><Input value={points} onChange={(event) => setPoints(event.target.value)} placeholder="+100 أو -50 نقطة" inputMode="numeric" /><Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="ملاحظة اختيارية" /><Button type="button" onClick={submitPoints} disabled={adjustPoints.isPending} className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"><Plus className="ml-1 h-4 w-4" />تعديل النقاط</Button></div>}
      {canQuery && <div className="grid gap-3 md:grid-cols-[1fr_auto]"><Input value={referralCode} onChange={(event) => setReferralCode(event.target.value.toUpperCase())} placeholder="رمز الإحالة" /><Button type="button" onClick={submitReferral} disabled={createReferral.isPending} variant="outline" className="rounded-xl"><Users className="ml-1 h-4 w-4" />إنشاء إحالة</Button></div>}
      {canQuery && <div className="rounded-2xl border border-slate-100"><div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-sm font-semibold"><History className="h-4 w-4" />آخر معاملات النقاط</div>{summary.data?.transactions?.length ? <div className="divide-y divide-slate-100">{summary.data.transactions.slice(0, 5).map((item) => <div key={item.id} className="flex items-center justify-between px-4 py-3 text-sm"><span className="text-slate-500">{item.note || item.type}</span><strong className={item.points >= 0 ? "text-emerald-600" : "text-red-600"}>{item.points > 0 ? "+" : ""}{item.points}</strong></div>)}</div> : <p className="px-4 py-5 text-sm text-slate-500">لا توجد معاملات نقاط لهذا العميل بعد.</p>}</div>}
    </CardContent>
  </Card>;
}
