import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function VcardCardsAdmin() {
  const products = trpc.platform.vcardProducts.useQuery();
  const codes = trpc.platform.vcardCodes.useQuery();
  const requests = trpc.platform.cardRequests.useQuery();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [targetRole, setTargetRole] = useState<"customer" | "restaurant" | "driver">("customer");
  const [code, setCode] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [generated, setGenerated] = useState("");
  const [resultLink, setResultLink] = useState("");
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const refreshRequests = () => void requests.refetch();
  const disable = trpc.platform.disableVcardCode.useMutation({
    onSuccess: () => { void codes.refetch(); toast.success("تم تعطيل الكود"); },
    onError: (error) => toast.error(error.message),
  });
  const create = trpc.platform.createVcardProduct.useMutation({
    onSuccess: () => { void products.refetch(); toast.success("تم حفظ المنتج"); },
    onError: (error) => toast.error(error.message),
  });
  const generate = trpc.platform.generateVcardCode.useMutation({
    onSuccess: (result) => { setGenerated(result.codeLast4); void codes.refetch(); toast.success("تم توليد الكود؛ احفظه مع البطاقة ولا يمكن استرجاعه من النظام"); },
    onError: (error) => toast.error(error.message),
  });
  const review = trpc.platform.reviewCardRequest.useMutation({
    onSuccess: (result) => {
      refreshRequests();
      setReviewingId(null);
      if (result.bindingId) toast.success("تم قبول الطلب وربط المفتاح بملف العميل");
      else toast.success("تم تحديث طلب البطاقة");
    },
    onError: (error) => { setReviewingId(null); toast.error(error.message); },
  });

  const reviewRequest = (id: number, status: "approved" | "rejected", profileSlug?: string | null) => {
    setReviewingId(id);
    if (status === "approved" && profileSlug) {
      setResultLink(`${window.location.origin}/vcard/${encodeURIComponent(profileSlug)}`);
    }
    review.mutate({ id, status, adminNote: status === "rejected" ? "مرفوض من الإدارة" : undefined });
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f8fb] p-5 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#e76f3c]">Super Admin · NFC</p>
            <h1 className="mt-1 text-2xl font-black">مفاتيح وبطاقات NFC</h1>
            <p className="mt-2 text-sm text-slate-500">إدارة المنتجات والأكواد وطلبات العملاء وربط المفتاح بملف العميل.</p>
          </div>
          <Link href="/"><Button variant="outline" className="rounded-xl">العودة للوحة</Button></Link>
        </div>

        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div><CardTitle className="text-base">طلبات بطاقات العملاء</CardTitle><p className="mt-1 text-xs text-slate-500">اختر طلب العميل، ثم اقبل الطلب لربط المفتاح تلقائيًا بملفه.</p></div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{requests.data?.length ?? 0} طلب</span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-right text-sm">
                <thead className="bg-slate-100 text-xs text-slate-500"><tr><th className="p-3">#</th><th className="p-3">العميل / الملف</th><th className="p-3">نوع الطلب</th><th className="p-3">المفتاح</th><th className="p-3">الحالة</th><th className="p-3">الإجراءات</th></tr></thead>
                <tbody>
                  {(requests.data ?? []).map((request) => (
                    <tr key={request.id} className="border-t border-slate-100 align-middle">
                      <td className="p-3 font-mono">{request.id}</td>
                      <td className="p-3"><div className="font-bold">{request.profileDisplayName ?? "عميل بلا ملف"}</div><div className="text-xs text-slate-400">{request.profileSlug ? `/${request.profileSlug}` : "لم يُحدد ملف"}</div></td>
                      <td className="p-3 text-xs">{request.requestType === "print" ? "طباعة بطاقة" : request.requestType}</td>
                      <td className="p-3">{request.bindingId ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">مرتبط</span> : <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">بانتظار الربط</span>}</td>
                      <td className="p-3 text-xs font-bold">{request.status}</td>
                      <td className="p-3"><div className="flex flex-wrap gap-2">{request.status === "pending" && <><Button size="sm" disabled={review.isPending || reviewingId === request.id} onClick={() => reviewRequest(request.id, "approved", request.profileSlug)} className="rounded-lg bg-emerald-600 text-xs">قبول وربط المفتاح</Button><Button size="sm" variant="outline" disabled={review.isPending || reviewingId === request.id} onClick={() => reviewRequest(request.id, "rejected")} className="rounded-lg text-xs text-red-600">رفض</Button></>}{request.bindingId && request.profileSlug && <a href={`/vcard/${encodeURIComponent(request.profileSlug)}`} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#0b65b1]">فتح النتيجة</a>}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(requests.data ?? []).length === 0 && <p className="p-5 text-sm text-slate-500">لا توجد طلبات بطاقات عملاء بعد.</p>}
            {resultLink && <div className="m-4 flex flex-wrap items-center gap-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800"><span className="font-bold">رابط النتيجة بعد الربط:</span><a href={resultLink} target="_blank" rel="noreferrer" className="break-all font-mono underline" dir="ltr">{resultLink}</a></div>}
          </CardContent>
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle className="text-base">إضافة منتج بطاقة</CardTitle></CardHeader><CardContent className="space-y-3"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="اسم البطاقة" className="rounded-xl" /><Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="وصف المنتج" className="rounded-xl" /><div className="grid grid-cols-2 gap-2"><Input value={price} onChange={(event) => setPrice(event.target.value)} placeholder="السعر" className="rounded-xl" dir="ltr" /><select value={targetRole} onChange={(event) => setTargetRole(event.target.value as typeof targetRole)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="customer">Customer</option><option value="restaurant">Restaurant</option><option value="driver">Driver</option></select></div><Button disabled={!name.trim() || create.isPending} onClick={() => create.mutate({ name, description, price, targetRole })} className="w-full rounded-xl bg-[#e76f3c]">حفظ المنتج</Button></CardContent></Card>
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle className="text-base">توليد مفتاح بطاقة</CardTitle></CardHeader><CardContent className="space-y-3"><select value={selectedProductId} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" onChange={(event) => setSelectedProductId(event.target.value)}><option value="">اختر المنتج</option>{products.data?.map((product) => <option key={product.id} value={product.id}>{product.name} · #{product.id}</option>)}</select><Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="كود عشوائي أو مطبوع مسبقًا" className="rounded-xl" dir="ltr" /><p className="text-xs text-slate-500">يحفظ النظام hash فقط، ولا يحتفظ بالكود الخام.</p><Button disabled={!code || !selectedProductId || generate.isPending} onClick={() => generate.mutate({ productId: Number(selectedProductId), code })} className="w-full rounded-xl bg-[#101d31]">توليد المفتاح</Button>{generated && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">آخر أربعة أرقام: {generated}</p>}</CardContent></Card>
        </div>

        <Card className="mt-5 rounded-3xl border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle className="text-base">الأكواد المطبوعة</CardTitle></CardHeader><CardContent>{codes.isLoading ? <p className="text-sm text-slate-500">جارٍ التحميل...</p> : (codes.data ?? []).length === 0 ? <p className="text-sm text-slate-500">لا توجد أكواد بعد.</p> : <div className="space-y-2">{codes.data?.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm"><span>#{item.id} · ****{item.codeLast4}</span><span className="text-xs text-slate-500">{item.status}</span>{item.status === "available" && <Button size="sm" variant="outline" onClick={() => disable.mutate({ id: item.id })} className="rounded-lg text-xs text-red-600">تعطيل</Button>}</div>)}</div>}</CardContent></Card>
      </div>
    </main>
  );
}
