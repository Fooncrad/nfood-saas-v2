import { useEffect, useMemo, useState } from "react";
import { Clock3, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

type Channel = "all" | "takeaway" | "delivery" | "pos";
type OperatingWindow = { dayOfWeek: number; startTime: string; endTime: string; channel: Channel };

const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export function ReservationSchedulePanel({ restaurantId, branchId }: { restaurantId: number; branchId?: number }) {
  const utils = trpc.useUtils();
  const branches = trpc.platform.branches.useQuery({ restaurantId }, { enabled: Boolean(restaurantId), retry: false });
  const selected = useMemo(() => branches.data?.find((branch) => branch.id === branchId) ?? branches.data?.[0], [branches.data, branchId]);
  const [openingTime, setOpeningTime] = useState("09:00");
  const [closingTime, setClosingTime] = useState("23:00");
  const [windows, setWindows] = useState<OperatingWindow[]>([]);
  const [slot, setSlot] = useState({ dayOfWeek: "0", startTime: "18:00", endTime: "23:00", capacity: "10", slotDurationMinutes: "60" });
  const slots = trpc.platform.reservationSlotsManage.useQuery({ restaurantId, branchId: branchId ?? 0 }, { enabled: Boolean(branchId), retry: false });

  useEffect(() => {
    if (!selected) return;
    setOpeningTime(selected.openingTime ?? "09:00");
    setClosingTime(selected.closingTime ?? "23:00");
    try {
      const parsed = JSON.parse(selected.operatingWindowsJson ?? "[]");
      setWindows(Array.isArray(parsed) ? parsed.map((item) => ({ dayOfWeek: Number(item.dayOfWeek) || 0, startTime: item.startTime ?? "09:00", endTime: item.endTime ?? "23:00", channel: item.channels?.[0] === "takeaway" || item.channels?.[0] === "delivery" || item.channels?.[0] === "pos" ? item.channels[0] : "all" })) : []);
    } catch { setWindows([]); }
  }, [selected]);

  const saveSlot = trpc.platform.saveReservationSlot.useMutation({ onSuccess: () => { toast.success("تم حفظ الفتحة الزمنية"); void utils.platform.reservationSlotsManage.invalidate(); }, onError: (error) => toast.error(`تعذر حفظ الفتحة: ${error.message}`) });
  const updateBranch = trpc.platform.updateBranch.useMutation({
    onSuccess: () => { toast.success("تم حفظ أوقات الحجوزات وقنوات الطلب"); void utils.platform.branches.invalidate(); },
    onError: (error) => toast.error(`تعذر حفظ الأوقات: ${error.message}`),
  });
  const updateWindow = (index: number, patch: Partial<OperatingWindow>) => setWindows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  const saveSlotRule = () => { if (!branchId) return; saveSlot.mutate({ restaurantId, branchId, dayOfWeek: Number(slot.dayOfWeek), startTime: slot.startTime, endTime: slot.endTime, capacity: Number(slot.capacity), slotDurationMinutes: Number(slot.slotDurationMinutes), isActive: true }); };
  const save = () => {
    if (!selected) return;
    updateBranch.mutate({ restaurantId, id: selected.id, openingTime, closingTime, operatingWindowsJson: windows.length ? JSON.stringify(windows.map(({ channel, ...window }) => ({ ...window, channels: channel === "all" ? undefined : [channel] }))) : undefined });
  };

  return <section className="space-y-4" dir="rtl" data-reservation-schedule-panel>
    <Card className="rounded-3xl border-indigo-100 bg-indigo-50/40 shadow-sm">
      <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Clock3 className="h-5 w-5 text-indigo-600" />إدارة الحجوزات والأوقات</CardTitle><p className="text-xs leading-5 text-slate-500">هذه هي النقطة الموحدة للفتحات الزمنية وساعات العمل وقنوات الاستلام والتوصيل ونقاط البيع. لم تعد هناك نسخة مستقلة منها في مركز الفروع.</p></CardHeader>
      <CardContent className="space-y-4">
        {!selected ? <p className="rounded-2xl border border-dashed border-indigo-200 p-5 text-center text-sm text-slate-500">أضف فرعًا أولًا لإدارة أوقاته.</p> : <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3"><div><p className="text-sm font-black text-slate-900">{selected.name}</p><p className="text-xs text-slate-500">الفرع الحالي لإعداد الحجز</p></div><Button onClick={save} disabled={updateBranch.isPending} className="rounded-xl bg-indigo-600 text-white"><Save className="ml-2 h-4 w-4" />{updateBranch.isPending ? "جارٍ الحفظ..." : "حفظ الأوقات"}</Button></div>
          <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold">وقت الفتح<Input type="time" value={openingTime} onChange={(event) => setOpeningTime(event.target.value)} className="mt-1 bg-white" dir="ltr" /></label><label className="text-xs font-bold">وقت الإغلاق<Input type="time" value={closingTime} onChange={(event) => setClosingTime(event.target.value)} className="mt-1 bg-white" dir="ltr" /></label></div>
          <div className="rounded-2xl bg-white p-3"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-black text-slate-700">الفتحات حسب اليوم والقناة</span><button type="button" onClick={() => setWindows((current) => [...current, { dayOfWeek: 0, startTime: openingTime, endTime: closingTime, channel: "all" }])} className="rounded-lg border border-indigo-200 px-2 py-1 text-[10px] font-bold text-indigo-700">+ إضافة فترة</button></div>{windows.length === 0 ? <p className="text-xs text-slate-400">تُستخدم ساعات الفرع العامة لكل القنوات. أضف فترة مستقلة عند الحاجة.</p> : <div className="space-y-2">{windows.map((window, index) => <div key={`${index}-${window.dayOfWeek}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]"><select value={window.dayOfWeek} onChange={(event) => updateWindow(index, { dayOfWeek: Number(event.target.value) })} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs">{days.map((day, dayIndex) => <option key={day} value={dayIndex}>{day}</option>)}</select><Input type="time" value={window.startTime} onChange={(event) => updateWindow(index, { startTime: event.target.value })} className="h-9 text-xs" dir="ltr" /><Input type="time" value={window.endTime} onChange={(event) => updateWindow(index, { endTime: event.target.value })} className="h-9 text-xs" dir="ltr" /><select value={window.channel} onChange={(event) => updateWindow(index, { channel: event.target.value as Channel })} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs"><option value="all">كل القنوات</option><option value="takeaway">الاستلام</option><option value="delivery">التوصيل</option><option value="pos">نقطة البيع</option></select><button type="button" onClick={() => setWindows((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="h-9 rounded-lg px-2 text-xs font-bold text-rose-600 hover:bg-rose-50">حذف</button></div>)}</div>}          </div>
          <div className="rounded-2xl bg-white p-3"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-black text-slate-700">فتحات الحجز والسعة</span><Button type="button" onClick={saveSlotRule} disabled={!branchId || saveSlot.isPending} className="h-8 rounded-lg bg-slate-900 px-2 text-[10px] text-white"><Save className="ml-1 h-3 w-3" />{saveSlot.isPending ? "جارٍ الحفظ..." : "حفظ الفتحة"}</Button></div><div className="grid gap-2 sm:grid-cols-5"><select value={slot.dayOfWeek} onChange={(event) => setSlot({ ...slot, dayOfWeek: event.target.value })} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs">{days.map((day, index) => <option key={day} value={index}>{day}</option>)}</select><Input type="time" value={slot.startTime} onChange={(event) => setSlot({ ...slot, startTime: event.target.value })} className="h-9 text-xs" dir="ltr" /><Input type="time" value={slot.endTime} onChange={(event) => setSlot({ ...slot, endTime: event.target.value })} className="h-9 text-xs" dir="ltr" /><Input type="number" min="1" value={slot.capacity} onChange={(event) => setSlot({ ...slot, capacity: event.target.value })} placeholder="السعة" className="h-9 text-xs" /><Input type="number" min="15" step="15" value={slot.slotDurationMinutes} onChange={(event) => setSlot({ ...slot, slotDurationMinutes: event.target.value })} placeholder="المدة بالدقائق" className="h-9 text-xs" /></div>{slots.data?.length ? <div className="mt-3 flex flex-wrap gap-2">{slots.data.map((item) => <span key={item.id} className="rounded-full bg-orange-50 px-3 py-1.5 text-[11px] font-bold text-orange-800">{days[item.dayOfWeek]} · {item.startTime}–{item.endTime} · {item.capacity} مقاعد</span>)}</div> : <p className="mt-3 text-xs text-slate-400">لا توجد فتحات محفوظة لهذا الفرع بعد.</p>}</div>
        </>}
      </CardContent>
    </Card>
  </section>;
}
