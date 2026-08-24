import { useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Edit3, Loader2, MapPin, Users, XCircle } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const statusMeta: Record<string, { label: string; className: string; icon: typeof Clock3 }> = {
  pending: { label: "بانتظار التأكيد", className: "border-amber-200 bg-amber-50 text-amber-800", icon: Clock3 },
  confirmed: { label: "مؤكد", className: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: CheckCircle2 },
  seated: { label: "تم الجلوس", className: "border-blue-200 bg-blue-50 text-blue-800", icon: Users },
  completed: { label: "منتهٍ", className: "border-slate-200 bg-slate-50 text-slate-700", icon: CheckCircle2 },
  cancelled: { label: "ملغى", className: "border-red-200 bg-red-50 text-red-800", icon: XCircle },
  no_show: { label: "لم يحضر", className: "border-red-200 bg-red-50 text-red-800", icon: XCircle },
};

function localDateTime(value: Date | string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

type Draft = { customerName: string; email: string; phone: string; partySize: string; childrenCount: string; reservedFor: string; durationMinutes: string; notes: string };

export default function CustomerReservations() {
  const { user, loading } = useAuth();
  const reservations = trpc.platform.myReservations.useQuery({ limit: 100 }, { enabled: Boolean(user), retry: false });
  const utils = trpc.useUtils();
  const [editId, setEditId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const updateReservation = trpc.platform.updateMyReservation.useMutation({ onSuccess: async () => { toast.success("تم تحديث الحجز"); setEditId(null); setDraft(null); await utils.platform.myReservations.invalidate(); }, onError: (error) => toast.error(error.message) });
  const cancelReservation = trpc.platform.cancelMyReservation.useMutation({ onSuccess: async () => { toast.success("تم إلغاء الحجز"); await utils.platform.myReservations.invalidate(); }, onError: (error) => toast.error(error.message) });

  const startEdit = (reservation: NonNullable<typeof reservations.data>[number]) => {
    setEditId(reservation.id);
    setDraft({ customerName: reservation.customerName, email: reservation.email ?? "", phone: reservation.phone ?? "", partySize: String(reservation.partySize), childrenCount: String(reservation.childrenCount), reservedFor: localDateTime(reservation.reservedFor), durationMinutes: String(reservation.durationMinutes), notes: reservation.notes ?? "" });
  };
  const submitEdit = () => {
    if (!editId || !draft) return;
    updateReservation.mutate({ id: editId, customerName: draft.customerName, email: draft.email || null, phone: draft.phone || null, partySize: Number(draft.partySize), childrenCount: Number(draft.childrenCount), reservedFor: new Date(draft.reservedFor), durationMinutes: Number(draft.durationMinutes), notes: draft.notes || null });
  };

  if (loading) return <main dir="rtl" className="grid min-h-screen place-items-center bg-[#f7f8fb]"><Loader2 className="h-7 w-7 animate-spin text-[#e76f3c]" /></main>;
  if (!user) return <main dir="rtl" className="grid min-h-screen place-items-center bg-[#f7f8fb] p-5"><Card className="w-full max-w-md rounded-3xl"><CardContent className="p-8 text-center"><CalendarDays className="mx-auto h-10 w-10 text-[#e76f3c]" /><h1 className="mt-4 text-2xl font-black">حجوزاتك محفوظة لحسابك</h1><p className="mt-2 text-sm leading-6 text-slate-500">سجّل الدخول لمتابعة الحجوزات وتعديلها أو إلغائها ضمن مهلة المطعم.</p><Button type="button" onClick={() => startLogin()} className="mt-5 rounded-xl bg-[#e76f3c]">تسجيل الدخول</Button></CardContent></Card></main>;

  return <main dir="rtl" className="min-h-screen bg-[#f7f8fb] p-5 text-slate-900 sm:p-8"><div className="mx-auto max-w-5xl"><header className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold text-[#e76f3c]">NFOOD · حساب العميل</p><h1 className="mt-2 text-3xl font-black">سجل الحجوزات</h1><p className="mt-2 text-sm text-slate-500">تابع مواعيدك، الطاولة والقسم، وعدّل الحجز قبل انتهاء مهلة المطعم.</p></div><div className="flex flex-wrap gap-2"><Link href="/customer-portal"><Button variant="outline" className="rounded-xl"><ArrowRight className="ml-2 h-4 w-4" />بوابة العميل</Button></Link><Link href="/customer-orders"><Button variant="outline" className="rounded-xl">سجل الطلبات</Button></Link></div></header>
    {reservations.isLoading && <Card className="rounded-3xl"><CardContent className="p-12 text-center text-sm text-slate-500"><Loader2 className="mx-auto h-7 w-7 animate-spin text-[#e76f3c]" /><p className="mt-3">جارٍ تحميل الحجوزات...</p></CardContent></Card>}
    {reservations.isError && <Card className="rounded-3xl border-red-200"><CardContent className="p-10 text-center text-sm text-red-700">تعذر تحميل سجل الحجوزات. حاول تحديث الصفحة.</CardContent></Card>}
    {!reservations.isLoading && !reservations.isError && !reservations.data?.length && <Card className="rounded-3xl border-dashed"><CardContent className="p-14 text-center"><CalendarDays className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-black text-slate-700">لا توجد حجوزات مرتبطة بحسابك</p><p className="mt-2 text-sm text-slate-500">افتح منيو المطعم واختر الحجز لإضافة موعد جديد.</p></CardContent></Card>}
    <div className="space-y-4">{(reservations.data ?? []).map((reservation) => { const meta = statusMeta[reservation.status] ?? statusMeta.pending; const StatusIcon = meta.icon; const editable = ["pending", "confirmed"].includes(reservation.status); const editing = editId === reservation.id && draft; return <Card key={reservation.id} className="rounded-3xl border-slate-200 bg-white shadow-sm"><CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 border-b border-slate-100"><div><CardTitle className="flex flex-wrap items-center gap-2 text-lg font-black">حجز #{reservation.id}<Badge className={`gap-1 rounded-full border ${meta.className}`}><StatusIcon className="h-3.5 w-3.5" />{meta.label}</Badge></CardTitle><p className="mt-2 text-xs text-slate-500">{reservation.restaurantName || "مطعم NFOOD"} · {new Date(reservation.reservedFor).toLocaleString("ar-SA")}</p></div><div className="text-left"><p className="text-lg font-black text-[#e76f3c]">{reservation.partySize} أشخاص</p><p className="text-xs text-slate-500">{reservation.durationMinutes} دقيقة</p></div></CardHeader><CardContent className="space-y-4 p-5"><div className="grid gap-2 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-3"><p className="text-[11px] font-bold text-slate-500">الطاولة</p><p className="mt-1 font-black">{reservation.assignedTableId ? `#${reservation.assignedTableId}` : "قائمة انتظار"}</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-[11px] font-bold text-slate-500">القسم</p><p className="mt-1 flex items-center gap-1 font-black"><MapPin className="h-4 w-4 text-[#e76f3c]" />{reservation.seatingSectionName || "كل الأقسام"}</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-[11px] font-bold text-slate-500">الأطفال</p><p className="mt-1 flex items-center gap-1 font-black"><Users className="h-4 w-4 text-[#e76f3c]" />{reservation.childrenCount}</p></div></div>{reservation.notes && !editing && <div className="rounded-2xl border border-orange-100 bg-orange-50 p-3 text-sm leading-6 text-orange-900"><strong>ملاحظتك:</strong> {reservation.notes}</div>}
      {editing && <div className="grid gap-3 rounded-2xl border border-orange-100 bg-orange-50/60 p-4 sm:grid-cols-2"><label className="text-xs font-bold">الاسم<Input value={draft.customerName} onChange={(e) => setDraft({ ...draft, customerName: e.target.value })} className="mt-1 rounded-xl bg-white" /></label><label className="text-xs font-bold">البريد الإلكتروني<Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className="mt-1 rounded-xl bg-white" /></label><label className="text-xs font-bold">رقم الجوال<Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className="mt-1 rounded-xl bg-white" /></label><label className="text-xs font-bold">عدد الأشخاص<Input type="number" min={1} max={50} value={draft.partySize} onChange={(e) => setDraft({ ...draft, partySize: e.target.value })} className="mt-1 rounded-xl bg-white" /></label><label className="text-xs font-bold">عدد الأطفال<Input type="number" min={0} max={50} value={draft.childrenCount} onChange={(e) => setDraft({ ...draft, childrenCount: e.target.value })} className="mt-1 rounded-xl bg-white" /></label><label className="text-xs font-bold">الموعد<Input type="datetime-local" value={draft.reservedFor} onChange={(e) => setDraft({ ...draft, reservedFor: e.target.value })} className="mt-1 rounded-xl bg-white" /></label><label className="text-xs font-bold sm:col-span-2">ملاحظات إضافية<Textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value.slice(0, 1000) })} className="mt-1 min-h-20 rounded-xl bg-white" /></label><div className="flex gap-2 sm:col-span-2"><Button type="button" disabled={updateReservation.isPending} onClick={submitEdit} className="rounded-xl bg-[#e76f3c]">{updateReservation.isPending ? "جارٍ الحفظ..." : "حفظ التعديل"}</Button><Button type="button" variant="outline" onClick={() => { setEditId(null); setDraft(null); }} className="rounded-xl">إلغاء التعديل</Button></div></div>}
      {!editing && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">{editable && <><Button type="button" variant="outline" size="sm" onClick={() => startEdit(reservation)} className="rounded-xl"><Edit3 className="ml-2 h-4 w-4" />تعديل الحجز</Button><Button type="button" variant="ghost" size="sm" disabled={cancelReservation.isPending} onClick={() => { if (window.confirm("هل تريد إلغاء هذا الحجز؟")) cancelReservation.mutate({ id: reservation.id }); }} className="rounded-xl text-red-700 hover:bg-red-50">{cancelReservation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <XCircle className="ml-2 h-4 w-4" />}إلغاء الحجز</Button></>}</div>}</CardContent></Card>; })}</div></div></main>;
}
