import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  Globe2,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import Home from "@/pages/Home";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { QRCodeSVG } from "qrcode.react";

type HomeFeatureCard = { title: string; body: string };
type HomeFeatureLocale = { title?: string; subtitle?: string; homeCards?: HomeFeatureCard[] };
type PublicPlan = { name: string; price: string; yearlyPrice?: string; desc: string; items: readonly string[]; featured?: boolean };
type PublicPricingLocale = { title?: string; subtitle?: string; plans?: PublicPlan[] };

function parseJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

export default function PublicHome() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { direction, language } = useLanguage();
  const lang = language === "fr" ? "fr" : language === "en" ? "en" : "ar";

  const publicContentQuery = trpc.platform.publicSiteContent.useQuery(undefined, { retry: false });
  const featuredBusinesses = trpc.marketplace.publicFeaturedStores.useQuery(undefined, { retry: false });

  const settings = publicContentQuery.data;
  const featureConfig = parseJson<Record<string, HomeFeatureLocale>>(settings?.publicFeaturesJson, {});
  const featureLocale = featureConfig[lang] ?? {};
  const pricingConfig = parseJson<Record<string, PublicPricingLocale>>(settings?.publicPricingJson, {});
  const pricingLocale = pricingConfig[lang] ?? {};
  const footerConfig = parseJson<Record<string, string | boolean>>(settings?.footerConfigJson, {});
  const headerConfig = parseJson<Record<string, string | boolean>>(settings?.headerConfigJson, {});

  const fallbackFeatures = lang === "en"
    ? [
        { icon: LayoutDashboard, title: "One operating system", body: "Run branches, orders, teams, subscriptions, and customer operations from one workspace." },
        { icon: BarChart3, title: "Decisions from live data", body: "Understand sales, demand, and operational performance with clear indicators." },
        { icon: Smartphone, title: "A connected customer journey", body: "Digital storefronts, ordering, bookings, queues, and notifications across devices." },
        { icon: ShieldCheck, title: "Security by role", body: "Fine-grained permissions and protected sessions for every team member." },
      ]
    : lang === "fr"
      ? [
          { icon: LayoutDashboard, title: "Un seul système d’exploitation", body: "Pilotez sites, commandes, équipes, abonnements et opérations depuis un espace unique." },
          { icon: BarChart3, title: "Des décisions fondées sur les données", body: "Suivez ventes, demande et performance opérationnelle avec des indicateurs clairs." },
          { icon: Smartphone, title: "Un parcours client connecté", body: "Boutiques numériques, commandes, réservations, files et notifications sur tous les appareils." },
          { icon: ShieldCheck, title: "Sécurité par rôle", body: "Permissions précises et sessions protégées pour chaque membre de l’équipe." },
        ]
      : [
          { icon: LayoutDashboard, title: "نظام تشغيل واحد", body: "أدر الفروع والطلبات والموظفين والاشتراكات وتجربة العميل من مساحة واحدة." },
          { icon: BarChart3, title: "قرارات مبنية على البيانات", body: "راقب المبيعات والطلب والأداء التشغيلي بمؤشرات واضحة ومباشرة." },
          { icon: Smartphone, title: "تجربة عميل متصلة", body: "متاجر رقمية وطلبات وحجوزات وطوابير وإشعارات تعمل على جميع الأجهزة." },
          { icon: ShieldCheck, title: "أمان حسب الدور", body: "صلاحيات دقيقة وجلسات محمية لكل عضو في فريق النشاط." },
        ];

  const featureIcons = [LayoutDashboard, BarChart3, Smartphone, ShieldCheck];
  const features = featureLocale.homeCards?.length
    ? featureLocale.homeCards.map((item, index) => ({ ...item, icon: featureIcons[index % featureIcons.length] }))
    : fallbackFeatures;

  const copy = lang === "en"
    ? {
        badge: "Commerce, operations, and customer experience",
        title: "Run your business with clarity.",
        accent: "Sell. Operate. Grow.",
        description: settings?.homepageContentEn || settings?.siteDescriptionEn || "NFOOD brings business operations, customer experience, and commerce into one connected platform.",
        features: "Features", how: "How it works", plans: "Plans", market: "Marketplace", login: "Sign in",
        start: "Create your business", explore: "Explore marketplace", featured: "Featured businesses",
        featuredHint: "Open a store directly — no long browsing journey.", solutions: "Built for real operations",
        flowTitle: "From setup to daily operations in one flow", flowText: "Create your business, configure operations, serve customers, then improve with live data.",
        steps: [
          ["Create your business", "Set up your identity, branches, team, and permissions."],
          ["Activate operations", "Publish products, menus, services, bookings, and ordering."],
          ["Serve customers", "Give customers a fast mobile-first journey with clear actions."],
          ["Grow with data", "Track performance and improve every part of the operation."],
        ],
        pricingEyebrow: "Plans that grow with you", pricingCta: "View all plans", marketTitle: "Discover businesses on NFOOD",
        marketText: "Browse independent stores and services by country and sector.", footerDiscover: "Discover",
        footerSupport: "Support", footerCompany: "Company", rights: "All rights reserved",
        about: "About", faq: "FAQ", contact: "Contact", terms: "Terms", privacy: "Privacy", refund: "Refund policy",
      }
    : lang === "fr"
      ? {
          badge: "Commerce, opérations et expérience client",
          title: "Pilotez votre activité avec clarté.",
          accent: "Vendez. Gérez. Grandissez.",
          description: settings?.homepageContentFr || settings?.siteDescriptionFr || "NFOOD réunit opérations, expérience client et commerce dans une seule plateforme.",
          features: "Fonctions", how: "Fonctionnement", plans: "Offres", market: "Marketplace", login: "Connexion",
          start: "Créer mon activité", explore: "Explorer le marketplace", featured: "Activités en vedette",
          featuredHint: "Ouvrez directement une boutique, sans parcours inutile.", solutions: "Pensé pour les opérations réelles",
          flowTitle: "De la configuration aux opérations quotidiennes", flowText: "Créez votre activité, configurez les opérations, servez vos clients puis améliorez-vous grâce aux données.",
          steps: [
            ["Créer votre activité", "Configurez identité, sites, équipe et permissions."],
            ["Activer les opérations", "Publiez produits, menus, services, réservations et commandes."],
            ["Servir les clients", "Offrez une expérience mobile rapide avec des actions claires."],
            ["Grandir avec les données", "Suivez les performances et améliorez chaque opération."],
          ],
          pricingEyebrow: "Des offres qui évoluent avec vous", pricingCta: "Voir toutes les offres", marketTitle: "Découvrez les activités sur NFOOD",
          marketText: "Explorez les boutiques et services indépendants par pays et activité.", footerDiscover: "Découvrir",
          footerSupport: "Assistance", footerCompany: "Entreprise", rights: "Tous droits réservés",
          about: "À propos", faq: "FAQ", contact: "Contact", terms: "Conditions", privacy: "Confidentialité", refund: "Remboursement",
        }
      : {
          badge: "التجارة والتشغيل وتجربة العميل",
          title: "شغّل نشاطك بوضوح.",
          accent: "بع. أدر. وتوسّع.",
          description: settings?.homepageContent || settings?.siteDescription || "NFOOD يجمع تشغيل النشاط وتجربة العميل والتجارة في منصة واحدة مترابطة.",
          features: "المزايا", how: "كيف يعمل", plans: "الباقات", market: "السوق", login: "تسجيل الدخول",
          start: "أنشئ نشاطك", explore: "استكشف السوق", featured: "أنشطة مميزة",
          featuredHint: "افتح المتجر مباشرة بدون رحلة تصفح طويلة.", solutions: "مصمم للتشغيل الحقيقي",
          flowTitle: "من الإعداد إلى التشغيل اليومي في مسار واحد", flowText: "أنشئ نشاطك، اضبط التشغيل، اخدم عملاءك، ثم حسّن الأداء من البيانات الحية.",
          steps: [
            ["أنشئ نشاطك", "اضبط الهوية والفروع والفريق والصلاحيات."],
            ["فعّل التشغيل", "انشر المنتجات والمنيو والخدمات والحجوزات والطلبات."],
            ["اخدم عملاءك", "قدّم تجربة جوال سريعة بإجراءات واضحة ومباشرة."],
            ["توسّع بالبيانات", "راقب الأداء وحسّن كل جزء من التشغيل."],
          ],
          pricingEyebrow: "باقات تنمو مع نشاطك", pricingCta: "عرض جميع الباقات", marketTitle: "اكتشف الأنشطة على NFOOD",
          marketText: "تصفح المتاجر والخدمات المستقلة حسب الدولة والنشاط.", footerDiscover: "اكتشف",
          footerSupport: "المساعدة", footerCompany: "الشركة", rights: "جميع الحقوق محفوظة",
          about: "من نحن", faq: "الأسئلة الشائعة", contact: "اتصل بنا", terms: "الشروط", privacy: "الخصوصية", refund: "الاسترجاع",
        };

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#071525] text-white">NFOOD</div>;
  if (user) return <Home />;

  const announcement = lang === "ar"
    ? String(headerConfig.announcementAr || headerConfig.announcement || "")
    : lang === "fr"
      ? String(headerConfig.announcementFr || "")
      : String(headerConfig.announcementEn || "");

  const footerDescription = lang === "ar"
    ? String(footerConfig.descriptionAr || settings?.siteDescription || copy.description)
    : lang === "fr"
      ? String(footerConfig.descriptionFr || settings?.siteDescriptionFr || copy.description)
      : String(footerConfig.descriptionEn || settings?.siteDescriptionEn || copy.description);

  return <div dir={direction} className="min-h-screen overflow-x-hidden bg-[#f7f9fc] text-[#0b1d35]">
    {announcement && <div className="bg-[#0b1d35] px-4 py-2 text-center text-xs font-bold text-white">{announcement}</div>}

    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
        <a href="#top" className="flex min-w-0 items-center gap-3">
          {settings?.siteLogoUrl
            ? <img src={settings.siteLogoUrl} alt={settings.siteName || "NFOOD"} className="h-10 w-10 shrink-0 rounded-xl object-contain" />
            : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500 text-lg font-black text-white">N</span>}
          <div className="min-w-0">
            <strong className="block truncate text-base tracking-[.13em]">{settings?.siteName || "NFOOD"}</strong>
            <small className="block truncate text-[9px] font-bold uppercase tracking-[.18em] text-slate-400">Business Operating Platform</small>
          </div>
        </a>

        <nav className={`${menuOpen ? "absolute inset-x-3 top-[72px] flex" : "hidden"} z-50 flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl lg:static lg:flex lg:flex-row lg:items-center lg:gap-6 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>
          <a href="#features" onClick={() => setMenuOpen(false)} className="rounded-xl px-2 py-2 text-sm font-bold text-slate-600 hover:text-orange-500">{copy.features}</a>
          <a href="#how" onClick={() => setMenuOpen(false)} className="rounded-xl px-2 py-2 text-sm font-bold text-slate-600 hover:text-orange-500">{copy.how}</a>
          <a href="#plans" onClick={() => setMenuOpen(false)} className="rounded-xl px-2 py-2 text-sm font-bold text-slate-600 hover:text-orange-500">{copy.plans}</a>
          <button onClick={() => setLocation("/marketplace")} className="rounded-xl px-2 py-2 text-start text-sm font-bold text-slate-600 hover:text-orange-500">{copy.market}</button>
          <LanguageSwitcher compact />
          <button onClick={() => setLocation("/login")} className="rounded-xl bg-[#0b1d35] px-4 py-2.5 text-sm font-black text-white">{copy.login}</button>
        </nav>
        <button aria-label="Menu" onClick={() => setMenuOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 lg:hidden">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
    </header>

    <main id="top">
      <section className="relative overflow-hidden bg-[#071525] text-white">
        <div className="absolute -start-24 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -end-24 bottom-0 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-black text-orange-200"><Sparkles className="h-4 w-4" />{copy.badge}</div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-7xl">{copy.title}<span className="mt-2 block bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">{copy.accent}</span></h1>
            <p className="mt-6 max-w-2xl text-sm leading-8 text-slate-300 sm:text-base lg:text-lg">{copy.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => setLocation("/login")} className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-orange-950/30">{copy.start}{direction === "rtl" ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}</button>
              <button onClick={() => setLocation("/marketplace")} className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-black text-white">{copy.explore}</button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 text-xs font-bold text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">AR / EN / FR</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">RTL / LTR</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Multi-tenant</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { value: "01", title: copy.features, body: lang === "ar" ? "تشغيل وإدارة وتجربة عميل في منصة واحدة." : lang === "fr" ? "Opérations, gestion et expérience client réunies." : "Operations, management, and customer experience in one platform." },
              { value: "02", title: copy.market, body: lang === "ar" ? "متاجر مستقلة وسوق عام بدون فقدان هوية النشاط." : lang === "fr" ? "Boutiques indépendantes et marketplace sans perdre l’identité." : "Independent stores plus a marketplace without losing brand identity." },
              { value: "03", title: copy.plans, body: lang === "ar" ? "خصائص مرنة حسب الباقة وحجم التشغيل." : lang === "fr" ? "Des capacités flexibles selon l’offre et l’échelle." : "Flexible capabilities by plan and operating scale." },
              { value: "04", title: lang === "ar" ? "تحكم مركزي" : lang === "fr" ? "Contrôle central" : "Central control", body: lang === "ar" ? "الأدمن يتحكم بالمحتوى والهوية والصفحات العامة." : lang === "fr" ? "L’admin contrôle contenu, identité et pages publiques." : "Admin controls content, identity, and public pages." },
            ].map((card) => <article key={card.value} className="rounded-[26px] border border-white/10 bg-white/[.06] p-5 backdrop-blur">
              <span className="text-xs font-black text-orange-300">{card.value}</span>
              <h2 className="mt-7 text-lg font-black">{card.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">{card.body}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-500">NFOOD SELECT</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">{copy.featured}</h2><p className="mt-2 text-sm text-slate-500">{copy.featuredHint}</p></div>
          <button onClick={() => setLocation("/marketplace")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black">{copy.explore}{direction === "rtl" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {featuredBusinesses.isLoading
            ? Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-56 animate-pulse rounded-3xl bg-slate-200" />)
            : (featuredBusinesses.data ?? []).slice(0, 5).map((store) => <button key={store.entityId} onClick={() => setLocation(`/store/${store.entityId}`)} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white text-start shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-[4/3] bg-slate-100">{store.imageUrl ? <img src={store.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center"><Store className="h-8 w-8 text-slate-300" /></div>}</div>
                <div className="p-4"><h3 className="truncate text-sm font-black">{store.customerName}</h3><p className="mt-1 truncate text-xs font-bold text-orange-500">{lang === "ar" ? store.sectorLabelAr : lang === "fr" ? store.sectorLabelFr : store.sectorLabelEn}</p></div>
              </button>)}
        </div>
      </section>

      <section id="features" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">{copy.solutions}</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">{featureLocale.title || copy.features}</h2><p className="mt-4 text-sm leading-7 text-slate-500">{featureLocale.subtitle || copy.description}</p></div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, body }) => <article key={title} className="rounded-[26px] border border-slate-200 bg-[#f8fafc] p-6">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0b1d35] text-white"><Icon className="h-5 w-5" /></div>
              <h3 className="mt-5 font-black">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-500">{body}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 md:py-20 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-24"><p className="text-xs font-black uppercase tracking-[.18em] text-orange-500">{copy.how}</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">{copy.flowTitle}</h2><p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">{copy.flowText}</p></div>
        <div className="space-y-3">{copy.steps.map(([title, body], index) => <article key={title} className="flex gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500 text-sm font-black text-white">{String(index + 1).padStart(2, "0")}</span><div><h3 className="font-black">{title}</h3><p className="mt-1 text-sm leading-7 text-slate-500">{body}</p></div></article>)}</div>
      </section>

      <section id="plans" className="bg-[#0b1d35] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">{copy.pricingEyebrow}</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">{pricingLocale.title || copy.plans}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">{pricingLocale.subtitle || copy.description}</p></div><Link href="/pricing" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-xs font-black text-white">{copy.pricingCta}{direction === "rtl" ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}</Link></div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {(pricingLocale.plans ?? []).slice(0, 3).map((plan) => <article key={plan.name} className={`rounded-[26px] border p-6 ${plan.featured ? "border-orange-400 bg-orange-500/10" : "border-white/10 bg-white/5"}`}>
              <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-black">{plan.name}</h3>{plan.featured && <span className="rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-black">NFOOD</span>}</div>
              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">{plan.desc}</p>
              <div className="mt-6"><span className="text-4xl font-black">{plan.price}</span><span className="ms-2 text-xs text-slate-400">SAR</span></div>
              <div className="mt-6 space-y-2">{plan.items.slice(0, 4).map((item) => <p key={item} className="flex items-center gap-2 text-sm text-slate-300"><Check className="h-4 w-4 text-orange-400" />{item}</p>)}</div>
            </article>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#0b1d35] via-[#12345a] to-[#0b1d35] p-7 text-white sm:p-10">
          <div className="absolute -end-20 -top-20 h-64 w-64 rounded-full bg-orange-500/25 blur-3xl" />
          <div className="relative max-w-2xl"><BadgeCheck className="h-7 w-7 text-orange-400" /><h2 className="mt-4 text-3xl font-black">{copy.marketTitle}</h2><p className="mt-3 text-sm leading-7 text-slate-300">{copy.marketText}</p><button onClick={() => setLocation("/marketplace")} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white">{copy.explore}{direction === "rtl" ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}</button></div>
        </div>
      </section>
    </main>

    <footer className="overflow-x-hidden bg-[#071525] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8">
        <div className="grid min-w-0 grid-cols-1 gap-9 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-3">
              {settings?.siteLogoUrl ? <img src={settings.siteLogoUrl} alt="" className="h-10 w-10 shrink-0 rounded-xl object-contain" /> : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500 font-black">N</span>}
              <strong className="truncate tracking-[.14em]">{settings?.siteName || "NFOOD"}</strong>
            </div>
            <p className="mt-4 max-w-sm break-words text-sm leading-7 text-slate-400">{footerDescription}</p>
          </div>

          <div className="min-w-0"><h3 className="font-black">{copy.footerDiscover}</h3><div className="mt-4 grid gap-3 text-sm text-slate-400"><a href="#features" className="break-words hover:text-orange-300">{copy.features}</a><a href="#how" className="break-words hover:text-orange-300">{copy.how}</a><Link href="/pricing" className="break-words hover:text-orange-300">{copy.plans}</Link><Link href="/marketplace" className="break-words hover:text-orange-300">{copy.market}</Link></div></div>

          <div className="min-w-0"><h3 className="font-black">{copy.footerSupport}</h3><div className="mt-4 grid gap-3 text-sm text-slate-400"><Link href="/faq" className="break-words hover:text-orange-300">{copy.faq}</Link><Link href="/contact" className="break-words hover:text-orange-300">{copy.contact}</Link>{settings?.supportPhone && <a href={`tel:${settings.supportPhone}`} className="break-all hover:text-orange-300">{settings.supportPhone}</a>}{settings?.supportEmail && <a href={`mailto:${settings.supportEmail}`} className="break-all hover:text-orange-300">{settings.supportEmail}</a>}</div></div>

          <div className="min-w-0"><h3 className="font-black">{copy.footerCompany}</h3><div className="mt-4 grid gap-3 text-sm text-slate-400"><Link href="/about" className="break-words hover:text-orange-300">{copy.about}</Link><Link href="/terms" className="break-words hover:text-orange-300">{copy.terms}</Link><Link href="/privacy" className="break-words hover:text-orange-300">{copy.privacy}</Link><Link href="/refund" className="break-words hover:text-orange-300">{copy.refund}</Link></div></div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-b border-white/10 py-6 sm:flex-row">
          <div className="text-center sm:text-start"><p className="text-sm font-black text-white">${lang === "ar" ? "QR الموقع" : lang === "fr" ? "QR du site" : "Site QR"}</p><p className="mt-1 text-xs text-slate-400">${lang === "ar" ? "امسح الرمز للدخول إلى موقع NFOOD" : lang === "fr" ? "Scannez pour ouvrir NFOOD" : "Scan to open NFOOD"}</p></div>
          <a href="/" aria-label="NFOOD QR" className="rounded-2xl bg-white p-2 shadow-xl"><QRCodeSVG value={typeof window !== "undefined" ? window.location.origin : "https://fooncard.com"} size={92} level="H" /></a>
        </div>

        <div className="flex min-w-0 flex-col gap-4 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span className="break-words">© {settings?.copyrightYear || new Date().getFullYear()} {settings?.siteName || "NFOOD"} · {copy.rights}</span>
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2"><span className="inline-flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5" />AR · EN · FR</span></div>
        </div>
      </div>
    </footer>
  </div>;
}
