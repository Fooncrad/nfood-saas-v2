import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpLeft, Layers3, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { NavKey } from "@/components/homeNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type DashboardQuickAccessItem = {
  key: NavKey;
  label: string;
  icon: LucideIcon;
};

type DashboardQuickAccessProps = {
  items: DashboardQuickAccessItem[];
  onNavigate: (key: NavKey) => void;
  title?: string;
  description?: string;
  storageScope?: string;
};

type AccessGroup = {
  id: string;
  label: string;
  description: string;
  keys: NavKey[];
};

const groups: AccessGroup[] = [
  {
    id: "priority",
    label: "الوصول السريع",
    description: "ابدأ من أكثر الأدوات استخدامًا في يوم العمل.",
    keys: ["pos", "orders", "kds", "menu", "tables", "reservations", "admin"],
  },
  {
    id: "management",
    label: "الإدارة والتشغيل",
    description: "إدارة الفروع والملفات والمخزون والفريق والتسويق.",
    keys: ["branches", "inventory", "team", "marketing", "files", "remote"],
  },
  {
    id: "control",
    label: "التحكم والمتابعة",
    description: "الإعدادات، الأمان، وصحة النظام.",
    keys: ["security", "health", "accounts"],
  },
];

const fallbackGroup: AccessGroup = {
  id: "other",
  label: "المزيد",
  description: "أقسام إضافية متاحة حسب صلاحيات الحساب.",
  keys: [],
};

export function DashboardQuickAccess({ items, onNavigate, title = "كل الأقسام في مكان واحد", description = "بطاقات مرتبة حسب الأولوية؛ اضغط على أي بطاقة للانتقال مباشرة إلى الوحدة دون البحث في القائمة.", storageScope = "default" }: DashboardQuickAccessProps) {
  const [density, setDensity] = useState<"comfortable" | "compact" | "spacious">(() => { try { return (localStorage.getItem("nfood.dashboard.density") as "comfortable" | "compact" | "spacious") || "comfortable"; } catch { return "comfortable"; } });
  const [orderedKeys, setOrderedKeys] = useState<NavKey[]>(() => { try { const saved = JSON.parse(localStorage.getItem(`nfood.dashboard.widget-order:${storageScope}`) || "[]"); return Array.isArray(saved) ? saved.filter((value): value is NavKey => typeof value === "string") : []; } catch { return []; } });
  const [dragKey, setDragKey] = useState<NavKey | null>(null);
  useEffect(() => { try { localStorage.setItem("nfood.dashboard.density", density); } catch { /* storage unavailable */ } }, [density]);
  useEffect(() => { try { localStorage.setItem(`nfood.dashboard.widget-order:${storageScope}`, JSON.stringify(orderedKeys)); } catch { /* storage unavailable */ } }, [orderedKeys, storageScope]);
  const densityClasses = { comfortable: { section: "p-3 md:p-4", gap: "gap-3", card: "min-h-[72px] p-2.5" }, compact: { section: "p-2 md:p-3", gap: "gap-2", card: "min-h-[60px] p-2" }, spacious: { section: "p-4 md:p-5", gap: "gap-4", card: "min-h-[86px] p-3" } }[density];
  const available = items.filter((item) => item.key !== "overview");
  const knownKeys = new Set(groups.flatMap((group) => group.keys));
  const defaultOrder = available.map((item) => item.key);
  const normalizedOrder = [...orderedKeys, ...defaultOrder.filter((key) => !orderedKeys.includes(key))];
  const resetOrder = () => { setOrderedKeys([]); try { localStorage.removeItem(`nfood.dashboard.widget-order:${storageScope}`); } catch { /* storage unavailable */ } toast.success("تمت إعادة ترتيب الودجات إلى الوضع الافتراضي"); };
  const orderIndex = new Map(normalizedOrder.map((key, index) => [key, index]));
  const sortItems = (groupItems: DashboardQuickAccessItem[]) => [...groupItems].sort((a, b) => (orderIndex.get(a.key) ?? 9999) - (orderIndex.get(b.key) ?? 9999));
  const grouped = groups.map((group) => ({ ...group, items: sortItems(group.keys.map((key) => available.find((item) => item.key === key)).filter((item): item is DashboardQuickAccessItem => Boolean(item))) })).filter((group) => group.items.length > 0);
  const remaining = available.filter((item) => !knownKeys.has(item.key));
  if (remaining.length) grouped.push({ ...fallbackGroup, items: remaining });
  if (!grouped.length) return null;

  return (
    <section aria-labelledby="dashboard-quick-access-title" className={`mb-4 rounded-[1.35rem] border border-slate-200/80 bg-white/70 shadow-sm ${densityClasses.section}`}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#e76f3c]"><Layers3 className="h-4 w-4" /></div>
            <div>
              <h3 id="dashboard-quick-access-title" className="text-lg font-black tracking-tight text-[#111c2e]">{title}</h3>
              <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2"><span className="hidden items-center gap-1 text-[10px] font-bold text-slate-400 sm:flex"><SlidersHorizontal className="h-3.5 w-3.5" /> اسحب لترتيب الودجات</span><Button type="button" variant="outline" size="sm" onClick={resetOrder} className="h-7 rounded-lg border-slate-200 px-2 text-[10px] font-bold text-slate-500 hover:border-orange-200 hover:text-[#e76f3c]"><RotateCcw className="ms-1 h-3 w-3" /> إعادة الضبط</Button><div className="flex rounded-xl bg-slate-100 p-0.5" role="group" aria-label="كثافة لوحة التحكم">{(["compact", "comfortable", "spacious"] as const).map((value) => <button key={value} type="button" onClick={() => setDensity(value)} className={`rounded-lg px-2 py-1 text-[10px] font-bold ${density === value ? "bg-white text-[#e76f3c] shadow-sm" : "text-slate-500"}`}>{value === "compact" ? "مضغوط" : value === "comfortable" ? "مريح" : "واسع"}</button>)}</div><span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">{available.length} أقسام متاحة</span></div>
      </div>
      <div className="grid gap-3 xl:grid-cols-3">
        {grouped.map((group) => (
          <div key={group.id}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-black text-slate-700">{group.label}</h4>
                <p className="mt-0.5 text-[11px] text-slate-400">{group.description}</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{group.items.length} وحدات</span>
            </div>
            <div className={`grid grid-cols-2 ${densityClasses.gap} sm:grid-cols-3`}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.key} type="button" draggable onDragStart={() => setDragKey(item.key)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (!dragKey || dragKey === item.key) return; const next = [...normalizedOrder]; const from = next.indexOf(dragKey); const to = next.indexOf(item.key); if (from >= 0 && to >= 0) { next.splice(from, 1); next.splice(to, 0, dragKey); setOrderedKeys(next); } setDragKey(null); }} onDragEnd={() => setDragKey(null)} onClick={() => onNavigate(item.key)} title="اسحب لتغيير ترتيب الودجت" className={`group text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e76f3c] focus-visible:ring-offset-2 ${dragKey === item.key ? "opacity-50" : ""}`}>
                    <Card className="h-full rounded-2xl border-slate-200/90 bg-white transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-orange-200 group-hover:shadow-md group-active:translate-y-0">
                      <CardContent className={`flex items-center gap-2.5 ${densityClasses.card}`}>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition-colors group-hover:bg-orange-50 group-hover:text-[#e76f3c]"><Icon className="h-[18px] w-[18px]" /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-bold text-slate-800">{item.label}</span>
                          <span className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-[#e76f3c]">فتح القسم <ArrowUpLeft className="h-3 w-3" /></span>
                        </span>
                      </CardContent>
                    </Card>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
