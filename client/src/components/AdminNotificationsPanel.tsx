import { useState } from "react";
import { Bell, CalendarClock, Pause, Play, Send, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Target = "all" | "customers" | "restaurants" | "admins" | "selected";
type MessageType = "task" | "message" | "payment" | "system";
const targetLabels: Record<Target, string> = { all: "كل الحسابات", customers: "العملاء", restaurants: "حسابات المطاعم والموظفين", admins: "الإدارة", selected: "معرّفات مستخدمين محددة" };

export default function AdminNotificationsPanel() {
  const utils = trpc.useUtils();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetType, setTargetType] = useState<Target>("all");
  const [type, setType] = useState<MessageType>("system");
  const [cron, setCron] = useState("0 0 9 * * *");
  const [ids, setIds] = useState("");
  const parseIds = () => ids.split(",").map(value => Number(value.trim())).filter(value => Number.isInteger(value) && value > 0);
  const payload = () => ({ title: title.trim(), body: body.trim(), targetType, type, targetUserIds: targetType === "selected" ? parseIds() : undefined });
  const sendNow = trpc.admin.sendCustomNotification.useMutation({ onSuccess: result => { toast.success(`تم الإرسال إلى ${result.notified} حساب · Push: ${result.pushSent}`); setTitle(""); setBody(""); }, onError: error => toast.error(error.message) });
  const create = trpc.admin.createScheduledNotification.useMutation({ onSuccess: () => { toast.success("تمت جدولة الرسالة"); void utils.admin.listScheduledNotifications.invalidate(); }, onError: error => toast.error(error.message) });
  const setStatus = trpc.admin.setScheduledNotificationStatus.useMutation({ onSuccess: () => void utils.admin.listScheduledNotifications.invalidate(), onError: error => toast.error(error.message) });
  const remove = trpc.admin.deleteScheduledNotification.useMutation({ onSuccess: () => { toast.success("تم حذف الجدولة"); void utils.admin.listScheduledNotifications.invalidate(); }, onError: error => toast.error(error.message) });
  const scheduled = trpc.admin.listScheduledNotifications.useQuery();
  const valid = title.trim().length >= 2 && body.trim().length >= 2 && (targetType !== "selected" || parseIds().length > 0);
  const submitNow = () => sendNow.mutate(payload());
  const submitSchedule = () => create.mutate({ ...payload(), cron: cron.trim() });
  return <div dir="rtl" className="space-y-5">
    <div className="flex items-center gap-3"><div className="rounded-2xl bg-orange-100 p-3 text-orange-600"><Bell className="h-6 w-6" /></div><div><h2 className="text-2xl font-black text-slate-900">رسائل الإشعارات</h2><p className="text-sm text-slate-500">أرسل رسالة مخصصة الآن أو أنشئ رسالة تتكرر تلقائيًا لجميع الحسابات والعملاء.</p></div></div>
    <Card className="rounded-3xl border-slate-200 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Send className="h-5 w-5 text-orange-500" />إنشاء رسالة</CardTitle></CardHeader><CardContent className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3"><Input value={title} onChange={event => setTitle(event.target.value)} placeholder="عنوان الإشعار" className="rounded-xl" /><select value={type} onChange={event => setType(event.target.value as MessageType)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="system">تنبيه نظام</option><option value="message">رسالة</option><option value="task">مهمة</option><option value="payment">دفع وفوترة</option></select><select value={targetType} onChange={event => setTargetType(event.target.value as Target)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">{Object.entries(targetLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
      {targetType === "selected" && <Input value={ids} onChange={event => setIds(event.target.value)} placeholder="أرقام المستخدمين مفصولة بفاصلة: 12, 45, 91" className="rounded-xl" />}
      <Textarea value={body} onChange={event => setBody(event.target.value)} placeholder="نص الإشعار..." className="min-h-28 rounded-xl" maxLength={2000} />
      <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-[1fr_auto_auto] md:items-end"><div><label className="mb-1 block text-xs font-bold text-slate-500">Cron من 6 خانات (ثواني، دقائق، ساعات، يوم، شهر، أسبوع)</label><Input value={cron} onChange={event => setCron(event.target.value)} className="rounded-xl bg-white font-mono" /></div><Button disabled={!valid || sendNow.isPending} onClick={submitNow} className="rounded-xl bg-orange-500 hover:bg-orange-600"><Send className="ml-2 h-4 w-4" />إرسال الآن</Button><Button disabled={!valid || create.isPending || !/^\d+ \d+ \d+ \S+ \S+ \S+$/.test(cron.trim())} onClick={submitSchedule} variant="outline" className="rounded-xl border-orange-200 text-orange-700"><CalendarClock className="ml-2 h-4 w-4" />جدولة متكررة</Button></div>
    </CardContent></Card>
    <Card className="rounded-3xl border-slate-200 shadow-sm"><CardHeader><CardTitle className="text-lg">الرسائل المجدولة</CardTitle></CardHeader><CardContent className="space-y-3">{scheduled.isLoading ? <p className="py-6 text-center text-sm text-slate-400">جارٍ التحميل...</p> : scheduled.data?.length ? scheduled.data.map(message => <div key={message.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 md:flex-row md:items-center md:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><span className="font-bold text-slate-900">{message.title}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${message.status === "scheduled" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{message.status === "scheduled" ? "نشطة" : "متوقفة"}</span></div><p className="mt-1 line-clamp-2 text-sm text-slate-500">{message.body}</p><p className="mt-2 font-mono text-xs text-slate-400">{targetLabels[message.targetType as Target]} · {message.scheduleCron} · آخر تشغيل: {message.lastRunAt ? new Date(message.lastRunAt).toLocaleString("ar-SA") : "لم تعمل بعد"}</p></div><div className="flex shrink-0 gap-2"><Button size="sm" variant="outline" className="rounded-lg" onClick={() => setStatus.mutate({ id: message.id, status: message.status === "scheduled" ? "paused" : "scheduled" })}>{message.status === "scheduled" ? <><Pause className="ml-1 h-4 w-4" />إيقاف</> : <><Play className="ml-1 h-4 w-4" />تشغيل</>}</Button><Button size="sm" variant="ghost" className="rounded-lg text-red-600 hover:bg-red-50" onClick={() => remove.mutate({ id: message.id })}><Trash2 className="h-4 w-4" /></Button></div></div>) : <p className="py-6 text-center text-sm text-slate-400">لا توجد رسائل مجدولة.</p>}</CardContent></Card>
  </div>;
}
