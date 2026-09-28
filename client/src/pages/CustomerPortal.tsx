import { Link } from "wouter";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  ChevronLeft,
  Gift,
  Heart,
  Library,
  LogOut,
  MapPinned,
  Download, Moon, Sun, Bell,
  ReceiptText,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  UserRound,
  WalletCards,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const statusLabel: Record<string, string> = {
  pending: "قيد المراجعة",
  confirmed: "مؤكد",
  preparing: "قيد التحضير",
  ready: "جاهز",
  out_for_delivery: "في الطريق",
  completed: "مكتمل",
  cancelled: "ملغى",
};

export default function CustomerPortal() {
  const { user, logout } = useAuth();
  const { direction, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [installPrompt, setInstallPrompt] = useState<(Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }) | null>(null);
  const [installHelp, setInstallHelp] = useState(false);
  const [installed, setInstalled] = useState(() => typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches);
  useEffect(() => {
    const capture = (event: Event) => { event.preventDefault(); setInstallPrompt(event as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }); };
    const complete = () => { setInstalled(true); setInstallPrompt(null); setInstallHelp(false); };
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", complete);
    return () => { window.removeEventListener("beforeinstallprompt", capture); window.removeEventListener("appinstalled", complete); };
  }, []);
  const lang = language === "ar" ? "ar" : language === "fr" ? "fr" : "en";
  const orders = trpc.platform.myOrders.useQuery({ limit: 6 }, { enabled: Boolean(user), retry:false });
  const reservations = trpc.platform.myReservations.useQuery({ limit: 6 }, { enabled: Boolean(user), retry:false });
  const favorites = trpc.platform.favoriteRestaurants.useQuery(undefined, { enabled:Boolean(user), retry:false });
  const wallet = trpc.platform.myWallet.useQuery(undefined, { enabled:Boolean(user), retry:false });
  const engagement = trpc.platform.engagement.useQuery(undefined, { enabled:Boolean(user), retry:false });
  const notifications = trpc.notifications.mine.useQuery(undefined, { enabled:Boolean(user), retry:false, refetchInterval:user ? 15000 : false });

  const copy = lang === "ar" ? {
    title:"حسابي", subtitle:"كل طلباتك وحجوزاتك ومحتواك في مكان واحد.",
    orders:"الطلبات", reservations:"الحجوزات", invoices:"الفواتير", notifications:"الإشعارات", favorites:"المفضلة",
    library:"مكتبتي", studio:"الاستوديو", rewards:"المكافآت", profile:"الملف والإعدادات",
    marketplace:"استكشف السوق", recentOrders:"آخر الطلبات", recentReservations:"آخر الحجوزات",
    emptyOrders:"لا توجد طلبات بعد.", emptyReservations:"لا توجد حجوزات بعد.",
    open:"عرض التفاصيل", logout:"تسجيل الخروج", balance:"رصيد المحفظة", restaurants:"مطاعمي المفضلة",
  } : lang === "fr" ? {
    title:"Mon compte", subtitle:"Commandes, réservations et contenu au même endroit.",
    orders:"Commandes", reservations:"Réservations", invoices:"Factures", notifications:"Notifications", favorites:"Favoris",
    library:"Ma bibliothèque", studio:"Studio", rewards:"Récompenses", profile:"Profil et paramètres",
    marketplace:"Explorer le marché", recentOrders:"Dernières commandes", recentReservations:"Dernières réservations",
    emptyOrders:"Aucune commande.", emptyReservations:"Aucune réservation.",
    open:"Voir les détails", logout:"Déconnexion", balance:"Solde du portefeuille", restaurants:"Restaurants favoris",
  } : {
    title:"My account", subtitle:"Orders, reservations and content in one place.",
    orders:"Orders", reservations:"Reservations", invoices:"Invoices", notifications:"Notifications", favorites:"Favorites",
    library:"My library", studio:"Studio", rewards:"Rewards", profile:"Profile & settings",
    marketplace:"Explore marketplace", recentOrders:"Recent orders", recentReservations:"Recent reservations",
    emptyOrders:"No orders yet.", emptyReservations:"No reservations yet.",
    open:"View details", logout:"Sign out", balance:"Wallet balance", restaurants:"Favorite restaurants",
  };

  const quick = [
    { label:copy.orders, href:"/customer-orders", Icon:ShoppingBag },
    { label:copy.reservations, href:"/customer-reservations", Icon:CalendarDays },
    { label:copy.invoices, href:"/customer-orders?view=invoices", Icon:ReceiptText },
    { label:copy.notifications, href:"/customer-portal#notifications", Icon:Bell },
    { label:copy.favorites, href:"/favorites", Icon:Heart },
    { label:copy.library, href:"/customer-content-library", Icon:Library },
    { label:copy.studio, href:"/customer-studio", Icon:Camera },
    { label:copy.rewards, href:"/customer-rewards", Icon:Gift },
    { label:copy.profile, href:"/customer-profile", Icon:Settings },
  ];

  const displayName = (user as any)?.name || (user as any)?.displayName || user?.email || copy.title;
  const points = (engagement.data?.loyalty ?? []).reduce((sum, row) => sum + Number(row.pointsBalance || 0), 0);

  return <main dir={direction} className="nfood-customer-shell min-h-screen overflow-x-hidden text-[#0b1d35] dark:text-white">
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#08192b]/95">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/marketplace" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 font-black text-white">N</span>
          <span className="font-black">NFOOD</span>
        </Link>
        <div className="flex items-center gap-2">
          {!installed && <button type="button" onClick={async () => { if (installPrompt) { await installPrompt.prompt(); const choice = await installPrompt.userChoice; if (choice.outcome === "accepted") setInstallPrompt(null); } else setInstallHelp((value) => !value); }} className="flex h-10 items-center gap-1.5 rounded-xl bg-orange-500 px-3 text-xs font-bold text-white hover:bg-orange-600" aria-label={lang === "ar" ? "تثبيت تطبيق الويب" : lang === "fr" ? "Installer l’application" : "Install web app"}><Download className="h-4 w-4" /><span className="hidden sm:inline">{lang === "ar" ? "تثبيت التطبيق" : lang === "fr" ? "Installer" : "Install app"}</span></button>}
          <button type="button" onClick={toggleTheme} aria-label={theme === "dark" ? "Light mode" : "Dark mode"} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          <Link href="/marketplace"><Button variant="outline" className="rounded-xl text-xs">{copy.marketplace}</Button></Link>
          <button onClick={() => void logout()} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5" aria-label={copy.logout}><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </header>

    {installHelp && <div className="mx-auto max-w-7xl px-4 pt-4 text-sm sm:px-6"><div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-950 dark:border-orange-500/30 dark:bg-orange-950/30 dark:text-orange-100">{lang === "ar" ? "للتثبيت: افتح قائمة المتصفح واختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية». في Safari استخدم مشاركة ← إضافة إلى الشاشة الرئيسية." : lang === "fr" ? "Ouvrez le menu du navigateur et choisissez « Installer » ou « Ajouter à l’écran d’accueil ». Dans Safari, utilisez Partager." : "Open your browser menu and choose Install app or Add to Home Screen. In Safari, use Share → Add to Home Screen."}</div></div>}
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className="overflow-hidden rounded-[28px] bg-[#0b1d35] p-5 text-white shadow-xl sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[.18em] text-orange-400">NFOOD CUSTOMER</p>
            <h1 className="mt-2 truncate text-2xl font-black sm:text-4xl">{displayName}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{copy.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:min-w-[260px]">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-[10px] font-bold text-slate-300">{copy.balance}</p>
              <p className="mt-1 text-lg font-black">{wallet.data?.account.balance ?? "0.00"} SAR</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-[10px] font-bold text-slate-300">{copy.rewards}</p>
              <p className="mt-1 text-lg font-black">{points}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quick.map(({ label, href, Icon }) => <Link key={href+label} href={href} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"><Icon className="h-5 w-5" /></span>
            <ChevronLeft className="h-4 w-4 text-slate-300 transition group-hover:-translate-x-1" />
          </div>
          <p className="mt-4 text-sm font-black">{label}</p>
        </Link>)}
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-[26px] border border-slate-200 bg-white p-4 sm:p-5 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-black">{copy.recentOrders}</h2><p className="mt-1 text-xs text-slate-500">{orders.data?.length ?? 0} {copy.orders}</p></div>
            <Link href="/customer-orders" className="text-xs font-black text-orange-600">{copy.open}</Link>
          </div>
          <div className="mt-4 space-y-2">
            {orders.isLoading ? <div className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" /> : orders.data?.length ? orders.data.slice(0,6).map((order:any) => <Link key={order.id} href={`/customer-orders?order=${order.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-3 dark:border-white/10">
              <div className="min-w-0"><p className="truncate text-sm font-black">#{order.id} · {order.restaurantName || copy.orders}</p><p className="mt-1 text-[11px] text-slate-500">{statusLabel[order.status] || order.status}</p></div>
              <div className="text-end"><p className="text-sm font-black">{Number(order.total || 0).toLocaleString("en-US")} {order.currencyCode || "SAR"}</p><ArrowLeft className="ms-auto mt-1 h-4 w-4 text-slate-300" /></div>
            </Link>) : <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-white/10">{copy.emptyOrders}</p>}
          </div>
        </section>

        <section className="rounded-[26px] border border-slate-200 bg-white p-4 sm:p-5 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-black">{copy.recentReservations}</h2><p className="mt-1 text-xs text-slate-500">{reservations.data?.length ?? 0} {copy.reservations}</p></div>
            <Link href="/customer-reservations" className="text-xs font-black text-blue-600">{copy.open}</Link>
          </div>
          <div className="mt-4 space-y-2">
            {reservations.isLoading ? <div className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" /> : reservations.data?.length ? reservations.data.slice(0,6).map((row:any) => <Link key={row.id} href="/customer-reservations" className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-3 dark:border-white/10">
              <div className="min-w-0"><p className="truncate text-sm font-black">{row.restaurantName || copy.reservations}</p><p className="mt-1 text-[11px] text-slate-500">{row.status || "—"}</p></div>
              <div className="text-end text-[11px] text-slate-500">{row.reservedFor ? new Date(row.reservedFor).toLocaleString(lang === "ar" ? "ar-SA" : lang === "fr" ? "fr-FR" : "en-US") : "—"}</div>
            </Link>) : <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-white/10">{copy.emptyReservations}</p>}
          </div>
        </section>
      </div>

      <section id="notifications" className="mt-5 rounded-[26px] border border-slate-200 bg-white p-4 sm:p-5 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-lg font-black"><Bell className="h-5 w-5 text-orange-500" />{copy.notifications}</h2><p className="mt-1 text-xs text-slate-500">{notifications.data?.length ?? 0}</p></div></div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">{notifications.isLoading ? <div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" /> : (notifications.data ?? []).slice(0,8).map((note:any) => <div key={note.id} className="rounded-2xl border border-slate-100 p-3 dark:border-white/10"><p className="text-sm font-black">{note.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{note.body}</p><p className="mt-2 text-[10px] text-slate-400">{note.createdAt ? new Date(note.createdAt).toLocaleString(lang === "ar" ? "ar-SA" : lang === "fr" ? "fr-FR" : "en-US") : ""}</p></div>)}</div>
      </section>

      <section className="mt-5 rounded-[26px] border border-slate-200 bg-white p-4 sm:p-5 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black">{copy.restaurants}</h2><p className="mt-1 text-xs text-slate-500">{favorites.data?.length ?? 0}</p></div><Link href="/favorites" className="text-xs font-black text-orange-600">{copy.open}</Link></div>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {(favorites.data ?? []).slice(0,8).map((row:any) => <Link key={row.restaurantId ?? row.id} href={`/menu/${row.slug || row.restaurantSlug}`} className="min-w-[190px] rounded-2xl border border-slate-100 p-3 dark:border-white/10">
            <div className="flex items-center gap-3">{row.brandLogoUrl ? <img src={row.brandLogoUrl} alt="" className="h-10 w-10 rounded-xl object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600"><Store className="h-5 w-5" /></span>}<div className="min-w-0"><p className="truncate text-sm font-black">{row.brandName || row.name || row.restaurantName}</p><p className="mt-1 truncate text-[10px] text-slate-500">{row.city || ""}</p></div></div>
          </Link>)}
        </div>
      </section>
    </div>
  </main>;
}
