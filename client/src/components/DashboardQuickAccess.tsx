import type { LucideIcon } from "lucide-react";
import { ArrowUpLeft, Layers3 } from "lucide-react";
import type { NavKey } from "@/components/homeNavigation";
import { Card, CardContent } from "@/components/ui/card";

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
    description: "الإعدادات، اللغات، الأمان، وصحة النظام.",
    keys: ["languages", "security", "health", "accounts"],
  },
];

const fallbackGroup: AccessGroup = {
  id: "other",
  label: "المزيد",
  description: "أقسام إضافية متاحة حسب صلاحيات الحساب.",
  keys: [],
};

export function DashboardQuickAccess({ items, onNavigate, title = "كل الأقسام في مكان واحد", description = "بطاقات مرتبة حسب الأولوية؛ اضغط على أي بطاقة للانتقال مباشرة إلى الوحدة دون البحث في القائمة." }: DashboardQuickAccessProps) {
  const available = items.filter((item) => item.key !== "overview");
  const knownKeys = new Set(groups.flatMap((group) => group.keys));
  const grouped = groups.map((group) => ({ ...group, items: group.keys.map((key) => available.find((item) => item.key === key)).filter((item): item is DashboardQuickAccessItem => Boolean(item)) })).filter((group) => group.items.length > 0);
  const remaining = available.filter((item) => !knownKeys.has(item.key));
  if (remaining.length) grouped.push({ ...fallbackGroup, items: remaining });
  if (!grouped.length) return null;

  return (
    <section aria-labelledby="dashboard-quick-access-title" className="mb-4 rounded-[1.35rem] border border-slate-200/80 bg-white/70 p-3 shadow-sm md:p-4">
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
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">{available.length} أقسام متاحة</span>
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
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.key} type="button" onClick={() => onNavigate(item.key)} className="group text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e76f3c] focus-visible:ring-offset-2">
                    <Card className="h-full rounded-2xl border-slate-200/90 bg-white transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-orange-200 group-hover:shadow-md group-active:translate-y-0">
                      <CardContent className="flex min-h-[72px] items-center gap-2.5 p-2.5">
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
