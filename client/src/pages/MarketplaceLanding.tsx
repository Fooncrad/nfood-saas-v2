import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { marketplaceCopy, marketplaceCountries, sectorMeta } from "@/lib/marketplaceExperience";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe2, Search, Store, ArrowUpLeft, Languages, Smartphone, ShieldCheck, MapPin, Phone, MessageCircle, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

export default function MarketplaceLanding() {
  const { language, setLanguage, direction } = useLanguage();
  const lang = language === "fr" ? "fr" : language === "en" ? "en" : "ar";
  const copy = marketplaceCopy(lang);
  const [country, setCountry] = useState(() => localStorage.getItem("nfood-market-country") || "SA");
  const [search, setSearch] = useState("");
  const sectors = trpc.marketplace.publicSectors.useQuery(undefined, { retry: false });
  const stores = trpc.marketplace.publicStores.useQuery({ countryCode: country, search: search.trim() || undefined }, { retry: false });
  const countryInfo = marketplaceCountries.find((item) => item.code === country) ?? marketplaceCountries[0];
  const sectorRows = sectors.data ?? [];
  const storeRows = stores.data ?? [];
  const storesBySector = useMemo(() => sectorRows.map((sector) => ({ sector, stores: storeRows.filter((store) => { const slug = sector.slug === "restaurants" ? "restaurant" : sector.slug; return store.sector === slug || store.sector === sector.slug; }).slice(0, 4) })).filter((group) => group.stores.length), [sectorRows, storeRows]);
  const filteredSectors = useMemo(() => sectorRows.filter((s) => !search.trim() || `${s.labelAr} ${s.labelEn} ${s.labelFr}`.toLowerCase().includes(search.toLowerCase())), [sectorRows, search]);

  function chooseCountry(code: string) {
    setCountry(code);
    localStorage.setItem("nfood-market-country", code);
  }

  return <main dir={direction} className="min-h-screen bg-[#080b12] text-white selection:bg-orange-400/30">
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#080b12]/85 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-xl font-black shadow-lg shadow-orange-950/30">N</span><span><b className="block tracking-[.18em]">NFOOD</b><small className="text-[9px] uppercase tracking-[.24em] text-slate-500">Global Marketplace</small></span></Link>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setLanguage(lang === "ar" ? "en" : lang === "en" ? "fr" : "ar")} className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-bold"><Languages className="h-4 w-4"/>{lang.toUpperCase()}</button>
          <Link href="/login"><Button variant="ghost" className="rounded-xl text-slate-200">{copy.login}</Button></Link>
          <Link href="/store-marketing"><Button className="hidden rounded-xl bg-white text-[#0b0f17] hover:bg-slate-100 sm:inline-flex">{copy.merchant}</Button></Link>
        </div>
      </div>
    </header>

    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(249,115,22,.20),transparent_34%),radial-gradient(circle_at_5%_40%,rgba(14,165,233,.10),transparent_28%)]"/>
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-12 md:px-8 md:pb-16 md:pt-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-xs font-bold text-orange-200"><Globe2 className="h-4 w-4"/>{copy.discover} · {countryInfo.flag} {countryInfo[lang]}</div>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.08] tracking-tight md:text-7xl">{copy.title}</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 md:text-lg md:leading-8">{copy.subtitle}</p>

        <div className="mt-8 grid max-w-4xl gap-3 rounded-[28px] border border-white/10 bg-white/[.055] p-3 shadow-2xl shadow-black/30 backdrop-blur-xl md:grid-cols-[220px_1fr]">
          <div className="relative">
            <label className="mb-1.5 block px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">{copy.country}</label>
            <select value={country} onChange={e=>chooseCountry(e.target.value)} className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-[#111722] px-4 text-sm font-black text-white outline-none">
              {marketplaceCountries.map(c=><option key={c.code} value={c.code}>{c.flag} {c[lang]}</option>)}
            </select>
          </div>
          <div className="relative self-end"><Search className="absolute end-4 top-4 h-4 w-4 text-slate-500"/><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder={copy.search} className="h-12 rounded-2xl border-white/10 bg-[#111722] pe-11 text-white placeholder:text-slate-600"/></div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-400">NFOOD Experiences</p><h2 className="mt-1 text-2xl font-black">{copy.activity}</h2></div><span className="text-xs text-slate-500">{filteredSectors.length}</span></div>
      {sectors.isLoading ? <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[1,2,3,4].map(x=><div key={x} className="h-40 animate-pulse rounded-3xl bg-white/5"/>)}</div> :
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{filteredSectors.map(sector=>{const meta=sectorMeta(sector.slug); return <Link key={sector.id} href={`/marketplace/sector/${sector.slug}?country=${country}`} className="group relative min-h-40 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[.08] to-white/[.025] p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-400/35">
        <span className="text-4xl">{meta.icon}</span><h3 className="mt-5 text-lg font-black">{lang==="ar"?meta.ar:lang==="fr"?meta.fr:meta.en}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{lang==="ar"?meta.hintAr:meta.hintEn}</p><ArrowUpLeft className="absolute bottom-5 end-5 h-4 w-4 text-slate-600 transition group-hover:text-orange-400"/>
      </Link>})}</div>}
    </section>

    <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-7 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-400">{countryInfo.flag} {countryInfo[lang]}</p><h2 className="mt-1 text-2xl font-black">{copy.stores}</h2></div></div>
      {stores.isLoading ? <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[1,2,3,4].map(x=><div key={x} className="h-64 animate-pulse rounded-3xl bg-white/5"/>)}</div> :
      storesBySector.length ? <div className="space-y-12">{storesBySector.map(({sector,stores:groupStores})=>{const meta=sectorMeta(sector.slug); return <div key={sector.id}>
        <div className="mb-4 flex items-end justify-between gap-4"><div><span className="text-2xl">{meta.icon}</span><h3 className="mt-1 text-xl font-black">{lang==="ar"?meta.ar:lang==="fr"?meta.fr:meta.en}</h3><p className="mt-1 text-xs text-slate-500">{lang==="ar"?"الأبرز والأكثر طلباً في هذا النشاط":lang==="fr"?"Les boutiques populaires de cette activité":"Popular stores in this activity"}</p></div><Link href={`/marketplace/sector/${sector.slug}?country=${country}`} className="shrink-0 text-xs font-bold text-orange-400 hover:text-orange-300">{lang==="ar"?"عرض الكل":lang==="fr"?"Voir tout":"View all"} ←</Link></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{groupStores.map(store=>{const r=store.restaurant; const phone=(r as any)?.phone; const whatsapp=(r as any)?.whatsapp; const website=(r as any)?.websiteUrl; const cover=(r as any)?.coverUrl; return <article key={store.entityId} className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[.045] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-orange-400/30">
          <Link href={`/store/${store.entityId}?country=${country}`} className="block">
            <div className="relative aspect-[16/9] overflow-hidden bg-[#121824]" style={!cover?{background:`linear-gradient(135deg,${r?.brandColor??"#172033"},${r?.brandAccentColor??"#101827"})`}:undefined}>{cover?<img src={cover} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" alt=""/>:null}<span className="absolute start-2.5 top-2.5 rounded-full border border-emerald-400/20 bg-emerald-500/90 px-2 py-1 text-[9px] font-black text-white">{lang==="ar"?"مفتوح":lang==="fr"?"Ouvert":"Open"}</span>{r?.brandLogoUrl?<img src={r.brandLogoUrl} className="absolute -bottom-0 end-3 h-11 w-11 rounded-xl border-2 border-[#151a24] bg-white object-cover p-0.5" alt=""/>:null}</div>
            <div className="p-3.5"><h4 className="truncate text-sm font-black md:text-base">{store.customerName}</h4><div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400"><MapPin className="h-3 w-3 text-orange-400"/><span className="truncate">{r?.city || (store as any).city || countryInfo[lang]}</span></div><div className="mt-3 flex items-center justify-between gap-2 text-[10px]"><span className="truncate rounded-lg bg-white/5 px-2 py-1 text-slate-300">{meta.icon} {lang==="ar"?meta.ar:lang==="fr"?meta.fr:meta.en}</span><span className="shrink-0 font-bold text-emerald-300">{store.listingCount} {lang==="ar"?"صنف":"items"}</span></div></div>
          </Link>
          {(phone||whatsapp||website)&&<div className="flex items-center gap-1 border-t border-white/7 p-2">{phone&&<a href={`tel:${phone}`} onClick={e=>e.stopPropagation()} aria-label="Call" className="grid h-8 flex-1 place-items-center rounded-lg bg-white/5 text-slate-300 hover:bg-white/10"><Phone className="h-3.5 w-3.5"/></a>}{whatsapp&&<a href={`https://wa.me/${String(whatsapp).replace(/\D/g,"")}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="grid h-8 flex-1 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"><MessageCircle className="h-3.5 w-3.5"/></a>}{website&&<a href={website} target="_blank" rel="noreferrer" aria-label="Website" className="grid h-8 flex-1 place-items-center rounded-lg bg-white/5 text-slate-300 hover:bg-white/10"><ExternalLink className="h-3.5 w-3.5"/></a>}</div>}
        </article>})}</div>
      </div>})}</div>:<div className="rounded-3xl border border-dashed border-white/15 bg-white/[.025] px-6 py-14 text-center"><Store className="mx-auto h-10 w-10 text-slate-700"/><p className="mt-4 font-bold text-slate-300">{lang==="ar"?"لا توجد متاجر منشورة في هذه الدولة بعد.":"No published stores in this country yet."}</p><p className="mt-2 text-xs text-slate-600">{lang==="ar"?"سيظهر هنا كل متجر حسب دولته ونشاطه فقط.":"Stores appear here only inside their own country and sector."}</p></div>}
    </section>

    <section className="mx-auto grid max-w-7xl gap-3 px-4 pb-16 md:grid-cols-3 md:px-8">{[[ShieldCheck,"Country isolation","كل دولة وسوق مستقل"],[Smartphone,"Progressive Web App","سريع، متجاوب وقابل للتثبيت"],[Globe2,"AR · EN · FR","واجهة متعددة اللغات والاتجاهات"]].map(([Icon,title,body])=>{const I=Icon as typeof ShieldCheck; return <div key={title as string} className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><I className="h-5 w-5 text-orange-400"/><b className="mt-3 block">{title as string}</b><span className="mt-1 block text-xs text-slate-500">{body as string}</span></div>})}</section>
  </main>;
}
