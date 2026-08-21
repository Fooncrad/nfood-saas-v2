import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function VcardAccountBinding({ role, onClose }: { role: "restaurant" | "driver"; onClose: () => void }) {
  const products = trpc.platform.vcardProducts.useQuery();
  const binding = trpc.platform.myVcardBinding.useQuery();
  const [code, setCode] = useState("");
  const bind = trpc.platform.bindVcardCode.useMutation({ onSuccess: () => { void binding.refetch(); setCode(""); toast.success("تم ربط البطاقة بالحساب"); }, onError: (error) => toast.error(error.message) });
  return <Card className="rounded-3xl border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center justify-between"><span>بطاقة vCard للحساب</span><Button variant="ghost" onClick={onClose}>إغلاق</Button></CardTitle></CardHeader><CardContent className="space-y-4 p-5">{binding.data ? <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">البطاقة مربوطة بالحساب. معرّف الربط: <b>{binding.data.codeId}</b></div> : <><p className="text-sm text-slate-500">هذه الميزة متاحة لهذا النوع بعد تفعيلها من Admin. اختر البطاقة أو أدخل كود البطاقة المطبوعة.</p><div className="grid gap-3 sm:grid-cols-2">{(products.data ?? []).filter((product) => product.targetRole === role).map((product) => <div key={product.id} className="rounded-2xl border border-slate-100 p-4"><p className="font-bold">{product.name}</p><p className="mt-1 text-xs text-slate-500">{product.price} {product.currency}</p><Button disabled className="mt-3 w-full rounded-xl">الشراء عند تفعيل الدفع</Button></div>)}<div className="rounded-2xl border border-dashed border-slate-200 p-4"><p className="font-bold">ربط بطاقة مطبوعة</p><Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="كود البطاقة" dir="ltr" className="mt-3 rounded-xl" /><Button onClick={() => bind.mutate({ code, targetRole: role })} disabled={code.length < 8 || bind.isPending} variant="outline" className="mt-3 w-full rounded-xl">ربط البطاقة</Button></div></div></>}</CardContent></Card>;
}
