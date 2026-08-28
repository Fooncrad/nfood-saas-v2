import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Download, Eye, FileJson, Languages, RefreshCw, Search, Sparkles, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { detectMenuSourceLanguage } from "@/lib/translationSource";

type LanguageCode = "ar" | "en" | "fr";
type TranslationEntry = { language: LanguageCode; name: string; description?: string; status?: "draft" | "review" | "approved"; confidence?: number; approvedAt?: string };
type TranslationEntity = { id: number; type: "category" | "item" | "addon"; name: string; description?: string | null; translations: TranslationEntry[] };
type TranslationExport = { format: "nfood-translations"; version: 1; restaurantId: number; exportedAt: string; entities: Array<{ id: number; type: TranslationEntity["type"]; name: string; description?: string | null; translations: TranslationEntry[] }> };

function readTranslations(value: string | null | undefined): TranslationEntry[] {
  try { const parsed = value ? JSON.parse(value) : []; return Array.isArray(parsed) ? parsed.filter((entry): entry is TranslationEntry => Boolean(entry && typeof entry.language === "string" && typeof entry.name === "string")) : []; } catch { return []; }
}

export function getTranslationProgress(entities: Array<{ translations: TranslationEntry[] }>, language: LanguageCode) { const total = entities.length; const complete = entities.filter((entity) => entity.translations.some((entry) => entry.language === language && (!entry.status || entry.status === "approved"))).length; return { total, complete, percent: total ? Math.round((complete / total) * 100) : 0 }; }

const languages: Array<{ code: LanguageCode; label: string }> = [{ code: "ar", label: "العربية" }, { code: "en", label: "English" }, { code: "fr", label: "Français" }];
export const TRANSLATION_PAGE_SIZES = [50, 100, 150, 200] as const;
export function getTranslationPagination(totalItems: number, requestedPage: number, pageSize: number) {
  const safePageSize = TRANSLATION_PAGE_SIZES.includes(pageSize as (typeof TRANSLATION_PAGE_SIZES)[number]) ? pageSize : TRANSLATION_PAGE_SIZES[0];
  const pageCount = Math.max(1, Math.ceil(Math.max(0, totalItems) / safePageSize));
  const page = Math.min(Math.max(1, Math.trunc(requestedPage) || 1), pageCount);
  return { page, pageSize: safePageSize, pageCount, startIndex: (page - 1) * safePageSize, endIndex: Math.min(page * safePageSize, Math.max(0, totalItems)) };
}
export function getTranslationPageNumbers(pageCount: number, currentPage: number) {
  const safeCount = Math.max(1, Math.trunc(pageCount) || 1);
  const safePage = Math.min(Math.max(1, Math.trunc(currentPage) || 1), safeCount);
  if (safeCount <= 7) return Array.from({ length: safeCount }, (_, index) => index + 1);
  const pages = new Set([1, safeCount, safePage, safePage - 1, safePage + 1]);
  if (safePage <= 3) [2, 3, 4].forEach((page) => pages.add(page));
  if (safePage >= safeCount - 2) [safeCount - 3, safeCount - 2, safeCount - 1].forEach((page) => pages.add(page));
  return Array.from(pages).filter((page) => page >= 1 && page <= safeCount).sort((left, right) => left - right);
}

export function TranslationReviewPanel({ restaurantId }: { restaurantId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const categories = trpc.platform.menuCategories.useQuery({ restaurantId }, { retry: false, enabled: isOpen });
  const items = trpc.platform.menuItems.useQuery({ restaurantId }, { retry: false, enabled: isOpen });
  const addons = trpc.platform.menuItemAddons.useQuery({ restaurantId }, { retry: false, enabled: isOpen });
  const utils = trpc.useUtils();
  const translationErrors = trpc.platform.translationErrors.useQuery({ restaurantId }, { retry: false, enabled: isOpen });
  const resolveError = trpc.platform.resolveTranslationError.useMutation({ onSuccess: () => void translationErrors.refetch(), onError: (error) => toast.error(error.message || "تعذر تحديث سجل الخطأ") });
  const retryTranslation = trpc.platform.translateMenuEntity.useMutation({ onSuccess: () => { toast.success("تم إنشاء ترجمة جديدة كمسودة"); void categories.refetch(); void items.refetch(); void addons.refetch(); }, onError: (error) => toast.error(error.message || "تعذرت إعادة الترجمة") });
  const approve = trpc.platform.approveMenuTranslation.useMutation({ onSuccess: () => { void categories.refetch(); void items.refetch(); void addons.refetch(); }, onError: (error) => toast.error(error.message || "تعذر اعتماد الترجمة") });
  const updateCategory = trpc.platform.updateMenuCategory.useMutation();
  const updateItem = trpc.platform.updateMenuItem.useMutation();
  const updateAddon = trpc.platform.updateMenuItemAddon.useMutation();
  const importInput = useRef<HTMLInputElement>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("ar");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(TRANSLATION_PAGE_SIZES[0]);
  const [preview, setPreview] = useState<TranslationEntity | null>(null);
  const [importing, setImporting] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const entities = useMemo<TranslationEntity[]>(() => [...(categories.data ?? []).map((entity) => ({ id: entity.id, type: "category" as const, name: entity.name, description: undefined, translations: readTranslations(entity.translationsJson) })), ...(items.data ?? []).map((entity) => ({ id: entity.id, type: "item" as const, name: entity.name, description: undefined, translations: readTranslations(entity.translationsJson) })), ...(addons.data ?? []).map((entity) => ({ id: entity.id, type: "addon" as const, name: entity.name, description: undefined, translations: readTranslations(entity.translationsJson) }))], [categories.data, items.data, addons.data]);
  const filteredEntities = useMemo(() => { const needle = search.trim().toLocaleLowerCase(); if (!needle) return entities; return entities.filter((entity) => `${entity.name} ${entity.description ?? ""} ${entity.translations.map((entry) => `${entry.name} ${entry.description ?? ""}`).join(" ")}`.toLocaleLowerCase().includes(needle)); }, [entities, search]);
  const summary = useMemo(() => languages.map(({ code }) => ({ code, ...getTranslationProgress(entities, code) })), [entities]);
  const pagination = useMemo(() => getTranslationPagination(filteredEntities.length, page, pageSize), [filteredEntities.length, page, pageSize]);
  const visibleEntities = useMemo(() => filteredEntities.slice(pagination.startIndex, pagination.endIndex), [filteredEntities, pagination.startIndex, pagination.endIndex]);
  const pageNumbers = useMemo(() => getTranslationPageNumbers(pagination.pageCount, pagination.page), [pagination.page, pagination.pageCount]);
  useEffect(() => { setPage(1); }, [search, pageSize]);
  useEffect(() => { if (page !== pagination.page) setPage(pagination.page); }, [page, pagination.page]);
  const draftEntities = entities.filter((entity) => entity.translations.some((entry) => entry.status === "draft"));

  const exportJson = () => {
    const payload: TranslationExport = { format: "nfood-translations", version: 1, restaurantId, exportedAt: new Date().toISOString(), entities };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `nfood-translations-${restaurantId}.json`; anchor.click(); URL.revokeObjectURL(url); toast.success("تم تصدير ملف الترجمات بصيغة JSON");
  };

  const importJson = async (file: File) => {
    setImporting(true);
    try {
      const parsed = JSON.parse(await file.text()) as Partial<TranslationExport>;
      if (parsed.format !== "nfood-translations" || parsed.version !== 1 || !Array.isArray(parsed.entities)) throw new Error("صيغة الملف غير مدعومة");
      const allowed = new Map(entities.map((entity) => [`${entity.type}:${entity.id}`, entity]));
      const updates = parsed.entities.filter((entry) => allowed.has(`${entry.type}:${entry.id}`) && Array.isArray(entry.translations));
      if (!updates.length) throw new Error("لا توجد عناصر مطابقة لهذا المطعم");
      for (const entry of updates) {
        const translationsJson = JSON.stringify(entry.translations);
        if (entry.type === "category") await updateCategory.mutateAsync({ restaurantId, id: entry.id, translationsJson });
        else if (entry.type === "item") await updateItem.mutateAsync({ restaurantId, id: entry.id, translationsJson });
        else await updateAddon.mutateAsync({ restaurantId, id: entry.id, translationsJson });
      }
      await utils.platform.menuCategories.invalidate({ restaurantId }); await utils.platform.menuItems.invalidate({ restaurantId }); await utils.platform.menuItemAddons.invalidate({ restaurantId });
      toast.success(`تم استيراد ${updates.length} ترجمة بنجاح`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "تعذر استيراد ملف الترجمات"); }
    finally { setImporting(false); if (importInput.current) importInput.current.value = ""; }
  };

  const retryOne = (entity: TranslationEntity, language: LanguageCode) => { const sourceLanguage = detectMenuSourceLanguage(entity.name); retryTranslation.mutate({ restaurantId, entityType: entity.type, entityId: entity.id, sourceName: entity.name, sourceLanguage, targetLanguage: language, languages: [sourceLanguage, language] }); };
  const approveAll = async () => { if (!draftEntities.length) return toast.info("لا توجد مسودات تحتاج إلى اعتماد"); for (const entity of draftEntities) await approve.mutateAsync({ restaurantId, entityType: entity.type, entityId: entity.id }); toast.success(`تم اعتماد ${draftEntities.length} عنصرًا ونشره`); await utils.platform.menuCategories.invalidate({ restaurantId }); await utils.platform.menuItems.invalidate({ restaurantId }); await utils.platform.menuItemAddons.invalidate({ restaurantId }); };
  const selectedEntry = preview?.translations.find((entry) => entry.language === selectedLanguage);
  const openPreview = (entity: TranslationEntity) => { setPreview(entity); const entry = entity.translations.find((item) => item.language === selectedLanguage); setEditName(entry?.name ?? ""); setEditDescription(entry?.description ?? ""); };
  const saveManualTranslation = async () => { if (!preview || !editName.trim()) return; const next = [...preview.translations.filter((entry) => entry.language !== selectedLanguage), { language: selectedLanguage, name: editName.trim(), description: editDescription.trim(), status: "approved" as const, confidence: 1, approvedAt: new Date().toISOString() }]; const translationsJson = JSON.stringify(next); if (preview.type === "category") await updateCategory.mutateAsync({ restaurantId, id: preview.id, translationsJson }); else if (preview.type === "item") await updateItem.mutateAsync({ restaurantId, id: preview.id, translationsJson }); else await updateAddon.mutateAsync({ restaurantId, id: preview.id, translationsJson }); setPreview({ ...preview, translations: next }); await Promise.all([categories.refetch(), items.refetch(), addons.refetch()]); toast.success("تم حفظ الترجمة واعتمادها يدويًا"); };

  return <Card className="mb-6 overflow-hidden rounded-[28px] border-0 bg-[#151922] text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]" dir="rtl">
    <CardHeader className="border-b border-white/10 bg-gradient-to-l from-[#252b39] to-[#171b24] pb-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#71e6c0]"><Languages className="h-4 w-4" /> مركز ترجمة المنيو</div><CardTitle className="text-xl font-black">أكمل ترجماتك ثم راجعها قبل النشر</CardTitle><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">ابحث في النصوص، بدّل اللغة، أو صدّر ملف JSON وعدّله خارجيًا ثم استورده مرة أخرى.</p></div><div className="flex flex-wrap gap-2"><input ref={importInput} type="file" accept="application/json,.json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importJson(file); }} /><Button type="button" variant="outline" onClick={() => setIsOpen((current) => !current)} className="rounded-xl border-[#f0b35d]/40 bg-[#f0b35d]/10 text-[#f8d79b] hover:bg-[#f0b35d]/20"><ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />{isOpen ? "طي القسم" : "فتح مركز الترجمة"}</Button>{isOpen && <><Button type="button" variant="outline" onClick={() => importInput.current?.click()} disabled={importing} className="rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10"><Upload className="ml-2 h-4 w-4" />{importing ? "جارٍ الاستيراد..." : "استيراد JSON"}</Button><Button type="button" variant="outline" onClick={exportJson} className="rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10"><Download className="ml-2 h-4 w-4" />تصدير JSON</Button><Button type="button" onClick={() => void approveAll()} disabled={approve.isPending || draftEntities.length === 0} className="rounded-xl bg-[#12c99a] font-black text-[#09251f] hover:bg-[#65edc9]"><CheckCircle2 className="ml-2 h-4 w-4" /> موافقة جماعية ({draftEntities.length})</Button></>}</div></div></CardHeader>
    {isOpen && <CardContent className="space-y-5 p-5"><div className="grid gap-3 md:grid-cols-3">{summary.map((entry) => <div key={entry.code} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="flex items-center justify-between"><div><p className="text-lg font-black">{entry.code.toUpperCase()}</p><p className="text-xs text-slate-400">{languages.find((lang) => lang.code === entry.code)?.label}</p></div><span className="text-2xl font-black text-[#71e6c0]">{entry.percent}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#12c99a] transition-all" style={{ width: `${entry.percent}%` }} /></div><p className="mt-2 text-[11px] text-slate-400">{entry.complete} من {entry.total} عناصر مكتملة</p></div>)}</div>
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:flex-row sm:items-center"><div className="relative min-w-0 flex-1"><Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث عن نص أو كلمة محددة..." className="h-10 border-white/10 bg-white/[0.06] pr-9 text-white placeholder:text-slate-500" /></div><div className="flex shrink-0 gap-2 overflow-x-auto" role="tablist" aria-label="لغات الترجمة">{languages.map((language) => <button key={language.code} type="button" role="tab" aria-selected={selectedLanguage === language.code} onClick={() => setSelectedLanguage(language.code)} className={`rounded-xl px-4 py-2.5 text-xs font-black transition ${selectedLanguage === language.code ? "bg-[#f0b35d] text-[#2c1a05]" : "bg-white/[0.06] text-slate-300 hover:bg-white/10"}`}>{language.label}</button>)}</div></div>
      <div className="flex items-center gap-2 rounded-2xl border border-[#f0b35d]/30 bg-[#f0b35d]/10 px-4 py-3 text-sm"><Sparkles className="h-4 w-4 shrink-0 text-[#f0b35d]" /><span className="min-w-0 flex-1">الترجمة الذكية تُحفظ أولًا كمسودة للمراجعة.</span><Badge className="bg-[#f0b35d] text-[#2c1a05]">{draftEntities.length} مسودة</Badge></div>
      <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-right"><div className="flex items-center justify-between gap-3"><div><p className="flex items-center gap-2 text-sm font-black text-red-900"><AlertTriangle className="h-4 w-4" /> سجل أخطاء الترجمة</p><p className="mt-1 text-xs text-red-700">راجع الأخطاء وأعد الترجمة بعد تصحيح المصطلح أو الوصف.</p></div><Badge className="bg-red-600 text-white">{(translationErrors.data ?? []).filter((error) => error.status === "open").length} مفتوح</Badge></div>{(translationErrors.data ?? []).length === 0 ? <p className="mt-3 text-xs text-red-700">لا توجد أخطاء مسجلة.</p> : <div className="mt-3 space-y-2">{(translationErrors.data ?? []).slice(0, 6).map((error) => <div key={error.id} className="flex flex-col gap-2 rounded-xl border border-red-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-xs font-black text-slate-900">{error.sourceName} · {error.targetLanguage.toUpperCase()}</p><p className="mt-1 text-xs text-red-700">{error.errorMessage}</p></div>{error.status === "open" && <Button type="button" size="sm" variant="outline" onClick={() => resolveError.mutate({ restaurantId, id: error.id })} className="shrink-0 rounded-lg border-red-200 text-red-700 hover:bg-red-50">تمت المراجعة</Button>}</div>)}</div>}</div>
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-300">عرض {filteredEntities.length === 0 ? 0 : pagination.startIndex + 1}–{pagination.endIndex} من {filteredEntities.length} نصًا · الصفحة {pagination.page} من {pagination.pageCount}</p><label className="flex items-center gap-2 text-xs font-bold text-slate-300">عدد السجلات في الصفحة<select aria-label="عدد السجلات في الصفحة" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="h-9 rounded-lg border border-white/15 bg-[#1f2633] px-2 text-xs text-white">{TRANSLATION_PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}</select></label></div>
      <div className="space-y-2">{filteredEntities.length === 0 ? <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-10 text-center text-sm text-slate-400">لا توجد نصوص تطابق البحث.</p> : visibleEntities.map((entity, index) => { const rowNumber = pagination.startIndex + index + 1; const entry = entity.translations.find((item) => item.language === selectedLanguage); const approved = entity.translations.filter((item) => item.status === "approved" || !item.status).length; const hasDraft = entity.translations.some((item) => item.status === "draft"); return <div key={`${entity.type}-${entity.id}`} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><span className="mb-2 inline-flex min-w-8 items-center justify-center rounded-lg bg-[#f0b35d] px-2 py-1 text-[11px] font-black text-[#2c1a05]" aria-label={`رقم الصف ${rowNumber}`}>{rowNumber}</span><p className="truncate font-black">{entry?.name || entity.name}</p><p className="mt-1 truncate text-xs text-slate-400">{entity.type === "category" ? "فئة" : entity.type === "item" ? "صنف" : "إضافة"} · {approved}/{languages.length} لغات معتمدة · {entry?.description || "لا يوجد وصف لهذه اللغة"}</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={() => openPreview(entity)} className="rounded-lg border-white/20 bg-transparent text-white hover:bg-white/10"><Eye className="ml-1 h-3.5 w-3.5" /> معاينة</Button>{(hasDraft || !entry) && <Button type="button" size="sm" onClick={() => retryOne(entity, selectedLanguage)} disabled={retryTranslation.isPending} className="rounded-lg bg-[#12c99a] text-[#09251f] hover:bg-[#65edc9]"><RefreshCw className="ml-1 h-3.5 w-3.5" /> إعادة الترجمة</Button>}</div></div>; })}</div>{pagination.pageCount > 1 && <nav aria-label="ترقيم قاموس اللغات" className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3"><Button type="button" variant="outline" size="sm" disabled={pagination.page === 1} onClick={() => setPage(pagination.page - 1)} className="rounded-lg border-white/15 bg-transparent text-xs text-white hover:bg-white/10 disabled:opacity-40"><ChevronRight className="ml-1 h-3.5 w-3.5" />السابق</Button>{pageNumbers.map((pageNumber, index) => <span key={pageNumber} className="flex items-center gap-1.5">{index > 0 && pageNumber > pageNumbers[index - 1] + 1 && <span className="px-1 text-slate-500" aria-hidden="true">…</span>}<button type="button" aria-label={`الصفحة ${pageNumber}`} aria-current={pagination.page === pageNumber ? "page" : undefined} onClick={() => setPage(pageNumber)} className={`h-9 min-w-9 rounded-lg px-2 text-xs font-black transition ${pagination.page === pageNumber ? "bg-[#f0b35d] text-[#2c1a05]" : "bg-white/[0.06] text-slate-300 hover:bg-white/10"}`}>{pageNumber}</button></span>)}<Button type="button" variant="outline" size="sm" disabled={pagination.page === pagination.pageCount} onClick={() => setPage(pagination.page + 1)} className="rounded-lg border-white/15 bg-transparent text-xs text-white hover:bg-white/10">التالي<ChevronLeft className="mr-1 h-3.5 w-3.5" /></Button></nav>}
      {preview && <div className="rounded-2xl border border-[#71e6c0]/30 bg-[#71e6c0]/10 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs text-[#71e6c0]">معاينة قبل النشر · {preview.type === "category" ? "فئة" : preview.type === "item" ? "صنف" : "إضافة"}</p><h3 className="mt-1 font-black">{selectedEntry?.name || preview.name}</h3></div><Button type="button" variant="ghost" onClick={() => setPreview(null)} className="text-white hover:bg-white/10"><X className="ml-1 h-4 w-4" />إغلاق</Button></div><div className="mt-4 rounded-xl bg-black/20 p-4"><div className="flex items-center gap-2 text-xs text-slate-300"><FileJson className="h-4 w-4" /> {selectedLanguage.toUpperCase()}</div><Input value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="اسم الترجمة" className="mt-3 border-white/20 bg-white/10 text-white placeholder:text-slate-400" /><Textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} placeholder="وصف الترجمة" className="mt-2 min-h-20 border-white/20 bg-white/10 text-white placeholder:text-slate-400" /><div className="mt-3 flex items-center justify-between gap-2"><p className="text-[11px] text-slate-400">الحالة الحالية: {selectedEntry?.status === "approved" ? "معتمدة" : "تحتاج مراجعة"}</p><Button type="button" size="sm" onClick={() => void saveManualTranslation()} disabled={!editName.trim() || updateCategory.isPending || updateItem.isPending || updateAddon.isPending} className="rounded-lg bg-[#12c99a] text-[#09251f] hover:bg-[#65edc9]">حفظ واعتماد يدوي</Button></div></div></div>}</CardContent>}</Card>;
}
