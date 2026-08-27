import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  Bell,
  ChevronDown,
  LifeBuoy,
  LayoutDashboard,
  PanelLeft,
  Pin,
  Printer,
  ReceiptText,
  Search,
  Settings2,
  ShieldCheck,
  Star,
  Store,
  Utensils,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import type { NavKey } from "@/components/homeNavigation";
import {
  formatSidebarCount,
  getSidebarStatusTone,
  getSidebarWidth,
  isSidebarToggleShortcut,
  toggleSidebarFavorite,
  type SidebarStatusTone,
} from "@/lib/sidebarModel";

type SidebarItem = { key: NavKey; label: string; icon: LucideIcon };
type SidebarGroup = { id?: string; label: string; items: SidebarItem[] };
type RestaurantOption = { id: number; name: string };
type BranchOption = { id: number; name: string };

type HomeSidebarProps = {
  direction: "rtl" | "ltr";
  sidebarGroups: SidebarGroup[];
  visibleNavItems: SidebarItem[];
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
  managerId: number | string;
  roleScope: string;
  isCentralAdmin: boolean;
  selectedRestaurantId: number;
  restaurants: RestaurantOption[];
  restaurantsLoading: boolean;
  onRestaurantChange: (restaurantId: number) => void;
  branch: string;
  branches: BranchOption[];
  branchesLoading: boolean;
  branchesError: boolean;
  onBranchChange: (branchName: string) => void;
  onOpenCommand: () => void;
  ordersLoading: boolean;
  orderCount: number;
  pwaInstalled: boolean;
  canInstall: boolean;
  onInstall: () => void;
  pushStatus: NotificationPermission | "unsupported";
  onEnablePush: () => void;
  onOpenNotifications?: () => void;
  notificationCount?: number;
  pendingReceiptCount?: number;
  printerStatus?: SidebarStatusTone;
};

const statusStyles: Record<SidebarStatusTone, { dot: string; text: string; ring: string }> = {
  healthy: { dot: "bg-emerald-400", text: "text-emerald-200", ring: "ring-emerald-400/20" },
  checking: { dot: "bg-amber-300 animate-pulse", text: "text-amber-100", ring: "ring-amber-300/20" },
  attention: { dot: "bg-rose-400 animate-pulse", text: "text-rose-200", ring: "ring-rose-400/20" },
};

function StatusLed({ tone, label }: { tone: SidebarStatusTone; label: string }) {
  const styles = statusStyles[tone];
  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 text-[10px] font-semibold ${styles.text}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ring-4 ${styles.dot} ${styles.ring}`} />
      <span className="truncate">{label}</span>
    </span>
  );
}

export function HomeSidebar({
  direction,
  sidebarGroups,
  visibleNavItems,
  active,
  onNavigate,
  onCollapsedChange,
  managerId,
  roleScope,
  isCentralAdmin,
  selectedRestaurantId,
  restaurants,
  restaurantsLoading,
  onRestaurantChange,
  branch,
  branches,
  branchesLoading,
  branchesError,
  onBranchChange,
  onOpenCommand,
  ordersLoading,
  orderCount,
  pwaInstalled,
  canInstall,
  onInstall,
  pushStatus,
  onEnablePush,
  onOpenNotifications,
  notificationCount = 0,
  pendingReceiptCount = 0,
  printerStatus = "checking",
}: HomeSidebarProps) {
  const { language, t } = useLanguage();
  const [workspaceQuery, setWorkspaceQuery] = useState("");
  const sidebarCollapsedKey = `nfood:sidebar-collapsed:${String(managerId)}:${roleScope}`;
  const sidebarStorageKey = `nfood:sidebar-groups:${String(managerId)}:${roleScope}`;
  const favoriteStorageKey = `nfood:sidebar-favorites:${String(managerId)}:${roleScope}`;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(sidebarCollapsedKey) === "true";
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = window.localStorage.getItem(sidebarStorageKey);
      return saved ? (JSON.parse(saved) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });
  const [favoriteKeys, setFavoriteKeys] = useState<NavKey[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem(favoriteStorageKey);
      return saved ? (JSON.parse(saved) as NavKey[]) : [];
    } catch {
      return [];
    }
  });

  const branchMessage = branchesLoading ? t("loadingBranches") : branchesError ? t("error") : t("noBranches");
  const restaurantMessage = restaurantsLoading ? t("loadingRestaurants") : t("noRestaurants");
  const integrationScope = "/integrations?scope=platform";
  const transferReceiptLabel = language === "ar" ? "إيصالات التحويل" : language === "fr" ? "Reçus de virement" : language === "ur" ? "منتقلی کی رسیدیں" : "Transfer receipts";
  const supportLabel = language === "ar" ? "مركز الدعم والتشخيص" : language === "fr" ? "Centre d’assistance et de diagnostic" : language === "ur" ? "مدد اور تشخیص مرکز" : "Support & diagnostics";
  const showRestaurantWorkspace = ["restaurant_admin", "waiter", "kitchen", "bar", "cashier"].includes(roleScope);
  const selectedRestaurant = restaurants.find(item => item.id === selectedRestaurantId);
  const normalizedWorkspaceQuery = workspaceQuery.trim().toLocaleLowerCase();
  const filteredRestaurants = restaurants.filter(item => item.name.toLocaleLowerCase().includes(normalizedWorkspaceQuery));
  const filteredBranches = branches.filter(item => item.name.toLocaleLowerCase().includes(normalizedWorkspaceQuery));
  const canOpenHealth = visibleNavItems.some(item => item.key === "health");
  const canOpenPrinters = visibleNavItems.some(item => item.key === "printers");
  const canOpenSettings = visibleNavItems.some(item => item.key === "settings");
  const notificationLabel = language === "ar" ? "الإشعارات" : language === "fr" ? "Notifications" : language === "ur" ? "اطلاعات" : "Notifications";

  const platformGroups = useMemo<SidebarGroup[]>(() => [
    {
      id: "platform-overview",
      label: t("overview"),
      items: ["overview"].map(key => visibleNavItems.find(item => item.key === key)).filter((item): item is SidebarItem => Boolean(item)),
    },
    {
      id: "platform-directory",
      label: language === "ar" ? "إدارة المطاعم" : language === "fr" ? "Gestion des restaurants" : language === "ur" ? "ریستوران مینجمنٹ" : "Restaurant management",
      items: ["accounts"].map(key => visibleNavItems.find(item => item.key === key)).filter((item): item is SidebarItem => Boolean(item)),
    },
    {
      id: "platform-settings",
      label: t("generalSettings"),
      items: ["settings", "branches", "files"].map(key => visibleNavItems.find(item => item.key === key)).filter((item): item is SidebarItem => Boolean(item)),
    },
    {
      id: "platform-security",
      label: t("security"),
      items: ["security", "health"].map(key => visibleNavItems.find(item => item.key === key)).filter((item): item is SidebarItem => Boolean(item)),
    },
  ].filter(group => group.items.length > 0), [language, t, visibleNavItems]);
  const groups = isCentralAdmin ? platformGroups : sidebarGroups;

  const copy = language === "ar"
    ? { favorites: "المفضلة", pin: "تثبيت", unpin: "إلغاء التثبيت", expand: "توسيع القائمة الجانبية", collapse: "طي القائمة الجانبية", system: "النظام", printers: "الطابعات", ready: "جاهز", checking: "جارٍ الفحص", attention: "يحتاج انتباهًا", workspace: "مساحة العمل" }
    : language === "fr"
      ? { favorites: "Favoris", pin: "Épingler", unpin: "Désépingler", expand: "Développer la barre latérale", collapse: "Réduire la barre latérale", system: "Système", printers: "Imprimantes", ready: "Prêt", checking: "Vérification", attention: "Attention", workspace: "Espace de travail" }
      : language === "ur"
        ? { favorites: "پسندیدہ", pin: "پن کریں", unpin: "پن ہٹائیں", expand: "سائیڈبار کھولیں", collapse: "سائیڈبار بند کریں", system: "سسٹم", printers: "پرنٹرز", ready: "تیار", checking: "جانچ جاری", attention: "توجہ درکار", workspace: "ورک اسپیس" }
        : { favorites: "Favorites", pin: "Pin", unpin: "Unpin", expand: "Expand sidebar", collapse: "Collapse sidebar", system: "System", printers: "Printers", ready: "Ready", checking: "Checking", attention: "Needs attention", workspace: "Workspace" };
  const getStatusLabel = (tone: SidebarStatusTone) => tone === "healthy" ? copy.ready : tone === "attention" ? copy.attention : copy.checking;
  const systemStatus = getSidebarStatusTone({ loading: branchesLoading || ordersLoading, error: branchesError });
  const activeGroupId = useMemo(() => groups.find(group => group.items.some(item => item.key === active))?.id ?? groups.find(group => group.items.some(item => item.key === active))?.label, [active, groups]);
  const favoriteItems = useMemo(() => visibleNavItems.filter(item => favoriteKeys.includes(item.key)).slice(0, 4), [favoriteKeys, visibleNavItems]);

  useEffect(() => {
    try {
      window.localStorage.setItem(sidebarCollapsedKey, String(sidebarCollapsed));
    } catch {
      /* localStorage may be unavailable */
    }
    onCollapsedChange?.(sidebarCollapsed);
  }, [onCollapsedChange, sidebarCollapsed, sidebarCollapsedKey]);
  useEffect(() => {
    try {
      window.localStorage.setItem(sidebarStorageKey, JSON.stringify(collapsedGroups));
    } catch {
      /* localStorage may be unavailable */
    }
  }, [collapsedGroups, sidebarStorageKey]);
  useEffect(() => {
    try {
      window.localStorage.setItem(favoriteStorageKey, JSON.stringify(favoriteKeys));
    } catch {
      /* localStorage may be unavailable */
    }
  }, [favoriteKeys, favoriteStorageKey]);
  useEffect(() => {
    if (!activeGroupId || !collapsedGroups[activeGroupId]) return;
    setCollapsedGroups(current => ({ ...current, [activeGroupId]: false }));
  }, [activeGroupId, collapsedGroups]);
  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if (isSidebarToggleShortcut(event)) {
        event.preventDefault();
        setSidebarCollapsed(current => !current);
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const syncTabletState = (event: MediaQueryList | MediaQueryListEvent) => {
      if (event.matches) setSidebarCollapsed(true);
    };
    syncTabletState(media);
    media.addEventListener?.("change", syncTabletState);
    return () => media.removeEventListener?.("change", syncTabletState);
  }, []);

  const toggleFavorite = (key: NavKey) => {
    setFavoriteKeys(current => toggleSidebarFavorite(current, key) as NavKey[]);
  };
  const groupIcon = (group: SidebarGroup) => group.id?.includes("operations") ? Utensils : group.id?.includes("growth") ? Users : group.id?.includes("settings") || group.id?.includes("directory") ? Settings2 : group.id?.includes("security") ? ShieldCheck : LayoutDashboard;
  const withTooltip = (label: string, child: ReactNode, side: "left" | "right" = direction === "rtl" ? "left" : "right") => (
    <Tooltip>
      <TooltipTrigger asChild>{child}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={10} className="border border-white/10 bg-[#18263b] text-white shadow-2xl">
        {label}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider delayDuration={120}>
      <motion.aside
        data-sidebar-collapsed={sidebarCollapsed ? "true" : "false"}
        data-sidebar-mode={sidebarCollapsed ? "collapsed" : "expanded"}
        data-testid="home-sidebar"
        initial={false}
        animate={{ width: getSidebarWidth(sidebarCollapsed) }}
        transition={{ type: "spring", stiffness: 360, damping: 34, mass: 0.8 }}
        className={`nfood-unified-sidebar fixed inset-y-0 z-20 hidden h-full overflow-hidden overscroll-contain border-white/10 bg-[#091321]/95 text-white shadow-[0_24px_80px_rgba(3,10,20,.42)] backdrop-blur-2xl lg:flex lg:flex-col ${direction === "rtl" ? "end-0 border-s" : "start-0 border-e"}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,.12),transparent_36%),linear-gradient(180deg,rgba(23,43,68,.28),transparent_48%)]" />
        <header className={`relative flex h-[68px] shrink-0 items-center gap-2 border-b border-white/[.08] px-3 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
          <button type="button" data-testid="sidebar-toggle" onClick={() => setSidebarCollapsed(value => !value)} aria-label={sidebarCollapsed ? copy.expand : copy.collapse} aria-expanded={!sidebarCollapsed} title={sidebarCollapsed ? copy.expand : copy.collapse} className={`group flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[.08] bg-white/[.04] text-slate-300 transition-[background-color,color,transform] duration-200 hover:bg-orange-400/15 hover:text-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 active:scale-95 ${sidebarCollapsed ? "order-none" : "order-first"}`}>
            <PanelLeft className={`h-4 w-4 transition-transform duration-200 ${sidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence initial={false} mode="wait">
            {!sidebarCollapsed && (
              <motion.div key="brand" initial={{ opacity: 0, x: direction === "rtl" ? 8 : -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction === "rtl" ? 8 : -8 }} transition={{ duration: 0.18 }} className="flex min-w-0 flex-1 items-center gap-2.5">
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-300 to-orange-600 text-[#101a29] shadow-lg shadow-orange-950/30">
                  <Utensils className="h-5 w-5" />
                  <span className="absolute -bottom-0.5 -end-0.5 h-2 w-2 rounded-full border-2 border-[#091321] bg-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[17px] font-black tracking-[.18em]">NFOOD</div>
                  <div className="truncate text-[8px] font-semibold tracking-[.14em] text-slate-500">RESTAURANT OS</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {sidebarCollapsed && <div className="absolute inset-x-0 top-2 flex justify-center"><span className="h-1 w-7 rounded-full bg-orange-400/70 shadow-[0_0_14px_rgba(249,115,22,.8)]" /></div>}
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-2 pb-1.5 pt-2">
          {showRestaurantWorkspace && (
            <AnimatePresence initial={false} mode="wait">
              {!sidebarCollapsed ? (
                <motion.div key="workspace-expanded" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.18 }} className="shrink-0 rounded-2xl border border-white/[.09] bg-white/[.045] p-2 shadow-inner shadow-white/[.02]">
                  <div className="mb-2 flex items-center justify-between gap-2 px-1">
                    <p className="text-[10px] font-bold tracking-[.14em] text-slate-400">{copy.workspace}</p>
                    {selectedRestaurant && <span className="max-w-[148px] truncate rounded-full border border-orange-300/20 bg-orange-300/10 px-2 py-0.5 text-[10px] font-bold text-orange-100" title={branch || selectedRestaurant.name}>{branch ? `${t("branch")}: ${branch}` : selectedRestaurant.name}</span>}
                  </div>
                  <div className="space-y-1.5">
                    <div className="relative">
                      <Search className="pointer-events-none absolute end-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                      <input value={workspaceQuery} onChange={event => setWorkspaceQuery(event.target.value)} onKeyDown={event => { if (event.key === "Enter") onOpenCommand(); }} placeholder={`${t("globalSearch")} / ${t("selectBranch")}`} aria-label={`${t("globalSearch")} / ${t("selectBranch")}`} className="h-8 w-full rounded-xl border border-white/[.08] bg-[#122238]/90 px-9 text-[11px] text-white outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-slate-500 focus:border-orange-300/60 focus:ring-2 focus:ring-orange-300/10" />
                    </div>
                    <select aria-label={t("selectRestaurant")} value={selectedRestaurantId} onChange={event => onRestaurantChange(Number(event.target.value))} className="h-8 w-full rounded-xl border border-white/[.08] bg-[#122238]/90 px-2.5 text-[11px] text-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-orange-300/60 focus:ring-2 focus:ring-orange-300/10">
                      <option value={selectedRestaurantId}>{restaurants.length ? t("selectRestaurant") : restaurantMessage}</option>
                      {(workspaceQuery ? filteredRestaurants : restaurants).map(restaurant => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>)}
                    </select>
                    <select aria-label={t("selectBranch")} value={branch} onChange={event => onBranchChange(event.target.value)} disabled={(branchesLoading && !branches.length) || branchesError || branches.length === 0} className="h-8 w-full rounded-xl border border-white/[.08] bg-[#122238]/90 px-2.5 text-[11px] text-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-orange-300/60 focus:ring-2 focus:ring-orange-300/10">
                      <option value="">{branches.length ? t("selectBranch") : branchMessage}</option>
                      {(workspaceQuery ? filteredBranches : branches).map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                    </select>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="workspace-collapsed" initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .92 }} className="flex shrink-0 justify-center">
                  {withTooltip(branch || selectedRestaurant?.name || copy.workspace, <button type="button" onClick={onOpenCommand} aria-label={branch || selectedRestaurant?.name || copy.workspace} className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-300/20 bg-orange-300/10 text-orange-100 transition hover:bg-orange-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70"><Store className="h-5 w-5" /><span className="absolute bottom-1 end-1 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-[#101d31]" /></button>)}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {isCentralAdmin && (
            <div className={`shrink-0 rounded-2xl border border-orange-300/15 bg-orange-400/[.07] p-1.5 ${sidebarCollapsed ? "space-y-1" : ""}`}>
              {!sidebarCollapsed && <p className="mb-1 px-2 text-[9px] font-bold tracking-[.14em] text-orange-200/90">{t("integrationsCenter")}</p>}
              {withTooltip(t("integrationsCenter"), <button type="button" onClick={() => { window.location.href = integrationScope; }} aria-label={t("integrationsCenter")} className={`flex w-full items-center rounded-xl text-slate-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 ${sidebarCollapsed ? "h-10 justify-center" : "gap-2 px-2 py-1.5 text-start text-[11px]"}`}><Settings2 className="h-4 w-4 shrink-0" />{!sidebarCollapsed && <span className="truncate">{t("integrationsCenter")}</span>}</button>)}
              {withTooltip(transferReceiptLabel, <a href="/admin/subscription-receipts" aria-label={transferReceiptLabel} className={`relative flex w-full items-center rounded-xl text-slate-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 ${sidebarCollapsed ? "h-10 justify-center" : "gap-2 px-2 py-1.5 text-start text-[11px]"}`}><ReceiptText className="h-4 w-4 shrink-0" />{!sidebarCollapsed && <span className="min-w-0 flex-1 truncate">{transferReceiptLabel}</span>}{pendingReceiptCount > 0 && <span className={`${sidebarCollapsed ? "absolute -end-0.5 -top-0.5" : ""} inline-flex min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 py-0.5 text-[9px] font-black text-white`}>{pendingReceiptCount > 99 ? "99+" : formatSidebarCount(pendingReceiptCount)}</span>}</a>)}
            </div>
          )}

          {favoriteItems.length > 0 && (
            <div className={`shrink-0 rounded-2xl border border-white/[.08] bg-white/[.035] p-1.5 ${sidebarCollapsed ? "space-y-1" : ""}`}>
              {!sidebarCollapsed && <div className="mb-1 flex items-center gap-1.5 px-2 text-[9px] font-bold tracking-[.14em] text-slate-400"><Pin className="h-3 w-3 text-orange-200" />{copy.favorites}</div>}
              <div className={sidebarCollapsed ? "space-y-1" : "grid grid-cols-2 gap-1"}>
                {favoriteItems.map(item => {
                  const Icon = item.icon;
                  return withTooltip(item.label, <button key={item.key} type="button" onClick={() => onNavigate(item.key)} aria-label={item.label} className={`flex items-center rounded-xl text-orange-100 transition hover:bg-orange-300/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 ${sidebarCollapsed ? "relative h-9 w-full justify-center" : "min-w-0 gap-1.5 px-2 py-1.5 text-start text-[10px]"}`}><Icon className="h-3.5 w-3.5 shrink-0" />{!sidebarCollapsed && <span className="truncate">{item.label}</span>}</button>);
                })}
              </div>
            </div>
          )}

          <nav aria-label={t("navigation.main")} className="nfood-sidebar-nav nfood-scroll-area min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden overscroll-contain pr-0.5">
            <LayoutGroup id={`nfood-sidebar-${String(managerId)}-${roleScope}`}>
              {groups.map(group => {
                const groupKey = group.id ?? group.label;
                const isGroupCollapsed = collapsedGroups[groupKey] ?? false;
                const GroupIcon = groupIcon(group);
                const hasActiveItem = group.items.some(item => item.key === active);
                return (
                  <div key={groupKey} className={`nfood-sidebar-group rounded-2xl border p-1 transition-[border-color,background-color,box-shadow] duration-200 ${hasActiveItem ? "border-orange-300/25 bg-orange-300/[.06] shadow-lg shadow-orange-950/10" : "border-white/[.07] bg-white/[.025]"}`}>
                    {withTooltip(group.label, <button type="button" aria-expanded={!isGroupCollapsed} onClick={() => setCollapsedGroups(current => ({ ...current, [groupKey]: !isGroupCollapsed }))} className={`flex w-full items-center rounded-xl text-start transition-[background-color,color] duration-200 hover:bg-white/[.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 ${sidebarCollapsed ? "h-9 justify-center" : "gap-2 px-1.5 py-1.5"}`}>
                      <GroupIcon className={`h-3.5 w-3.5 shrink-0 ${hasActiveItem ? "text-orange-200" : "text-slate-400"}`} />
                      {!sidebarCollapsed && <><span className={`min-w-0 flex-1 truncate text-[10px] font-bold tracking-[.08em] ${hasActiveItem ? "text-orange-100" : "text-slate-300"}`}>{group.label}</span><span className="rounded-full bg-white/[.08] px-1.5 py-0.5 text-[9px] text-slate-500">{formatSidebarCount(group.items.length)}</span><ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform duration-200 ${isGroupCollapsed ? "-rotate-90" : ""}`} /></>}
                    </button>)}
                    <AnimatePresence initial={false}>
                      {!isGroupCollapsed && (
                        <motion.div initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.16 }} className="mt-1 space-y-0.5">
                          {group.items.map(item => {
                            const Icon = item.icon;
                            const isActive = item.key === active;
                            const isFavorite = favoriteKeys.includes(item.key);
                            const itemButton = <button type="button" onClick={() => onNavigate(item.key)} aria-label={item.label} className={`relative flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-xl text-start transition-[color,background-color,transform] duration-150 active:scale-[.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 ${sidebarCollapsed ? "h-10 justify-center px-0" : "px-2 py-2 text-xs"} ${isActive ? "font-bold text-white" : "text-slate-300 hover:bg-white/[.07] hover:text-white"}`}>
                              {isActive && <motion.span layoutId="activePill" transition={{ type: "spring", stiffness: 430, damping: 31 }} className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/95 to-orange-400/80 shadow-lg shadow-orange-950/30" />}
                              <Icon className={`relative z-10 shrink-0 transition-transform duration-200 ${sidebarCollapsed ? "h-[18px] w-[18px]" : "h-4 w-4"} ${isActive ? "text-white" : "text-slate-400"}`} />
                              {!sidebarCollapsed && <span className="relative z-10 min-w-0 flex-1 truncate">{item.label}</span>}
                              {item.key === "orders" && <span className={`relative z-10 rounded-full px-1.5 py-0.5 text-[9px] font-black ${isActive ? "bg-white/20 text-white" : "bg-orange-400/15 text-orange-100"}`}>{ordersLoading ? "…" : formatSidebarCount(orderCount)}</span>}
                            </button>;
                            return (
                              <div key={item.key} className="group flex min-w-0 items-center gap-0.5">
                                {withTooltip(item.label, itemButton)}
                                {!sidebarCollapsed && <button type="button" onClick={() => toggleFavorite(item.key)} aria-label={isFavorite ? `${copy.unpin}: ${item.label}` : `${copy.pin}: ${item.label}`} title={isFavorite ? copy.unpin : copy.pin} className={`flex h-8 w-7 shrink-0 items-center justify-center rounded-lg transition-[background-color,color,opacity] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 ${isFavorite ? "text-orange-200 opacity-100" : "text-slate-600 opacity-0 group-hover:opacity-100 hover:bg-white/[.07] hover:text-orange-200"}`}><Star className="h-3.5 w-3.5" fill={isFavorite ? "currentColor" : "none"} /></button>}
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </LayoutGroup>
          </nav>
        </div>

        <footer className="relative mt-auto shrink-0 space-y-1.5 border-t border-white/[.08] bg-[#08111e]/70 p-2">
          <div className={`rounded-2xl border border-white/[.08] bg-white/[.035] ${sidebarCollapsed ? "p-1" : "p-2"}`}>
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center gap-1">
                {withTooltip(`${copy.system}: ${getStatusLabel(systemStatus)}`, <button type="button" disabled={!canOpenHealth} onClick={() => { if (canOpenHealth) onNavigate("health"); }} aria-label={`${copy.system}: ${getStatusLabel(systemStatus)}`} className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 disabled:cursor-default disabled:opacity-80"><Activity className="h-4 w-4" /><span className={`absolute bottom-1 end-1 h-1.5 w-1.5 rounded-full ${statusStyles[systemStatus].dot}`} /></button>)}
                {canOpenPrinters && withTooltip(`${copy.printers}: ${getStatusLabel(printerStatus)}`, <button type="button" onClick={() => onNavigate("printers")} aria-label={`${copy.printers}: ${getStatusLabel(printerStatus)}`} className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70"><Printer className="h-4 w-4" /><span className={`absolute bottom-1 end-1 h-1.5 w-1.5 rounded-full ${statusStyles[printerStatus].dot}`} /></button>)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={!canOpenHealth} onClick={() => { if (canOpenHealth) onNavigate("health"); }} className="min-w-0 rounded-xl px-1.5 py-1 text-start transition hover:bg-white/[.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 disabled:cursor-default"><div className="mb-1 flex items-center gap-1.5 text-slate-400"><Activity className="h-3.5 w-3.5" /><span className="truncate text-[9px] font-bold">{copy.system}</span></div><StatusLed tone={systemStatus} label={getStatusLabel(systemStatus)} /></button>
                {canOpenPrinters && <button type="button" onClick={() => onNavigate("printers")} className="min-w-0 rounded-xl px-1.5 py-1 text-start transition hover:bg-white/[.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70"><div className="mb-1 flex items-center gap-1.5 text-slate-400"><Printer className="h-3.5 w-3.5" /><span className="truncate text-[9px] font-bold">{copy.printers}</span></div><StatusLed tone={printerStatus} label={getStatusLabel(printerStatus)} /></button>}
              </div>
            )}
          </div>
          <div className={`rounded-2xl border border-white/[.07] bg-white/[.025] ${sidebarCollapsed ? "flex justify-center p-1" : "p-2"}`}>
            {sidebarCollapsed ? withTooltip(t("subscriptionLabel"), <button type="button" disabled={!canOpenSettings} onClick={() => { if (canOpenSettings) onNavigate("settings"); }} aria-label={t("subscriptionLabel")} className="flex h-9 w-9 items-center justify-center rounded-xl text-orange-200 transition hover:bg-orange-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 disabled:cursor-default"><Zap className="h-4 w-4" /></button>) : <div className="flex items-center gap-2"><Zap className="h-4 w-4 shrink-0 text-orange-200" /><div className="min-w-0"><p className="truncate text-[10px] font-bold text-slate-200">{t("subscriptionLabel")}</p><p className="truncate text-[10px] text-slate-500">{t("managePlan")}</p></div></div>}
          </div>
          {isCentralAdmin && (
            <div className={`rounded-2xl border border-cyan-300/15 bg-cyan-400/[.06] ${sidebarCollapsed ? "flex justify-center p-1" : "p-2"}`}>
              {sidebarCollapsed ? withTooltip(t("advancedAdminApp"), <button type="button" disabled={!canInstall} onClick={() => { if (canInstall) onInstall(); }} aria-label={t("advancedAdminApp")} className="flex h-9 w-9 items-center justify-center rounded-xl text-cyan-200 transition hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:cursor-default disabled:opacity-60"><Zap className="h-4 w-4" /></button>) : <div className="flex items-center gap-2"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-300/15 text-cyan-200"><Zap className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate text-[10px] font-bold text-white">{t("advancedAdminApp")}</p>{pwaInstalled ? <p className="truncate text-[9px] text-emerald-300">{t("installedOnDevice")}</p> : canInstall ? <button type="button" onClick={onInstall} className="text-[9px] font-bold text-cyan-200 hover:text-white">{t("installApp")}</button> : <p className="truncate text-[9px] text-slate-500">{t("installAvailableBrowser")}</p>}</div></div>}
            </div>
          )}
          {pushStatus === "default" && (sidebarCollapsed ? withTooltip(t("enableNotifications"), <button type="button" onClick={onEnablePush} aria-label={t("enableNotifications")} className="flex h-9 w-full items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/[.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70"><Bell className="h-4 w-4" /></button>) : <button type="button" onClick={onEnablePush} className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-[10px] text-slate-400 transition hover:bg-white/[.06] hover:text-white"><Bell className="h-3.5 w-3.5" />{t("enableNotifications")}</button>)}
          {onOpenNotifications && (sidebarCollapsed ? withTooltip(`${notificationLabel}: ${formatSidebarCount(notificationCount)}`, <button type="button" onClick={onOpenNotifications} aria-label={`${notificationLabel}: ${formatSidebarCount(notificationCount)}`} className="relative flex h-9 w-full items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/[.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70"><Bell className="h-4 w-4" />{notificationCount > 0 && <span className="absolute right-1 top-0.5 inline-flex min-w-3.5 items-center justify-center rounded-full bg-orange-500 px-0.5 text-[8px] font-black leading-3 text-white">{notificationCount > 99 ? "99+" : formatSidebarCount(notificationCount)}</span>}</button>) : <button type="button" onClick={onOpenNotifications} className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-[10px] text-slate-400 transition hover:bg-white/[.06] hover:text-white"><span className="flex items-center gap-2"><Bell className="h-3.5 w-3.5" />{notificationLabel}</span>{notificationCount > 0 && <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-black text-white">{notificationCount > 99 ? "99+" : formatSidebarCount(notificationCount)}</span>}</button>)}
          {pushStatus === "granted" && !sidebarCollapsed && <p className="px-2 py-1 text-[10px] text-emerald-300">{t("notificationsEnabled")}</p>}
          {withTooltip(supportLabel, <button type="button" onClick={() => { window.location.href = "/support"; }} aria-label={supportLabel} className={`flex w-full items-center rounded-xl text-slate-400 transition hover:bg-white/[.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 ${sidebarCollapsed ? "h-9 justify-center" : "gap-2 px-2 py-1.5 text-[10px]"}`}><LifeBuoy className="h-3.5 w-3.5 shrink-0" />{!sidebarCollapsed && <span className="truncate">{supportLabel}</span>}</button>)}
        </footer>
      </motion.aside>
    </TooltipProvider>
  );
}
