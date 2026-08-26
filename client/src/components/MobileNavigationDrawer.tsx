import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Menu as MenuIcon, Settings2, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { NavKey } from "@/components/homeNavigation";

type MobileNavItem = { key: NavKey; label: string; icon: LucideIcon };

type MobileNavigationDrawerProps = {
  open: boolean;
  direction: "rtl" | "ltr";
  visibleNavItems: MobileNavItem[];
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  onClose: () => void;
  isCentralAdmin: boolean;
  isRestaurantAdmin: boolean;
  selectedRestaurantId: number;
};

export function MobileNavigationDrawer({
  open,
  direction,
  visibleNavItems,
  active,
  onNavigate,
  onClose,
  isCentralAdmin,
  isRestaurantAdmin,
  selectedRestaurantId,
}: MobileNavigationDrawerProps) {
  const { language, t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const mobileNavItems = expanded ? visibleNavItems : visibleNavItems.slice(0, 6);
  const copy = language === "ar"
    ? { more: "عرض المزيد", less: "طي القائمة" }
    : language === "fr"
      ? { more: "Afficher plus", less: "Réduire la liste" }
      : { more: "Show more", less: "Show less" };

  useEffect(() => {
    if (!open) setExpanded(false);
  }, [open]);

  const navigate = (key: NavKey) => {
    onNavigate(key);
    onClose();
    setExpanded(false);
  };

  return (
    <div className={`fixed inset-0 z-[70] lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`} role="dialog" aria-modal="true" aria-hidden={!open} aria-label={t("openNavigation")}>
      <button type="button" aria-label={t("closeNavigation")} className={`absolute inset-0 bg-slate-950/40 transition-opacity duration-200 motion-reduce:transition-none ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <aside className={`absolute inset-y-0 ${direction === "rtl" ? "right-0" : "left-0"} nfood-mobile-drawer flex max-h-[100dvh] w-[min(84vw,300px)] flex-col overflow-y-auto overscroll-contain bg-[#111c2e] p-4 text-white shadow-2xl transition-transform duration-200 ease-out motion-reduce:transition-none ${open ? "translate-x-0" : direction === "rtl" ? "translate-x-full" : "-translate-x-full"}`}>
        <div className="nfood-mobile-drawer__header sticky top-0 z-10 mb-4 flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#111c2e] pb-3">
          <p className="text-base font-bold">{t("menu")}</p>
          <button type="button" onClick={onClose} className="rounded-xl bg-white/10 px-3 py-2 text-sm">
            <X className="mr-1 inline-block h-4 w-4" />{t("closeNavigation")}
          </button>
        </div>
        <div className="space-y-1.5">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.key} type="button" onClick={() => navigate(item.key)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-sm ${active === item.key ? "bg-[#e76f3c] font-semibold" : "text-slate-300 hover:bg-white/10"}`}><Icon className="h-5 w-5" /><span>{item.label}</span></button>;
          })}
        </div>
        {visibleNavItems.length > 6 && <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-300/20 bg-orange-400/10 px-3 py-2.5 text-xs font-bold text-orange-100 hover:bg-orange-400/20"><MenuIcon className="h-4 w-4" />{expanded ? copy.less : `${copy.more} (${visibleNavItems.length - 6})`}</button>}
        {(isCentralAdmin || isRestaurantAdmin) && <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-2 px-3 text-xs font-bold text-orange-200">{t("integrationsCenter")}</p>
          <button type="button" onClick={() => navigate("admin")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-sm text-slate-300 hover:bg-white/10"><Settings2 className="h-5 w-5" />{t("platformSettingsCenter")}</button>
          <button type="button" onClick={() => { window.location.href = isCentralAdmin ? "/integrations?scope=platform" : `/integrations?scope=restaurant&restaurantId=${selectedRestaurantId}`; }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-sm text-slate-300 hover:bg-white/10"><Settings2 className="h-5 w-5" />{isCentralAdmin ? t("integrationsCenter") : t("restaurantPortals")}</button>
        </div>}
      </aside>
    </div>
  );
}
