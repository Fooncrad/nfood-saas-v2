import { useEffect, useMemo, useState } from "react";
import { FileClock, ImagePlus, Save, ShieldCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const actionLabels: Record<string, string> = {
  "restaurant.pricing.updated": "تحديث الضرائب والخصومات",
  "receipt.template.updated": "تحديث قالب الإيصال",
  "receipt.logo.updated": "تحديث شعار الإيصال",
  "receipt.delivery.sent": "إرسال إيصال",
  "receipt.delivery.failed": "فشل إرسال إيصال",
};

function readMetadata(raw: string | null) {
  if (!raw) return "";
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    return Object.entries(value).map(([key, item]) => `${key}: ${typeof item === "object" ? JSON.stringify(item) : String(item)}`).join(" · ");
  } catch {
    return raw;
  }
}

export function ReceiptCustomizationPanel({ restaurantId }: { restaurantId: number }) {
  const templateQuery = trpc.platform.receiptTemplate.useQuery({ restaurantId }, { retry: false });
  const auditQuery = trpc.platform.receiptAuditLogs.useQuery({ restaurantId, limit: 60 }, { retry: false });
  const [headerText, setHeaderText] = useState("");
  const [footerText, setFooterText] = useState("شكراً لزيارتكم");
  const [logoPreview, setLogoPreview] = useState("");
  const [pendingLogo, setPendingLogo] = useState<{ fileName: string; contentType: "image/png" | "image/jpeg" | "image/webp"; base64: string } | null>(null);
  const updateTemplate = trpc.platform.updateReceiptTemplate.useMutation({ onSuccess: () => { toast.success("تم حفظ قالب الإيصال وتسجيل التغيير"); void templateQuery.refetch(); void auditQuery.refetch(); }, onError: (error) => toast.error(`تعذر حفظ قالب الإيصال: ${error.message}`) });
  const uploadLogo = trpc.platform.uploadReceiptLogo.useMutation({ onSuccess: (result) => { setLogoPreview(result.logoUrl); setPendingLogo(null); toast.success("تم رفع شعار الإيصال وتسجيل التغيير"); void templateQuery.refetch(); void auditQuery.refetch(); }, onError: (error) => toast.error(`تعذر رفع الشعار: ${error.message}`) });
  useEffect(() => { if (templateQuery.data) { setHeaderText(templateQuery.data.headerText ?? ""); setFooterText(templateQuery.data.footerText ?? "شكراً لزيارتكم"); setLogoPreview(templateQuery.data.logoUrl ?? ""); } }, [templateQuery.data]);
  const auditRows = useMemo(() => auditQuery.data ?? [], [auditQuery.data]);
  const chooseLogo = (file: File) => { if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) { toast.error("اختر صورة PNG أو JPG أو WEBP فقط"); return; } if (file.size > 2 * 1024 * 1024) { toast.error("يجب ألا يتجاوز الشعار 2 ميجابايت"); return; } const reader = new FileReader(); reader.onload = () => { const base64 = typeof reader.result === "string" ? reader.result : ""; if (!base64) return; setPendingLogo({ fileName: file.name, contentType: file.type as "image/png" | "image/jpeg" | "image/webp", base64 }); setLogoPreview(base64); }; reader.readAsDataURL(file); };
  const save = () => updateTemplate.mutate({ restaurantId, headerText: headerText.trim(), footerText: footerText.trim() || "شكراً لزيارتكم", logoUrl: templateQuery.data?.logoUrl ?? undefined });
  const saveLogo = () => { if (!pendingLogo) return; uploadLogo.mutate({ restaurantId, ...pendingLogo }); };
  return <div className="grid gap-5 xl:grid-cols-[1fr_380px]"><Card className="rounded-2xl border-amber-200 bg-gradient-to-br from-amber-50/70 via-white to-white shadow-sm"><CardHeader className="border-b border-amber-100"><div className="flex items-start justify-between gap-3"><div><CardTitle className="flex items-center gap-2 text-base"><ImagePlus className="h-4 w-4 text-amber-600" />تخصيص الإيصال الحراري</CardTitle><p className="mt-1 text-xs leading-6 text-slate-500">خصص رأس الإيصال وتذييله وارفع شعارًا واضحًا. جميع التغييرات تُسجّل في سجل التدقيق باسم المنفّذ ووقتها.</p></div><ShieldCheck className="h-5 w-5 text-emerald-600" /></div></CardHeader><CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_220px]"><div className="space-y-4"><label className="grid gap-2 text-xs font-bold text-slate-700">رسالة الرأس<Input value={headerText} maxLength={240} onChange={(event) => setHeaderText(event.target.value)} placeholder="اسم المطعم أو عبارة ترحيبية" className="rounded-xl bg-white" /></label><label className="grid gap-2 text-xs font-bold text-slate-700">رسالة التذييل<textarea value={footerText} maxLength={240} onChange={(event) => setFooterText(event.target.value)} placeholder="شكراً لزيارتكم" className="min-h-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100" /></label><div className="flex flex-wrap gap-2"><Button disabled={updateTemplate.isPending || templateQuery.isLoading} onClick={save} className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"><Save className="ml-2 h-4 w-4" />{updateTemplate.isPending ? "جارٍ الحفظ..." : "حفظ النصوص"}</Button>{pendingLogo && <Button disabled={uploadLogo.isPending} onClick={saveLogo} variant="outline" className="rounded-xl border-amber-300 text-amber-700"><Upload className="ml-2 h-4 w-4" />{uploadLogo.isPending ? "جارٍ الرفع..." : "حفظ الشعار"}</Button>}</div></div><div className="space-y-3"><div className="flex min-h-44 items-center justify-center rounded-2xl border border-dashed border-amber-200 bg-white p-4"><div className="text-center">{logoPreview ? <img src={logoPreview} alt="معاينة شعار الإيصال" className="mx-auto max-h-28 max-w-[180px] object-contain" /> : <ImagePlus className="mx-auto h-10 w-10 text-slate-300" />}<p className="mt-3 text-[11px] text-slate-500">PNG / JPG / WEBP · حد أقصى 2MB</p></div></div><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"><Upload className="h-4 w-4 text-amber-600" />اختيار شعار<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) chooseLogo(file); event.currentTarget.value = ""; }} /></label></div></CardContent></Card><Card className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardHeader className="border-b border-slate-100"><CardTitle className="flex items-center gap-2 text-base"><FileClock className="h-4 w-4 text-[#e76f3c]" />سجل تغييرات الإيصال</CardTitle><p className="mt-1 text-xs leading-6 text-slate-500">يعرض تغييرات التسعير والقالب والشعار ونتائج إرسال الإيصالات لهذا المطعم فقط.</p></CardHeader><CardContent className="p-0">{auditQuery.isError ? <div className="p-5 text-sm text-red-700">تعذر تحميل سجل التدقيق. <button onClick={() => void auditQuery.refetch()} className="font-bold underline">إعادة المحاولة</button></div> : auditQuery.isLoading ? <div className="space-y-2 p-5"><div className="h-12 animate-pulse rounded-xl bg-slate-100" /><div className="h-12 animate-pulse rounded-xl bg-slate-100" /></div> : auditRows.length === 0 ? <div className="p-6 text-center text-sm text-slate-400">لا توجد تغييرات مسجلة بعد.</div> : <div className="max-h-[470px] divide-y divide-slate-100 overflow-y-auto">{auditRows.map((row) => <div key={row.id} className="p-4"><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-black text-slate-800">{actionLabels[row.action] ?? row.action}</p><p className="mt-1 text-[10px] text-slate-400">{new Date(row.createdAt).toLocaleString("ar-SA")} · {row.actorRole ?? "نظام"}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${row.outcome === "success" ? "bg-emerald-50 text-emerald-700" : row.outcome === "failure" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{row.outcome === "success" ? "نجاح" : row.outcome === "failure" ? "فشل" : "مرفوض"}</span></div><p className="mt-2 break-words text-[10px] leading-5 text-slate-500">{readMetadata(row.metadata)}</p></div>)}</div>}</CardContent></Card></div>;
}
