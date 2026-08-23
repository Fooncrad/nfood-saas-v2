import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Clock3, UserRound, Users, type LucideIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { isRoleActionAllowed } from "@/lib/roleNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

type Props = { restaurantId: number };
const statuses = ["pending", "confirmed", "seated", "completed", "cancelled", "no_show"] as const;
type ReservationStatus = (typeof statuses)[number];
type Filter = "all" | ReservationStatus;
const statusLabels: Record<ReservationStatus, string> = { pending: "قيد الانتظار", confirmed: "مؤكد", seated: "جلس", completed: "مكتمل", cancelled: "ملغى", no_show: "لم يحضر" };

export type ReservationDraft = { customerName: string; phone: string; partySize: string; reservedFor: string };
export function validateReservationDraft(draft: ReservationDraft, now = Date.now()): string | null {
  const guests = Number(draft.partySize);
  const when = new Date(draft.reservedFor);
  if (draft.customerName.trim().length < 2 || !draft.reservedFor) return "أدخل اسم العميل والموعد";
  if (!Number.isInteger(guests) || guests < 1 || guests > 50) return "عدد الضيوف يجب أن يكون بين 1 و50";
  if (Number.isNaN(when.getTime()) || when.getTime() <= now) return "اختر موعدًا مستقبليًا صالحًا";
  if (draft.phone.trim() && !/^[+\d][\d\s-]{7,19}$/.test(draft.phone.trim())) return "أدخل رقم هاتف صالحًا";
  return null;
}

export function ReservationsView({ restaurantId }: Props) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const canCreateReservation = isRoleActionAllowed(user?.testRole, "reservations.create");
  const [kind, setKind] = useState<"reservation" | "waitlist">("reservation");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [reservedFor, setReservedFor] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const reservations = trpc.platform.reservations.useQuery({ restaurantId }, { retry: false });
  const create = trpc.platform.createReservation.useMutation({ onSuccess: () => { void utils.platform.reservations.invalidate(); setCustomerName(""); setPhone(""); setReservedFor(""); setFormOpen(false); toast.success("تم حفظ الحجز"); }, onError: (error) => toast.error(`تعذر حفظ الحجز: ${error.message}`) });
  const update = trpc.platform.updateReservationStatus.useMutation({ onSuccess: () => { void utils.platform.reservations.invalidate(); toast.success("تم تحديث الحالة"); }, onError: (error) => toast.error(`تعذر تحديث الحجز: ${error.message}`) });
  const allReservations = reservations.data ?? [];
  const filteredReservations = useMemo(() => filter === "all" ? allReservations : allReservations.filter((item) => item.status === filter), [allReservations, filter]);
  const stats = useMemo(() => ({ total: allReservations.length, confirmed: allReservations.filter((item) => item.status === "confirmed").length, seated: allReservations.filter((item) => item.status === "seated").length, pending: allReservations.filter((item) => item.status === "pending").length }), [allReservations]);
  const statCards: { label: string; value: number; Icon: LucideIcon; tone: string }[] = [{ label: "إجمالي السجلات", value: stats.total, Icon: CalendarClock, tone: "bg-orange-50 text-[#e76f3c]" }, { label: "قيد الانتظار", value: stats.pending, Icon: Clock3, tone: "bg-amber-50 text-amber-600" }, { label: "مؤكدة", value: stats.confirmed, Icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" }, { label: "جلس الضيف", value: stats.seated, Icon: Users, tone: "bg-sky-50 text-sky-600" }];
  const submit = () => { const error = validateReservationDraft({ customerName, phone, partySize, reservedFor }); if (error) { toast.error(error); return; } create.mutate({ restaurantId, kind, customerName: customerName.trim(), phone: phone.trim() || undefined, partySize: Number(partySize), reservedFor: new Date(reservedFor) }); };
  return <div dir="rtl" className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#e76f3c]"><CalendarClock className="h-6 w-6" /></div><div><h2 className="text-xl font-bold">الحجوزات وقائمة الانتظار</h2><p className="text-sm text-slate-500">تابع المواعيد والتوفر وحالة حضور الضيوف من مكان واحد.</p></div></div>{canCreateReservation && <Dialog open={formOpen} onOpenChange={setFormOpen}><DialogTrigger asChild><Button className="rounded-xl bg-[#e76f3c] shadow-lg shadow-orange-200/50 hover:bg-[#d85f2e]">إضافة حجز أو انتظار</Button></DialogTrigger><DialogContent dir="rtl" className="rounded-3xl sm:max-w-2xl"><DialogHeader><DialogTitle>إضافة حجز أو انتظار</DialogTitle></DialogHeader><div className="grid gap-3 p-1 md:grid-cols-2"><select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="reservation">حجز</option><option value="waitlist">قائمة انتظار</option></select><Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="اسم العميل" className="rounded-xl" /><Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="رقم الهاتف" className="rounded-xl" /><Input type="number" min={1} max={50} value={partySize} onChange={(event) => setPartySize(event.target.value)} placeholder="عدد الأشخاص" className="rounded-xl" /><Input type="datetime-local" value={reservedFor} onChange={(event) => setReservedFor(event.target.value)} className="rounded-xl" /><Button onClick={submit} disabled={create.isPending || customerName.trim().length < 2 || !reservedFor || !Number.isInteger(Number(partySize)) || Number(partySize) < 1 || Number(partySize) > 50} className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]">{create.isPending ? "جارٍ الحفظ..." : "حفظ الحجز"}</Button></div></DialogContent></Dialog>}</div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{statCards.map(({ label, value, Icon, tone }) => <Card key={String(label)} className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{value}</p></div><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div></CardContent></Card>)}</div>
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardHeader className="gap-4 border-b border-slate-100"><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="text-base">سجل الحجوزات</CardTitle><p className="mt-1 text-xs text-slate-500">تظهر هنا بيانات المطعم المعزولة، ويمكن تحديث الحالة من نفس البطاقة.</p></div><div className="flex flex-wrap gap-2">{(["all", ...statuses] as Filter[]).map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${filter === item ? "bg-[#e76f3c] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-[#e76f3c]"}`}>{item === "all" ? "الكل" : statusLabels[item]}</button>)}</div></div></CardHeader><CardContent className="p-5">{reservations.isLoading ? <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">جارٍ تحميل الحجوزات...</div> : reservations.isError ? <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">تعذر تحميل الحجوزات. Request ID: reservations-{restaurantId}<Button variant="outline" onClick={() => void reservations.refetch()} className="mx-auto mt-3 rounded-lg">إعادة المحاولة</Button></div> : filteredReservations.length === 0 ? <div className="rounded-xl bg-slate-50 p-10 text-center text-sm text-slate-500">لا توجد سجلات ضمن هذا الفلتر.</div> : <div className="grid gap-3 xl:grid-cols-2">{filteredReservations.map((item) => <div key={item.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><UserRound className="h-5 w-5" /></div><div><p className="font-bold text-slate-900">{item.customerName}</p><p className="mt-1 text-xs text-slate-500">{item.kind === "waitlist" ? "قائمة انتظار" : "حجز"} · {item.partySize} أشخاص</p></div></div><Badge variant="outline" className="rounded-lg">{statusLabels[item.status as ReservationStatus]}</Badge></div><div className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-2"><p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#e76f3c]" />{new Date(item.reservedFor).toLocaleString("ar-SA")}</p><p className="flex items-center gap-2"><Users className="h-4 w-4 text-[#e76f3c]" />الطاولة: {item.assignedTableId ? `#${item.assignedTableId}` : "تخصيص تلقائي"}</p>{item.phone && <p className="sm:col-span-2" dir="ltr">{item.phone}</p>}</div><div className="mt-3 flex flex-wrap gap-2">{item.status === "pending" && <Button size="sm" onClick={() => update.mutate({ restaurantId, id: item.id, status: "confirmed" })} className="rounded-lg bg-emerald-600 text-xs">تأكيد</Button>}{item.status === "confirmed" && <Button size="sm" onClick={() => update.mutate({ restaurantId, id: item.id, status: "seated" })} className="rounded-lg bg-[#e76f3c] text-xs">تم الجلوس</Button>}{item.status === "seated" && <Button size="sm" onClick={() => update.mutate({ restaurantId, id: item.id, status: "completed" })} className="rounded-lg bg-slate-700 text-xs">إكمال</Button>}{!( ["completed", "cancelled", "no_show"] as string[]).includes(item.status) && <Button size="sm" variant="outline" onClick={() => update.mutate({ restaurantId, id: item.id, status: "cancelled" })} className="rounded-lg text-xs text-red-600">إلغاء</Button>}</div></div>)}</div>}</CardContent></Card>
  </div>;
}
