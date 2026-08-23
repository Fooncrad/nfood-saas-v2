import { useEffect, useState } from "react";
import { Mail, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export type ReceiptSummary = {
  orderId: number;
  paymentStatus: "unpaid" | "paid";
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
  pricing: { subtotal: string; discountPercent: number; discountAmount: string; taxPercent: number; taxAmount: string; total: string; couponCode?: string | null; discountSource?: "default" | "coupon_or_default" };
};

export function ReceiptDeliveryPanel({ restaurantId, receipt }: { restaurantId: number; receipt: ReceiptSummary | null }) {
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [recipient, setRecipient] = useState("");
  const send = trpc.platform.sendReceipt.useMutation({ onSuccess: (result) => { toast.success(result.channel === "email" ? "تم إرسال الإيصال إلى البريد" : "تم إرسال الإيصال برسالة قصيرة"); setRecipient(""); }, onError: (error) => toast.error(`تعذر إرسال الإيصال: ${error.message}`) });
  useEffect(() => { setRecipient(""); }, [receipt?.orderId]);
  if (!receipt) return null;
  const disabled = receipt.paymentStatus !== "paid" || send.isPending;
  return <Card className="mb-5 rounded-2xl border-slate-200 bg-white shadow-sm"><CardHeader className="border-b border-slate-100 px-5 py-4"><CardTitle className="flex items-center gap-2 text-base"><Send className="h-4 w-4 text-[#e76f3c]" />إرسال الإيصال للعميل</CardTitle><p className="mt-1 text-xs leading-6 text-slate-500">يتاح الإرسال بعد تأكيد الدفع. اترك المستلم فارغًا لاستخدام البريد المرتبط بالعميل أو رقم الجوال الموجود في الطلب.</p></CardHeader><CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end"><label className="grid flex-1 gap-2 text-xs font-bold text-slate-700">{channel === "email" ? "البريد الإلكتروني" : "رقم الجوال"}<Input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder={channel === "email" ? "customer@example.com" : "+9665XXXXXXXX"} type={channel === "email" ? "email" : "tel"} dir="ltr" className="rounded-xl" /></label><div className="flex rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setChannel("email")} className={`flex h-9 items-center gap-1 rounded-lg px-3 text-xs font-bold transition ${channel === "email" ? "bg-white text-[#e76f3c] shadow-sm" : "text-slate-500"}`}><Mail className="h-4 w-4" />البريد</button><button type="button" onClick={() => setChannel("sms")} className={`flex h-9 items-center gap-1 rounded-lg px-3 text-xs font-bold transition ${channel === "sms" ? "bg-white text-[#e76f3c] shadow-sm" : "text-slate-500"}`}><MessageSquare className="h-4 w-4" />SMS</button></div><Button disabled={disabled} onClick={() => send.mutate({ restaurantId, orderId: receipt.orderId, channel, recipient: recipient.trim() || undefined })} className="rounded-xl bg-[#111c2e] hover:bg-[#1b2b45]">{send.isPending ? "جارٍ الإرسال..." : "إرسال الآن"}</Button>{receipt.paymentStatus !== "paid" && <p className="text-[11px] font-semibold text-amber-700">أكد الدفع أولًا لتفعيل الإرسال.</p>}</CardContent></Card>;
}
