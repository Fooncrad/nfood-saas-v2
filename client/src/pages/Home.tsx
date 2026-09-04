import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  Activity, Bell, ChefHat, ChevronDown, CircleDollarSign, Clock3, Eye, LayoutDashboard, Moon, Sun,
  Menu as MenuIcon, Package, Plus, Search, Settings2, ShoppingBag, Store, Table2,
  Users, Utensils, WalletCards, Zap, CheckCircle2, ArrowUpLeft, MoreHorizontal, Maximize2, Minimize2, RotateCcw,
  Truck, Megaphone, Boxes, ShieldCheck, TrendingDown, ArrowLeft, HardDrive, Sparkles, Wifi, WifiOff, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuAddonsPanel } from "@/components/MenuAddonsPanel";
import { TranslationReviewPanel } from "@/components/TranslationReviewPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { executeLogoutFlow, executeSwitchAccountFlow } from "@/lib/profileActions";
import { getWorkspaceState } from "@/lib/workspace";
import { formatMoney } from "@shared/currencies";
import { enqueueOfflineItem, readOfflineQueue, writeOfflineQueue } from "@/lib/offlineQueue";
import { enqueueAdminOfflineOperation, readAdminOfflineQueue, replayAdminOfflineQueue, type AdminOfflineOperation } from "@/lib/adminOfflineSync";
import { publicMenuUrl } from "@/lib/publicMenuUrl";
import { validateRemoteTaskDraft } from "@/lib/remoteTaskValidation";
import AccountManagementPanel from "@/components/AccountManagementPanel";
import { MediaLibraryPanel } from "@/components/MediaLibraryPanel";
import { dashboardProfiles } from "@/lib/dashboardProfiles";
import { getVisibleNavigation, isRoleActionAllowed } from "@/lib/roleNavigation";
import { buildMenuTranslations, primaryMenuTranslation, readLocalizedDraft, type LocalizedDraft, type MenuLanguage } from "@/lib/menuLanguageDraft";
import { getMissingTranslationTasks } from "@/lib/menuBulkTranslation";
import Barcode from "react-barcode";
import { ReservationsView } from "@/pages/ReservationsView";
import { PlatformSettingsPanel } from "@/components/PlatformSettingsPanel";
import { ActivityAnalyticsPanel } from "@/components/ActivityAnalyticsPanel";
import { RegisterScreen } from "@/components/RegisterScreen";
import { TestLoginScreen } from "@/components/TestLoginScreen";
import { PasswordResetScreen } from "@/components/PasswordResetScreen";
import { PlatformOverview } from "@/components/PlatformOverview";
import { PendingTransferBanner } from "@/components/PendingTransferBanner";
import { HomeSidebar } from "@/components/HomeSidebar";
import { MobileNavigationDrawer } from "@/components/MobileNavigationDrawer";
import { AccessDeniedView } from "@/components/AccessDeniedView";
const LazyModuleView = lazy(() => import("@/components/HomeModules").then(({ ModuleView }) => ({ default: ModuleView })));
import { CreateRestaurantDialog } from "@/components/CreateRestaurantDialog";
import { LoyaltyPanel } from "@/components/LoyaltyPanel";
import { ReviewsPanel } from "@/components/ReviewsPanel";
import { DriverDeliveryView } from "@/components/DriverDeliveryView";
import { RemoteTaskDialog, type RemoteTaskDraft } from "@/components/RemoteTaskDialog";
import { KitchenPrinterSettings } from "@/components/KitchenPrinterSettings";
import { KitchenTicketBoard } from "@/components/KitchenTicketBoard";
import { OrderRealtimeAlerts } from "@/components/OrderRealtimeAlerts";
import { RestaurantDisplayMarketingPanel } from "@/components/RestaurantDisplayMarketingPanel";
import { RestaurantMenuInsightsPanel } from "@/components/RestaurantMenuInsightsPanel";
import { MediaTemplateStudio } from "@/components/MediaTemplateStudio";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { navItems, navTranslationKeys, type NavKey, type Order, type OrderStatus } from "@/components/homeNavigation";
import { getOrderStatusPalette } from "@/lib/statusPalette";
import { detectMenuSourceLanguage } from "@/lib/translationSource";
import CustomerProfileSettings from "@/pages/CustomerProfileSettings";
import CustomerPortal from "@/pages/CustomerPortal";
import VcardAccountBinding from "@/pages/VcardAccountBinding";
import { DeliveryOperationsPanel } from "@/components/DeliveryOperationsPanel";
import { AccountPreferencesPanel } from "@/components/AccountPreferencesPanel";
import { DashboardQuickAccess, type DashboardQuickAccessItem } from "@/components/DashboardQuickAccess";
import { RestaurantOverviewWorkspace } from "@/components/RestaurantOverviewWorkspace";
import { ManagerOperationsPanel } from "@/components/ManagerOperationsPanel";
import { SmartInsightsPanel } from "@/components/SmartInsightsPanel";
import { AuditSecurityAlerts } from "@/components/AuditSecurityAlerts";
import { consumeAdminReturnReport, formatAdminReturnReport, saveAdminReturnReport } from "@/lib/adminReturnReport";
import { WaiterCallsPanel } from "@/components/WaiterCallsPanel";
import { WaiterResponseStatsPanel } from "@/components/WaiterResponseStatsPanel";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

function money(value: number) { return `${Math.round(Number.isFinite(value) ? value : 0).toLocaleString("en-US")} SAR`; }
function parseOrderDate(value: Date | string | number) { const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime(); return Number.isFinite(timestamp) ? new Date(timestamp) : null; }
function formatOrderTime(value: Date | string | number) { const date = parseOrderDate(value); return date ? date.toLocaleTimeString("ar-SA-u-nu-latn", { timeZone: "Asia/Riyadh", hour: "2-digit", minute: "2-digit", hour12: false }) : "--:--"; }
function orderAgeMinutes(value: Date | string | number) { const date = parseOrderDate(value); return date ? Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000)) : 0; }

type NotificationType = "task" | "message" | "payment" | "system";
type NotificationPreferences = Record<NotificationType, boolean> & { soundEnabled: boolean; vibrationEnabled: boolean };
const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = { task: true, message: true, payment: true, system: true, soundEnabled: false, vibrationEnabled: true };
function parseNotificationPreferences(raw?: string | null): NotificationPreferences {
  if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES;
  try {
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...parsed };
  } catch { return DEFAULT_NOTIFICATION_PREFERENCES; }
}

export default function Home() {
  const [location, setLocation] = useLocation();
  const { user, loading, logout, refresh } = useAuth();
  const { direction, language, locale, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const siteMeta = trpc.platform.publicSiteMeta.useQuery(undefined, { staleTime: 5 * 60 * 1000, retry: false });
  useEffect(() => {
    if (user || !siteMeta.data) return;
    const meta = siteMeta.data;
    const title = meta.seoTitle?.trim() || meta.siteName || "NFOOD Restaurant SaaS";
    const description = meta.seoDescription?.trim() || meta.siteDescription?.trim() || "NFOOD Restaurant SaaS";
    const previousTitle = document.title;
    document.title = title;
    const upsertMeta = (kind: "name" | "property", key: string, content: string) => {
      const selector = `meta[data-nfood-platform-seo="${kind}:${key}"]`;
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) { element = document.createElement("meta"); element.dataset.nfoodPlatformSeo = `${kind}:${key}`; element.setAttribute(kind, key); document.head.appendChild(element); }
      element.content = content;
    };
    upsertMeta("name", "description", description);
    upsertMeta("name", "keywords", meta.seoKeywords ?? "");
    upsertMeta("name", "robots", meta.seoRobots || "index,follow");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", meta.seoCanonicalUrl?.trim() || window.location.href);
    if (meta.seoImageUrl?.trim()) upsertMeta("property", "og:image", meta.seoImageUrl.trim());
    const verification = meta.googleSearchConsoleVerification?.trim();
    if (verification) upsertMeta("name", "google-site-verification", verification);
    const analyticsId = meta.googleAnalyticsMeasurementId?.trim();
    const tagManagerId = meta.googleTagManagerId?.trim();
    const addedScripts: HTMLScriptElement[] = [];
    if (/^G-[A-Z0-9]+$/i.test(analyticsId ?? "")) {
      const script = document.createElement("script"); script.id = "nfood-platform-google-analytics"; script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId!)}`; document.head.appendChild(script); addedScripts.push(script);
      const inline = document.createElement("script"); inline.id = "nfood-platform-google-analytics-init"; inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${analyticsId}");`; document.head.appendChild(inline); addedScripts.push(inline);
    }
    if (/^GTM-[A-Z0-9]+$/i.test(tagManagerId ?? "")) {
      const script = document.createElement("script"); script.id = "nfood-platform-google-tag-manager"; script.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!="dataLayer"?"&l="+l:"";j.async=true;j.src="https://www.googletagmanager.com/gtm.js?id="+i+dl;f.parentNode.insertBefore(j,f);})(window,document,"script","dataLayer","${tagManagerId}");`; document.head.appendChild(script); addedScripts.push(script);
    }
    let structuredNode: HTMLScriptElement | null = null;
    if (meta.structuredDataJson?.trim()) { try { JSON.parse(meta.structuredDataJson); structuredNode = document.createElement("script"); structuredNode.id = "nfood-platform-structured-data"; structuredNode.type = "application/ld+json"; structuredNode.text = meta.structuredDataJson; document.head.appendChild(structuredNode); } catch { console.warn("[SEO] platform structuredDataJson is not valid JSON"); } }
    return () => { document.title = previousTitle; addedScripts.forEach(script => script.remove()); structuredNode?.remove(); document.head.querySelectorAll("meta[data-nfood-platform-seo]").forEach(node => node.remove()); };
  }, [siteMeta.data, user]);
  const [testEmail, setTestEmail] = useState(() => typeof window !== "undefined" ? window.localStorage.getItem("nfood-remembered-email") ?? "fooncards@gmail.com" : "fooncards@gmail.com");
  const [testPassword, setTestPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("nfood-remember-me") === "true");
  const [showRegister, setShowRegister] = useState(() => location === "/register" || location === "/restaurant/register");
  const [resetToken, setResetToken] = useState(() => typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("reset") : null);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const testLogin = trpc.auth.testLogin.useMutation({ onSuccess: async () => { if (rememberMe) { window.localStorage.setItem("nfood-remembered-email", testEmail); window.localStorage.setItem("nfood-remember-me", "true"); } else { window.localStorage.removeItem("nfood-remembered-email"); window.localStorage.removeItem("nfood-remember-me"); } toast.success("تم تسجيل الدخول لحساب الاختبار"); await refresh(); setLocation("/dashboard"); }, onError: (error) => toast.error(error.message || "بيانات الدخول غير صحيحة") });
  const requestPasswordReset = trpc.auth.requestPasswordReset.useMutation({ onSuccess: (result) => { setForgotMessage(result.message); toast.success(result.message); }, onError: (error) => toast.error(error.message || "تعذر إرسال رابط الاستعادة") });
  const adminReturn = trpc.auth.adminReturn.useMutation({ onSuccess: (data) => { saveAdminReturnReport(data.report); window.location.reload(); }, onError: (error) => toast.error(error.message || "تعذرت العودة إلى جلسة الإدارة") });
  useEffect(() => { const report = consumeAdminReturnReport(); if (report) toast.success(formatAdminReturnReport(report)); }, []);
  const [active, setActive] = useState<NavKey>(() => {
    if (typeof window === "undefined") return "overview";
    const requested = new URLSearchParams(window.location.search).get("module") as NavKey | null;
    return requested && navItems.some(item => item.key === requested) ? requested : "overview";
  });
  const localizedNavItems = useMemo(() => navItems.map((item) => ({ ...item, label: item.key === "trend" ? "Trend Kitchen · سوق نفود" : item.key === "languages" ? (language === "ar" ? "اللغة والترجمة" : language === "fr" ? "Langue et traduction" : language === "ur" ? "زبان اور ترجمہ" : "Language & translation") : t(navTranslationKeys[item.key]) })), [language, t]);
  const visibleNavItems = useMemo(() => { const role = (user?.testRole as string | undefined) ?? (user?.role === "admin" ? "admin" : user ? "customer" : undefined); const keys = getVisibleNavigation(role, user?.role === "admin" || role === "admin"); return localizedNavItems.filter((item) => keys.includes(item.key as (typeof keys)[number])); }, [user?.role, user?.testRole, localizedNavItems]);
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen(true); return; }
      if (event.key === "Escape") { setCommandOpen(false); setNotificationOpen(false); return; }
      if (isTyping || !event.altKey || !/^[1-9]$/.test(event.key)) return;
      const shortcutItem = visibleNavItems[Number(event.key) - 1];
      if (shortcutItem) { event.preventDefault(); setActive(shortcutItem.key); toast.info(`${shortcutItem.label} · Alt+${event.key}`); }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [visibleNavItems]);
  useEffect(() => { if (user && !visibleNavItems.some((item) => item.key === active)) setActive("overview"); }, [user, active, visibleNavItems]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(() => { if (typeof window === "undefined") return 1; const stored = Number(window.localStorage.getItem("nfood-selected-restaurant")); return Number.isInteger(stored) && stored > 0 ? stored : 1; });
  const isCentralAdmin = user?.role === "admin" || (user?.testRole as string | undefined) === "admin";
  const isDriver = user?.testRole === "driver";
  const platformRestaurantsQuery = trpc.platform.restaurants.useQuery(undefined, { enabled: Boolean(user && !isCentralAdmin && !isDriver), retry: 2 });
  const centralRestaurantsQuery = trpc.admin.restaurants.useQuery(undefined, { enabled: Boolean(user && isCentralAdmin), retry: 2 });
  const restaurantsQuery = isCentralAdmin ? centralRestaurantsQuery : platformRestaurantsQuery;
  useEffect(() => { const restaurants = restaurantsQuery.data ?? []; if (!restaurants.length) return; const available = restaurants.some((restaurant) => restaurant.id === selectedRestaurantId); const nextId = available ? selectedRestaurantId : restaurants[0].id; if (nextId !== selectedRestaurantId) setSelectedRestaurantId(nextId); window.localStorage.setItem("nfood-selected-restaurant", String(nextId)); }, [restaurantsQuery.data, selectedRestaurantId]);
  const workspaceState = getWorkspaceState(restaurantsQuery.data ?? [], selectedRestaurantId);
  const workspaceReady = Boolean(user && (isCentralAdmin || workspaceState === "ready"));
  const showRestaurantContext = !isCentralAdmin && user?.testRole !== "customer";
  useEffect(() => { if (restaurantsQuery.isError && !isCentralAdmin) toast.error("تعذر تحميل قائمة المطاعم الآن؛ يمكنك متابعة الدخول وإعادة المحاولة من محدد المطعم."); }, [restaurantsQuery.isError, isCentralAdmin]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showVcardBinding, setShowVcardBinding] = useState(false);
  const vcardFeatureQuery = trpc.platform.vcardFeature.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [notificationPulse, setNotificationPulse] = useState(false);
  const previousUnreadCount = useRef<number | null>(null);
  const [notificationFilter, setNotificationFilter] = useState<"all" | "unread">("unread");
  const [notificationPrinterQuery, setNotificationPrinterQuery] = useState("");
  const [notificationRestaurantQuery, setNotificationRestaurantQuery] = useState("");
  const pendingTransfersQuery = trpc.admin.subscriptionTransferReceipts.useQuery(undefined, { enabled: isCentralAdmin, refetchInterval: isCentralAdmin ? 5000 : false, retry: false });
  const pendingTransferCount = pendingTransfersQuery.data?.filter((receipt) => receipt.status === "pending").length ?? 0;
  const [transferBannerDismissed, setTransferBannerDismissed] = useState(false);
  useEffect(() => { setTransferBannerDismissed(false); }, [pendingTransferCount]);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboardFullscreen, setDashboardFullscreen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const globalSearchQuery = trpc.platform.globalSearch.useQuery({ restaurantId: selectedRestaurantId, query: commandQuery, limit: 20 }, { enabled: !isDriver && commandOpen && commandQuery.trim().length >= 2 && workspaceReady, retry: false });
  const workspaceBranches = trpc.platform.branches.useQuery({ restaurantId: selectedRestaurantId }, { enabled: !isDriver && workspaceReady, retry: 2 });
  const activeBranchId = workspaceBranches.data?.find((branch) => branch.status === "open")?.id ?? workspaceBranches.data?.[0]?.id;
  const isWaiter = user?.testRole === "waiter";
  const roleSummaryQuery = trpc.platform.roleSummary.useQuery({ restaurantId: selectedRestaurantId, branchId: activeBranchId }, { enabled: !isDriver && Boolean(user && selectedRestaurantId > 0 && workspaceReady), retry: 2 });
  const brandingQuery = trpc.platform.branding.useQuery({ restaurantId: selectedRestaurantId }, { enabled: !isDriver && workspaceReady, retry: false });
  const [globalForbiddenAction, setGlobalForbiddenAction] = useState<string | null>(null);
  useEffect(() => {
    if (isCentralAdmin) {
      setGlobalForbiddenAction(null);
      return;
    }
    if (globalSearchQuery.error?.data?.code === "FORBIDDEN") setGlobalForbiddenAction("global.search");
    else if (roleSummaryQuery.error?.data?.code === "FORBIDDEN") setGlobalForbiddenAction("dashboard.summary");
  }, [globalSearchQuery.error, roleSummaryQuery.error, isCentralAdmin]);
  useEffect(() => {
    const onForbidden = (event: Event) => {
      if (isCentralAdmin) return;
      const action = (event as CustomEvent<{ action?: string }>).detail?.action;
      if (action === "global.search" || action === "dashboard.summary") {
        setGlobalForbiddenAction(action);
      }
    };
    window.addEventListener("nfood:forbidden", onForbidden);
    return () => window.removeEventListener("nfood:forbidden", onForbidden);
  }, [isCentralAdmin]);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [pwaInstalled, setPwaInstalled] = useState(() => typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches);
  const [pushStatus, setPushStatus] = useState<NotificationPermission | "unsupported">(() => typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  const pushSubscribe = trpc.notifications.pushSubscribe.useMutation();
  const enablePush = async () => { if (typeof Notification === "undefined" || !("serviceWorker" in navigator)) { toast.error("المتصفح الحالي لا يدعم إشعارات Push"); return; } const permission = await Notification.requestPermission(); setPushStatus(permission); if (permission !== "granted") { toast.info("لم يتم تفعيل الإشعارات"); return; } try { const registration = await navigator.serviceWorker.ready; const subscription = await registration.pushManager.getSubscription(); if (subscription) { const json = subscription.toJSON(); if (json.endpoint && json.keys?.p256dh && json.keys.auth) { await pushSubscribe.mutateAsync({ endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth }, userAgent: navigator.userAgent }); toast.success("تم تفعيل إشعارات NFOOD وحفظ الجهاز"); return; } } toast.info("تم السماح بالإشعارات. يلزم ربط مفتاح Push للإرسال الإنتاجي."); } catch { toast.error("تعذر حفظ اشتراك الإشعارات"); } };
  useEffect(() => { const capture = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); }; const installed = () => { setPwaInstalled(true); setInstallPrompt(null); toast.success("تم تثبيت تطبيق NFOOD"); }; window.addEventListener("beforeinstallprompt", capture); window.addEventListener("appinstalled", installed); return () => { window.removeEventListener("beforeinstallprompt", capture); window.removeEventListener("appinstalled", installed); }; }, []);
    const installApp = async () => { if (!installPrompt) return; await installPrompt.prompt(); const result = await installPrompt.userChoice; if (result.outcome === "accepted") toast.success(t("installApp")); setInstallPrompt(null); };
  useEffect(() => { const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!manifestLink) return;
    const defaultTitle = "NFOOD Restaurant SaaS";
    if (!user) {
      document.title = defaultTitle;
      if (themeMeta) themeMeta.content = "#e76f3c";
      manifestLink.href = "/manifest.webmanifest";
      return;
    }
    const role = user.role === "admin" ? "admin" : (user.testRole ?? "customer");
    const brand = brandingQuery.data;
    document.title = brand?.brandName || defaultTitle;
    if (themeMeta) themeMeta.content = brand?.brandColor || "#e76f3c";
    // Keep the manifest on a stable HTTP URL. Blob manifests are not installable
    // in several browsers even when the page itself has a valid service worker.
    manifestLink.href = `/manifest.${role}.webmanifest`;
    return () => {
      manifestLink.href = "/manifest.webmanifest";
      document.title = defaultTitle;
      if (themeMeta) themeMeta.content = "#e76f3c";
    };
  }, [brandingQuery.data, user?.role, user?.testRole, Boolean(workspaceReady)]);
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen(true); } if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "n") { event.preventDefault(); setNotificationOpen((open) => !open); } if (event.key === "Escape") { setCommandOpen(false); setNotificationOpen(false); } }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, []);
  useEffect(() => { const onFullscreenChange = () => setDashboardFullscreen(document.fullscreenElement === document.documentElement); document.addEventListener("fullscreenchange", onFullscreenChange); return () => document.removeEventListener("fullscreenchange", onFullscreenChange); }, []);
  const toggleDashboardFullscreen = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen?.(); } catch { toast.info("لا يدعم المتصفح وضع الشاشة الكاملة من هذا الجهاز"); } };
  const resetDashboardLayout = () => { setSidebarCollapsed(false); setCommandOpen(false); setNotificationOpen(false); try { Object.keys(window.localStorage).filter((key) => key.startsWith("nfood.dashboard") || key.startsWith("nfood:sidebar-")).forEach((key) => window.localStorage.removeItem(key)); } catch { /* storage may be unavailable */ } toast.success(language === "ar" ? "تمت استعادة التخطيط الافتراضي" : language === "fr" ? "Disposition réinitialisée" : language === "ur" ? "ڈیفالٹ لے آؤٹ بحال ہو گیا" : "Default layout restored"); };
  const notificationsQuery = trpc.notifications.mine.useQuery(undefined, { enabled: Boolean(user), retry: 2, refetchInterval: 5000, refetchIntervalInBackground: false, refetchOnWindowFocus: true, staleTime: 1000 });
  const preferencesQuery = trpc.platform.myPreferences.useQuery(undefined, { enabled: Boolean(user), retry: false, staleTime: 30000 });
  const savePreferences = trpc.platform.saveMyPreferences.useMutation({ onSuccess: () => preferencesQuery.refetch() });
  useEffect(() => { if (preferencesQuery.data?.notificationPreferencesJson !== undefined) setNotificationPreferences(parseNotificationPreferences(preferencesQuery.data.notificationPreferencesJson)); }, [preferencesQuery.data?.notificationPreferencesJson]);
  const markNotificationRead = trpc.notifications.markRead.useMutation({ onSuccess: () => notificationsQuery.refetch() });
  const markAllNotificationsRead = trpc.notifications.markAllRead.useMutation({ onSuccess: () => notificationsQuery.refetch() });
  const deleteAllNotifications = trpc.notifications.deleteAll.useMutation({ onSuccess: () => { notificationsQuery.refetch(); setNotificationOpen(false); } });
  const unreadNotificationCount = (notificationsQuery.data ?? []).filter((item) => !item.readAt).length;
  useEffect(() => {
    const previous = previousUnreadCount.current;
    previousUnreadCount.current = unreadNotificationCount;
    if (previous === null || unreadNotificationCount <= previous) return;
    setNotificationPulse(true);
    const timer = window.setTimeout(() => setNotificationPulse(false), 700);
    if (notificationPreferences.vibrationEnabled) window.navigator.vibrate?.(130);
    if (notificationPreferences.soundEnabled) {
      try { const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext; if (AudioContextClass) { const context = new AudioContextClass(); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.frequency.value = 740; gain.gain.value = 0.035; oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.08); } } catch { /* browser audio policy may block notification sounds */ }
    }
    return () => window.clearTimeout(timer);
  }, [notificationPreferences.soundEnabled, notificationPreferences.vibrationEnabled, unreadNotificationCount]);
  const handleNotificationClick = (item: NonNullable<typeof notificationsQuery.data>[number]) => {
    if (!item.readAt) markNotificationRead.mutate({ notificationId: item.id });
    const destination: NavKey = item.type === "payment" ? "admin" : item.type === "task" || item.type === "message" ? "remote" : "overview";
    setActive(destination);
    setNotificationOpen(false);
  };
  const updateNotificationPreference = (key: keyof NotificationPreferences, value: boolean) => {
    const next = { ...notificationPreferences, [key]: value };
    setNotificationPreferences(next);
    const current = preferencesQuery.data;
    if (current) savePreferences.mutate({ language: current.language as "ar" | "en" | "fr" | "ur", themeMode: current.themeMode, themePreset: current.themePreset, notificationPreferencesJson: JSON.stringify(next) });
  };
  const visibleNotifications = useMemo(() => (notificationsQuery.data ?? []).filter((item) => { const text = `${item.title} ${item.body}`.toLowerCase(); return notificationPreferences[item.type] && (notificationFilter === "all" || !item.readAt) && (!notificationPrinterQuery.trim() || text.includes(notificationPrinterQuery.trim().toLowerCase())) && (!notificationRestaurantQuery.trim() || text.includes(notificationRestaurantQuery.trim().toLowerCase())); }), [notificationFilter, notificationPreferences, notificationPrinterQuery, notificationRestaurantQuery, notificationsQuery.data]);
  const remoteOrders = trpc.platform.ordersByRestaurant.useQuery({ restaurantId: selectedRestaurantId, limit: 200 }, { enabled: workspaceReady && user?.role !== "admin" && (user?.testRole as string | undefined) !== "admin", retry: false, refetchInterval: 3000, refetchIntervalInBackground: false, refetchOnWindowFocus: true, staleTime: 1000 });
  const updateOrderStatus = trpc.platform.updateOrderStatus.useMutation({ onSuccess: () => { remoteOrders.refetch(); toast.success("تم حفظ حالة الطلب في قاعدة البيانات"); }, onError: (error) => toast.error(`تعذر تحديث الطلب: ${error.message}`) });
  const [branch, setBranch] = useState("");
  useEffect(() => { const firstBranch = workspaceBranches.data?.[0]; setBranch((current) => current && workspaceBranches.data?.some((item) => item.name === current) ? current : firstBranch?.name ?? ""); }, [workspaceBranches.data]);
  const [query, setQuery] = useState("");
  const orders = useMemo(() => (remoteOrders.data ?? []).map((order) => ({ id: `#${order.id}`, table: order.tableName ?? "بدون طاولة", items: order.items?.length ? order.items.map((item) => `${item.quantity} × ${item.itemName}`).join("، ") : "لا توجد بنود محفوظة", itemDetails: order.items?.map((item) => ({ itemName: item.itemName, quantity: item.quantity, categoryName: item.categoryName ?? null })) ?? [], total: Number(order.total), status: order.status === "cancelled" ? "completed" : order.status, time: formatOrderTime(order.createdAt), createdAt: order.createdAt ?? null, paymentMethod: order.paymentMethod ?? null, currencyCode: order.currencyCode ?? null, guestName: order.guestName ?? null, guestPhone: order.guestPhone ?? null, customerNote: order.notes ?? null, cashierNotes: order.cashierNotes ?? null, deliveryNote: order.deliveryNote ?? null, channel: order.channel === "dine_in" ? "داخل المطعم" : order.channel === "takeaway" ? "استلام" : order.channel === "reservation" ? "حجز + طلب" : order.channel === "hotel" ? "فندق" : "توصيل", ageMinutes: orderAgeMinutes(order.createdAt), kitchenSectionId: order.kitchenSectionId ?? null, reservationDate: order.reservationDate ?? null, reservationEventType: order.reservationEventType ?? null, partySize: order.partySize ?? null, childrenCount: order.childrenCount ?? null, splitBillMode: order.splitBillMode ?? null })), [remoteOrders.data]);
  const visibleOrders = useMemo(() => orders.filter((order) => `${order.id} ${order.table} ${order.items}`.includes(query)), [orders, query]);
  const advanceOrder = (id: string) => {
    const current = orders.find((order) => order.id === id);
    if (!current) return;
    const next: OrderStatus = current.status === "new" ? "preparing" : current.status === "preparing" ? "ready" : "completed";
    const numericId = Number(id.replace("#", ""));
    if (!remoteOrders.data?.some((order) => order.id === numericId)) { toast.error("الطلب غير موجود في بيانات backend الحالية"); return; }
    updateOrderStatus.mutate({ restaurantId: selectedRestaurantId, orderId: numericId, status: next });
  };

  if (loading) return <div dir={direction} className="flex h-dvh items-center justify-center overflow-hidden bg-[#f6f7f9] text-slate-500 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-300"><div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-4 text-sm shadow-sm backdrop-blur"><span className="h-4 w-4 animate-spin rounded-full border-2 border-[#e76f3c]/25 border-t-[#e76f3c]" />جارٍ التحقق من الجلسة...</div></div>;
    if (resetToken) return <PasswordResetScreen token={resetToken} onComplete={() => { window.history.replaceState({}, "", window.location.pathname); setResetToken(null); }} onBack={() => { window.history.replaceState({}, "", window.location.pathname); setResetToken(null); }} />;
    if (location === "/register" || location === "/restaurant/register") return <RegisterScreen onBack={() => setLocation("/login")} onOAuth={() => startLogin()} />;
    if (location === "/login") return <TestLoginScreen email={testEmail} password={testPassword} setEmail={setTestEmail} setPassword={setTestPassword} rememberMe={rememberMe} setRememberMe={setRememberMe} onSubmit={() => testLogin.mutate({ email: testEmail, password: testPassword })} pending={testLogin.isPending} onOAuth={() => startLogin()} onRegister={() => setLocation("/restaurant/register")} onForgotPassword={() => { setForgotMessage(null); requestPasswordReset.mutate({ email: testEmail }); }} forgotPending={requestPasswordReset.isPending} forgotMessage={forgotMessage} loginError={testLogin.error?.message ?? null} />;
    if (!user) return showRegister ? <RegisterScreen onBack={() => setShowRegister(false)} onOAuth={() => startLogin()} /> : <TestLoginScreen email={testEmail} password={testPassword} setEmail={setTestEmail} setPassword={setTestPassword} rememberMe={rememberMe} setRememberMe={setRememberMe} onSubmit={() => testLogin.mutate({ email: testEmail, password: testPassword })} pending={testLogin.isPending} onOAuth={() => startLogin()} onRegister={() => setShowRegister(true)} onForgotPassword={() => { setForgotMessage(null); requestPasswordReset.mutate({ email: testEmail }); }} forgotPending={requestPasswordReset.isPending} forgotMessage={forgotMessage} loginError={testLogin.error?.message ?? null} />;
  if (((user.testRole as string | undefined) ?? (user.role === "admin" ? "admin" : "customer")) === "customer") return <CustomerPortal />;
  if (isDriver) return <div dir={direction} className="h-dvh min-h-0 overflow-hidden bg-[#f6f7f9] text-slate-900"><aside className={`fixed inset-y-0 z-20 hidden w-64 flex-col bg-[#091321] p-4 text-white shadow-2xl lg:flex ${direction === "rtl" ? "end-0 border-l" : "start-0 border-r"} border-white/10`}><div className="border-b border-white/10 pb-4"><p className="text-lg font-black tracking-[.18em]">NFOOD</p><p className="mt-1 text-xs text-slate-400">لوحة السائق</p></div><div className="mt-5 rounded-2xl bg-orange-500/15 px-3 py-3 text-sm font-bold text-orange-100"><Truck className="mb-2 h-5 w-5" />طلبات التوصيل</div><p className="mt-auto text-[11px] leading-5 text-slate-500">بيانات المطعم والخريطة والإعدادات غير متاحة لهذا الحساب.</p></aside><main className={`h-dvh overflow-y-auto p-4 sm:p-6 ${direction === "rtl" ? "lg:mr-64" : "lg:ml-64"}`}><DriverDeliveryView restaurantId={selectedRestaurantId} /></main></div>;
  const title = localizedNavItems.find((item) => item.key === active)?.label ?? t("overview");
  const sidebarGroups = [
    { id: "restaurant-overview", label: t("overview"), keys: ["overview", "admin"] as NavKey[] },
    { id: "restaurant-operations", label: t("operations"), keys: ["operations", "orders", "pos", "kds", "menu", "tables", "waiters", "drivers", "printers", "inventory", "reservations"] as NavKey[] },
    { id: "restaurant-people-growth", label: `${t("team")} · ${t("marketing")}`, keys: ["team", "marketing", "remote"] as NavKey[] },
    { id: "restaurant-workspace", label: t("accountPlatform"), keys: ["settings", "branches", "files"] as NavKey[] },
    { id: "restaurant-system", label: t("security"), keys: ["languages", "security", "health"] as NavKey[] },
  ].map((group) => ({ ...group, items: group.keys.map((key) => visibleNavItems.find((item) => item.key === key)).filter((item): item is (typeof visibleNavItems)[number] => Boolean(item)) })).filter((group) => group.items.length > 0);
  const handleLogout = async () => { await executeLogoutFlow({ logout, closeMenu: () => setProfileOpen(false), redirect: () => { window.location.href = "/"; }, notifySuccess: () => toast.success(t("logout")), notifyError: (message) => toast.error(message) }); };
  const handleSwitchAccount = async () => { await executeSwitchAccountFlow({ logout, closeMenu: () => setProfileOpen(false), startLogin, redirect: () => undefined, notifyError: (message) => toast.error(message) }); };
  return (
    <div dir={direction} lang={language} className="h-dvh min-h-0 overflow-hidden bg-[#f6f7f9] nfood-dashboard-shell text-[#182230] transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <HomeSidebar
        direction={direction}
        sidebarGroups={sidebarGroups}
        visibleNavItems={visibleNavItems}
        active={active}
        onNavigate={setActive}
        onCollapsedChange={setSidebarCollapsed}
        managerId={user.id}
        roleScope={user.role === "admin" ? "admin" : (user.testRole ?? "customer")}
        isCentralAdmin={isCentralAdmin}
        selectedRestaurantId={selectedRestaurantId}
        restaurants={restaurantsQuery.data ?? []}
        restaurantsLoading={restaurantsQuery.isLoading}
        onRestaurantChange={setSelectedRestaurantId}
        branch={branch}
        branches={workspaceBranches.data ?? []}
        branchesLoading={workspaceBranches.isLoading}
        branchesError={workspaceBranches.isError}
        onBranchChange={setBranch}
        onOpenCommand={() => setCommandOpen(true)}
        ordersLoading={remoteOrders.isLoading}
        orderCount={remoteOrders.data?.length ?? 0}
        pwaInstalled={pwaInstalled}
        canInstall={Boolean(installPrompt)}
        onInstall={installApp}
        pushStatus={pushStatus}
        onEnablePush={enablePush}
        onOpenNotifications={() => setNotificationOpen(true)}
        notificationCount={unreadNotificationCount}
        pendingReceiptCount={pendingTransferCount}
      />
      <main data-testid="dashboard-center-canvas" className={`${direction === "rtl" ? (sidebarCollapsed ? "lg:mr-[80px]" : "lg:mr-[256px]") : (sidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]")} h-dvh min-h-0 overflow-hidden flex flex-col gap-2 transition-[margin] duration-300 ease-in-out dark:bg-slate-950`}>{isCentralAdmin && pendingTransferCount > 0 && !transferBannerDismissed && <PendingTransferBanner count={pendingTransferCount} language={language as "ar" | "en" | "fr" | "ur"} onOpen={() => setActive("admin")} onClose={() => setTransferBannerDismissed(true)} />}{user?.loginMethod === "admin_impersonation" && <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-2xl border border-white/15 bg-[#101d31] p-2 text-white shadow-xl"><span className="hidden px-2 text-xs font-semibold text-slate-300 sm:inline">وضع تمثيل العميل</span><button type="button" disabled={adminReturn.isPending} onClick={() => adminReturn.mutate()} className="rounded-xl bg-[#e76f3c] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#d65e30]">{adminReturn.isPending ? t("loading") : "إنهاء الجلسة والعودة للإدارة"}</button></div>}
        <header data-testid="dashboard-center-header" className="sticky top-0 z-10 flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 bg-[#f6f7f9]/90 px-3 ps-14 py-2 overflow-visible backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-950/90 md:px-5 md:ps-5"><div className="min-w-0 flex-1 max-w-[calc(100%_-_11.5rem)] md:max-w-none">{showRestaurantContext && <div className="mb-1 flex items-center gap-2 text-xs text-slate-500"><span>{t("workspace")}</span><span>/</span><span className="font-medium text-slate-700">{restaurantsQuery.data?.find((restaurant) => restaurant.id === selectedRestaurantId)?.name ?? (restaurantsQuery.isLoading ? t("loadingRestaurant") : t("noRestaurant"))}</span></div>}<h1 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h1></div><div className="mx-3 hidden min-w-0 max-w-sm flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 shadow-sm transition-all focus-within:border-[#e76f3c] focus-within:shadow-md dark:border-slate-700 dark:bg-slate-900 md:flex"><Search className="h-4 w-4 shrink-0 text-slate-400" /><input aria-label={t("globalSearch")} value={commandQuery} onChange={(event) => { setCommandQuery(event.target.value); setCommandOpen(true); }} onFocus={() => setCommandOpen(true)} placeholder={t("globalSearch")} className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100" /><kbd className="hidden rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500 lg:inline">Ctrl K</kbd></div><div className="flex shrink-0 items-center gap-1 sm:gap-2"><button type="button" aria-label={dashboardFullscreen ? "الخروج من الشاشة الكاملة" : "فتح الشاشة الكاملة"} title={dashboardFullscreen ? "الخروج من الشاشة الكاملة" : "الشاشة الكاملة"} onClick={() => void toggleDashboardFullscreen()} className="hidden rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:text-[#e76f3c] active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 md:inline-flex">{dashboardFullscreen ? <Minimize2 className="h-[18px] w-[18px]" /> : <Maximize2 className="h-[18px] w-[18px]" />}</button><button type="button" aria-label="إعادة ضبط التخطيط" title="إعادة ضبط التخطيط" onClick={resetDashboardLayout} className="hidden rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:text-[#e76f3c] active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 md:inline-flex"><RotateCcw className="h-[18px] w-[18px]" /></button>{toggleTheme && <button type="button" aria-label={theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"} title={`${theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"} · Alt+T`} onClick={toggleTheme} className="hidden rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 sm:inline-flex shadow-sm transition hover:-translate-y-0.5 hover:text-[#e76f3c] active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}</button>}<LanguageSwitcher compact />{showRestaurantContext && restaurantsQuery.data?.find((restaurant) => restaurant.id === selectedRestaurantId)?.slug && <button type="button" aria-label={t("openPublicMenu")} title={t("openPublicMenu")} onClick={() => { const slug = restaurantsQuery.data?.find((restaurant) => restaurant.id === selectedRestaurantId)?.slug; if (slug) window.location.assign(publicMenuUrl(window.location.origin, slug)); }} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:text-[#e76f3c]"><Utensils className="h-[18px] w-[18px]" /></button>}<div className="relative"><button aria-label={t("openNotifications")} title="الإشعارات · Ctrl+Shift+N" aria-expanded={notificationOpen} onClick={() => setNotificationOpen((open) => !open)} className={`relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:text-[#e76f3c] ${notificationPulse ? "nfood-notification-pulse" : ""}`}><Bell className="h-[18px] w-[18px]" />{unreadNotificationCount > 0 && <span aria-label={`${unreadNotificationCount} إشعارات غير مقروءة`} className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#e76f3c] px-1 text-[10px] font-black leading-4 text-white shadow-sm dark:border-slate-900">{unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}</span>}</button>{notificationOpen && <div className="nfood-notification-popover absolute left-0 top-12 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"><div className="flex items-center justify-between border-b border-slate-100 px-3 py-2"><p className="text-sm font-bold">{t("notifications")}</p><div className="flex items-center gap-1"><span className="text-[10px] text-slate-400">{notificationsQuery.data?.length ?? 0}</span><button type="button" aria-label="إعدادات الإشعارات" title="إعدادات الإشعارات" onClick={() => setNotificationSettingsOpen((open) => !open)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-orange-50 hover:text-[#c75325]"><Settings2 className="h-3.5 w-3.5" /></button></div></div>{isCentralAdmin && pendingTransferCount > 0 && <button type="button" onClick={() => { setActive("admin"); setNotificationOpen(false); }} className="nfood-enter flex w-full items-center justify-between gap-3 rounded-xl bg-amber-50 px-3 py-2.5 text-right text-xs font-bold text-amber-900 transition hover:bg-amber-100"><span>{language === "ar" ? "إيصالات تحويل معلقة للمراجعة" : language === "fr" ? "Reçus de virement en attente" : language === "ur" ? "منتقلی کی رسیدیں جائزے کی منتظر ہیں" : "Pending transfer receipts"}</span><span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] text-white">{pendingTransferCount}</span></button>}<div className="flex items-center justify-between gap-2 border-b border-slate-100 px-2 py-2"><div className="flex gap-1" role="tablist" aria-label="تصفية الإشعارات"><button type="button" role="tab" aria-selected={notificationFilter === "unread"} onClick={() => setNotificationFilter("unread")} className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${notificationFilter === "unread" ? "bg-orange-50 text-[#c75325]" : "text-slate-500 hover:bg-slate-50"}`}>غير مقروءة</button><button type="button" role="tab" aria-selected={notificationFilter === "all"} onClick={() => setNotificationFilter("all")} className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${notificationFilter === "all" ? "bg-orange-50 text-[#c75325]" : "text-slate-500 hover:bg-slate-50"}`}>الكل</button></div><button type="button" disabled={unreadNotificationCount === 0 || markAllNotificationsRead.isPending} onClick={() => markAllNotificationsRead.mutate()} className="rounded-lg px-2 py-1 text-[10px] font-bold text-[#c75325] transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40">{markAllNotificationsRead.isPending ? "جارٍ التحديث…" : "تحديد الكل كمقروء"}</button><button type="button" disabled={(notificationsQuery.data?.length ?? 0) === 0 || deleteAllNotifications.isPending} onClick={() => deleteAllNotifications.mutate()} className="rounded-lg px-2 py-1 text-[10px] font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">{deleteAllNotifications.isPending ? "جارٍ الحذف…" : "حذف الكل"}</button></div><div className="grid grid-cols-2 gap-2 border-b border-slate-100 px-2 py-2"><input value={notificationPrinterQuery} onChange={(event) => setNotificationPrinterQuery(event.target.value)} placeholder="فلترة حسب الطابعة" aria-label="فلترة إشعارات الطابعة" className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[10px] outline-none focus:border-[#e76f3c]" /><input value={notificationRestaurantQuery} onChange={(event) => setNotificationRestaurantQuery(event.target.value)} placeholder="فلترة حسب المطعم" aria-label="فلترة إشعارات المطعم" className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[10px] outline-none focus:border-[#e76f3c]" /></div>{notificationSettingsOpen && <div className="border-b border-slate-100 bg-slate-50/70 px-3 py-2 dark:bg-slate-800/50"><p className="mb-2 text-[10px] font-bold text-slate-500">أنواع التنبيهات الظاهرة</p><div className="grid grid-cols-2 gap-1 text-[11px]">{([['task', 'المهام'], ['message', 'الرسائل'], ['payment', 'المدفوعات'], ['system', 'النظام']] as const).map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-lg px-1 py-1.5 text-slate-700 dark:text-slate-200"><input type="checkbox" checked={notificationPreferences[key]} onChange={(event) => updateNotificationPreference(key, event.target.checked)} className="accent-[#e76f3c]" /><span>{label}</span></label>)}</div><label className="mt-1 flex items-center gap-2 rounded-lg px-1 py-1.5 text-[11px] text-slate-700 dark:text-slate-200"><input type="checkbox" checked={notificationPreferences.vibrationEnabled} onChange={(event) => updateNotificationPreference("vibrationEnabled", event.target.checked)} className="accent-[#e76f3c]" /><span>اهتزاز عند وصول تنبيه</span></label><label className="flex items-center gap-2 rounded-lg px-1 py-1.5 text-[11px] text-slate-700 dark:text-slate-200"><input type="checkbox" checked={notificationPreferences.soundEnabled} onChange={(event) => updateNotificationPreference("soundEnabled", event.target.checked)} className="accent-[#e76f3c]" /><span>صوت خفيف عند وصول تنبيه</span></label></div>}<div className="max-h-72 overflow-y-auto">{visibleNotifications.length === 0 ? <p className="px-3 py-8 text-center text-xs text-slate-500">{t("noNotifications")}</p> : visibleNotifications.map((item) => <button key={item.id} onClick={() => handleNotificationClick(item)} className={`w-full rounded-xl px-3 py-3 text-right hover:bg-orange-50 ${item.readAt ? "opacity-60" : ""}`}><p className="text-xs font-bold">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.body}</p></button>)}</div></div>}</div><div className="relative block"><button aria-label={t("profileMenu")} aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)} className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#e76f3c] text-sm font-bold text-white shadow-sm transition hover:bg-[#d85f2e]">{user?.avatarUrl ? <img src={user.avatarUrl} alt={t("accountImageSettings")} className="h-full w-full object-cover" /> : user?.name?.[0] || "م"}</button>{profileOpen && <div className="absolute left-0 top-11 z-50 w-[min(16rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-2 text-right shadow-xl dark:border-slate-700 dark:bg-slate-900"><div className="border-b border-slate-100 px-3 py-3"><p className="text-sm font-bold">{user?.name || "حساب NFOOD"}</p><p className="mt-1 truncate text-xs text-slate-500">{user?.email || "لم يتم تسجيل الدخول"}</p></div><button onClick={() => { setShowPreferences(true); setProfileOpen(false); }} className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-[#e76f3c]">{t("language")}</button>{(user?.testRole === "customer" || (!user?.testRole && user?.role === "user")) && <button onClick={() => { window.location.assign("/account-profile"); }} className="mt-2 flex w-full items-center rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-[#e76f3c]">{t("accountImageSettings")}</button>}{user?.testRole === "customer" && <button onClick={() => { setShowCustomerProfile(true); setProfileOpen(false); }} className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-[#e76f3c]">{t("publicProfileSettings")}</button>}<button onClick={handleLogout} className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50">{t("logout")}</button></div>}</div></div><button type="button" aria-label={t("openNavigation")} onClick={() => setMobileSidebarOpen(true)} className={`fixed top-3 z-50 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm lg:hidden start-3`}><MenuIcon className="h-5 w-5" /></button></header>{commandOpen && <div className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-950/30 px-4 pt-24" onMouseDown={() => setCommandOpen(false)}><div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3"><Search className="h-5 w-5 text-slate-400" /><input autoFocus value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} placeholder={t("globalSearch")} className="flex-1 bg-transparent text-sm outline-none" /><kbd className="rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-500">Esc</kbd></div><div className="max-h-[55vh] overflow-y-auto p-2">{globalSearchQuery.isLoading && <p className="px-3 py-3 text-xs text-slate-500">{t("loading")}</p>}{globalSearchQuery.isError && <p className="px-3 py-3 text-xs text-red-600">{t("error")} {t("requestId")}: search-{selectedRestaurantId}</p>}{globalSearchQuery.data?.results.map((result) => <button key={`${result.type}-${result.id}`} onClick={() => { setActive(result.action as NavKey); setCommandOpen(false); setCommandQuery(""); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right hover:bg-orange-50"><Search className="h-4 w-4 text-[#e76f3c]" /><span className="text-sm font-semibold">{result.title}</span><span className="mr-auto text-xs text-slate-400">{result.subtitle}</span></button>)}{localizedNavItems.filter((item) => visibleNavItems.some((visible) => visible.key === item.key) && item.label.includes(commandQuery)).map((item) => { const Icon = item.icon; return <button key={item.key} onClick={() => { setActive(item.key); setCommandOpen(false); setCommandQuery(""); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right hover:bg-orange-50"><Icon className="h-4 w-4 text-[#e76f3c]" /><span className="text-sm font-semibold">{item.label}</span><span className="mr-auto text-xs text-slate-400">{t("module")}</span></button>; })}{orders.filter((order) => `${order.id} ${order.table} ${order.items}`.includes(commandQuery)).slice(0, 5).map((order) => <button key={order.id} onClick={() => { setActive("orders"); setCommandOpen(false); setCommandQuery(""); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right hover:bg-slate-50"><ShoppingBag className="h-4 w-4 text-slate-400" /><span className="text-sm font-semibold">{order.id} · {order.table}</span><span className="mr-auto text-xs text-slate-400">{t("newOrder")}</span></button>)}{localizedNavItems.filter((item) => visibleNavItems.some((visible) => visible.key === item.key) && item.label.includes(commandQuery)).length === 0 && orders.filter((order) => `${order.id} ${order.table} ${order.items}`.includes(commandQuery)).length === 0 && (globalSearchQuery.data?.results.length ?? 0) === 0 && !globalSearchQuery.isLoading && <p className="px-3 py-10 text-center text-sm text-slate-500">{t("noResults")}</p>}</div></div></div>}
        <div className="nfood-dashboard-content nfood-scroll-area min-h-0 flex-1 overflow-y-auto p-2 pb-4 md:p-3 xl:p-4">
          <div data-testid="dashboard-center-workspace" className="mx-auto w-full max-w-[1600px] space-y-3">{isWaiter && activeBranchId ? <WaiterCallsPanel restaurantId={selectedRestaurantId} branchId={activeBranchId} /> : null}
          {showPreferences ? <AccountPreferencesPanel onClose={() => setShowPreferences(false)} /> : showCustomerProfile ? <CustomerProfileSettings embedded onClose={() => setShowCustomerProfile(false)} /> : showVcardBinding ? <VcardAccountBinding role={user?.testRole === "driver" ? "driver" : "restaurant"} onClose={() => setShowVcardBinding(false)} /> : globalForbiddenAction ? <AccessDeniedView feature={globalForbiddenAction} /> : active === "overview" ? (isCentralAdmin ? <PlatformOverview onNavigate={() => setActive("admin")} /> : <RestaurantOverviewWorkspace restaurantId={selectedRestaurantId} orders={visibleOrders} summary={roleSummaryQuery.data} summaryLoading={roleSummaryQuery.isLoading} summaryError={roleSummaryQuery.isError} onNavigate={setActive} role={user?.testRole} />) : !visibleNavItems.some((item) => item.key === active) ? <AccessDeniedView feature={active} /> : <Suspense fallback={<div className="flex min-h-28 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/60 text-sm text-slate-500 shadow-sm backdrop-blur"><span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#e76f3c]/25 border-t-[#e76f3c]" />{t("loading")}</div>}><LazyModuleView active={active} orders={visibleOrders} advanceOrder={advanceOrder} orderUpdatePending={updateOrderStatus.isPending} setActive={setActive} restaurantId={selectedRestaurantId} branchId={activeBranchId} ordersLoading={remoteOrders.isLoading} ordersError={remoteOrders.isError} role={user?.testRole} /></Suspense>}
          </div>
        </div>
        <MobileNavigationDrawer
          open={mobileSidebarOpen}
          direction={direction}
          visibleNavItems={visibleNavItems}
          active={active}
          onNavigate={setActive}
          onClose={() => setMobileSidebarOpen(false)}
          isCentralAdmin={isCentralAdmin}
          isRestaurantAdmin={user?.testRole === "restaurant_admin"}
          selectedRestaurantId={selectedRestaurantId}
        />
      </main>
    </div>
  );
}

function EmptyWorkspaceView() { return <div className="flex min-h-[58vh] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60"><div className="max-w-md px-6 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#e76f3c]"><LayoutDashboard className="h-6 w-6" /></div><h2 className="mt-4 text-xl font-bold text-slate-800">مساحة العمل جاهزة</h2><p className="mt-2 text-sm leading-7 text-slate-500">اختر أي عنصر من الشريط الجانبي لفتح تفاصيله هنا. عند إغلاق العنصر يعود الوسط إلى مساحة فارغة للرسوم البيانية والبيانات النشطة.</p></div></div>; }


function Overview({ restaurantId, orders, advanceOrder, query, setQuery, role, onNavigate, quickItems, summary, summaryLoading, summaryError, lastUpdatedAt, ordersLoading, ordersError }: { restaurantId: number; orders: Order[]; advanceOrder: (id: string) => void; query: string; setQuery: (value: string) => void; role?: string; onNavigate: (key: NavKey) => void; quickItems: DashboardQuickAccessItem[]; summary?: { available: boolean; sales: number; orders: number; average: number; avgFulfillmentMinutes: number; newOrders: number; preparing: number; ready: number; completed: number; tables: number }; summaryLoading: boolean; summaryError: boolean; lastUpdatedAt?: number; ordersLoading: boolean; ordersError: boolean }) {
  const statsByRole: Record<string, { label: string; value: string; change: string; icon: typeof CircleDollarSign; tint: string }[]> = { restaurant_admin: [{ label: "الإيرادات المحصلة", value: `${formatMoney("12840", "SAR", "en-US")} SAR`, change: "+18.4%", icon: CircleDollarSign, tint: "orange" }, { label: "الطلبات اليوم", value: "186", change: "+12.2%", icon: ShoppingBag, tint: "blue" }, { label: "متوسط قيمة الطلب", value: `${formatMoney("69.03", "SAR", "en-US")} SAR`, change: "+5.6%", icon: WalletCards, tint: "violet" }, { label: "الطاولات المشغولة", value: "18 / 32", change: "56% إشغال", icon: Table2, tint: "emerald" }], waiter: [{ label: "طلبات تنتظر الخدمة", value: "24", change: "جديد", icon: ShoppingBag, tint: "orange" }, { label: "طاولات بها طلبات", value: "0", change: "من بيانات المطعم", icon: Table2, tint: "blue" }, { label: "متوسط دورة الطلب", value: "0 د", change: "من البيانات الفعلية", icon: WalletCards, tint: "violet" }, { label: "طلبات تحتاج متابعة", value: "6", change: "اليوم", icon: CircleDollarSign, tint: "emerald" }], kitchen: [{ label: "طلبات جديدة", value: "14", change: "عاجل", icon: ChefHat, tint: "orange" }, { label: "قيد التحضير", value: "22", change: "الآن", icon: ShoppingBag, tint: "blue" }, { label: "متوسط دورة الطلب", value: "0 د", change: "من البيانات الفعلية", icon: WalletCards, tint: "violet" }, { label: "جاهز للتسليم", value: "9", change: "بانتظار النادل", icon: CheckCircle2, tint: "emerald" }], cashier: [{ label: "طلبات بانتظار الدفع", value: "12", change: "الآن", icon: WalletCards, tint: "orange" }, { label: "المدفوعات المحصلة", value: `${formatMoney("8460", "SAR", "en-US")} SAR`, change: "+9.4%", icon: CircleDollarSign, tint: "blue" }, { label: "متوسط التحصيل", value: `${formatMoney("68.20", "SAR", "en-US")} SAR`, change: "+3.1%", icon: ShoppingBag, tint: "violet" }, { label: "مرتجعات معلقة", value: "2", change: "تحتاج مراجعة", icon: Table2, tint: "emerald" }], customer: [{ label: "الطلبات الجديدة", value: "0", change: "من بيانات المطعم", icon: ShoppingBag, tint: "orange" }, { label: "طلبات مكتملة", value: "0", change: "من بيانات المطعم", icon: CheckCircle2, tint: "blue" }, { label: "إجمالي الطلبات", value: "0", change: "من بيانات المطعم", icon: CircleDollarSign, tint: "violet" }, { label: "طلبات جاهزة", value: "0", change: "من بيانات المطعم", icon: WalletCards, tint: "emerald" }], driver: [{ label: "طلبات مخصصة", value: "7", change: "اليوم", icon: ShoppingBag, tint: "orange" }, { label: "قيد التوصيل", value: "3", change: "الآن", icon: Table2, tint: "blue" }, { label: "متوسط دورة الطلب", value: "0 د", change: "من البيانات الفعلية", icon: WalletCards, tint: "violet" }, { label: "تسليمات مكتملة", value: "31", change: "+12.5%", icon: CheckCircle2, tint: "emerald" }] };
  const baseStats = statsByRole[role ?? "restaurant_admin"] ?? statsByRole.restaurant_admin;
  const liveValues: Record<string, string[]> = { restaurant_admin: [`${Math.round(summary?.sales ?? 0).toLocaleString("en-US")} SAR`, String(summary?.orders ?? 0), `${Math.round(summary?.average ?? 0).toLocaleString("en-US")} SAR`, `${summary?.tables ?? 0}`], waiter: [String(summary?.newOrders ?? 0), String(summary?.tables ?? 0), `${Math.round(summary?.average ?? 0).toLocaleString("en-US")} SAR`, String(summary?.ready ?? 0)], kitchen: [String(summary?.newOrders ?? 0), String(summary?.preparing ?? 0), `${Math.round(summary?.avgFulfillmentMinutes ?? 0)} د`, String(summary?.ready ?? 0)], cashier: [String(summary?.newOrders ?? 0), `${Math.round(summary?.sales ?? 0).toLocaleString("en-US")} SAR`, `${Math.round(summary?.average ?? 0).toLocaleString("en-US")} SAR`, String(summary?.completed ?? 0)], customer: [String(summary?.newOrders ?? 0), String(summary?.completed ?? 0), String(summary?.orders ?? 0), String(summary?.ready ?? 0)], driver: [String(summary?.newOrders ?? 0), String(summary?.preparing ?? 0), `${Math.round(summary?.avgFulfillmentMinutes ?? 0)} د`, String(summary?.completed ?? 0)] };
  const stats = baseStats.map((stat, index) => ({ ...stat, value: summary ? liveValues[role ?? "restaurant_admin"]?.[index] ?? "غير متاح" : summaryLoading ? "جارٍ..." : "غير متاح", change: summary ? "مؤشر مباشر" : summaryLoading ? "جارٍ التحقق" : "بانتظار البيانات" }));
  const roleFocus: Record<string, { title: string; body: string; action: string; target: NavKey }> = { restaurant_admin: { title: "مركز إدارة المطعم", body: "راجع الطلبات والفروع والعمليات اليومية من مساحة المطعم.", action: "فتح الطلبات", target: "orders" }, waiter: { title: "مركز خدمة الطاولات", body: "تابع الطلبات الجديدة وإشغال الطاولات وتواصل مع فريق المطبخ.", action: "فتح الطلبات", target: "orders" }, kitchen: { title: "مركز تشغيل المطبخ", body: "ابدأ بالطلبات الجديدة ثم انقلها إلى التحضير والجاهزية.", action: "فتح KDS", target: "kds" }, cashier: { title: "مركز الكاشير", body: "أنشئ طلبًا جديدًا وتحقق من حالة الدفع والطلبات المكتملة.", action: "فتح POS", target: "pos" }, customer: { title: "مركز العميل", body: "استعرض طلباتك الأخيرة وأعد الطلب من المساحة الموحدة.", action: "عرض الطلبات", target: "orders" }, driver: { title: "مركز التوصيل", body: "تابع الطلبات المخصصة لك وتحديثات مهام التوصيل.", action: "فتح الطلبات", target: "orders" } };
  const focus = dashboardProfiles[(role as keyof typeof dashboardProfiles) ?? "restaurant_admin"] ?? dashboardProfiles.restaurant_admin;
  return <>{summaryError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">تعذر تحميل مؤشرات الدور. Request ID: role-summary-{role ?? "unknown"}</div>}{summary && summary.orders === 0 && <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600"><ShoppingBag className="h-5 w-5 text-slate-400" /><div><p className="font-semibold">لا توجد بيانات تشغيلية بعد</p><p className="mt-1 text-xs text-slate-500">ستظهر مؤشرات هذا الدور بعد تسجيل أول طلب في المطعم.</p></div></div>}<Card className="mb-5 rounded-2xl border-orange-100 bg-gradient-to-l from-orange-50 to-white shadow-sm"><CardContent className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="text-xs font-semibold text-[#e76f3c]">مساحة الدور</p><h3 className="mt-1 text-lg font-bold">{focus.title}</h3><p className="mt-1 text-sm text-slate-500">{focus.body}</p></div><div className="flex flex-wrap gap-2"><Button onClick={() => onNavigate(focus.target as NavKey)} className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]">{focus.action}</Button>{focus.secondary.map((item) => <Button key={item.target} variant="outline" onClick={() => onNavigate(item.target as NavKey)} className="rounded-xl border-orange-200 text-[#c65325] hover:bg-orange-50">{item.label}</Button>)}</div></CardContent></Card><DashboardQuickAccess items={quickItems} onNavigate={onNavigate} storageScope={`${restaurantId}:${role ?? "unknown"}`} />{role === "restaurant_admin" && <WaiterResponseStatsPanel restaurantId={restaurantId} />}<ManagerOperationsPanel restaurantId={restaurantId} orders={orders} ordersLoading={ordersLoading} ordersError={ordersError} summaryLoading={summaryLoading} summaryError={summaryError} lastUpdatedAt={lastUpdatedAt} onNavigate={onNavigate} /><AuditSecurityAlerts restaurantId={restaurantId} /><SmartInsightsPanel restaurantId={restaurantId} /><Card className="mb-5 overflow-hidden rounded-2xl border-emerald-200 bg-gradient-to-l from-emerald-50 via-white to-white shadow-sm"><CardContent className="flex flex-wrap items-center justify-between gap-4 p-5"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><HardDrive className="h-5 w-5" /></div><div><p className="text-xs font-bold text-emerald-700">مكتبة الملفات</p><h3 className="mt-1 text-lg font-black text-[#111c2e]">صور المنيو وملفات المطعم</h3><p className="mt-1 text-sm text-slate-500">الأرشيف التلقائي محفوظ داخل مجلد Menu Archive.</p></div></div><Button onClick={() => onNavigate("files")} className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"><HardDrive className="ml-2 h-4 w-4" /> فتح المكتبة</Button></CardContent></Card><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => { const Icon = stat.icon; const tone = stat.tint === "orange" ? "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300" : stat.tint === "blue" ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-300" : stat.tint === "violet" ? "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"; return <Card key={stat.label} className="group rounded-2xl border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/80 dark:bg-slate-900/90"><CardContent className="p-3 sm:p-5"><div className="flex items-start justify-between gap-3"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm transition-transform duration-200 group-hover:scale-105 ${tone}`}><Icon className="h-5 w-5" /></div><span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />{stat.change}</span></div><p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-300 sm:mt-5">{stat.label}</p><p className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{stat.value}</p></CardContent></Card>; })}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]"><Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm"><CardHeader className="flex-row items-center justify-between border-b border-slate-100 px-5 py-4"><div><CardTitle className="text-base">أداء المبيعات</CardTitle><p className="mt-1 text-xs text-slate-500">نظرة على مبيعات آخر 7 أيام</p></div><Badge variant="outline" className="rounded-lg border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">هذا الأسبوع <ChevronDown className="mr-1 inline h-3 w-3" /></Badge></CardHeader><CardContent className="p-5"><div className="flex h-[180px] items-center justify-center rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">لا تتوفر سلسلة مبيعات يومية محفوظة بعد. ستظهر هنا بعد ربط تقرير الفترة ببيانات الطلبات اليومية.</div><div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-[#e76f3c]" /> إجمالي المبيعات من المؤشر الحالي <strong className="mr-auto text-sm text-slate-800">{summary ? `${Math.round(summary.sales).toLocaleString("en-US")} SAR` : "غير متاح"}</strong></div></CardContent></Card>
      <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm"><CardHeader className="flex-row items-center justify-between border-b border-slate-100 px-5 py-4"><div><CardTitle className="text-base">الأصناف الأكثر مبيعاً</CardTitle><p className="mt-1 text-xs text-slate-500">حسب عدد الطلبات</p></div><Button variant="ghost" size="sm" className="text-xs text-[#e76f3c]" onClick={() => onNavigate("menu")}>عرض المنيو</Button></CardHeader><CardContent className="p-5"><div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">لا يتوفر تقرير أصناف فعلي بعد. سيظهر الترتيب عند ربط الطلبات ببنودها المحفوظة في orderItems.</div></CardContent></Card></div>
    <Card className="mt-6 rounded-2xl border-slate-200/80 bg-white shadow-sm"><CardHeader className="flex-row items-center justify-between border-b border-slate-100 px-5 py-4"><div><CardTitle className="text-base">آخر الطلبات</CardTitle><p className="mt-1 text-xs text-slate-500">تحديث مباشر من نقطة البيع والمطبخ</p></div><div className="flex items-center gap-2"><div className="relative hidden sm:block"><Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث في الطلبات" className="h-9 w-44 rounded-lg border-slate-200 pr-9 text-xs" /></div><Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => onNavigate("orders")}>عرض الطلبات <ArrowUpLeft className="mr-1 h-3 w-3" /></Button></div></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-right text-sm"><thead className="bg-slate-50/70 text-[11px] text-slate-500"><tr><th className="px-5 py-3 font-medium">رقم الطلب</th><th className="px-5 py-3 font-medium">الطاولة / القناة</th><th className="px-5 py-3 font-medium">الأصناف</th><th className="px-5 py-3 font-medium">الإجمالي</th><th className="px-5 py-3 font-medium">الحالة</th><th className="px-5 py-3 font-medium">إجراء</th></tr></thead><tbody>{orders.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center"><div className="flex flex-col items-center text-slate-400"><ShoppingBag className="mb-3 h-8 w-8" /><p className="text-sm font-semibold">لا توجد طلبات حتى الآن</p><p className="mt-1 text-xs">ستظهر الطلبات الجديدة هنا عند استقبالها من نقطة البيع.</p></div></td></tr> : orders.map((order) => <tr key={order.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/60"><td className="px-5 py-4 font-bold">{order.id}<div className="mt-0.5 text-[10px] font-normal text-slate-400">{order.time}</div></td><td className="px-5 py-4"><div className="font-medium">{order.table}</div><div className="mt-0.5 text-[11px] text-slate-400">{order.channel}</div></td><td className="max-w-[240px] truncate px-5 py-4 text-xs text-slate-500">{order.items}</td><td className="px-5 py-4 font-bold">{money(order.total)}</td><td className="px-5 py-4"><Badge variant="outline" className={`rounded-lg px-2.5 py-1 text-[11px] ${getOrderStatusPalette(order.status).className}`}><span className={`ml-1 inline-block h-1.5 w-1.5 rounded-full ${getOrderStatusPalette(order.status).dotClassName}`} />{getOrderStatusPalette(order.status).label}</Badge></td><td className="px-5 py-4"><button onClick={() => order.status !== "completed" ? advanceOrder(order.id) : toast.info("الطلب مكتمل بالفعل")} className="rounded-lg p-2 text-slate-400 hover:bg-orange-50 hover:text-[#e76f3c]" title="تحديث الحالة">{order.status !== "completed" ? <CheckCircle2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></td></tr>)}</tbody></table></div></CardContent></Card></>;
}
