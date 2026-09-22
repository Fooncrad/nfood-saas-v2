import { useMemo, useState } from "react";
import { Eye, ImageIcon, Layers3, Save } from "lucide-react";
import { toast } from "sonner";
import { ActivitiesSectorsView, type ActivitySector } from "@/components/ActivitiesSectorsView";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

type SectorDraft = { key: string; labelAr: string; labelEn: string; labelFr: string; coverUrl: string; active: boolean };
const EMPTY_DRAFT: SectorDraft = { key: "", labelAr: "", labelEn: "", labelFr: "", coverUrl: "", active: true };
const fieldClass = "mt-2 border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-[#07111f]";

export default function ActivitiesSectorsAdmin() {
  const { language } = useLanguage();
  const lang: "ar" | "en" | "fr" = language === "fr" ? "fr" : language === "en" ? "en" : "ar";
  const utils = trpc.useUtils();
  const catalog = trpc.admin.sectorCatalog.useQuery(undefined, { retry: 2 });
  const marketplace = trpc.marketplace.adminSectors.useQuery(undefined, { retry: 2 });
  const entities = trpc.admin.getPlatformEntities.useQuery({ filterTab: "orders" }, { retry: 1 });
  const [editorOpen, setEditorOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<SectorDraft>(EMPTY_DRAFT);
  const [preview, setPreview] = useState<ActivitySector | null>(null);

  const sectors = useMemo<ActivitySector[]>(() => {
    const canonical = catalog.data?.sectors ?? [];
    const known = new Set(canonical.map((sector) => sector.key));
    const dynamic = (marketplace.data ?? []).filter((sector) => !known.has(sector.slug)).map((sector) => ({ key: sector.slug, alias: sector.slug, labelAr: sector.labelAr, labelEn: sector.labelEn, labelFr: sector.labelFr, active: Boolean(sector.isActive), entityCount: Number(entities.data?.bySector?.[sector.slug]?.total ?? 0), coverUrl: "", source: "platformEntity" as const }));
    return [...canonical, ...dynamic];
  }, [catalog.data?.sectors, entities.data?.bySector, marketplace.data]);

  const updateCanonical = trpc.admin.updateSectorMeta.useMutation({ onSuccess: async () => { await utils.admin.sectorCatalog.invalidate(); toast.success("تم حفظ بيانات النشاط"); setEditorOpen(false); }, onError: (error) => toast.error(error.message || "تعذر حفظ النشاط") });
  const updateMarketplace = trpc.marketplace.updateSector.useMutation({ onSuccess: async () => { await Promise.all([utils.marketplace.adminSectors.invalidate(), utils.marketplace.publicSectors.invalidate()]); toast.success("تم حفظ بيانات النشاط"); setEditorOpen(false); }, onError: (error) => toast.error(error.message || "تعذر حفظ النشاط") });
  const createSector = trpc.marketplace.createSector.useMutation({ onSuccess: async () => { await Promise.all([utils.marketplace.adminSectors.invalidate(), utils.marketplace.publicSectors.invalidate()]); toast.success("تمت إضافة النشاط الجديد"); setEditorOpen(false); }, onError: (error) => toast.error(error.message || "تعذر إضافة النشاط") });

  const canonicalKeys = useMemo(() => new Set((catalog.data?.sectors ?? []).map((sector) => sector.key)), [catalog.data?.sectors]);
  const getLabel = (sector: ActivitySector) => lang === "ar" ? sector.labelAr : lang === "fr" ? sector.labelFr : sector.labelEn;
  const openAdd = () => { setCreating(true); setDraft(EMPTY_DRAFT); setEditorOpen(true); };
  const openEdit = (sector: ActivitySector) => { setCreating(false); setDraft({ key: sector.key, labelAr: sector.labelAr, labelEn: sector.labelEn, labelFr: sector.labelFr, coverUrl: sector.coverUrl || "", active: sector.active }); setEditorOpen(true); };
  const save = () => {
    if (!draft.labelAr.trim() || !draft.labelEn.trim() || !draft.labelFr.trim()) return toast.error("أكمل أسماء النشاط باللغات الثلاث");
    if (creating) {
      const slug = draft.key.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
      if (slug.length < 2) return toast.error("اكتب رمزًا إنجليزيًا صالحًا للنشاط");
      createSector.mutate({ slug, labelAr: draft.labelAr.trim(), labelEn: draft.labelEn.trim(), labelFr: draft.labelFr.trim(), icon: "store", color: "#f97316" });
    } else if (canonicalKeys.has(draft.key)) updateCanonical.mutate({ sectorKey: draft.key, labelAr: draft.labelAr.trim(), labelEn: draft.labelEn.trim(), labelFr: draft.labelFr.trim(), active: draft.active, coverUrl: draft.coverUrl.trim() });
    else { const row = (marketplace.data ?? []).find((sector) => sector.slug === draft.key); if (!row) return toast.error("تعذر العثور على النشاط"); updateMarketplace.mutate({ id: row.id, labelAr: draft.labelAr.trim(), labelEn: draft.labelEn.trim(), labelFr: draft.labelFr.trim(), isActive: draft.active }); }
  };
  const toggle = (sector: ActivitySector) => { if (canonicalKeys.has(sector.key)) updateCanonical.mutate({ sectorKey: sector.key, labelAr: sector.labelAr, labelEn: sector.labelEn, labelFr: sector.labelFr, active: !sector.active, coverUrl: sector.coverUrl || "" }); else { const row = (marketplace.data ?? []).find((item) => item.slug === sector.key); if (row) updateMarketplace.mutate({ id: row.id, isActive: !sector.active }); } };
  const pending = updateCanonical.isPending || updateMarketplace.isPending || createSector.isPending;

  return <>
    <ActivitiesSectorsView sectors={sectors} lang={lang} getSectorLabel={getLabel} onAdd={openAdd} onEdit={openEdit} onPreview={setPreview} onToggle={toggle} updatePending={pending} notifyPending={false} loading={catalog.isLoading || marketplace.isLoading} usingFallback={catalog.isError || marketplace.isError}/>
    <Dialog open={editorOpen} onOpenChange={setEditorOpen}><DialogContent dir="rtl" className="left-1/2 top-1/2 max-h-[88dvh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-3xl border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-[#0c1828] dark:text-slate-100 sm:w-full"><DialogHeader className="text-right"><DialogTitle className="flex items-center gap-2 text-xl font-black"><Layers3 className="h-5 w-5 text-orange-500"/>{creating ? "إضافة نشاط جديد" : "تعديل النشاط"}</DialogTitle><DialogDescription className="text-slate-600 dark:text-slate-400">الأسماء وحالة الظهور تُحفظ في بيانات المنصة الفعلية.</DialogDescription></DialogHeader><div className="grid gap-4 sm:grid-cols-2">{creating && <label className="text-xs font-bold sm:col-span-2">رمز النشاط بالإنجليزية<Input value={draft.key} onChange={(event)=>setDraft({...draft,key:event.target.value})} placeholder="example-sector" dir="ltr" className={fieldClass}/></label>}<label className="text-xs font-bold">الاسم بالعربية<Input value={draft.labelAr} onChange={(event)=>setDraft({...draft,labelAr:event.target.value})} className={fieldClass}/></label><label className="text-xs font-bold">English name<Input value={draft.labelEn} onChange={(event)=>setDraft({...draft,labelEn:event.target.value})} dir="ltr" className={fieldClass}/></label><label className="text-xs font-bold">Nom français<Input value={draft.labelFr} onChange={(event)=>setDraft({...draft,labelFr:event.target.value})} dir="ltr" className={fieldClass}/></label>{!creating && canonicalKeys.has(draft.key) && <label className="text-xs font-bold">رابط صورة الغلاف<Input value={draft.coverUrl} onChange={(event)=>setDraft({...draft,coverUrl:event.target.value})} placeholder="https://..." dir="ltr" className={fieldClass}/></label>}{!creating && <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-bold dark:border-slate-700 dark:bg-[#07111f] sm:col-span-2"><span>إظهار النشاط في المنصة</span><input type="checkbox" checked={draft.active} onChange={(event)=>setDraft({...draft,active:event.target.checked})} className="h-5 w-5 accent-orange-500"/></label>}</div><DialogFooter className="gap-2 sm:justify-start"><Button onClick={save} disabled={pending} className="gap-2 rounded-xl bg-orange-500 hover:bg-orange-600"><Save className="h-4 w-4"/>{pending ? "جارٍ الحفظ..." : "حفظ"}</Button><Button variant="outline" onClick={()=>setEditorOpen(false)} className="rounded-xl border-slate-300 bg-transparent dark:border-slate-700">إلغاء</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={Boolean(preview)} onOpenChange={(open)=>{ if(!open) setPreview(null); }}><DialogContent dir="rtl" className="overflow-hidden rounded-3xl border-slate-200 bg-white p-0 text-slate-900 dark:border-slate-700 dark:bg-[#0c1828] dark:text-slate-100 sm:max-w-lg"><div className="relative aspect-[16/7] bg-slate-50 dark:bg-[#07111f]">{preview?.coverUrl ? <img src={preview.coverUrl} alt={preview.labelAr} className="h-full w-full object-cover"/> : <div className="grid h-full place-items-center text-slate-400 dark:text-slate-600"><ImageIcon className="h-12 w-12"/></div>}</div><div className="p-6"><DialogHeader className="text-right"><DialogTitle className="flex items-center gap-2 text-xl font-black"><Eye className="h-5 w-5 text-orange-500"/>{preview && getLabel(preview)}</DialogTitle><DialogDescription className="text-slate-600 dark:text-slate-400">{preview?.labelEn} · {preview?.key}</DialogDescription></DialogHeader><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-50 p-4 dark:bg-[#07111f]"><p className="text-2xl font-black">{Number(preview?.entityCount ?? 0).toLocaleString("en-US")}</p><p className="mt-1 text-xs text-slate-600 dark:text-slate-500">إجمالي المسجلين</p></div><div className="rounded-2xl bg-slate-50 p-4 dark:bg-[#07111f]"><p className={preview?.active ? "font-black text-emerald-500 dark:text-emerald-400" : "font-black text-slate-500"}>{preview?.active ? "نشط" : "غير نشط"}</p><p className="mt-1 text-xs text-slate-600 dark:text-slate-500">حالة الظهور</p></div></div></div></DialogContent></Dialog>
  </>;
}
