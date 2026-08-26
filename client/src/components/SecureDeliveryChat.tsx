import { useState } from "react";
import { Loader2, MessageCircle, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function SecureDeliveryChat({ orderId }: { orderId: number }) {
  const [body, setBody] = useState("");
  const messages = trpc.platform.deliveryMessages.useQuery({ orderId }, { refetchInterval: 8000, retry: false });
  const send = trpc.platform.sendDeliveryMessage.useMutation({
    onSuccess: () => { setBody(""); void messages.refetch(); },
    onError: (error) => toast.error(error.message || "تعذر إرسال الرسالة"),
  });
  const submit = () => { const value = body.trim(); if (!value) return; send.mutate({ orderId, body: value }); };
  return <section className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4" aria-label="محادثة التوصيل الآمنة">
    <div className="flex items-start justify-between gap-3"><div><p className="flex items-center gap-2 text-sm font-black text-sky-900"><MessageCircle className="h-4 w-4" />محادثة التوصيل داخل التطبيق</p><p className="mt-1 text-[11px] leading-5 text-sky-800">لا تشارك رقم الجوال أو الروابط. سيبقى التواصل مرتبطًا بهذا الطلب وتحت حماية NFOOD.</p></div><ShieldCheck className="h-5 w-5 shrink-0 text-sky-600" /></div>
    <div className="mt-3 max-h-40 space-y-2 overflow-y-auto rounded-xl bg-white/80 p-2">{messages.isLoading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-sky-600" /> : messages.isError ? <p className="p-2 text-xs text-red-700">تعذر تحميل المحادثة.</p> : (messages.data ?? []).length === 0 ? <p className="p-2 text-xs text-slate-500">لا توجد رسائل بعد. استخدم المحادثة لتوجيه السائق.</p> : (messages.data ?? []).map((message) => <div key={message.id} className={`rounded-xl px-3 py-2 text-xs ${message.senderRole === "customer" ? "mr-5 bg-sky-100 text-sky-950" : "ml-5 bg-slate-100 text-slate-800"}`}><p className="font-bold">{message.senderRole === "driver" ? "السائق" : message.senderRole === "restaurant" ? "المطعم" : message.senderRole === "admin" ? "دعم NFOOD" : "أنت"}</p><p className="mt-1 whitespace-pre-wrap leading-5">{message.body}</p></div>)}</div>
    <div className="mt-3 flex items-end gap-2"><Textarea value={body} onChange={(event) => setBody(event.target.value.slice(0, 1000))} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") submit(); }} placeholder="اكتب تعليمات التسليم هنا..." className="min-h-16 rounded-xl border-sky-200 bg-white text-xs" maxLength={1000} /><Button type="button" onClick={submit} disabled={send.isPending || !body.trim()} className="h-10 shrink-0 rounded-xl bg-sky-700"><Send className="ml-1 h-4 w-4" />{send.isPending ? "..." : "إرسال"}</Button></div>
    <p className="mt-2 text-[10px] text-slate-500">اختصار الإرسال: Ctrl+Enter. للمشكلات استخدم الإبلاغ من مركز الدعم.</p>
  </section>;
}
