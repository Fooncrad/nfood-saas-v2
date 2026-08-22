import { useMemo, useState } from "react";
import { CheckCircle2, Eye, Languages, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type LanguageCode = "ar" | "en" | "fr";
type TranslationEntry = { language: string; name: string; description?: string; status?: "draft" | "approved"; approvedAt?: string };

function readTranslations(value: string | null | undefined): TranslationEntry[] {
  try { const parsed = value ? JSON.parse(value) : []; return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}

export function getTranslationProgress(entities: Array<{ translations: TranslationEntry[] }>, language: LanguageCode) { const total = entities.length; const complete = entities.filter((entity) => entity.translations.some((entry) => entry.language === language && (!entry.status || entry.status === "approved"))).length; return { total, complete, percent: total ? Math.round((complete / total) * 100) : 0 }; }

const languages: Array<{ code: LanguageCode; label: string }> = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

export function TranslationReviewPanel({ restaurantId }: { restaurantId: number }) {
  const categories = trpc.platform.menuCategories.useQuery({ restaurantId }, { retry: false });
  const items = trpc.platform.menuItems.useQuery({ restaurantId }, { retry: false });
  const utils = trpc.useUtils();
  const [preview, setPreview] = useState<{ name: string; description?: string; entries: TranslationEntry[] } | null>(null);
  const approve = trpc.platform.approveMenuTranslation.useMutation({ onSuccess: () => { void categories.refetch(); void items.refetch(); }, onError: (error) => toast.error(error.message || "تعذر اعتماد الترجمة") });
  const entities = useMemo(() => [
    ...(categories.data ?? []).map((entity) => ({ id: entity.id, type: "category" as const, name: entity.name, translations: readTranslations(entity.translationsJson) })),
    ...(items.data ?? []).map((entity) => ({ id: entity.id, type: "item" as const, name: entity.name, translations: readTranslations(entity.translationsJson) })),
  ], [categories.data, items.data]);
  const summary = useMemo(() => languages.map(({ code }) => ({ code, ...getTranslationProgress(entities, code) })), [entities]);
  const draftEntities = entities.filter((entity) => entity.translations.some((entry) => entry.status === "draft"));
  const approveOne = (entity: (typeof entities)[number]) => approve.mutate({ restaurantId, entityType: entity.type, entityId: entity.id });
  const approveAll = async () => { if (!draftEntities.length) return toast.info("لا توجد مسودات تحتاج إلى اعتماد"); for (const entity of draftEntities) await approve.mutateAsync({ restaurantId, entityType: entity.type, entityId: entity.id }); toast.success(`تم اعتماد ${draftEntities.length} عنصرًا ونشره`); await utils.platform.menuCategories.invalidate({ restaurantId }); await utils.platform.menuItems.invalidate({ restaurantId }); };
  return <Card className="mb-6 overflow-hidden rounded-[28px] border-0 bg-[#151922] text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]" dir="rtl"><CardHeader className="border-b border-white/10 bg-gradient-to-l from-[#252b39] to-[#171b24] pb-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#71e6c0]"><Languages className="h-4 w-4" /> مركز ترجمة المنيو</div><CardTitle className="text-xl font-black">أكمل ترجماتك ثم راجعها قبل النشر</CardTitle><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">تابع اكتمال كل لغة، افتح المعاينة العامة، ثم اعتمد المسودات دفعة واحدة لتظهر للزوار.</p></div><Button type="button" onClick={() => void approveAll()} disabled={approve.isPending || draftEntities.length === 0} className="rounded-xl bg-[#12c99a] font-black text-[#09251f] hover:bg-[#65edc9]"><CheckCircle2 className="ml-2 h-4 w-4" /> موافقة جماعية ({draftEntities.length})</Button></div></CardHeader><CardContent className="space-y-5 p-5"><div className="grid gap-3 md:grid-cols-3">{summary.map((entry) => <div key={entry.code} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="flex items-center justify-between"><div><p className="text-lg font-black">{entry.code.toUpperCase()}</p><p className="text-xs text-slate-400">{languages.find((lang) => lang.code === entry.code)?.label}</p></div><span className="text-2xl font-black text-[#71e6c0]">{entry.percent}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#12c99a] transition-all" style={{ width: `${entry.percent}%` }} /></div><p className="mt-2 text-[11px] text-slate-400">{entry.complete} من {entry.total} عناصر مكتملة</p></div>)}</div><div className="flex items-center justify-between gap-3 rounded-2xl border border-[#f0b35d]/30 bg-[#f0b35d]/10 px-4 py-3 text-sm"><span><Sparkles className="ml-2 inline h-4 w-4 text-[#f0b35d]" />الترجمة الذكية تُحفظ أولًا كمسودة للمراجعة.</span><Badge className="bg-[#f0b35d] text-[#2c1a05]">{draftEntities.length} مسودة</Badge></div><div className="space-y-2">{entities.slice(0, 12).map((entity) => { const approved = entity.translations.filter((entry) => entry.status === "approved" || !entry.status).length; const hasDraft = entity.translations.some((entry) => entry.status === "draft"); return <div key={`${entity.type}-${entity.id}`} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate font-black">{entity.name}</p><p className="mt-1 text-xs text-slate-400">{entity.type === "category" ? "فئة" : "صنف"} · {approved}/{languages.length} لغات معتمدة</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={() => setPreview({ name: entity.name, entries: entity.translations })} className="rounded-lg border-white/20 bg-transparent text-white hover:bg-white/10"><Eye className="ml-1 h-3.5 w-3.5" /> معاينة</Button>{hasDraft && <Button type="button" size="sm" onClick={() => approveOne(entity)} disabled={approve.isPending} className="rounded-lg bg-[#12c99a] text-[#09251f] hover:bg-[#65edc9]"><CheckCircle2 className="ml-1 h-3.5 w-3.5" /> اعتماد</Button>}</div></div>; })}</div>{entities.length > 12 && <p className="text-center text-xs text-slate-400">تظهر أول 12 عنصرًا هنا؛ استخدم جدول المنيو لإدارة بقية العناصر.</p>}{preview && <div className="rounded-2xl border border-[#71e6c0]/30 bg-[#71e6c0]/10 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs text-[#71e6c0]">معاينة قبل النشر</p><h3 className="mt-1 font-black">{preview.name}</h3></div><Button type="button" variant="ghost" onClick={() => setPreview(null)} className="text-white hover:bg-white/10">إغلاق</Button></div><div className="mt-4 grid gap-3 md:grid-cols-3">{preview.entries.map((entry) => <div key={entry.language} className="rounded-xl bg-black/20 p-3"><div className="flex items-center justify-between"><span className="text-xs font-black">{entry.language.toUpperCase()}</span><Badge className={entry.status === "draft" ? "bg-[#f0b35d] text-[#2c1a05]" : "bg-[#12c99a] text-[#09251f]"}>{entry.status === "draft" ? "مسودة" : "معتمدة"}</Badge></div><p className="mt-3 font-bold">{entry.name}</p><p className="mt-1 text-xs leading-5 text-slate-300">{entry.description || "لا يوجد وصف"}</p></div>)}</div></div>}</CardContent></Card>;
}
