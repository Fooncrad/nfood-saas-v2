import { useState } from "react";
import { Check, Eye, Loader2, WalletCards, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const statusLabel: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "معتمد",
  rejected: "مرفوض",
};

export function WalletTopupReviewPanel() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [noteById, setNoteById] = useState<Record<number, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const query = trpc.platform.walletTopups.useQuery({ status }, { retry: false });
  const utils = trpc.useUtils();
  const review = trpc.platform.reviewWalletTopup.useMutation({
    onSuccess: async () => {
      toast.success("تم تحديث حالة طلب الشحن وإبلاغ العميل");
      await query.refetch();
      await utils.platform.myWallet.invalidate();
    },
    onError: error => toast.error(`تعذر تحديث طلب الشحن: ${error.message}`),
  });
  const rows = query.data ?? [];
  return (
    <Card className="rounded-2xl border-sky-100 bg-white shadow-sm" dir="rtl">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base"><WalletCards className="h-5 w-5 text-sky-600" />مراجعة شحن المحافظ</CardTitle>
          <p className="mt-1 text-xs text-slate-500">اعتمد الشحن بعد التحقق من التحويل؛ لا يضاف الرصيد قبل الاعتماد.</p>
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          {(["pending", "approved", "rejected"] as const).map(value => <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${status === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{statusLabel[value]}</button>)}
        </div>
      </CardHeader>
      <CardContent>
        {query.isLoading ? <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />جارٍ تحميل الطلبات...</div> : query.isError ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">تعذر تحميل طلبات الشحن. <button className="font-bold underline" onClick={() => void query.refetch()}>إعادة المحاولة</button></div> : rows.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">لا توجد طلبات في هذه الحالة.</div> : <div className="space-y-2">{rows.map(row => <div key={row.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 md:grid-cols-[1fr_auto] md:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-black text-slate-900">#{row.id} · {row.customerName || "عميل"}</p><Badge variant="outline" className="rounded-full">{statusLabel[row.status] ?? row.status}</Badge></div><p className="mt-1 text-xs text-slate-500">{row.customerEmail || "بدون بريد"} · {row.amount} {row.currencyCode} · {row.paymentMethod === "bank_transfer" ? "تحويل بنكي" : row.paymentMethod === "apple_pay" ? "Apple Pay" : "نقدي"}</p>{row.reviewNote && <p className="mt-1 text-xs text-rose-700">ملاحظة: {row.reviewNote}</p>}</div><div className="flex flex-wrap items-center justify-end gap-2">{row.receiptUrl && <Button type="button" variant="outline" size="sm" className="h-8 rounded-lg" onClick={() => setPreviewUrl(row.receiptUrl)}><Eye className="me-1 h-3.5 w-3.5" />الإيصال</Button>}{status === "pending" && <><Input value={noteById[row.id] ?? ""} onChange={event => setNoteById(current => ({ ...current, [row.id]: event.target.value }))} placeholder="ملاحظة اختيارية" className="h-8 w-36 rounded-lg bg-white text-xs" /><Button type="button" size="sm" className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700" disabled={review.isPending} onClick={() => review.mutate({ id: row.id, status: "approved", reviewNote: noteById[row.id]?.trim() || null })}><Check className="me-1 h-3.5 w-3.5" />اعتماد</Button><Button type="button" size="sm" variant="outline" className="h-8 rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50" disabled={review.isPending} onClick={() => review.mutate({ id: row.id, status: "rejected", reviewNote: noteById[row.id]?.trim() || null })}><X className="me-1 h-3.5 w-3.5" />رفض</Button></>}</div></div>)}</div>}
      </CardContent>
      {previewUrl && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" onClick={() => setPreviewUrl(null)}><div className="max-h-[90vh] max-w-3xl rounded-2xl bg-white p-3 shadow-2xl" onClick={event => event.stopPropagation()}><div className="mb-2 flex justify-end"><Button type="button" variant="ghost" size="sm" onClick={() => setPreviewUrl(null)}>إغلاق</Button></div><img src={previewUrl} alt="إيصال التحويل" className="max-h-[78vh] max-w-full rounded-xl object-contain" /></div></div>}
    </Card>
  );
}

export default WalletTopupReviewPanel;
