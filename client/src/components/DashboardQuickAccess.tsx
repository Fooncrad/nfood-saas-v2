import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpLeft, Layers3, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { NavKey } from "@/components/homeNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

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

const copyByLanguage = {
  ar: { title: "كل الأقسام في مكان واحد", description: "ابدأ من الأدوات الأهم وانتقل مباشرة إلى الوحدة المطلوبة.", open: "فتح القسم", drag: "اسحب لتغيير الترتيب", reset: "إعادة الضبط", available: "أقسام متاحة", units: "وحدات", density: { compact: "مضغوط", comfortable: "مريح", spacious: "واسع" }, groups: { priority: ["الوصول السريع", "الأدوات الأكثر استخدامًا في التشغيل اليومي."], management: ["الإدارة والتشغيل", "الفروع والملفات والمخزون والفريق."], control: ["التحكم والمتابعة", "الإعدادات والأمان وصحة النظام."], other: ["المزيد", "أقسام إضافية حسب صلاحيات الحساب."] } },
  en: { title: "Everything in one workspace", description: "Start with the most important tools and jump straight to the right module.", open: "Open module", drag: "Drag to reorder", reset: "Reset order", available: "available", units: "modules", density: { compact: "Compact", comfortable: "Comfortable", spacious: "Spacious" }, groups: { priority: ["Quick access", "The tools used most in daily operations."], management: ["Management & operations", "Branches, files, inventory, and team."], control: ["Control & monitoring", "Settings, security, and system health."], other: ["More", "Additional areas based on your permissions."] } },
  fr: { title: "Tout dans un espace", description: "Commencez par les outils essentiels et ouvrez directement le module voulu.", open: "Ouvrir le module", drag: "Glisser pour réordonner", reset: "Réinitialiser", available: "disponibles", units: "modules", density: { compact: "Compact", comfortable: "Confort", spacious: "Aéré" }, groups: { priority: ["Accès rapide", "Les outils les plus utilisés au quotidien."], management: ["Gestion et opérations", "Succursales, fichiers, stock et équipe."], control: ["Contrôle et suivi", "Réglages, sécurité et état du système."], other: ["Plus", "Autres espaces selon vos permissions."] } },
  ur: { title: "سب کچھ ایک جگہ", description: "اہم ٹولز سے شروع کریں اور مطلوبہ ماڈیول کھولیں۔", open: "ماڈیول کھولیں", drag: "ترتیب بدلنے کے لیے کھینچیں", reset: "ترتیب بحال کریں", available: "دستیاب", units: "ماڈیولز", density: { compact: "مختصر", comfortable: "آرام دہ", spacious: "کشادہ" }, groups: { priority: ["فوری رسائی", "روزمرہ کام کے زیادہ استعمال ہونے والے ٹولز۔"], management: ["انتظام اور آپریشنز", "برانچز، فائلز، انوینٹری اور ٹیم۔"], control: ["کنٹرول اور نگرانی", "ترتیبات، سیکیورٹی اور سسٹم کی صحت۔"], other: ["مزید", "آپ کی اجازت کے مطابق اضافی حصے۔"] } },
} as const;

export function DashboardQuickAccess({ items, onNavigate, title, description, storageScope = "default" }: DashboardQuickAccessProps) {
  const { language } = useLanguage();
  const copy = copyByLanguage[language as keyof typeof copyByLanguage] ?? copyByLanguage.en;
  const resolvedTitle = title ?? copy.title;
  const resolvedDescription = description ?? copy.description;
  const [density, setDensity] = useState<"comfortable" | "compact" | "spacious">(() => { try { return (localStorage.getItem("nfood.dashboard.density") as "comfortable" | "compact" | "spacious") || "compact"; } catch { return "comfortable"; } });
  const [orderedKeys, setOrderedKeys] = useState<NavKey[]>(() => { try { const saved = JSON.parse(localStorage.getItem(`nfood.dashboard.widget-order:${storageScope}`) || "[]"); return Array.isArray(saved) ? saved.filter((value): value is NavKey => typeof value === "string") : []; } catch { return []; } });
  const [dragKey, setDragKey] = useState<NavKey | null>(null);
  useEffect(() => { try { localStorage.setItem("nfood.dashboard.density", density); } catch { /* storage unavailable */ } }, [density]);
  useEffect(() => { try { localStorage.setItem(`nfood.dashboard.widget-order:${storageScope}`, JSON.stringify(orderedKeys)); } catch { /* storage unavailable */ } }, [orderedKeys, storageScope]);
  const densityClasses = { comfortable: { section: "p-3 md:p-4", gap: "gap-3", card: "min-h-[68px] p-2" }, compact: { section: "p-2", gap: "gap-1.5", card: "min-h-[48px] p-1.5" }, spacious: { section: "p-4 md:p-5", gap: "gap-4", card: "min-h-[82px] p-3" } }[density];
  const available = items.filter((item) => item.key !== "overview");
  const knownKeys = new Set(groups.flatMap((group) => group.keys));
  const defaultOrder = available.map((item) => item.key);
  const normalizedOrder = [...orderedKeys, ...defaultOrder.filter((key) => !orderedKeys.includes(key))];
  const resetOrder = () => { setOrderedKeys([]); try { localStorage.removeItem(`nfood.dashboard.widget-order:${storageScope}`); } catch { /* storage unavailable */ } toast.success("تمت إعادة ترتيب الودجات إلى الوضع الافتراضي"); };
  const orderIndex = new Map(normalizedOrder.map((key, index) => [key, index]));
  const sortItems = (groupItems: DashboardQuickAccessItem[]) => [...groupItems].sort((a, b) => (orderIndex.get(a.key) ?? 9999) - (orderIndex.get(b.key) ?? 9999));
  const grouped = groups.map((group) => { const localized = copy.groups[group.id as keyof typeof copy.groups]; return { ...group, label: localized?.[0] ?? group.label, description: localized?.[1] ?? group.description, items: sortItems(group.keys.map((key) => available.find((item) => item.key === key)).filter((item): item is DashboardQuickAccessItem => Boolean(item))) }; }).filter((group) => group.items.length > 0);
  const remaining = available.filter((item) => !knownKeys.has(item.key));
  if (remaining.length) grouped.push({ ...fallbackGroup, label: copy.groups.other[0], description: copy.groups.other[1], items: remaining });
  if (!grouped.length) return null;

  return (
    <section aria-labelledby="dashboard-quick-access-title" className={`nfood-quick-access mb-3 rounded-xl border border-slate-200/80 bg-white/70 shadow-sm transition-colors duration-300 dark:border-slate-700/80 dark:bg-slate-900/85 ${densityClasses.section}`}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#e76f3c]"><Layers3 className="h-4 w-4" /></div>
            <div>
              <h3 id="dashboard-quick-access-title" className="text-base font-black tracking-tight text-[#111c2e] dark:text-white">{resolvedTitle}</h3>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{resolvedDescription}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2"><span className="hidden items-center gap-1 text-[10px] font-bold text-slate-400 sm:flex"><SlidersHorizontal className="h-3.5 w-3.5" /> {copy.drag}</span><Button type="button" variant="outline" size="sm" onClick={resetOrder} className="h-7 rounded-lg border-slate-200 px-2 text-[10px] font-bold text-slate-500 hover:border-orange-200 hover:text-[#e76f3c]"><RotateCcw className="ms-1 h-3 w-3" /> {copy.reset}</Button><div className="flex rounded-xl bg-slate-100 p-0.5" role="group" aria-label="كثافة لوحة التحكم">{(["compact", "comfortable", "spacious"] as const).map((value) => <button key={value} type="button" onClick={() => setDensity(value)} className={`rounded-lg px-2 py-1 text-[10px] font-bold ${density === value ? "bg-white text-[#e76f3c] shadow-sm" : "text-slate-500"}`}>{copy.density[value]}</button>)}</div><span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">{available.length} {copy.available}</span></div>
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {grouped.map((group) => (
          <div key={group.id}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">{group.label}</h4>
                <p className="mt-0.5 text-[11px] text-slate-400">{group.description}</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{group.items.length} {copy.units}</span>
            </div>
            <div className={`grid grid-cols-2 ${densityClasses.gap} sm:grid-cols-2`}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.key} type="button" draggable onDragStart={() => setDragKey(item.key)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (!dragKey || dragKey === item.key) return; const next = [...normalizedOrder]; const from = next.indexOf(dragKey); const to = next.indexOf(item.key); if (from >= 0 && to >= 0) { next.splice(from, 1); next.splice(to, 0, dragKey); setOrderedKeys(next); } setDragKey(null); }} onDragEnd={() => setDragKey(null)} onClick={() => onNavigate(item.key)} title={copy.drag} className={`group text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e76f3c] focus-visible:ring-offset-2 motion-safe:transition-transform motion-safe:duration-200 hover:-translate-y-0.5 ${dragKey === item.key ? "opacity-50" : ""}`}>
                    <Card className="nfood-quick-card h-full rounded-xl border-slate-300/90 bg-white shadow-[0_6px_18px_-14px_rgba(15,23,42,0.5)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-orange-300 group-hover:shadow-[0_14px_28px_-18px_rgba(15,23,42,0.55)] group-active:translate-y-0 dark:border-slate-700 dark:bg-slate-900/95">
                      <CardContent className={`flex items-center gap-2.5 ${densityClasses.card}`}>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition-colors group-hover:bg-orange-50 group-hover:text-[#e76f3c] dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-orange-500/15"><Icon className="h-[18px] w-[18px]" /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-slate-900 dark:text-slate-100">{item.label}</span>
                          <span className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-slate-600 group-hover:text-[#c75325] dark:text-slate-400">{copy.open} <ArrowUpLeft className="h-3 w-3" /></span>
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
