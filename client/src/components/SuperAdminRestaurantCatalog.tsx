import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Eye,
  KeyRound,
  LogIn,
  MoreHorizontal,
  Plus,
  Search,
  Store,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreateRestaurantDialog } from "@/components/CreateRestaurantDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { filterRestaurantRows, formatCatalogMoney } from "@/lib/restaurantCatalog";
import { sectorFeatureCatalog } from "../../../shared/sectorFeatureCatalog";

type Filter = "الكل" | "نشط" | "تجربة" | "معلّق";

type PlanRecord = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  monthlyPrice: string;
  yearlyPrice: string;
  isActive: boolean;
  features: Array<{
    key: string;
    enabled: boolean;
    featureLimit: number | null;
  }>;
};

type FeatureDefinition = {
  id: number;
  key: string;
  label: string;
  dependencyKey: string | null;
  defaultLimit: number | null;
  isAddOn: boolean;
  addonPrice: string | null;
};
type AccessRecord = FeatureDefinition & {
  access: { enabled: boolean; limit: number | null; reason: string };
};

export function SuperAdminRestaurantCatalog() {
  const { language } = useLanguage();
  const ui = language === "ar"
    ? { center: "منشآت المنصة", title: "إدارة المنشآت والمطاعم", subtitle: "إدارة الدخول الإداري، الباقات والحزم والمميزات وحالة كل منشأة من شاشة واحدة.", add: "إضافة مطعم جديد", search: "ابحث باسم المطعم أو المعرّف أو الباقة", all: "الكل", active: "نشط", trial: "تجربة", pending: "معلّق", plans: "كل الباقات", actions: "إجراءات", retry: "إعادة المحاولة", empty: "لا توجد مطاعم مطابقة للبحث الحالي.", report: "تفاصيل التقرير", branches: "فروع", account: "حساب", statusActive: "نشط", statusTrial: "تجربة", statusPending: "معلّق", plan: "الباقة", publicLink: "الرابط العام", details: "التفاصيل", login: "دخول المطعم", pause: "إيقاف مؤقت", activate: "تفعيل المطعم", editPlan: "الباقة والحزم", resetPassword: "إعادة تعيين كلمة المرور", unspecified: "غير محددة" }
    : language === "fr"
      ? { center: "Centre des restaurants", title: "Liste des restaurants", subtitle: "Gérez les restaurants, offres, statuts et liens publics depuis un seul espace.", add: "Ajouter un restaurant", search: "Rechercher par nom, identifiant ou offre", all: "Tous", active: "Actif", trial: "Essai", pending: "En attente", plans: "Toutes les offres", actions: "Actions", retry: "Réessayer", empty: "Aucun restaurant ne correspond à la recherche.", report: "Détails du rapport", branches: "succursales", account: "Compte", statusActive: "Actif", statusTrial: "Essai", statusPending: "En attente", plan: "Offre", publicLink: "Lien public", details: "Détails", login: "Ouvrir le restaurant", pause: "Suspendre", activate: "Activer", editPlan: "Modifier l’offre", resetPassword: "Réinitialiser le mot de passe", unspecified: "Non définie" }
      : language === "ur"
        ? { center: "ریستوران مرکز", title: "ریستوران فہرست", subtitle: "ریستوران، پیکیجز، حیثیت اور عوامی لنکس ایک جگہ سے منظم کریں۔", add: "نیا ریستوران شامل کریں", search: "نام، شناخت یا پیکیج سے تلاش کریں", all: "سب", active: "فعال", trial: "آزمائشی", pending: "زیر التوا", plans: "تمام پیکیجز", actions: "اعمال", retry: "دوبارہ کوشش", empty: "تلاش سے کوئی ریستوران نہیں ملا۔", report: "رپورٹ کی تفصیل", branches: "برانچز", account: "اکاؤنٹ", statusActive: "فعال", statusTrial: "آزمائشی", statusPending: "زیر التوا", plan: "پیکیج", publicLink: "عوامی لنک", details: "تفصیل", login: "ریستوران کھولیں", pause: "روکیں", activate: "فعال کریں", editPlan: "پیکیج تبدیل کریں", resetPassword: "پاس ورڈ ری سیٹ کریں", unspecified: "متعین نہیں" }
        : { center: "Restaurant center", title: "Restaurant list", subtitle: "Manage registered restaurants, plans, statuses, and public links from one workspace.", add: "Add restaurant", search: "Search by restaurant name, ID, or plan", all: "All", active: "Active", trial: "Trial", pending: "Pending", plans: "All plans", actions: "Actions", retry: "Try again", empty: "No restaurants match the current search.", report: "Report details", branches: "branches", account: "Account", statusActive: "Active", statusTrial: "Trial", statusPending: "Pending", plan: "Plan", publicLink: "Public link", details: "Details", login: "Open restaurant", pause: "Pause", activate: "Activate", editPlan: "Edit plan", resetPassword: "Reset password", unspecified: "Not set" };
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("الكل");
  const [createOpen, setCreateOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);
  const [planFilter, setPlanFilter] = useState("الكل");
  const [planEditor, setPlanEditor] = useState<{
    id: number;
    name: string;
    currentPlan: string;
  } | null>(null);
  const [planDraft, setPlanDraft] = useState("");
  const [detailsRestaurant, setDetailsRestaurant] = useState<{
    id: number;
    name: string;
    plan: string | null;
  } | null>(null);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [passwordEditor, setPasswordEditor] = useState<{
    restaurantId: number;
    restaurantName: string;
    password: string;
    confirmPassword: string;
  } | null>(null);
  const restaurantsQuery = trpc.admin.restaurants.useQuery(undefined, {
    retry: 2,
  });
  const plansQuery = trpc.admin.packagePlans.useQuery(undefined, { retry: 2 });
  const definitionsQuery = trpc.admin.featureDefinitions.useQuery(undefined, {
    retry: 2,
  });
  const detailsQuery = trpc.features.allAccess.useQuery(
    { restaurantId: detailsRestaurant?.id ?? 1 },
    { enabled: Boolean(detailsRestaurant), retry: 1 }
  );
  const marketplacePresentationQuery = trpc.marketplace.adminRestaurantMarketplacePresentation.useQuery(
    { restaurantId: detailsRestaurant?.id ?? 1 },
    { enabled: Boolean(detailsRestaurant), retry: 1 }
  );
  const utils = trpc.useUtils();
  const updateMarketplacePresentation = trpc.marketplace.adminUpdateRestaurantMarketplacePresentation.useMutation({
    onSuccess: async () => {
      if (detailsRestaurant) await utils.marketplace.adminRestaurantMarketplacePresentation.invalidate({ restaurantId: detailsRestaurant.id });
      toast.success("تم تحديث عدد المنتجات الظاهرة في السوق العام");
    },
    onError: error => toast.error(`تعذر تحديث عرض السوق: ${error.message}`),
  });
  const updateRestaurant = trpc.admin.updateRestaurant.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.admin.restaurants.invalidate(), utils.admin.subscriptions.invalidate(), utils.admin.saasMetrics.invalidate()]);
      setPlanEditor(null);
      toast.success(language === "ar" ? "تم تحديث المنشأة والاشتراك" : "Restaurant and subscription updated");
    },
    onError: error => toast.error(`تعذر تحديث المطعم: ${error.message}`),
  });
  const enterRestaurant = trpc.admin.enterRestaurantAccount.useMutation({
    onSuccess: () => {
      toast.success("تم الدخول إلى مساحة المطعم");
      window.location.assign("/");
    },
    onError: error => {
      toast.error(`تعذر الدخول إلى المطعم: ${error.message}`);
    },
  });
  const createRestaurant = trpc.admin.createRestaurant.useMutation({
    onSuccess: data => {
      void utils.admin.restaurants.invalidate();
      setCreateOpen(false);
      setCredentials({
        email: data.account.email,
        password: data.account.temporaryPassword,
      });
      toast.success("تم إنشاء المطعم وحساب الدخول");
    },
    onError: error => toast.error(`تعذر إنشاء المطعم: ${error.message}`),
  });
  const resetPassword = trpc.admin.resetRestaurantPassword.useMutation({
    onSuccess: data => {
      setPasswordEditor(null);
      setCredentials({ email: data.email, password: data.temporaryPassword });
      toast.success("تم تحديث كلمة المرور وإبطال الجلسات السابقة");
    },
    onError: error =>
      toast.error(`تعذر إعادة تعيين كلمة المرور: ${error.message}`),
  });
  const restaurants = restaurantsQuery.data ?? [];
  const plans = (plansQuery.data ?? []) as PlanRecord[];
  const definitions = (definitionsQuery.data ?? []) as FeatureDefinition[];
  const planOptions = useMemo(
    () => [
      "الكل",
      ...Array.from(
        new Set([
          ...plans.map(plan => plan.name),
          ...(restaurantsQuery.data ?? [])
            .map(restaurant => restaurant.plan)
            .filter((plan): plan is string => Boolean(plan)),
        ])
      ),
    ],
    [plans, restaurantsQuery.data]
  );
  const rows = useMemo(
    () =>
      filterRestaurantRows(
        (restaurantsQuery.data ?? []) as Array<{
          id: number;
          name: string;
          slug: string | null;
          plan: string | null;
          status: string;
          branchCount?: number;
        }>,
        query,
        filter,
        planFilter,
        plans
      ),
    [filter, planFilter, plans, query, restaurantsQuery.data]
  );
  const details = (detailsQuery.data ?? []) as AccessRecord[];
  const enabledDetailsCount = details.filter(
    feature => feature.access.enabled
  ).length;
  const planOptionsForEditor = plans.filter(plan => plan.isActive);
  const catalogLoading = plansQuery.isLoading || definitionsQuery.isLoading;
  const catalogError = plansQuery.isError || definitionsQuery.isError;
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const visibleDefinitions = showAllFeatures
    ? definitions
    : definitions.slice(0, 8);
  const actionsCopy = language === "ar"
    ? { refresh: "تحديث القائمة", reset: "مسح الفلاتر", openCatalog: "فتح كتالوج الباقات" }
    : language === "fr"
      ? { refresh: "Actualiser la liste", reset: "Réinitialiser les filtres", openCatalog: "Ouvrir le catalogue" }
      : language === "ur"
        ? { refresh: "فہرست تازہ کریں", reset: "فلٹر صاف کریں", openCatalog: "کیٹلاگ کھولیں" }
        : { refresh: "Refresh list", reset: "Reset filters", openCatalog: "Open package catalog" };

  return (
    <div data-testid="super-admin-restaurant-catalog" dir={language === "ar" || language === "ur" ? "rtl" : "ltr"} className="space-y-4 text-slate-900 dark:text-white">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-1 py-1 dark:border-slate-800 dark:bg-slate-950/30">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#e76f3c]">{ui.center}</p>
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {restaurantsQuery.isLoading ? "…" : formatCatalogMoney(restaurants.length)}
            </span>
          </div>
          <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950 dark:text-white md:text-xl">{ui.title}</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">{ui.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-9 gap-1.5 rounded-lg bg-[#e76f3c] px-3 text-xs shadow-sm hover:bg-[#d85f2e]"
          >
            <Plus className="h-4 w-4" /> {ui.add}
          </Button>
        </div>
      </div>
      <CreateRestaurantDialog
        open={createOpen}
        pending={createRestaurant.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={input => createRestaurant.mutate(input)}
      />
      <Dialog
        open={Boolean(planEditor)}
        onOpenChange={open => {
          if (!open) setPlanEditor(null);
        }}
      >
        <DialogContent
          dir="rtl"
          className="max-h-[90dvh] overflow-y-auto rounded-3xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 sm:max-w-xl"
        >
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
              إدارة الباقة والحزم
            </DialogTitle>
            <DialogDescription>
              اختر الباقة الجديدة، راجع السعر والمميزات الفعلية، ثم طبّق الترقية مباشرة على المنشأة.
            </DialogDescription>
          </DialogHeader>
          {planEditor && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs text-slate-500 dark:text-slate-400">المنشأة</p>
                <p className="mt-1 font-bold text-slate-900 dark:text-white">
                  {planEditor.name}
                </p>
                <p className="mt-1 font-mono text-xs text-slate-400">
                  الباقة الحالية: {planEditor.currentPlan || "غير محددة"}
                </p>
              </div>
              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">الباقة الجديدة</span>
                <select
                  value={planDraft}
                  onChange={event => setPlanDraft(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e76f3c] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {planOptionsForEditor.length === 0 ? (
                    <option value="">لا توجد باقات نشطة</option>
                  ) : (
                    planOptionsForEditor.map(plan => (
                      <option key={plan.id} value={plan.key}>
                        {plan.name} · {plan.monthlyPrice} SAR شهريًا · {plan.features.filter(feature => feature.enabled).length} مميزات
                      </option>
                    ))
                  )}
                </select>
              </label>
              {planDraft ? (() => {
                const selected = planOptionsForEditor.find(plan => plan.key === planDraft);
                if (!selected) return null;
                const active = selected.features.filter(feature => feature.enabled);
                const limited = active.filter(feature => feature.featureLimit !== null);
                return (
                  <div className="grid gap-3 rounded-2xl border border-orange-200 bg-orange-50/70 p-4 dark:border-orange-900/60 dark:bg-orange-950/20 sm:grid-cols-3">
                    <div><p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">المميزات</p><p className="mt-1 text-xl font-black dark:text-white">{active.length}</p></div>
                    <div><p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">حدود مخصصة</p><p className="mt-1 text-xl font-black dark:text-white">{limited.length}</p></div>
                    <div><p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">شهريًا</p><p className="mt-1 text-xl font-black text-[#e76f3c]">{selected.monthlyPrice} SAR</p></div>
                    <div className="flex flex-wrap gap-1.5 border-t border-orange-200/70 pt-3 dark:border-orange-900/50 sm:col-span-3">
                      {active.slice(0, 10).map(feature => <Badge key={feature.key} variant="outline" className="rounded-lg bg-white/80 text-[10px] dark:bg-slate-900">{definitions.find(item => item.key === feature.key)?.label ?? feature.key}{feature.featureLimit !== null ? ` · ${feature.featureLimit}` : ""}</Badge>)}
                      {active.length > 10 ? <Badge className="rounded-lg text-[10px]">+{active.length - 10}</Badge> : null}
                      <div className="mt-2 w-full rounded-xl border border-dashed border-orange-300/70 bg-white/60 p-3 dark:border-orange-900 dark:bg-slate-950/50">
                        <p className="text-[11px] font-black text-slate-700 dark:text-slate-200">حزمة الضيافة الذكية</p>
                        <p className="mt-1 text-[10px] leading-5 text-slate-500 dark:text-slate-400">للمطاعم والمقاهي: المنيو الرقمي، QR/NFC، الطلبات، POS/KDS، الطاولات، نداء النادل، الحجوزات، الطابور، التوصيل، الموظفون، المخزون والمشتريات.</p>
                        <p className="mt-2 text-[10px] font-bold text-[#e76f3c]">{sectorFeatureCatalog.hospitality.length} قدرة تشغيلية قابلة للربط بالباقة والحزم</p>
                      </div>
                    </div>
                  </div>
                );
              })() : null}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPlanEditor(null)}
              className="rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              disabled={!planDraft || updateRestaurant.isPending}
              onClick={() => {
                const selectedPlan = planOptionsForEditor.find(
                  plan => plan.key === planDraft
                );
                if (planEditor && selectedPlan)
                  updateRestaurant.mutate({
                    id: planEditor.id,
                    plan: selectedPlan.key,
                    status: "active",
                  });
              }}
              className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"
            >
              {updateRestaurant.isPending ? "جارٍ تطبيق الترقية..." : "ترقية المطعم وتفعيل المميزات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(detailsRestaurant)}
        onOpenChange={open => {
          if (!open) setDetailsRestaurant(null);
        }}
      >
        <DialogContent
          dir="rtl"
          className="max-h-[85vh] overflow-y-auto rounded-3xl border-slate-200 bg-white sm:max-w-2xl"
        >
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-black text-slate-900">
              مميزات المطعم الفعلية
            </DialogTitle>
            <DialogDescription>
              {detailsRestaurant?.name} · الباقة الحالية:{" "}
              {detailsRestaurant?.plan || "غير محددة"}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">عرض المنتجات في السوق العام</p>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">حدد أقصى عدد من منتجات هذا المطعم التي يمكن أن تظهر ضمن «الأكثر مبيعًا». اختر 0 لإخفائها من هذا القسم.</p>
              </div>
              {marketplacePresentationQuery.isLoading ? <span className="text-xs text-slate-400">جارٍ التحميل...</span> : marketplacePresentationQuery.isError ? <button type="button" onClick={() => void marketplacePresentationQuery.refetch()} className="text-xs font-bold text-red-600 underline">إعادة المحاولة</button> : (
                <select
                  aria-label="عدد المنتجات الأكثر مبيعًا في السوق العام"
                  value={marketplacePresentationQuery.data?.publicBestSellingLimit ?? 5}
                  disabled={updateMarketplacePresentation.isPending}
                  onChange={event => detailsRestaurant && updateMarketplacePresentation.mutate({ restaurantId: detailsRestaurant.id, publicBestSellingLimit: Number(event.target.value) })}
                  className="h-10 rounded-xl border border-blue-200 bg-white px-3 text-sm font-black text-slate-800 outline-none dark:border-blue-800 dark:bg-slate-950 dark:text-white"
                >
                  {Array.from({ length: 11 }, (_, value) => <option key={value} value={value}>{value === 0 ? "0 · إخفاء" : `${value} منتج`}</option>)}
                </select>
              )}
            </div>
            {marketplacePresentationQuery.data ? <p className="mt-2 text-[10px] font-bold text-blue-700 dark:text-blue-300">الحد العام الحالي: {marketplacePresentationQuery.data.inheritedLimit} · إعداد هذا المطعم: {marketplacePresentationQuery.data.publicBestSellingLimit}</p> : null}
          </div>
          {detailsQuery.isLoading ? (
            <div className="space-y-2">
              <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
            </div>
          ) : detailsQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              تعذر تحميل المميزات. Request ID: restaurant-features-
              {detailsRestaurant?.id}
              <button
                type="button"
                onClick={() => void detailsQuery.refetch()}
                className="mr-2 font-bold underline"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : details.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-7 text-center text-sm text-slate-500">
              لا توجد مميزات معرفة لهذا المطعم.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {details.map(feature => (
                <div
                  key={feature.id}
                  className={`rounded-2xl border p-3 ${feature.access.enabled ? "border-emerald-200 bg-emerald-50/70" : "border-slate-200 bg-slate-50"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`flex min-w-0 items-center gap-2 text-sm font-bold ${feature.access.enabled ? "text-emerald-800" : "text-slate-500"}`}
                    >
                      {feature.access.enabled ? (
                        <Check className="h-4 w-4 shrink-0" />
                      ) : (
                        <X className="h-4 w-4 shrink-0" />
                      )}
                      <span className="truncate">{feature.label}</span>
                    </span>
                    <Badge
                      variant="outline"
                      className="shrink-0 rounded-lg text-[10px]"
                    >
                      {feature.access.enabled ? "مفعلة" : "غير مفعلة"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span>السبب: {feature.access.reason}</span>
                    {feature.access.limit !== null ? (
                      <span>الحد: {feature.access.limit}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <div className="ml-auto rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
              {detailsQuery.isLoading
                ? "..."
                : `${enabledDetailsCount} من ${details.length} مميزة مفعلة`}
            </div>
            <Button
              type="button"
              onClick={() => setDetailsRestaurant(null)}
              className="rounded-xl bg-[#111c2e] hover:bg-[#1b2a43]"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(passwordEditor)}
        onOpenChange={open => {
          if (!open && !resetPassword.isPending) setPasswordEditor(null);
        }}
      >
        <DialogContent
          dir="rtl"
          className="rounded-3xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 sm:max-w-md"
        >
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
              تغيير كلمة مرور المتجر
            </DialogTitle>
            <DialogDescription className="leading-6">
              {passwordEditor?.restaurantName} · سيتم تشفير كلمة المرور الجديدة وإبطال جلسات المتجر السابقة.
            </DialogDescription>
          </DialogHeader>
          {passwordEditor && (
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  كلمة المرور الجديدة
                </span>
                <Input
                  type="password"
                  dir="ltr"
                  autoComplete="new-password"
                  value={passwordEditor.password}
                  onChange={event =>
                    setPasswordEditor(current =>
                      current ? { ...current, password: event.target.value } : current
                    )
                  }
                  placeholder="8 أحرف على الأقل"
                  className="h-11 rounded-xl"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  تأكيد كلمة المرور
                </span>
                <Input
                  type="password"
                  dir="ltr"
                  autoComplete="new-password"
                  value={passwordEditor.confirmPassword}
                  onChange={event =>
                    setPasswordEditor(current =>
                      current ? { ...current, confirmPassword: event.target.value } : current
                    )
                  }
                  placeholder="أعد إدخال كلمة المرور"
                  className="h-11 rounded-xl"
                />
              </label>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                بعد الحفظ سيتم تسجيل خروج جلسات هذا المتجر السابقة، بينما تبقى جلسة Super Admin محفوظة.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={resetPassword.isPending}
              onClick={() => setPasswordEditor(null)}
              className="rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              disabled={
                !passwordEditor ||
                passwordEditor.password.length < 8 ||
                passwordEditor.password !== passwordEditor.confirmPassword ||
                resetPassword.isPending
              }
              onClick={() => {
                if (!passwordEditor) return;
                if (passwordEditor.password.length < 8) {
                  toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
                  return;
                }
                if (passwordEditor.password !== passwordEditor.confirmPassword) {
                  toast.error("كلمتا المرور غير متطابقتين");
                  return;
                }
                resetPassword.mutate({
                  restaurantId: passwordEditor.restaurantId,
                  password: passwordEditor.password,
                });
              }}
              className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"
            >
              {resetPassword.isPending ? "جارٍ التحديث..." : "حفظ كلمة المرور"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(credentials)}
        onOpenChange={open => {
          if (!open) setCredentials(null);
        }}
      >
        <DialogContent
          dir="rtl"
          className="rounded-3xl border-slate-200 bg-white sm:max-w-md"
        >
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-black text-slate-900">
              بيانات دخول المطعم
            </DialogTitle>
            <DialogDescription className="leading-6">
              احفظ هذه البيانات الآن؛ لن نعرض كلمة المرور مرة أخرى بعد إغلاق هذه
              النافذة.
            </DialogDescription>
          </DialogHeader>
          {credentials && (
            <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
              <div>
                <p className="mb-1 text-xs font-bold text-slate-500">
                  البريد الإلكتروني
                </p>
                <div className="flex items-center gap-2">
                  <code
                    dir="ltr"
                    className="flex-1 rounded-xl bg-white px-3 py-2 text-sm text-slate-800"
                  >
                    {credentials.email}
                  </code>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label="نسخ البريد"
                    onClick={() =>
                      void navigator.clipboard?.writeText(credentials.email)
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-bold text-slate-500">
                  كلمة المرور
                </p>
                <div className="flex items-center gap-2">
                  <code
                    dir="ltr"
                    className="flex-1 rounded-xl bg-white px-3 py-2 text-sm text-slate-800"
                  >
                    {credentials.password}
                  </code>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label="نسخ كلمة المرور"
                    onClick={() =>
                      void navigator.clipboard?.writeText(credentials.password)
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setCredentials(null)}
              className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"
            >
              تم الحفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div>
        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-l from-slate-50/80 via-white to-white p-3.5 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                aria-label={ui.search}
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder={ui.search}
                className="h-10 rounded-xl border-slate-200 bg-white/90 pr-9 text-xs shadow-none focus-visible:ring-2 focus-visible:ring-orange-200 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["الكل", "نشط", "تجربة", "معلّق"] as Filter[]).map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-black transition ${filter === item ? "bg-[#e76f3c] text-white shadow-sm" : "bg-slate-100/80 text-slate-500 hover:bg-orange-50 hover:text-[#e76f3c] dark:bg-slate-800 dark:text-slate-300"}`}
                >
                  {item === "الكل" ? ui.all : item === "نشط" ? ui.active : item === "تجربة" ? ui.trial : ui.pending}
                </button>
              ))}
            </div>
            <select
              aria-label={ui.plans}
              value={planFilter}
              onChange={event => setPlanFilter(event.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-600 outline-none transition focus:border-[#e76f3c] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="الكل">{ui.plans}</option>
              {planOptions.slice(1).map(plan => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
            <div className="relative">
              <Button aria-label={ui.actions} aria-expanded={actionsOpen} onClick={() => setActionsOpen(open => !open)} variant="outline" className="h-9 gap-1.5 rounded-lg border-slate-200 px-3 text-[11px] font-black dark:border-slate-700">
                <MoreHorizontal className="h-4 w-4" /> {ui.actions}
              </Button>
              {actionsOpen && (
                <div className="absolute left-0 top-11 z-30 min-w-48 rounded-xl border border-slate-200 bg-white p-1.5 text-right shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <button type="button" onClick={() => { void restaurantsQuery.refetch(); setActionsOpen(false); }} className="flex w-full items-center rounded-lg px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-orange-50 hover:text-[#c75325] dark:text-slate-200 dark:hover:bg-orange-500/10">{actionsCopy.refresh}</button>
                  <button type="button" onClick={() => { setQuery(""); setFilter("الكل"); setPlanFilter("الكل"); setActionsOpen(false); }} className="flex w-full items-center rounded-lg px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-orange-50 hover:text-[#c75325] dark:text-slate-200 dark:hover:bg-orange-500/10">{actionsCopy.reset}</button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {restaurantsQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2].map(item => (
                <div
                  key={item}
                  className="h-44 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : restaurantsQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
              {language === "ar" ? "تعذر تحميل القائمة حاليًا." : language === "fr" ? "Impossible de charger la liste pour le moment." : language === "ur" ? "فہرست ابھی لوڈ نہیں ہو سکی۔" : "Unable to load the list right now."} <span className="text-[10px] opacity-70">(admin-restaurants)</span>{" "}
              <button
                type="button"
                onClick={() => void restaurantsQuery.refetch()}
                className="mr-2 font-bold underline"
              >
                {ui.retry}
              </button>
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-10 text-center text-sm text-slate-500">
              {ui.empty}
            </div>
          ) : (
            <div className="grid min-w-0 gap-4 xl:grid-cols-2">
              {rows.map((restaurant, index) => {
                const status =
                  restaurant.status === "active"
                    ? "نشط"
                    : restaurant.status === "trial"
                      ? "تجربة"
                      : "معلّق";
                const statusClass =
                  status === "نشط"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : status === "تجربة"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-slate-200 bg-slate-50 text-slate-600";
                const statusLabel = status === "نشط" ? ui.statusActive : status === "تجربة" ? ui.statusTrial : ui.statusPending;
                const currentPlan = plans.find(plan => plan.key === restaurant.plan || plan.name === restaurant.plan);
                const enabledPlanFeatures = currentPlan?.features.filter(feature => feature.enabled) ?? [];
                const planDisplayName = currentPlan?.name ?? restaurant.plan ?? ui.unspecified;
                return (
                  <article
                    key={restaurant.id}
                    data-testid={`restaurant-card-${restaurant.id}`}
                    className="group relative flex min-h-[300px] min-w-0 flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,.06)] transition duration-300 hover:-translate-y-1 hover:border-orange-300/70 hover:shadow-[0_18px_45px_rgba(15,23,42,.12)] dark:border-white/10 dark:bg-[#0d2038]"
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-blue-500" />
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20 transition group-hover:scale-105">
                          <Store className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                            {restaurant.name}
                          </p>
                          <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                            {ui.account} <span dir="ltr">#{formatCatalogMoney(restaurant.id)}</span> · {formatCatalogMoney(restaurant.branchCount ?? 0)} {ui.branches}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${statusClass} dark:border-white/10 dark:bg-opacity-20`}
                      >
                        {statusLabel}
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2.5 text-[10px]">
                      <div className="min-w-0 rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/80">
                        <p className="text-slate-400">{ui.plan}</p>
                        <p className="mt-0.5 truncate font-bold text-slate-800 dark:text-slate-200">
                          {planDisplayName}
                        </p>
                        {currentPlan && <p className="mt-1 text-[9px] font-semibold text-slate-400">{enabledPlanFeatures.length} {language === "ar" ? "ميزة مفعلة" : language === "fr" ? "fonctionnalités actives" : "active features"} · {currentPlan.monthlyPrice} SAR/{language === "ar" ? "شهر" : "mo"}</p>}
                      </div>
                      <div className="min-w-0 rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/80">
                        <p className="text-slate-400">{ui.publicLink}</p>
                        <a
                          href={`/menu/${encodeURIComponent(restaurant.slug ?? "")}`}
                          target="_blank"
                          rel="noreferrer"
                          dir="ltr"
                          className="mt-0.5 block truncate font-mono font-bold text-sky-700 transition hover:text-sky-900 hover:underline dark:text-sky-300 dark:hover:text-sky-200"
                        >
                          /{restaurant.slug}
                        </a>
                      </div>
                    </div>

                    <div className="mt-4 grid min-w-0 grid-cols-1 gap-2 border-t border-slate-100 pt-4 dark:border-white/10 sm:grid-cols-2 2xl:grid-cols-3">
                      <a
                        href={`/menu/${encodeURIComponent(restaurant.slug ?? "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 w-full max-w-full items-center justify-center gap-1 rounded-xl bg-[#e76f3c] px-3 text-[11px] font-black text-white shadow-sm transition hover:bg-[#d85f2e]"
                      >
                        <Utensils className="h-3.5 w-3.5 shrink-0" /> فتح Menu
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setDetailsRestaurant({
                            id: restaurant.id,
                            name: restaurant.name,
                            plan: restaurant.plan,
                          })
                        }
                        className="h-10 w-full max-w-full justify-center gap-1 rounded-xl border-slate-200 px-3 text-[11px] font-bold dark:border-white/10"
                      >
                        <Eye className="h-3.5 w-3.5 shrink-0" /> {ui.details}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={enterRestaurant.isPending}
                        onClick={() =>
                          enterRestaurant.mutate({ id: restaurant.id })
                        }
                        className="h-10 w-full max-w-full justify-center gap-1 rounded-xl bg-[#071525] px-3 text-[11px] font-black text-white shadow-sm hover:bg-[#102844] dark:bg-orange-500 dark:hover:bg-orange-600"
                      >
                        <LogIn className="h-3.5 w-3.5 shrink-0" /> {ui.login}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={updateRestaurant.isPending}
                        onClick={() => updateRestaurant.mutate({ id: restaurant.id, status: restaurant.status === "suspended" ? "active" : "suspended" })}
                        className={`h-10 w-full max-w-full justify-center gap-1 rounded-xl px-3 text-[11px] font-bold ${restaurant.status === "suspended" ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-300" : "border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-300"}`}
                        data-testid={`restaurant-status-toggle-${restaurant.id}`}
                      >
                        {restaurant.status === "suspended" ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
                        {restaurant.status === "suspended" ? ui.activate : ui.pause}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={updateRestaurant.isPending || planOptionsForEditor.length === 0}
                        onClick={() => {
                          const current = plans.find(plan => plan.name === restaurant.plan || plan.key === restaurant.plan);
                          setPlanDraft(current?.key ?? planOptionsForEditor[0]?.key ?? "");
                          setPlanEditor({ id: restaurant.id, name: restaurant.name, currentPlan: restaurant.plan ?? "" });
                        }}
                        className="h-10 w-full max-w-full justify-center gap-1.5 rounded-xl border-orange-500 bg-orange-500 px-4 text-[11px] font-black text-white shadow-sm hover:bg-orange-600 dark:border-orange-500 dark:bg-orange-500 dark:text-white dark:hover:bg-orange-600"
                        data-testid={`restaurant-plan-${restaurant.id}`}
                      >
                        ترقية / تغيير الباقة
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={resetPassword.isPending}
                        onClick={() =>
                          setPasswordEditor({
                            restaurantId: restaurant.id,
                            restaurantName: restaurant.name,
                            password: "",
                            confirmPassword: "",
                          })
                        }
                        className="h-9 max-w-full gap-1 rounded-xl border-slate-200 px-3 text-[10px] font-bold dark:border-white/10"
                      >
                        <KeyRound className="h-3.5 w-3.5 shrink-0" /> {ui.resetPassword}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled
                        aria-disabled="true"
                        data-testid={`restaurant-delete-disabled-${restaurant.id}`}
                        title="حذف المطعم معطل للحماية من الحذف العرضي"
                        className="h-10 w-full max-w-full cursor-not-allowed justify-center gap-1 rounded-xl border-slate-200 px-3 text-[10px] font-bold text-slate-400 opacity-60 dark:border-white/10 dark:text-slate-500"
                      >
                        <Trash2 className="h-3.5 w-3.5 shrink-0" /> الحذف معطل
                      </Button>
                    </div>

                    <span className="sr-only">الترتيب {index + 1}</span>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      </div>


    </div>
  );
}
