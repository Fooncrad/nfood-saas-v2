import * as React from "react";
import { ArrowDownUp, Search, Store, Users, ToggleLeft, ToggleRight, Pencil, Eye, MoreVertical, Plus, Layers3 } from "lucide-react";

export type ActivitySector = {
  key: string;
  alias: string;
  labelAr: string;
  labelEn: string;
  labelFr: string;
  active: boolean;
  entityCount: number;
  coverUrl: string;
  source: "platformEntity" | "contentCreators";
};

type Props = {
  sectors: ActivitySector[];
  lang: "ar" | "en" | "fr";
  getSectorLabel: (sector: ActivitySector) => string;
  onAdd: () => void;
  onEdit: (sector: ActivitySector) => void;
  onPreview: (sector: ActivitySector) => void;
  onToggle: (sector: ActivitySector) => void;
  updatePending: boolean;
  notifyPending: boolean;
  loading?: boolean;
  usingFallback?: boolean;
};

export function ActivitiesSectorsView({ sectors, lang, getSectorLabel, onAdd, onEdit, onPreview, onToggle, updatePending, notifyPending, loading = false, usingFallback = false }: Props) {
  const active = sectors.filter((sector) => sector.active).length;
  const inactive = sectors.length - active;
  const registered = sectors.reduce((sum, sector) => sum + Number(sector.entityCount || 0), 0);
  const copy = lang === "ar" ? {
    title: "الأنشطة والقطاعات", subtitle: "إدارة الأنشطة والقطاعات في المنصة مع التحكم في الظهور والتخصيص",
    total: "إجمالي الأنشطة", active: "نشط", inactive: "غير نشط", registered: "إجمالي المسجلين",
    search: "بحث عن نشاط...", all: "كل الحالات", newest: "الأحدث", oldest: "الأقدم", mostRegistered: "الأكثر تسجيلًا",
    add: "إضافة نشاط جديد", edit: "تعديل", preview: "معاينة", registeredLabel: "مسجل",
    tip: "نصيحة", tipText: "يمكنك تخصيص صورة الغلاف لكل نشاط ليظهر بشكل جميل في صفحات الموقع وتطبيقات الجوال.",
    noResults: "لا توجد أنشطة مطابقة للبحث.", statusActive: "نشط", statusInactive: "غير نشط", loading: "جارٍ تحميل بيانات القطاعات الحية...", fallback: "تعذر تحميل البيانات الحية مؤقتًا — تظهر القطاعات الرسمية بدون أرقام مسجلين حتى عودة الاتصال."
  } : {
    title: "Activities & Sectors", subtitle: "Manage platform activities and sectors, visibility and customization",
    total: "Total activities", active: "Active", inactive: "Inactive", registered: "Total registered",
    search: "Search activities...", all: "All statuses", newest: "Newest", oldest: "Oldest", mostRegistered: "Most registered",
    add: "Add new activity", edit: "Edit", preview: "Preview", registeredLabel: "registered",
    tip: "Tip", tipText: "Customize each activity cover image for a polished appearance across the website and mobile apps.",
    noResults: "No activities match your search.", statusActive: "Active", statusInactive: "Inactive", loading: "Loading live sector data...", fallback: "Live data is temporarily unavailable — canonical sectors are shown without registration counts until the connection returns."
  };
  const [query, setQuery] = React.useState("");
  const dataNotice = loading ? copy.loading : usingFallback ? copy.fallback : null;
  const [status, setStatus] = React.useState<"all"|"active"|"inactive">("all");
  const [sort, setSort] = React.useState<"newest"|"oldest"|"registered">("newest");
  const filteredRows = sectors.filter((sector) => {
    const matchesText = getSectorLabel(sector).toLowerCase().includes(query.trim().toLowerCase());
    const matchesStatus = status === "all" || (status === "active" ? sector.active : !sector.active);
    return matchesText && matchesStatus;
  });
  const rows = sort === "registered"
    ? [...filteredRows].sort((left, right) => Number(right.entityCount) - Number(left.entityCount))
    : sort === "oldest" ? [...filteredRows].reverse() : filteredRows;

  return <div className="space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
    <section className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500/10 text-orange-500"><Layers3 size={25}/></span><h1 className="text-2xl font-black text-slate-900 dark:text-white">{copy.title}</h1></div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{copy.subtitle}</p>
      </div>
      <button type="button" onClick={onAdd} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-orange-500 to-orange-600 px-5 text-xs font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-orange-500/30 sm:w-auto"><Plus size={17}/>{copy.add}</button>
    </section>

    {dataNotice && <div className={`rounded-xl border px-4 py-3 text-xs font-bold ${usingFallback ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-sky-500/20 bg-sky-500/10 text-sky-300"}`}>{dataNotice}</div>}

    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {[
        [copy.total, sectors.length, Store, "text-sky-400 bg-sky-500/10"],
        [copy.active, active, ToggleRight, "text-emerald-400 bg-emerald-500/10"],
        [copy.inactive, inactive, ToggleLeft, "text-orange-400 bg-orange-500/10"],
        [copy.registered, registered, Users, "text-violet-400 bg-violet-500/10"],
      ].map(([label,value,Icon,tone]) => { const StatIcon=Icon as typeof Store; return <div key={String(label)} className="rounded-2xl border border-slate-700/60 bg-[#0c1828] p-3 shadow-sm sm:p-4"><div className="flex items-center justify-between gap-2"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl ${tone}`}><StatIcon size={20}/></span><div className="min-w-0 text-end"><p className="text-xl font-black text-white sm:text-2xl">{Number(value).toLocaleString("en-US")}</p><p className="mt-1 truncate text-[10px] font-bold text-slate-400 sm:text-[11px]">{String(label)}</p></div></div></div>})}
    </section>

    <section className="grid gap-3 sm:flex sm:items-center sm:justify-between">
      <div className="grid min-w-0 flex-1 gap-3 sm:flex sm:items-center">
        <div className="relative min-w-0 w-full sm:max-w-sm sm:flex-1"><Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={copy.search} className="h-11 w-full rounded-xl border border-slate-700 bg-[#0c1828] ps-10 pe-3 text-xs text-white outline-none focus:border-orange-500"/></div>
        <select value={status} onChange={(e)=>setStatus(e.target.value as typeof status)} className="h-11 w-full rounded-xl border border-slate-700 bg-[#0c1828] px-4 text-xs font-bold text-slate-200 sm:w-auto"><option value="all">{copy.all}</option><option value="active">{copy.statusActive}</option><option value="inactive">{copy.statusInactive}</option></select>
      </div>
      <label className="relative w-full sm:w-auto">
        <ArrowDownUp size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-500"/>
        <select value={sort} onChange={(event)=>setSort(event.target.value as typeof sort)} aria-label={copy.newest} className="h-11 w-full appearance-none rounded-xl border border-slate-700 bg-[#0c1828] ps-9 pe-8 text-xs font-bold text-slate-300 outline-none focus:border-orange-500 sm:w-auto">
          <option value="newest">{copy.newest}</option><option value="oldest">{copy.oldest}</option><option value="registered">{copy.mostRegistered}</option>
        </select>
      </label>
    </section>

    <section id="sector-grid" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {rows.map((sector) => {
        const label=getSectorLabel(sector);
        return <article key={sector.key} className={`group overflow-hidden rounded-2xl border bg-[#0c1828] shadow-sm transition hover:-translate-y-0.5 hover:border-orange-500/50 ${sector.active ? "border-slate-700/70" : "border-dashed border-slate-700 opacity-80"}`}>
          <div className="relative aspect-[16/7] overflow-hidden bg-[#07111f]">
            {sector.coverUrl ? <img src={sector.coverUrl} alt={label} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"/> : <div className="grid h-full place-items-center text-slate-600"><Store size={36}/></div>}
            <button type="button" onClick={()=>onEdit(sector)} className="absolute end-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur"><MoreVertical size={16}/></button>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate text-sm font-black text-white">{label}</h3><p className="mt-1 truncate text-[10px] text-slate-400">{sector.labelEn || sector.key}</p></div><button type="button" role="switch" aria-checked={sector.active} aria-label={`${sector.active ? copy.statusActive : copy.statusInactive}: ${label}`} onClick={()=>onToggle(sector)} disabled={updatePending || sector.source==="contentCreators"} className={`relative h-6 w-11 shrink-0 rounded-full transition ${sector.active ? "bg-emerald-500" : "bg-slate-600"} disabled:opacity-50`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${sector.active ? "end-1" : "start-1"}`}/></button></div>
            <div className="mt-4 flex items-end justify-between"><div><p className="text-lg font-black text-white">{Number(sector.entityCount).toLocaleString("en-US")}</p><p className="text-[10px] text-slate-400">{copy.registeredLabel}</p></div><span className={`text-[10px] font-black ${sector.active ? "text-emerald-400" : "text-slate-500"}`}>{sector.active ? copy.statusActive : copy.statusInactive}</span></div>
            <div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={()=>onEdit(sector)} className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-700 py-2 text-[10px] font-black text-slate-200 hover:border-orange-500/60"><Pencil size={12}/>{copy.edit}</button><button type="button" onClick={()=>onPreview(sector)} disabled={notifyPending} className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-700 py-2 text-[10px] font-black text-slate-200 hover:border-orange-500/60 disabled:opacity-50"><Eye size={12}/>{copy.preview}</button></div>
          </div>
        </article>;
      })}
      {rows.length===0 && <div className="col-span-full rounded-2xl border border-dashed border-slate-700 bg-[#0c1828] p-10 text-center text-xs text-slate-500">{copy.noResults}</div>}
      <button type="button" onClick={onAdd} className="group min-h-[260px] rounded-2xl border border-dashed border-slate-600 bg-[#0c1828]/55 p-6 text-center transition hover:border-orange-500 hover:bg-orange-500/5">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-dashed border-slate-500 text-slate-400 transition group-hover:border-orange-500 group-hover:bg-orange-500/10 group-hover:text-orange-400"><Plus size={25}/></span>
        <strong className="mt-4 block text-sm text-slate-200">{copy.add}</strong>
        <span className="mt-2 block text-[10px] leading-5 text-slate-500">{lang === "ar" ? "أنشئ قطاعًا جديدًا وحدد اسمه وهويته وحالة ظهوره." : "Create a sector and configure its identity and visibility."}</span>
      </button>
    </section>

    <aside className="flex items-center gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/5 px-5 py-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-400">💡</span><p className="text-xs text-slate-400"><strong className="me-2 text-orange-400">{copy.tip}</strong>{copy.tipText}</p></aside>
  </div>;
}
