import { useState } from "react";
import { DownloadCloud, ExternalLink, Image as ImageIcon, Link2, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Props = { restaurantId: number };

export function MenuImportPanel({ restaurantId }: Props) {
  const [sourceUrl, setSourceUrl] = useState("");
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof trpc.platform.previewMenuImport.useMutation>["mutateAsync"]> extends never ? null : any>(null);
  const previewImport = trpc.platform.previewMenuImport.useMutation({ onError: error => toast.error(`تعذر قراءة المنيو: ${error.message}`) });
  const commitImport = trpc.platform.commitMenuImport.useMutation({ onSuccess: result => toast.success(`تم استيراد ${result.itemsCreated} صنفًا و${result.categoriesCreated} قسمًا`), onError: error => toast.error(`تعذر الاستيراد: ${error.message}`) });
  const runPreview = async () => {
    try { setPreview(await previewImport.mutateAsync({ restaurantId, sourceUrl: sourceUrl.trim() })); } catch { /* toast handled by mutation */ }
  };
  const commit = async () => {
    if (!preview?.items?.length) return;
    await commitImport.mutateAsync({ restaurantId, sourceUrl: preview.sourceUrl, items: preview.items });
  };
  return <Card className="rounded-2xl border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-white shadow-sm dark:border-indigo-500/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
    <CardHeader className="flex flex-row items-center justify-between gap-3"><div><CardTitle className="flex items-center gap-2 text-base font-black"><DownloadCloud className="h-5 w-5 text-indigo-600" />استيراد منيو من موقع خارجي</CardTitle><p className="mt-1 text-xs text-slate-500">ضع رابط المنيو، راجع المعاينة، ثم استورد الأقسام والأصناف والأسعار والصور دفعة واحدة.</p></div><Badge variant="outline">معاينة قبل الحفظ</Badge></CardHeader>
    <CardContent className="space-y-4"><div className="flex flex-col gap-2 sm:flex-row"><div className="relative flex-1"><Link2 className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" /><Input dir="ltr" value={sourceUrl} onChange={event => setSourceUrl(event.target.value)} placeholder="https://restaurant.example/menu" className="rounded-xl pr-9" /></div><Button type="button" onClick={() => void runPreview()} disabled={previewImport.isPending || !sourceUrl.trim()} className="rounded-xl bg-indigo-600 hover:bg-indigo-700">{previewImport.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <UploadCloud className="ml-2 h-4 w-4" />}قراءة المعاينة</Button></div>
      {preview && <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/70"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black">{preview.title || "منيو مستورد"}</p><a href={preview.sourceUrl} target="_blank" rel="noreferrer" dir="ltr" className="mt-1 flex items-center gap-1 break-all text-[11px] text-indigo-700 underline"><ExternalLink className="h-3 w-3" />{preview.sourceUrl}</a></div><div className="flex gap-2 text-xs"><Badge>{preview.categories.length} قسم</Badge><Badge>{preview.items.length} صنف</Badge></div></div>{preview.warnings?.length > 0 && <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{preview.warnings.join(" · ")}</div>}<div className="max-h-80 overflow-auto rounded-xl border border-slate-100"><div className="grid grid-cols-[1.1fr_1.5fr_110px_56px] gap-2 border-b bg-slate-50 p-3 text-[11px] font-black text-slate-600"><span>القسم</span><span>الصنف</span><span>السعر</span><span>صورة</span></div>{preview.items.slice(0, 100).map((item: any, index: number) => <div key={`${item.category}-${item.name}-${index}`} className="grid grid-cols-[1.1fr_1.5fr_110px_56px] items-center gap-2 border-b border-slate-100 p-3 text-xs last:border-0"><span className="truncate">{item.category}</span><span className="truncate font-bold">{item.name}</span><span dir="ltr">{item.price} SAR</span>{item.imageUrl ? <img src={item.imageUrl} alt="" className="h-9 w-9 rounded-lg object-cover" /> : <ImageIcon className="h-4 w-4 text-slate-300" />}</div>)}</div><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-[11px] text-slate-500">تُتجاهل العناصر الموجودة مسبقًا بالاسم داخل القسم، ولا تُحذف أي بيانات حالية.</p><Button type="button" onClick={() => void commit()} disabled={commitImport.isPending || !preview.items.length} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">{commitImport.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <DownloadCloud className="ml-2 h-4 w-4" />}تأكيد الاستيراد دفعة واحدة</Button></div></div>}
    </CardContent>
  </Card>;
}
