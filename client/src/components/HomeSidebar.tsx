import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  LifeBuoy,
  ReceiptText,
  Search,
  Settings2,
  ShieldCheck,
  Utensils,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { NavKey } from "@/components/homeNavigation";

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
};

export function HomeSidebar({
  direction,
  sidebarGroups,
  visibleNavItems,
  active,
  onNavigate,
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
}: HomeSidebarProps) {
  const { t } = useLanguage();
  const branchMessage = branchesLoading
    ? t("loadingBranches")
    : branchesError
      ? t("error")
      : t("noBranches");
  const restaurantMessage = restaurantsLoading
    ? t("loadingRestaurants")
    : t("noRestaurants");
  const integrationScope = "/integrations?scope=platform";
  const showRestaurantWorkspace = [
    "restaurant_admin",
    "waiter",
    "kitchen",
    "cashier",
  ].includes(roleScope);
  const [workspaceQuery, setWorkspaceQuery] = useState("");
  const selectedRestaurant = restaurants.find(
    item => item.id === selectedRestaurantId
  );
  const normalizedWorkspaceQuery = workspaceQuery.trim().toLocaleLowerCase();
  const filteredRestaurants = restaurants.filter(item =>
    item.name.toLocaleLowerCase().includes(normalizedWorkspaceQuery)
  );
  const filteredBranches = branches.filter(item =>
    item.name.toLocaleLowerCase().includes(normalizedWorkspaceQuery)
  );
  const sidebarStorageKey = `nfood:sidebar-groups:${String(managerId)}:${roleScope}`;
  const sidebarCollapsedKey = `nfood:sidebar-collapsed:${String(managerId)}:${roleScope}`;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(sidebarCollapsedKey) === "true";
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(
        sidebarCollapsedKey,
        String(sidebarCollapsed)
      );
    } catch {
      /* storage may be unavailable */
    }
  }, [sidebarCollapsed, sidebarCollapsedKey]);
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = window.localStorage.getItem(sidebarStorageKey);
      return saved ? (JSON.parse(saved) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(
        sidebarStorageKey,
        JSON.stringify(collapsedGroups)
      );
    } catch {
      /* storage may be unavailable */
    }
  }, [collapsedGroups, sidebarStorageKey]);
  const platformGroups = [
    {
      id: "platform-overview",
      label: t("overview"),
      keys: ["overview"] as NavKey[],
    },
    {
      id: "platform-settings",
      label: "الإعدادات والتشغيل",
      keys: ["branches", "health"] as NavKey[],
    },
    {
      id: "platform-security",
      label: t("security"),
      keys: ["security"] as NavKey[],
    },
  ]
    .map(group => ({
      ...group,
      items: group.keys
        .map(key => visibleNavItems.find(item => item.key === key))
        .filter((item): item is SidebarItem => Boolean(item)),
    }))
    .filter(group => group.items.length > 0);

  return (
    <aside
      data-sidebar-collapsed={sidebarCollapsed ? "true" : "false"}
      className={`nfood-unified-sidebar fixed inset-y-0 z-20 hidden h-full w-[304px] overflow-hidden overscroll-contain border-slate-200 bg-[#111c2e] text-white lg:flex lg:flex-col ${direction === "rtl" ? "right-0 border-l" : "left-0 border-r"}`}
    >
      <div className="flex h-[68px] items-center gap-3 border-b border-white/10 px-5">
        <button
          type="button"
          onClick={() => setSidebarCollapsed(value => !value)}
          aria-label={
            sidebarCollapsed
              ? "توسيع القائمة الجانبية"
              : "تصغير القائمة الجانبية"
          }
          title={
            sidebarCollapsed
              ? "توسيع القائمة الجانبية"
              : "تصغير القائمة الجانبية"
          }
          className="order-first flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${sidebarCollapsed ? "-rotate-90" : "rotate-90"}`}
          />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e76f3c] shadow-lg shadow-orange-900/20">
          <Utensils className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[17px] font-bold tracking-tight">NFOOD</div>
          <div className="text-[10px] font-medium text-slate-400">
            RESTAURANT OPERATING SYSTEM
          </div>
        </div>
      </div>
      <div className="nfood-sidebar-body flex min-h-0 flex-1 flex-col space-y-2 overflow-hidden px-2.5 pb-2.5 pt-2.5">
        {showRestaurantWorkspace && (
          <div
            key={`${roleScope}-${selectedRestaurantId}-${branch}`}
            className="animate-[nfood-enter_220ms_ease-out] rounded-xl border border-white/10 bg-white/[.04] p-2 transition-[border-color,background-color,transform] duration-200 ease-out"
          >
            <div className="mb-2 flex items-center justify-between gap-2 px-2">
              <p className="text-[10px] font-bold tracking-[.14em] text-slate-500">
                {t("workspace")}
              </p>
              {selectedRestaurant && (
                <span
                  className="max-w-[155px] truncate rounded-full border border-orange-300/20 bg-orange-300/10 px-2 py-0.5 text-[10px] font-bold text-orange-200"
                  title={branch || selectedRestaurant.name}
                >
                  {branch
                    ? `${t("branch")}: ${branch}`
                    : selectedRestaurant.name}
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="relative">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  value={workspaceQuery}
                  onChange={event => setWorkspaceQuery(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === "Enter") onOpenCommand();
                  }}
                  placeholder={`${t("globalSearch")} / ${t("selectBranch")}`}
                  aria-label={`${t("globalSearch")} / ${t("selectBranch")}`}
                  className="h-9 w-full rounded-lg border border-white/10 bg-[#17263d] px-9 text-[12px] text-white outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-slate-500 focus:border-orange-300/60 focus:ring-2 focus:ring-orange-300/10"
                />
              </div>
              <select
                aria-label={t("selectRestaurant")}
                value={selectedRestaurantId}
                onChange={event =>
                  onRestaurantChange(Number(event.target.value))
                }
                className="h-9 w-full rounded-lg border border-white/10 bg-[#17263d] px-3 text-[13px] text-white outline-none transition-[border-color,box-shadow,transform] duration-200 ease-out focus:border-orange-300/60 focus:ring-2 focus:ring-orange-300/10 active:scale-[0.99]"
              >
                <option value={selectedRestaurantId}>
                  {restaurants.length
                    ? t("selectRestaurant")
                    : restaurantMessage}
                </option>
                {(workspaceQuery ? filteredRestaurants : restaurants).map(
                  restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  )
                )}
              </select>
              <select
                aria-label={t("selectBranch")}
                value={branch}
                onChange={event => onBranchChange(event.target.value)}
                disabled={
                  (branchesLoading && !branches.length) ||
                  branchesError ||
                  branches.length === 0
                }
                className="h-9 w-full rounded-lg border border-white/10 bg-[#17263d] px-3 text-[13px] text-white outline-none transition-[border-color,box-shadow,transform] duration-200 ease-out focus:border-orange-300/60 focus:ring-2 focus:ring-orange-300/10 active:scale-[0.99]"
              >
                <option value="">
                  {branches.length ? t("selectBranch") : branchMessage}
                </option>
                {(workspaceQuery ? filteredBranches : branches).map(item => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onOpenCommand}
                className="flex h-9 w-full items-center gap-2 rounded-lg border border-white/10 bg-[#17263d] px-3 text-[13px] text-slate-300 hover:text-white"
              >
                <Search className="h-4 w-4" />
                {t("search")}{" "}
                <span className="mr-auto text-[10px] text-slate-500">
                  Ctrl K
                </span>
              </button>
            </div>
          </div>
        )}
        {isCentralAdmin && (
          <div className="rounded-2xl border border-orange-300/20 bg-orange-400/10 p-2.5">
            <p className="mb-2 px-2 text-[10px] font-bold tracking-[.14em] text-orange-200">
              {t("integrationsCenter")}
            </p>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  window.location.href = integrationScope;
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-right text-[13px] text-slate-300 transition-all hover:bg-white/10 hover:text-white"
              >
                <Settings2 className="h-[18px] w-[18px]" />
                <span>{t("integrationsCenter")}</span>
              </button>
              {isCentralAdmin && (
                <a
                  href="/admin/subscription-receipts"
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-right text-[13px] text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                >
                  <ReceiptText className="h-[18px] w-[18px]" />
                  <span>إيصالات التحويل</span>
                </a>
              )}
            </div>
          </div>
        )}
        <nav className="nfood-sidebar-nav min-h-0 flex-1 space-y-2 overflow-hidden">
          {(isCentralAdmin ? platformGroups : sidebarGroups).map(group => {
            const isCollapsed =
              collapsedGroups[group.id ?? group.label] ?? false;
            return (
              <div
                key={group.id ?? group.label}
                className="nfood-sidebar-group rounded-xl border border-white/10 bg-white/[.035] p-1.5"
              >
                <button
                  type="button"
                  onClick={() =>
                    setCollapsedGroups(current => ({
                      ...current,
                      [group.id ?? group.label]: !isCollapsed,
                    }))
                  }
                  className="flex w-full items-center justify-between px-2 py-1.5 text-right"
                >
                  <span className="text-[10px] font-bold tracking-[.14em] text-slate-500">
                    {group.label}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
                  />
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const isActive = item.key === active;
                      return (
                        <button
                          key={item.key}
                          onClick={() => onNavigate(item.key)}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-right text-[13px] transition-all duration-200 ${isActive ? "bg-[#e76f3c] font-semibold text-white shadow-lg shadow-orange-950/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                        >
                          <Icon className="h-[18px] w-[18px]" />
                          <span>{item.label}</span>
                          {item.key === "orders" && (
                            <span className="mr-auto rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-white">
                              {ordersLoading ? "…" : orderCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      <div className="nfood-sidebar-footer mt-auto shrink-0 space-y-1 p-2">
        <div className="rounded-xl border border-white/10 bg-white/[.04] p-2">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
            <Zap className="h-4 w-4 text-[#f0ad65]" /> {t("subscriptionLabel")}
          </div>
          <p className="text-sm font-bold">{t("managePlan")}</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-400">
            {t("subscriptionDetails")}
          </p>
        </div>
        {isCentralAdmin && (
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-2.5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-cyan-300/15 p-2 text-cyan-200">
                <Zap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">
                  {t("advancedAdminApp")}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-slate-300">
                  {t("advancedAdminDescription")}
                </p>
                {pwaInstalled ? (
                  <p className="mt-2 text-[11px] font-bold text-emerald-300">
                    {t("installedOnDevice")}
                  </p>
                ) : canInstall ? (
                  <button
                    type="button"
                    onClick={onInstall}
                    className="mt-2 rounded-lg bg-cyan-300 px-3 py-1.5 text-[11px] font-black text-[#0f1b2d]"
                  >
                    {t("installApp")}
                  </button>
                ) : (
                  <p className="mt-2 text-[11px] text-slate-400">
                    {t("installAvailableBrowser")}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {pushStatus === "default" && (
          <button
            onClick={onEnablePush}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white"
          >
            <Bell className="h-4 w-4" /> {t("enableNotifications")}
          </button>
        )}
        {pushStatus === "granted" && (
          <p className="px-3 py-2 text-xs text-emerald-400">
            {t("notificationsEnabled")}
          </p>
        )}
        {pwaInstalled ? (
          <p className="px-3 py-2 text-xs text-emerald-400">{t("installed")}</p>
        ) : canInstall ? (
          <button
            onClick={onInstall}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-[#f0ad65] hover:text-white"
          >
            <Zap className="h-4 w-4" /> {t("installApp")}
          </button>
        ) : (
          <p className="px-3 py-2 text-xs text-slate-500">
            {t("installAvailableBrowser")}
          </p>
        )}
        <button
          onClick={() => onNavigate("branches")}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white"
        >
          <Settings2 className="h-4 w-4" />
          {t("generalSettings")}
        </button>
        <button
          onClick={() => {
            window.location.href = "/support";
          }}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <LifeBuoy className="h-4 w-4" />
          مركز الدعم والتشخيص
        </button>
      </div>
    </aside>
  );
}
