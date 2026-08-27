import { PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

function formatCallTime(value: Date | string | number) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleTimeString("ar-SA-u-nu-latn", { timeZone: "Asia/Riyadh", hour: "2-digit", minute: "2-digit", hour12: false }) : "--:--";
}

export function WaiterCallsPanel({ restaurantId, branchId }: { restaurantId: number; branchId?: number }) {
  const utils = trpc.useUtils();
  const calls = trpc.platform.waiterCallsMine.useQuery({ restaurantId, branchId }, { enabled: Boolean(restaurantId), refetchInterval: 10_000, retry: false });
  const acknowledge = trpc.platform.acknowledgeWaiterCall.useMutation({ onSuccess: () => { void utils.platform.waiterCallsMine.invalidate({ restaurantId, branchId }); toast.success("تم تأكيد استلام النداء"); }, onError: (error) => toast.error(error.message) });
  return <Card data-testid="waiter-calls-panel" className="rounded-3xl border-violet-100 bg-white shadow-sm dark:border-violet-900/40 dark:bg-slate-900"><CardHeader className="flex-row items-center justify-between gap-3 p-4"><div><CardTitle className="flex items-center gap-2 text-base"><PhoneCall className="h-5 w-5 text-violet-600" />نداءات الطاولات</CardTitle><p className="mt-1 text-xs text-slate-500">تظهر هنا النداءات التي وصلت إلى الطاولات المعيّنة لك فقط.</p></div><Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">{calls.data?.length ?? 0} نشط</Badge></CardHeader><CardContent className="p-4 pt-0">{calls.isLoading ? <p className="rounded-2xl bg-slate-50 p-4 text-center text-xs text-slate-500">جارٍ تحميل النداءات...</p> : calls.isError ? <p className="rounded-2xl bg-rose-50 p-4 text-xs text-rose-700">تعذر تحميل نداءات الطاولات. حدّث الصفحة وحاول مجددًا.</p> : calls.data?.length ? <div className="grid gap-2 md:grid-cols-2">{calls.data.map((call) => <div key={call.id} className="flex items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3 dark:border-violet-900/40 dark:bg-violet-950/20"><div className="min-w-0"><p className="text-sm font-black text-slate-900 dark:text-white">طاولة {call.tableName}</p><p className="mt-1 text-xs font-bold text-violet-700">{call.reason}{call.customerName ? ` · ${call.customerName}` : ""}</p><p className="mt-1 text-[10px] text-slate-500">{formatCallTime(call.createdAt)}</p></div><Button type="button" onClick={() => acknowledge.mutate({ restaurantId, id: call.id })} disabled={acknowledge.isPending || call.status === "acknowledged"} className="shrink-0 rounded-xl bg-violet-600 px-3 text-xs text-white hover:bg-violet-700">{call.status === "acknowledged" ? "تم الاستلام" : "استلام النداء"}</Button></div>)}</div> : <p className="rounded-2xl bg-slate-50 p-5 text-center text-xs text-slate-500 dark:bg-slate-800">لا توجد نداءات نشطة لطاولاتك حاليًا.</p>}</CardContent></Card>;
}
