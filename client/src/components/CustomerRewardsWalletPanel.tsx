import { useState } from "react";
import { ArrowUpLeft, Coins, FileUp, Loader2, Star, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const topupStatus: Record<string, string> = { pending: "قيد المراجعة", approved: "معتمد", rejected: "مرفوض" };
const acceptedReceiptTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf"] as const;
type Receipt = { base64: string; fileName: string; contentType: (typeof acceptedReceiptTypes)[number] };

export function CustomerRewardsWalletPanel() {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "cash" | "apple_pay">("bank_transfer");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const wallet = trpc.platform.myWallet.useQuery(undefined, { retry: false });
  const engagement = trpc.platform.engagement.useQuery(undefined, { retry: false });
  const utils = trpc.useUtils();
  const topup = trpc.platform.createWalletTopup.useMutation({
    onSuccess: async () => { setAmount(""); setReceipt(null); toast.success("تم تسجيل طلب شحن المحفظة للمراجعة"); await utils.platform.myWallet.invalidate(); },
    onError: (error) => toast.error(error.message),
  });
  const loyalty = engagement.data?.loyalty ?? [];
  const totalPoints = loyalty.reduce((sum, account) => sum + Number(account.pointsBalance ?? 0), 0);
  const numericAmount = Number(amount);
  const canSubmit = Number.isFinite(numericAmount) && numericAmount > 0 && numericAmount <= 1000000 && !topup.isPending;
  const readReceipt = (file: File) => {
    if (!(acceptedReceiptTypes as readonly string[]).includes(file.type)) { toast.error("يسمح برفع PNG أو JPG أو WEBP أو PDF فقط"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("الحد الأقصى للإيصال 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => { const base64 = String(reader.result || ""); if (!base64) { toast.error("تعذر قراءة الإيصال"); return; } setReceipt({ base64, fileName: file.name, contentType: file.type as Receipt["contentType"] }); };
    reader.onerror = () => toast.error("تعذر قراءة ملف الإيصال");
    reader.readAsDataURL(file);
  };
  const submitTopup = () => topup.mutate({ amount: numericAmount, currencyCode: wallet.data?.account?.currencyCode ?? "SAR", paymentMethod, ...(receipt ? { receiptBase64: receipt.base64, receiptFileName: receipt.fileName, receiptContentType: receipt.contentType } : {}) });
  return <section className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]" aria-label="الولاء والمحفظة">
    <Card className="rounded-3xl border-amber-100 bg-gradient-to-br from-amber-50 via-white to-white shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0"><div><CardTitle className="flex items-center gap-2 text-lg"><Star className="h-5 w-5 text-amber-500" />الولاء والنقاط</CardTitle><p className="mt-1 text-xs text-slate-500">نقاطك الفعلية موزعة حسب المطاعم التي شاركت فيها.</p></div><Badge className="rounded-full bg-amber-100 text-amber-800">{totalPoints} نقطة</Badge></CardHeader>
      <CardContent className="space-y-3">
        {engagement.isLoading && <p className="text-sm text-slate-500">جارٍ تحميل رصيد الولاء...</p>}
        {!engagement.isLoading && loyalty.length === 0 && <div className="rounded-2xl border border-dashed border-amber-200 bg-white/70 p-5 text-center text-sm text-slate-500">ستظهر نقاطك بعد إتمام أول طلب مؤهل.</div>}
        {loyalty.map((account) => <div key={account.id} className="flex items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-white/80 px-4 py-3"><div><p className="font-black text-slate-900">{account.restaurantName}</p><p className="mt-1 text-xs text-slate-500">المستوى: {account.tier}</p></div><div className="text-left"><p className="font-black text-amber-700">{account.pointsBalance} نقطة</p><Button type="button" variant="ghost" size="sm" className="mt-1 h-7 px-0 text-xs text-[#e76f3c]" onClick={() => toast.info("يمكن استبدال النقاط من صفحة عروض المطعم عند توفر مكافأة مؤهلة")}>استعراض المكافآت <ArrowUpLeft className="ms-1 h-3.5 w-3.5" /></Button></div></div>)}
      </CardContent>
    </Card>
    <Card className="rounded-3xl border-sky-100 bg-gradient-to-br from-sky-50 via-white to-white shadow-sm">
      <CardHeader className="space-y-1"><CardTitle className="flex items-center gap-2 text-lg"><WalletCards className="h-5 w-5 text-sky-600" />المحفظة المصغرة</CardTitle><p className="text-xs text-slate-500">قدّم طلب شحن يدويًا، وأرفق الإيصال إن كان متاحًا، ثم يتولى الفريق مراجعته قبل إضافة الرصيد.</p></CardHeader>
      <CardContent className="space-y-4"><div className="rounded-2xl bg-slate-950 p-4 text-white"><p className="text-xs text-slate-300">الرصيد المتاح</p><p className="mt-1 text-3xl font-black">{wallet.data?.account?.balance ?? "0.00"} <span className="text-sm font-bold text-slate-300">{wallet.data?.account?.currencyCode ?? "SAR"}</span></p></div><div className="grid gap-2"><label className="text-xs font-black text-slate-700" htmlFor="wallet-topup-amount">قيمة الشحن</label><Input id="wallet-topup-amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="مثال: 100" className="rounded-xl bg-white" /><label className="text-xs font-black text-slate-700" htmlFor="wallet-payment-method">وسيلة الدفع</label><select id="wallet-payment-method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as typeof paymentMethod)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"><option value="bank_transfer">تحويل بنكي</option><option value="cash">دفع نقدي</option><option value="apple_pay">Apple Pay</option></select><label className={`flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-sky-200 bg-white/70 px-3 py-3 text-xs font-bold text-slate-700 transition hover:border-sky-400 ${topup.isPending ? "pointer-events-none opacity-60" : ""}`}><FileUp className="h-4 w-4 text-sky-600" /><span className="min-w-0 flex-1 truncate">{receipt ? `تم اختيار: ${receipt.fileName}` : "إرفاق صورة أو PDF للإيصال (اختياري)"}</span><input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="hidden" disabled={topup.isPending} onChange={(event) => { const file = event.target.files?.[0]; if (file) readReceipt(file); event.currentTarget.value = ""; }} /></label><Button type="button" disabled={!canSubmit} onClick={submitTopup} className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]">{topup.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Coins className="me-2 h-4 w-4" />}إرسال طلب شحن</Button></div><div className="space-y-2"><p className="text-xs font-black text-slate-700">آخر طلبات الشحن</p>{(wallet.data?.topups ?? []).slice(0, 3).map((request) => <div key={request.id} className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2 text-xs"><span>#{request.id} · {request.amount} {request.currencyCode}{request.receiptUrl ? " · إيصال مرفق" : ""}</span><Badge variant="outline" className="rounded-full">{topupStatus[request.status] ?? request.status}</Badge></div>)}{!wallet.isLoading && !(wallet.data?.topups?.length) && <p className="rounded-xl bg-white/70 px-3 py-2 text-xs text-slate-500">لا توجد طلبات شحن بعد.</p>}</div></CardContent>
    </Card>
  </section>;
}

export default CustomerRewardsWalletPanel;
