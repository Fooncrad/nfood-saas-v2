import { Bell, CheckCheck, Gift, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function CustomerNotificationsCenter() {
  const notifications = trpc.notifications.mine.useQuery(undefined, { refetchInterval: 20_000 });
  const utils = trpc.useUtils();
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: () => void utils.notifications.mine.invalidate() });
  const markAll = trpc.notifications.markAllRead.useMutation({ onSuccess: () => void utils.notifications.mine.invalidate(), onError: (error) => toast.error(error.message || "تعذر تحديث الإشعارات") });
  const rows = notifications.data ?? [];
  const unread = rows.filter((item) => !item.readAt).length;
  return <Card dir="rtl" className="rounded-3xl border-slate-200 bg-white shadow-sm"><CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0"><div><CardTitle className="flex items-center gap-2 text-lg font-black"><Bell className="h-5 w-5 text-orange-500" />مركز الإشعارات {unread > 0 && <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[11px] text-white">{unread} جديد</span>}</CardTitle><p className="mt-1 text-xs text-slate-500">تنبيهات بيع المحتوى والمكافآت وتحديثات حسابك.</p></div><Button type="button" variant="outline" size="sm" disabled={!unread || markAll.isPending} onClick={() => markAll.mutate()} className="rounded-xl text-xs"><CheckCheck className="ml-1 h-4 w-4" />تحديد الكل كمقروء</Button></CardHeader><CardContent className="space-y-2">{notifications.isLoading ? <div className="h-24 animate-pulse rounded-2xl bg-slate-100" /> : rows.length === 0 ? <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">لا توجد إشعارات جديدة حاليًا.</div> : rows.slice(0, 12).map((item) => <button type="button" key={item.id} onClick={() => { if (!item.readAt) markRead.mutate({ notificationId: item.id }); }} className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-right transition hover:border-orange-200 hover:bg-orange-50 ${item.readAt ? "border-slate-100 bg-white" : "border-orange-100 bg-orange-50/70"}`}><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">{item.type === "message" ? <ShoppingBag className="h-4 w-4" /> : <Gift className="h-4 w-4" />}</div><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="text-sm font-black text-slate-900">{item.title}</strong>{!item.readAt && <span className="h-2 w-2 rounded-full bg-orange-500" />}</span><span className="mt-1 block text-xs leading-5 text-slate-600">{item.body}</span><span className="mt-1 block text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleString("ar-SA-u-ca-gregory-nu-latn")}</span></span></button>)}</CardContent></Card>;
}
