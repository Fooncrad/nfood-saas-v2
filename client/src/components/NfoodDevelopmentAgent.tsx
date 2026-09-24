import { useMemo, useState } from "react";
import { Activity, Bot, CheckCircle2, Code2, Lightbulb, Search, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";

type AgentArea = "all" | "ux" | "seo" | "performance" | "security";

const AREAS: Record<AgentArea, { ar: string; en: string }> = {
  all: { ar: "فحص شامل", en: "Full scan" },
  ux: { ar: "UI / UX", en: "UI / UX" },
  seo: { ar: "SEO", en: "SEO" },
  performance: { ar: "الأداء", en: "Performance" },
  security: { ar: "الأمان", en: "Security" },
};

const suggestions = [
  { area: "seo", title: "SEO & Indexing", ar: "مراجعة metadata و canonical و Schema و sitemap والصفحات متعددة اللغات.", impact: "High" },
  { area: "performance", title: "Performance", ar: "مراجعة أحجام الحزم والصور والتحميل الكسول ومسارات React الثقيلة.", impact: "High" },
  { area: "ux", title: "Product UX", ar: "فحص التنقل، حالات الخطأ والتحميل، وتناسق الجوال ولوحات التشغيل.", impact: "Medium" },
  { area: "security", title: "Security", ar: "مراجعة حدود الصلاحيات والجلسات ونقاط API الحساسة بدون عرض الأسرار.", impact: "High" },
];

export default function NfoodDevelopmentAgent() {
  const [area, setArea] = useState<AgentArea>("all");
  const [query, setQuery] = useState("");
  const [lastScan, setLastScan] = useState<string | null>(null);
  const visible = useMemo(() => suggestions.filter((item) => (area === "all" || item.area === area) && (!query.trim() || (item.title + item.ar).toLowerCase().includes(query.toLowerCase()))), [area, query]);

  return (
    <section dir="rtl" className="space-y-5 text-slate-100">
      <div className="overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-bl from-[#102641] via-[#0b1d33] to-[#071525] p-5 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20"><Bot className="h-6 w-6" /></span>
            <div><p className="text-[11px] font-black tracking-[.18em] text-orange-400">NFOOD DEVELOPMENT AGENT</p><h2 className="mt-1 text-xl font-black">مساعد تطوير المنصة</h2><p className="mt-1 max-w-2xl text-xs leading-6 text-slate-400">مركز داخلي لمراجعة التطوير وتجميع الاقتراحات التقنية وSEO والأداء والأمان قبل اعتماد أي تغيير على الإنتاج.</p></div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300"><Activity className="h-4 w-4" /> Production branch only</div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/10 px-4"><Search className="h-4 w-4 text-slate-500" /><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="ابحث في اقتراحات التطوير..." className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-slate-600" /></div>
          <button type="button" onClick={()=>setLastScan(new Date().toLocaleTimeString("en-US"))} className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-400"><WandSparkles className="h-4 w-4" /> تشغيل فحص الواجهة</button>
        </div>
        {lastScan && <p className="mt-2 text-[11px] text-emerald-300"><CheckCircle2 className="ms-1 inline h-3.5 w-3.5" /> تم تحديث قائمة الفحص محليًا · {lastScan}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(AREAS) as AgentArea[]).map((key)=><button key={key} type="button" onClick={()=>setArea(key)} className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${area===key?"border-orange-500 bg-orange-500 text-white":"border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}>{AREAS[key].ar}</button>)}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {visible.map((item)=><article key={item.title} className="rounded-2xl border border-white/10 bg-[#0d2038] p-4">
          <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><span className="rounded-xl bg-orange-500/10 p-2 text-orange-400">{item.area==="security"?<ShieldCheck className="h-4 w-4" />:item.area==="seo"?<Sparkles className="h-4 w-4" />:item.area==="performance"?<Code2 className="h-4 w-4" />:<Lightbulb className="h-4 w-4" />}</span><h3 className="text-sm font-black">{item.title}</h3></div><span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-[10px] font-black text-orange-300">{item.impact}</span></div>
          <p className="mt-3 text-xs leading-6 text-slate-400">{item.ar}</p>
        </article>)}
      </div>

      <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-xs leading-6 text-slate-300">
        <strong className="text-sky-300">حدود الأمان:</strong> هذه الشاشة لا تضع مفاتيح GitHub أو OpenAI في المتصفح ولا تنفذ نشرًا مباشرًا من العميل. التنفيذ الآلي يجب أن يمر عبر خادم NFOOD بصلاحيات Admin وسجل تدقيق واختبارات قبل النشر.
      </div>
    </section>
  );
}
