import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { marketplaceCountries, sectorMeta } from "@/lib/marketplaceExperience";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Compass,
  Crown,
  Globe2,
  MapPin,
  Moon,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  Sun,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

type MarketLanguage = "ar" | "en" | "fr";
type MarketAppearance = {
  marketplaceEnabled?: boolean;
  theme?: "system" | "light" | "dark";
  primaryColor?: string;
  accentColor?: string;
  cardRadius?: string | number;
  heroImageUrl?: string;
  heroTitleAr?: string;
  heroTitleEn?: string;
  heroTitleFr?: string;
  heroSubtitleAr?: string;
  heroSubtitleEn?: string;
  heroSubtitleFr?: string;
  promoTextAr?: string;
  promoTextEn?: string;
  promoTextFr?: string;
  showPromo?: boolean;
  showTrustBar?: boolean;
};

const copy = {
  ar: {
    home: "الرئيسية", market: "السوق", stores: "متاجر مختارة", storesHint: "ابدأ من المتاجر مباشرة — بدون تمرير طويل أو تشتيت.",
    sectors: "تصفح حسب النشاط", trending: "رائج هذا الشهر", best: "الأكثر مبيعًا", viewAll: "عرض النشاط",
    search: "ابحث عن متجر أو نشاط", searchButton: "بحث", login: "تسجيل الدخول", merchant: "انضم كتاجر",
    emptyStores: "لا توجد متاجر مطابقة حاليًا.", emptyItems: "سيظهر المحتوى هنا فور توفر منتجات منشورة.",
    disabledTitle: "السوق العام متوقف مؤقتًا", disabledBody: "بوابة السوق غير متاحة حاليًا. ما زالت صفحات المتاجر المستقلة وروابطها المباشرة تعمل بشكل طبيعي.",
    backHome: "العودة للرئيسية", curated: "اختيارات NFOOD", popularHint: "مرتب حسب المبيعات المكتملة خلال آخر 30 يومًا",
    bestHint: "مرتب حسب إجمالي المبيعات المكتملة", from: "من", items: "صنف", discover: "اكتشف الآن",
    promo: "اكتشف جديد NFOOD كل يوم", promoBody: "متاجر مستقلة، منتجات مميزة، وتجارب مرتبة حسب النشاط.",
    noImage: "NFOOD",
  },
  en: {
    home: "Home", market: "Marketplace", stores: "Featured stores", storesHint: "Start with stores immediately — no long scrolling or distractions.",
    sectors: "Browse by sector", trending: "Trending this month", best: "Best sellers", viewAll: "View sector",
    search: "Search stores or sectors", searchButton: "Search", login: "Sign in", merchant: "Join as a merchant",
    emptyStores: "No matching stores right now.", emptyItems: "Published products will appear here as soon as they are available.",
    disabledTitle: "Marketplace is temporarily unavailable", disabledBody: "The public marketplace hub is currently disabled. Independent store pages and direct links remain available.",
    backHome: "Back home", curated: "NFOOD picks", popularHint: "Ranked by completed sales over the last 30 days",
    bestHint: "Ranked by all-time completed sales", from: "from", items: "items", discover: "Discover now",
    promo: "Discover something new on NFOOD every day", promoBody: "Independent stores, standout products, and experiences organized by sector.",
    noImage: "NFOOD",
  },
  fr: {
    home: "Accueil", market: "Marketplace", stores: "Boutiques sélectionnées", storesHint: "Accédez immédiatement aux boutiques, sans défilement inutile.",
    sectors: "Explorer par activité", trending: "Tendances du mois", best: "Meilleures ventes", viewAll: "Voir l’activité",
    search: "Rechercher une boutique ou activité", searchButton: "Rechercher", login: "Connexion", merchant: "Devenir marchand",
    emptyStores: "Aucune boutique correspondante pour le moment.", emptyItems: "Les produits publiés apparaîtront ici dès qu’ils seront disponibles.",
    disabledTitle: "Le marketplace est temporairement indisponible", disabledBody: "Le hub public est désactivé. Les pages indépendantes des boutiques et leurs liens directs restent disponibles.",
    backHome: "Retour à l’accueil", curated: "Sélection NFOOD", popularHint: "Classé selon les ventes finalisées des 30 derniers jours",
    bestHint: "Classé selon le total des ventes finalisées", from: "dès", items: "articles", discover: "Découvrir",
    promo: "Découvrez chaque jour de nouvelles expériences sur NFOOD", promoBody: "Boutiques indépendantes, produits remarquables et expériences organisées par activité.",
    noImage: "NFOOD",
  },
} as const;

function localized<T extends Record<string, unknown>>(appearance: T, lang: MarketLanguage, key: string, fallback: string) {
  const suffix = lang === "ar" ? "Ar" : lang === "fr" ? "Fr" : "En";
  const value = appearance[`${key}${suffix}`];
  return typeof value === "string" && value.trim() ? value : fallback;
}

export default function MarketplaceLanding() {
  const { language, direction } = useLanguage();
  const lang: MarketLanguage = language === "fr" ? "fr" : language === "en" ? "en" : "ar";
  const t = copy[lang];
  const [country, setCountry] = useState(() => localStorage.getItem("nfood-market-country") || "SA");
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">(() => localStorage.getItem("nfood-market-theme") === "light" ? "light" : "dark");

  const appearanceQuery = trpc.marketplace.publicAppearance.useQuery(undefined, { retry: false });
  const appearance = (appearanceQuery.data?.appearance || {}) as MarketAppearance;
  const enabled = appearance.marketplaceEnabled !== false;

  const sectors = trpc.marketplace.publicSectors.useQuery(undefined, { retry: false, enabled });
  const stores = trpc.marketplace.publicStores.useQuery({ countryCode: country, search: search.trim() || undefined }, { retry: false, enabled });
  const featuredStores = trpc.marketplace.publicFeaturedStores.useQuery({ countryCode: country }, { retry: false, enabled });
  const highlights = trpc.marketplace.publicSectorHighlights.useQuery({ countryCode: country }, { retry: false, enabled });

  const primary = appearance.primaryColor || "#f97316";
  const accent = appearance.accentColor || "#2563eb";
  const radius = `${appearance.cardRadius || 24}px`;
  const countryInfo = marketplaceCountries.find((item) => item.code === country) ?? marketplaceCountries[0];
  const sectorRows = sectors.data ?? [];
  const storeRows = stores.data ?? [];
  const featuredRows = featuredStores.data?.length
    ? featuredStores.data
    : storeRows.slice(0, 5).map((store) => {
        const meta = sectorMeta(store.sector);
        return {
          entityId: store.entityId,
          customerName: store.customerName,
          sector: store.sector,
          sectorLabelAr: meta.ar,
          sectorLabelEn: meta.en,
          sectorLabelFr: meta.fr,
          imageUrl: store.restaurant?.coverUrl ?? store.restaurant?.brandLogoUrl ?? null,
          listingCount: store.listingCount,
          featured: false,
        };
      });
  const highlightRows = highlights.data ?? [];

  useEffect(() => {
    if (appearance.theme === "light" || appearance.theme === "dark") setTheme(appearance.theme);
    else if (!localStorage.getItem("nfood-market-theme")) setTheme(matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, [appearance.theme]);

  const filteredSectors = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sectorRows;
    return sectorRows.filter((sector) => `${sector.labelAr} ${sector.labelEn} ${sector.labelFr}`.toLowerCase().includes(term));
  }, [sectorRows, search]);

  const chooseCountry = (value: string) => {
    setCountry(value);
    localStorage.setItem("nfood-market-country", value);
  };
  const toggleTheme = () => {
    const value = theme === "dark" ? "light" : "dark";
    setTheme(value);
    localStorage.setItem("nfood-market-theme", value);
  };

  const dark = theme === "dark";
  const shell = dark ? "bg-[#071525] text-white" : "bg-[#f6f8fc] text-[#0b1d35]";
  const surface = dark ? "border-white/10 bg-[#0d2037]" : "border-slate-200/80 bg-white";
  const muted = dark ? "text-slate-400" : "text-slate-500";

  if (!appearanceQuery.isLoading && !enabled) {
    return <main dir={direction} className={`grid min-h-screen place-items-center px-5 ${shell}`}>
      <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-[#0b1d35] p-8 text-center text-white shadow-2xl sm:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-orange-500 text-2xl font-black">N</span>
        <h1 className="mt-7 text-3xl font-black sm:text-4xl">{t.disabledTitle}</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300">{t.disabledBody}</p>
        <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black text-white">
          {direction === "rtl" ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}{t.backHome}
        </Link>
      </div>
    </main>;
  }

  const heroTitle = localized(appearance as Record<string, unknown>, lang, "heroTitle", lang === "ar" ? "اكتشف أفضل الأنشطة والمنتجات في مكان واحد" : lang === "fr" ? "Découvrez les meilleures activités et produits en un seul endroit" : "Discover standout businesses and products in one place");
  const heroSubtitle = localized(appearance as Record<string, unknown>, lang, "heroSubtitle", lang === "ar" ? "متاجر مستقلة، تجارب مختارة، وأفضل ما يقدمه كل نشاط — مرتب حسب دولتك واهتماماتك." : lang === "fr" ? "Des boutiques indépendantes et le meilleur de chaque secteur, organisé selon votre pays." : "Independent stores and the best of every sector, organized for your country.");
  const promoText = localized(appearance as Record<string, unknown>, lang, "promoText", t.promo);

  return <main dir={direction} className={`min-h-screen transition-colors duration-300 ${shell}`} style={{ "--market-primary": primary, "--market-accent": accent, "--market-radius": radius } as React.CSSProperties}>
    <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${dark ? "border-white/10 bg-[#071525]/90" : "border-slate-200/80 bg-white/90"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          {appearanceQuery.data?.siteLogoUrl ? <img src={appearanceQuery.data.siteLogoUrl} alt="" className="h-10 w-10 rounded-xl object-contain" /> : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500 text-xl font-black text-white">N</span>}
          <div className="min-w-0"><b className="block truncate text-lg tracking-[.12em]">{appearanceQuery.data?.siteName || "NFOOD"}</b><small className={`block truncate text-[10px] font-bold ${muted}`}>{t.market}</small></div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-bold lg:flex">
          <Link href="/" className="transition hover:text-orange-500">{t.home}</Link>
          <a href="#stores" className="transition hover:text-orange-500">{t.stores}</a>
          <a href="#sectors" className="transition hover:text-orange-500">{t.sectors}</a>
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button onClick={toggleTheme} className={`grid h-10 w-10 place-items-center rounded-xl border ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`} aria-label="Theme">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          <LanguageSwitcher compact />
          <Link href="/login" className="hidden rounded-xl bg-[#0b1d35] px-4 py-2.5 text-sm font-black text-white sm:inline-flex">{t.login}</Link>
        </div>
      </div>
    </header>

    <section className="relative overflow-hidden border-b border-white/5 bg-[#071525] text-white">
      <div className="absolute inset-0 opacity-25" style={{ background: `radial-gradient(circle at 15% 20%, ${accent} 0, transparent 32%), radial-gradient(circle at 85% 10%, ${primary} 0, transparent 28%)` }} />
      {appearance.heroImageUrl && <div className="absolute inset-y-0 end-0 hidden w-[44%] lg:block"><img src={appearance.heroImageUrl} alt="" className="h-full w-full object-cover opacity-35" /><div className="absolute inset-0 bg-gradient-to-r from-[#071525] via-[#071525]/65 to-transparent" /></div>}
      <div className="relative mx-auto grid min-h-[360px] max-w-7xl items-center gap-8 px-4 py-12 md:px-8 lg:grid-cols-[1.05fr_.95fr]">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-orange-200"><Compass className="h-4 w-4" />{countryInfo.flag} {countryInfo[lang]} · NFOOD</span>
          <h1 className="mt-5 text-4xl font-black leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">{heroTitle}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-300 sm:text-base">{heroSubtitle}</p>
          <div className="mt-7 grid gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:grid-cols-[1fr_190px_auto]">
            <div className="flex items-center"><Search className="ms-3 h-5 w-5 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.search} className="h-11 border-0 bg-transparent text-slate-900 shadow-none focus-visible:ring-0" /></div>
            <select value={country} onChange={(event) => chooseCountry(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-900">
              {marketplaceCountries.map((item) => <option key={item.code} value={item.code}>{item.flag} {item[lang]}</option>)}
            </select>
            <Button className="h-11 rounded-xl px-6 font-black text-white" style={{ background: primary }}>{t.searchButton}</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-400">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2"><BadgeCheck className="h-3.5 w-3.5 text-orange-300" />{t.curated}</span>
            <Link href="/store-marketing" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white transition hover:bg-white/10"><Store className="h-3.5 w-3.5" />{t.merchant}</Link>
          </div>
        </div>
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-3">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur"><TrendingUp className="h-7 w-7 text-orange-400" /><p className="mt-8 text-xs font-bold text-slate-400">{t.trending}</p><p className="mt-2 text-2xl font-black">{t.popularHint}</p></div>
          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur"><Crown className="h-7 w-7 text-blue-400" /><p className="mt-8 text-xs font-bold text-slate-400">{t.best}</p><p className="mt-2 text-2xl font-black">{t.bestHint}</p></div>
        </div>
      </div>
    </section>

    <section id="stores" className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black text-orange-500">NFOOD SELECT</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">{t.stores}</h2><p className={`mt-2 text-sm ${muted}`}>{t.storesHint}</p></div></div>
      {featuredStores.isLoading || stores.isLoading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, index) => <div key={index} className={`h-60 animate-pulse border ${surface}`} style={{ borderRadius: radius }} />)}</div> : featuredRows.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{featuredRows.slice(0, 5).map((store) => {
        const fullStore = storeRows.find((item) => item.entityId === store.entityId);
        const restaurant = fullStore?.restaurant;
        const cover = restaurant?.coverUrl || store.imageUrl;
        const meta = sectorMeta(store.sector);
        return <Link key={store.entityId} href={`/store/${store.entityId}?country=${country}`} className={`group overflow-hidden border shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${surface}`} style={{ borderRadius: radius }}>
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-200/10">{cover ? <img src={cover} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-5xl">{meta.icon}</div>}<span className="absolute end-3 top-3 rounded-full bg-[#071525]/75 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur">{meta.icon}</span></div>
          <div className="p-4"><h3 className="truncate font-black">{store.customerName}</h3><p className={`mt-1 flex items-center gap-1 text-xs ${muted}`}><MapPin className="h-3 w-3" />{restaurant?.city || countryInfo[lang]}</p><div className="mt-3 flex items-center justify-between gap-2"><span className="truncate text-xs font-bold text-orange-500">{lang === "ar" ? store.sectorLabelAr : lang === "fr" ? store.sectorLabelFr : store.sectorLabelEn}</span><span className={`shrink-0 text-[10px] ${muted}`}>{store.listingCount} {t.items}</span></div></div>
        </Link>;
      })}</div> : <div className={`border border-dashed p-10 text-center ${surface}`} style={{ borderRadius: radius }}><Store className="mx-auto h-10 w-10 opacity-30" /><p className="mt-3 font-bold">{t.emptyStores}</p></div>}
    </section>

    <section id="sectors" className={`border-y py-5 ${dark ? "border-white/10 bg-[#091a2e]" : "border-slate-200 bg-white"}`}>
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">{filteredSectors.map((sector) => {
          const meta = sectorMeta(sector.slug);
          return <Link key={sector.id} href={`/marketplace/sector/${sector.slug}?country=${country}`} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-black transition hover:-translate-y-0.5 ${surface}`}><span>{meta.icon}</span><span>{lang === "ar" ? sector.labelAr : lang === "fr" ? sector.labelFr : sector.labelEn}</span><small className={muted}>{sector.listingCount}</small></Link>;
        })}</div>
      </div>
    </section>

    <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 md:px-8">
      {highlights.isLoading ? Array.from({ length: 2 }).map((_, index) => <div key={index} className={`h-80 animate-pulse border ${surface}`} style={{ borderRadius: radius }} />) : highlightRows.map((group) => {
        const meta = sectorMeta(group.sector.slug);
        const sectorName = lang === "ar" ? group.sector.labelAr : lang === "fr" ? group.sector.labelFr : group.sector.labelEn;
        const ProductRow = ({ items, kind }: { items: typeof group.trending; kind: "trending" | "best" }) => <div>
          <div className="mb-4 flex items-center justify-between gap-3"><div><div className="flex items-center gap-2">{kind === "trending" ? <TrendingUp className="h-5 w-5 text-orange-500" /> : <Crown className="h-5 w-5 text-blue-500" />}<h3 className="text-lg font-black sm:text-xl">{kind === "trending" ? t.trending : t.best}</h3></div><p className={`mt-1 text-xs ${muted}`}>{kind === "trending" ? t.popularHint : t.bestHint}</p></div></div>
          {items.length ? <div className="grid auto-cols-[72%] grid-flow-col gap-3 overflow-x-auto pb-3 sm:auto-cols-[42%] md:grid-flow-row md:grid-cols-3 md:overflow-visible lg:grid-cols-5">{items.map((item) => {
            const displayTitle = lang === "ar" ? item.title : item.titleEn || item.title;
            const sales = kind === "trending" ? item.recentSales : item.totalSales;
            return <Link key={item.id} href={`/store/${item.entityId}?country=${country}`} className={`group overflow-hidden border shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${surface}`} style={{ borderRadius: radius }}>
              <div className="relative aspect-square overflow-hidden bg-slate-200/10">{item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center"><ShoppingBag className="h-10 w-10 opacity-25" /></div>}{item.isFeatured && <span className="absolute start-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-black text-white">{t.curated}</span>}</div>
              <div className="p-4"><p className={`truncate text-[11px] font-bold ${muted}`}>{item.sellerName}</p><h4 className="mt-1 line-clamp-2 min-h-10 text-sm font-black">{displayTitle}</h4><div className="mt-3 flex items-end justify-between gap-2"><div><span className="text-base font-black">{Number(item.price).toLocaleString("en-US")}</span><span className={`ms-1 text-[10px] ${muted}`}>{item.currencyCode}</span>{item.compareAtPrice && Number(item.compareAtPrice) > Number(item.price) && <span className="ms-2 text-[10px] text-slate-400 line-through">{Number(item.compareAtPrice).toLocaleString("en-US")}</span>}</div>{sales > 0 && <span className={`rounded-full px-2 py-1 text-[10px] font-black ${kind === "trending" ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"}`}>{sales}</span>}</div></div>
            </Link>;
          })}</div> : <div className={`rounded-2xl border border-dashed p-6 text-center text-sm ${muted} ${surface}`}>{t.emptyItems}</div>}
        </div>;
        return <section key={group.sector.id}>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black text-orange-500">{t.sectors}</p><h2 className="mt-1 flex items-center gap-3 text-2xl font-black sm:text-3xl"><span className="text-3xl">{meta.icon}</span>{sectorName}</h2></div><Link href={`/marketplace/sector/${group.sector.slug}?country=${country}`} className="inline-flex items-center gap-2 rounded-xl border border-orange-500/20 px-4 py-2 text-xs font-black text-orange-500">{t.viewAll}{direction === "rtl" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</Link></div>
          <div className="space-y-9"><ProductRow items={group.trending} kind="trending" /><ProductRow items={group.bestSelling} kind="best" /></div>
        </section>;
      })}
    </div>

    {appearance.showPromo !== false && <section className="mx-auto max-w-7xl px-4 pb-14 md:px-8"><div className="relative overflow-hidden rounded-[32px] bg-[#0b1d35] p-7 text-white shadow-2xl sm:p-10"><div className="absolute -end-20 -top-20 h-64 w-64 rounded-full bg-blue-600/35 blur-3xl" /><div className="absolute -bottom-24 start-1/4 h-64 w-64 rounded-full bg-orange-500/35 blur-3xl" /><div className="relative z-10 max-w-2xl"><Sparkles className="h-7 w-7 text-orange-400" /><h2 className="mt-4 text-2xl font-black sm:text-3xl">{promoText}</h2><p className="mt-3 text-sm leading-7 text-slate-300">{t.promoBody}</p><a href="#stores" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white">{t.discover}{direction === "rtl" ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}</a></div></div></section>}

    <footer className={`border-t px-4 py-9 ${dark ? "border-white/10 bg-[#06101b]" : "border-slate-200 bg-white"}`}><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 font-black text-white">N</span><b className="tracking-[.12em]">NFOOD</b></div><p className={`text-xs ${muted}`}>© {new Date().getFullYear()} NFOOD</p><div className="flex items-center gap-4 text-xs font-bold"><Link href="/terms">{lang === "ar" ? "الشروط" : lang === "fr" ? "Conditions" : "Terms"}</Link><Link href="/privacy">{lang === "ar" ? "الخصوصية" : lang === "fr" ? "Confidentialité" : "Privacy"}</Link><Globe2 className="h-4 w-4 opacity-50" /></div></div></footer>
  </main>;
}
