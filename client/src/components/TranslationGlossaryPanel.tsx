import { useState } from "react";
import { BookOpen, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type TermType = "brand" | "dish" | "ingredient" | "modifier" | "other";
const termTypes: Array<{ value: TermType; label: string }> = [
  { value: "brand", label: "علامة تجارية" },
  { value: "dish", label: "طبق خاص" },
  { value: "ingredient", label: "مكوّن" },
  { value: "modifier", label: "إضافة" },
  { value: "other", label: "أخرى" },
];

export function TranslationGlossaryPanel({ restaurantId }: { restaurantId: number }) {
  const utils = trpc.useUtils();
  const glossary = trpc.platform.translationGlossary.useQuery({ restaurantId }, { retry: false });
  const save = trpc.platform.upsertTranslationGlossary.useMutation({ onSuccess: async () => { await utils.platform.translationGlossary.invalidate({ restaurantId }); reset(); toast.success("تم حفظ المصطلح المحمي"); }, onError: (error) => toast.error(error.message || "تعذر حفظ المصطلح") });
  const remove = trpc.platform.deleteTranslationGlossary.useMutation({ onSuccess: async () => { await utils.platform.translationGlossary.invalidate({ restaurantId }); toast.success("تم حذف المصطلح"); }, onError: (error) => toast.error(error.message || "تعذر حذف المصطلح") });
  const [editingId, setEditingId] = useState<number | undefined>();
  const [sourceTerm, setSourceTerm] = useState("");
  const [translatedTerm, setTranslatedTerm] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("ar");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [termType, setTermType] = useState<TermType>("dish");
  const [isProtected, setIsProtected] = useState(true);
  const reset = () => { setEditingId(undefined); setSourceTerm(""); setTranslatedTerm(""); setSourceLanguage("ar"); setTargetLanguage("en"); setTermType("dish"); setIsProtected(true); };
  const submit = () => save.mutate({ id: editingId, restaurantId, sourceLanguage: sourceLanguage as "ar" | "en" | "fr" | "ur", targetLanguage: targetLanguage as "ar" | "en" | "fr" | "ur", sourceTerm, translatedTerm, termType, isProtected });
  return <Card className="rounded-2xl border-slate-200 bg-white shadow-sm" dir="rtl">
    <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3"><div><CardTitle className="flex items-center gap-2 text-base font-black text-slate-900"><BookOpen className="h-4 w-4 text-emerald-600" /> قاموس المصطلحات المحمي</CardTitle><p className="mt-1 text-xs text-slate-500">يحافظ على أسماء العلامات والأطباق الخاصة من الترجمة الحرفية الخاطئة.</p></div><Button type="button" variant="outline" size="sm" onClick={reset} className="rounded-lg"><Plus className="ml-1 h-3.5 w-3.5" /> مصطلح جديد</Button></CardHeader>
    <CardContent className="space-y-4"><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6"><Input value={sourceTerm} onChange={(event) => setSourceTerm(event.target.value)} placeholder="المصطلح الأصلي" className="lg:col-span-2" /><Input value={translatedTerm} onChange={(event) => setTranslatedTerm(event.target.value)} placeholder="الترجمة المحمية" className="lg:col-span-2" /><select value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-2 text-xs"><option value="ar">من العربية</option><option value="en">من الإنجليزية</option><option value="fr">من الفرنسية</option><option value="ur">من الأردية</option></select><select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-2 text-xs"><option value="en">إلى الإنجليزية</option><option value="ar">إلى العربية</option><option value="fr">إلى الفرنسية</option><option value="ur">إلى الأردية</option></select><select value={termType} onChange={(event) => setTermType(event.target.value as TermType)} className="h-10 rounded-md border border-slate-200 bg-white px-2 text-xs">{termTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select><label className="flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs text-slate-600"><input type="checkbox" checked={isProtected} onChange={(event) => setIsProtected(event.target.checked)} /> حماية إجبارية</label><Button type="button" onClick={submit} disabled={save.isPending || !sourceTerm.trim() || !translatedTerm.trim()} className="rounded-lg bg-emerald-600 hover:bg-emerald-700">{editingId ? "تحديث المصطلح" : "حفظ المصطلح"}</Button></div>
      <div className="grid gap-2 md:grid-cols-2">{(glossary.data ?? []).map((entry) => <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="min-w-0"><p className="truncate text-sm font-black text-slate-800">{entry.sourceTerm} <span className="font-normal text-slate-400">→</span> {entry.translatedTerm}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500"><ShieldCheck className="h-3 w-3 text-emerald-600" /> {entry.sourceLanguage.toUpperCase()} → {entry.targetLanguage.toUpperCase()} · {termTypes.find((type) => type.value === entry.termType)?.label}</p></div><div className="flex shrink-0 gap-1"><Button type="button" size="icon" variant="ghost" onClick={() => { setEditingId(entry.id); setSourceTerm(entry.sourceTerm); setTranslatedTerm(entry.translatedTerm); setSourceLanguage(entry.sourceLanguage); setTargetLanguage(entry.targetLanguage); setTermType(entry.termType as TermType); setIsProtected(entry.isProtected); }} aria-label="تعديل المصطلح"><Pencil className="h-4 w-4" /></Button><Button type="button" size="icon" variant="ghost" onClick={() => remove.mutate({ restaurantId, id: entry.id })} aria-label="حذف المصطلح"><Trash2 className="h-4 w-4 text-red-500" /></Button></div></div>)}</div>{glossary.data?.length === 0 && <p className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-500">لا توجد مصطلحات محمية بعد.</p>}</CardContent>
  </Card>;
}
