import { useState } from "react";
import { ChefHat, CircleAlert, Loader2, Plus, Printer, Save, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type PrinterType = "network" | "usb" | "browser" | "none";

export function KitchenPrinterSettings({ restaurantId }: { restaurantId: number }) {
  const [name, setName] = useState("");
  const [printerName, setPrinterName] = useState("");
  const [printerType, setPrinterType] = useState<PrinterType>("none");
  const [printerAddress, setPrinterAddress] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [ruleLabel, setRuleLabel] = useState("");
  const sections = trpc.platform.listKitchenSections.useQuery({ restaurantId }, { retry: false });
  const rules = trpc.platform.listPrinterRoutingRules.useQuery({ restaurantId }, { retry: false });
  const createSection = trpc.platform.createKitchenSection.useMutation({ onSuccess: () => { toast.success("تم حفظ قسم المطبخ"); setName(""); setPrinterName(""); setPrinterAddress(""); setPrinterType("none"); sections.refetch(); }, onError: (error) => toast.error(error.message || "تعذر حفظ القسم") });
  const createRule = trpc.platform.createPrinterRoutingRule.useMutation({ onSuccess: () => { toast.success("تم حفظ قاعدة التوجيه"); setRuleLabel(""); rules.refetch(); }, onError: (error) => toast.error(error.message || "تعذر حفظ قاعدة التوجيه") });

  const saveSection = () => {
    if (name.trim().length < 2) { toast.error("اكتب اسم القسم أولاً"); return; }
    createSection.mutate({ restaurantId, name: name.trim(), printerName: printerName.trim() || undefined, printerType, printerAddress: printerAddress.trim() || undefined });
  };
  const saveRule = () => {
    if (!selectedSectionId) { toast.error("اختر قسم المطبخ أولاً"); return; }
    createRule.mutate({ restaurantId, kitchenSectionId: selectedSectionId, priority: 0, categoryId: null, menuItemId: null });
  };
  const printerLabel = (value: PrinterType) => ({ network: "شبكة", usb: "USB", browser: "طباعة المتصفح", none: "غير موصل" }[value]);

  return <section className="mt-6 space-y-4" dir="rtl">
    <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#e76f3c]"><Settings2 className="h-5 w-5" /></div><div><h3 className="text-lg font-bold">أقسام المطبخ والطابعات</h3><p className="text-xs text-slate-500">أنشئ أقساماً مثل الساخن والبار والحلويات، ثم اربط كل قسم بمسار الطباعة المناسب.</p></div></div>
    <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
      <Card className="rounded-2xl border-slate-200 shadow-sm"><CardHeader className="border-b border-slate-100"><CardTitle className="flex items-center gap-2 text-sm"><ChefHat className="h-4 w-4 text-[#e76f3c]" /> قسم جديد</CardTitle></CardHeader><CardContent className="space-y-3 p-5">
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="اسم القسم: المطبخ الساخن" aria-label="اسم قسم المطبخ" />
        <div className="grid gap-3 sm:grid-cols-2"><Input value={printerName} onChange={(event) => setPrinterName(event.target.value)} placeholder="اسم الطابعة" aria-label="اسم الطابعة" /><select value={printerType} onChange={(event) => setPrinterType(event.target.value as PrinterType)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="none">غير موصل</option><option value="network">طابعة شبكة</option><option value="usb">USB</option><option value="browser">طباعة المتصفح</option></select></div>
        <Input value={printerAddress} onChange={(event) => setPrinterAddress(event.target.value)} placeholder="عنوان الطابعة أو IP — اختياري" aria-label="عنوان الطابعة" />
        <Button onClick={saveSection} disabled={createSection.isPending} className="w-full rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"><Save className="ml-2 h-4 w-4" />{createSection.isPending ? "جارٍ الحفظ..." : "حفظ القسم والطابعة"}</Button>
      </CardContent></Card>
      <Card className="rounded-2xl border-slate-200 shadow-sm"><CardHeader className="border-b border-slate-100"><CardTitle className="flex items-center gap-2 text-sm"><Printer className="h-4 w-4 text-[#e76f3c]" /> الأقسام المحفوظة</CardTitle></CardHeader><CardContent className="p-4">
        {sections.isLoading ? <div className="flex items-center gap-2 p-5 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />جارٍ تحميل الأقسام...</div> : sections.isError ? <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-xs text-red-700"><CircleAlert className="mt-0.5 h-4 w-4" />تعذر تحميل الأقسام. Request ID: kitchen-sections-{restaurantId}</div> : sections.data?.length ? <div className="space-y-2">{sections.data.map((section) => <button key={section.id} onClick={() => setSelectedSectionId(section.id)} className={`flex w-full items-center justify-between rounded-xl border p-3 text-right transition ${selectedSectionId === section.id ? "border-[#e76f3c] bg-orange-50" : "border-slate-100 bg-slate-50/70 hover:border-orange-200"}`}><span><span className="block text-sm font-bold">{section.name}</span><span className="mt-1 block text-[11px] text-slate-500">{section.printerName || "بدون طابعة"}{section.printerAddress ? ` · ${section.printerAddress}` : ""}</span></span><Badge variant="outline" className="rounded-lg text-[10px]">{printerLabel(section.printerType as PrinterType)}</Badge></button>)}</div> : <div className="py-8 text-center text-sm text-slate-500"><Printer className="mx-auto mb-2 h-7 w-7 text-slate-300" />لا توجد أقسام بعد. أضف أول قسم للمطبخ.</div>}
      </CardContent></Card>
    </div>
    <Card className="rounded-2xl border-slate-200 shadow-sm"><CardHeader className="border-b border-slate-100"><CardTitle className="flex items-center gap-2 text-sm"><Plus className="h-4 w-4 text-[#e76f3c]" /> قاعدة توجيه جديدة</CardTitle></CardHeader><CardContent className="space-y-3 p-5"><p className="text-xs text-slate-500">اختر القسم الذي يستقبل التذكرة. ربط الصنف أو التصنيف سيظهر في شاشة المنيو بعد استكمال واجهة التعيين.</p><div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><select value={selectedSectionId ?? ""} onChange={(event) => setSelectedSectionId(event.target.value ? Number(event.target.value) : null)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="">اختر قسم المطبخ</option>{(sections.data ?? []).map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}</select><Input value={ruleLabel} onChange={(event) => setRuleLabel(event.target.value)} placeholder="وصف القاعدة (اختياري)" aria-label="وصف قاعدة التوجيه" /><Button onClick={saveRule} disabled={createRule.isPending} className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]">{createRule.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة"}</Button></div>{rules.isError ? <p className="text-xs text-red-600">تعذر تحميل قواعد التوجيه. Request ID: printer-rules-{restaurantId}</p> : <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">{rules.data?.length ? rules.data.map((rule) => <div key={rule.id} className="flex items-center justify-between px-4 py-3 text-xs"><span>قاعدة #{rule.id} · قسم {rule.kitchenSectionId}{ruleLabel ? ` · ${ruleLabel}` : ""}</span><span className="text-emerald-600">مفعّلة</span></div>) : <p className="px-4 py-5 text-center text-xs text-slate-500">لا توجد قواعد بعد.</p>}</div>}</CardContent></Card>
  </section>;
}

export default KitchenPrinterSettings;
