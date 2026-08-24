import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardQuickAccess, type DashboardQuickAccessItem } from "@/components/DashboardQuickAccess";
import { SuperAdminRestaurantCatalog } from "@/components/SuperAdminRestaurantCatalog";

type PlatformOverviewProps = {
  onNavigate: (key: "admin" | DashboardQuickAccessItem["key"]) => void;
  quickItems: DashboardQuickAccessItem[];
};

export function PlatformOverview({ onNavigate, quickItems }: PlatformOverviewProps) {
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden rounded-[1.6rem] border-orange-100 bg-gradient-to-l from-orange-50 via-white to-white shadow-sm dark:border-orange-500/25 dark:bg-slate-900/90 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="text-xs font-semibold text-[#e76f3c]">نظرة عامة للمنصة</p>
            <h3 className="mt-1 text-lg font-black text-slate-950 dark:text-white">مركز نشاط NFOOD</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">وصول مباشر إلى أدوات الإدارة ومركز المطاعم من شاشة واحدة، دون تكرار أشرطة الإحصاءات.</p>
          </div>
          <Button onClick={() => onNavigate("admin")} className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]">فتح مركز المطاعم</Button>
        </CardContent>
      </Card>
      <DashboardQuickAccess items={quickItems} onNavigate={onNavigate} title="كل أدوات المنصة في مكان واحد" description="الوحدات مرتبة حسب الأولوية. اضغط على أي بطاقة للوصول المباشر دون البحث في الشريط الجانبي." />
      <SuperAdminRestaurantCatalog />
    </div>
  );
}
