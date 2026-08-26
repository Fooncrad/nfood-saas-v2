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
    ? { center: "مركز المطاعم", title: "قائمة المطاعم", subtitle: "إدارة المطاعم المسجلة والباقات والحالة والروابط العامة من شاشة واحدة.", add: "إضافة مطعم جديد", search: "ابحث باسم المطعم أو المعرّف أو الباقة", all: "الكل", active: "نشط", trial: "تجربة", pending: "معلّق", plans: "كل الباقات", actions: "إجراءات", retry: "إعادة المحاولة", empty: "لا توجد مطاعم مطابقة للبحث الحالي.", report: "تفاصيل التقرير", branches: "فروع", account: "حساب", statusActive: "نشط", statusTrial: "تجربة", statusPending: "معلّق", plan: "الباقة", publicLink: "الرابط العام", details: "التفاصيل", login: "دخول المطعم", pause: "إيقاف مؤقت", activate: "تفعيل المطعم", editPlan: "تعديل الباقة", resetPassword: "إعادة تعيين كلمة المرور", unspecified: "غير محددة" }
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
  const utils = trpc.useUtils();
  const updateRestaurant = trpc.admin.updateRestaurant.useMutation({
    onSuccess: () => {
      void utils.admin.restaurants.invalidate();
      setPlanEditor(null);
      toast.success("تم تحديث المطعم");
    },
    onError: error => toast.error(`تعذر تحديث المطعم: ${error.message}`),
  });
  const enterRestaurant = trpc.admin.enterRestaurantAccount.useMutation({
    onSuccess: () => {
      toast.success("تم الدخول إلى مساحة المطعم");
      window.location.assign("/");
    },
    onError: error => toast.error(`تعذر الدخول إلى المطعم: ${error.message}`),
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
  const [catalogOpen, setCatalogOpen] = useState(true);
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
            type="button"
            variant="outline"
            aria-expanded={catalogOpen}
            onClick={() => setCatalogOpen(open => !open)}
            className="h-9 gap-1.5 rounded-lg border-slate-200 px-3 text-xs"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${catalogOpen ? "rotate-180" : ""}`} />
            {catalogOpen ? (language === "ar" ? "طي القائمة" : language === "fr" ? "Réduire la liste" : language === "ur" ? "فہرست سمیٹیں" : "Collapse list") : (language === "ar" ? "فتح القائمة" : language === "fr" ? "Ouvrir la liste" : language === "ur" ? "فہرست کھولیں" : "Open list")}
          </Button>
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
          className="rounded-3xl border-slate-200 bg-white sm:max-w-lg"
        >
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-black text-slate-900">
              تعديل باقة المطعم
            </DialogTitle>
            <DialogDescription>
              اختر الباقة التي ستصبح فعالة لهذا المطعم. التغيير يحفظ مباشرة في
              حساب المطعم.
            </DialogDescription>
          </DialogHeader>
          {planEditor && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">المطعم</p>
                <p className="mt-1 font-bold text-slate-900">
                  {planEditor.name}
                </p>
                <p className="mt-1 font-mono text-xs text-slate-400">
                  الباقة الحالية: {planEditor.currentPlan || "غير محددة"}
                </p>
              </div>
              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-700">
                  الباقة الجديدة
                </span>
                <select
                  value={planDraft}
                  onChange={event => setPlanDraft(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e76f3c]"
                >
                  {planOptionsForEditor.length === 0 ? (
                    <option value="">لا توجد باقات نشطة</option>
                  ) : (
                    planOptionsForEditor.map(plan => (
                      <option key={plan.id} value={plan.key}>
                        {plan.name} · {plan.monthlyPrice} SAR شهريًا
                      </option>
                    ))
                  )}
                </select>
              </label>
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
                    plan: selectedPlan.name,
                  });
              }}
              className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"
            >
              {updateRestaurant.isPending ? "جارٍ الحفظ..." : "حفظ الباقة"}
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
      {catalogOpen && (
        <div className="animate-[nfood-enter_180ms_ease-out]">
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
                  <button type="button" onClick={() => { setCatalogOpen(true); setActionsOpen(false); }} className="flex w-full items-center rounded-lg px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-orange-50 hover:text-[#c75325] dark:text-slate-200 dark:hover:bg-orange-500/10">{actionsCopy.openCatalog}</button>
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
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
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
                return (
                  <article
                    key={restaurant.id}
                    data-testid={`restaurant-card-${restaurant.id}`}
                    className="group flex min-h-[200px] min-w-0 flex-col rounded-[18px] border border-slate-200/90 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-300/70 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/60"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#e76f3c] ring-1 ring-orange-100 transition group-hover:bg-orange-100 dark:bg-orange-500/10 dark:ring-orange-500/20">
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

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                      <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-900/80">
                        <p className="text-slate-400">{ui.plan}</p>
                        <p className="mt-0.5 truncate font-bold text-slate-800 dark:text-slate-200">
                          {restaurant.plan ?? ui.unspecified}
                        </p>
                      </div>
                      <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-900/80">
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

                    <div className="mt-auto flex min-w-0 flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <a
                        href={`/menu/${encodeURIComponent(restaurant.slug ?? "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-7 max-w-full items-center gap-1 rounded-lg bg-[#e76f3c] px-2 text-[10px] font-black text-white shadow-sm transition hover:bg-[#d85f2e]"
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
                        className="h-7 max-w-full gap-1 rounded-lg border-slate-200 px-2 text-[10px] font-bold dark:border-slate-700"
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
                        className="h-7 max-w-full gap-1 rounded-lg bg-[#111c2e] px-2 text-[10px] font-bold text-white shadow-sm hover:bg-[#1b2a43]"
                      >
                        <LogIn className="h-3.5 w-3.5 shrink-0" /> {ui.login}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={resetPassword.isPending}
                        onClick={() => {
                          const password = window.prompt(
                            "أدخل كلمة المرور الجديدة (6 أحرف أو أرقام على الأقل):"
                          );
                          if (password && password.length >= 6)
                            resetPassword.mutate({
                              restaurantId: restaurant.id,
                              password,
                            });
                          else if (password)
                            toast.error(
                              "كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل"
                            );
                        }}
                        className="h-7 max-w-full gap-1 rounded-lg border-slate-200 px-2 text-[10px] font-bold dark:border-slate-700"
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
                        className="h-7 max-w-full cursor-not-allowed gap-1 rounded-lg border-slate-200 px-2 text-[10px] font-bold text-slate-400 opacity-70 dark:border-slate-700 dark:text-slate-500"
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
      )}

      <div data-testid="restaurant-governance-grid" className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <Card className="overflow-hidden rounded-[22px] border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-l from-cyan-50 via-white to-white p-3.5 dark:border-slate-800 dark:from-cyan-950/30 dark:via-slate-900 dark:to-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                  <CardTitle className="text-sm font-black md:text-base">
                    مميزات الباقات الفعلية
                  </CardTitle>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                    هذه البيانات تُقرأ مباشرة من packagePlans وpackagePlanFeatures وfeatureDefinitions.
                  </p>
              </div>
              <Badge variant="outline" className="rounded-lg">
                  {catalogLoading
                    ? "جارٍ التحميل"
                    : `${formatCatalogMoney(plans.length)} باقات · ${formatCatalogMoney(definitions.length)} ميزة`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {catalogError ? (
              <div className="m-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                تعذر تحميل كتالوج الباقات. Request ID: package-catalog{" "}
                <button
                  type="button"
                  onClick={() => {
                    void plansQuery.refetch();
                    void definitionsQuery.refetch();
                  }}
                  className="mr-2 font-bold underline"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : catalogLoading ? (
              <div className="space-y-2 p-4">
                <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
              </div>
            ) : plans.length === 0 ? (
              <div className="p-7 text-center">
                <p className="text-sm text-slate-600">
                  لا توجد باقات محفوظة حاليًا.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  استخدم محرر الباقات لإنشاء أول باقة وربط المميزات بها.
                </p>
              </div>
            ) : (
              plans.map((plan, index) => {
                const featureMap = new Map(
                  plan.features.map(feature => [feature.key, feature])
                );
                const enabledCount = plan.features.filter(
                  feature => feature.enabled
                ).length;
                const isExpanded = expandedPlan === plan.id;
                return (
                  <div
                    key={plan.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedPlan(isExpanded ? null : plan.id)
                      }
                      className="flex w-full items-center justify-between gap-3 p-3 text-right transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${index % 3 === 0 ? "bg-slate-400" : index % 3 === 1 ? "bg-sky-500" : "bg-violet-500"}`}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-black text-slate-800 dark:text-slate-100">
                            {plan.name}
                          </span>
                          <span className="mt-0.5 block truncate font-mono text-[10px] text-slate-400">
                            {plan.key} · {formatCatalogMoney(plan.monthlyPrice)} SAR/شهري · {formatCatalogMoney(enabledCount)} مفعّلة
                          </span>
                        </span>
                      </span>
                      <span className="flex items-center gap-2">
                        <Badge
                          className={`rounded-lg ${plan.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                        >
                          {plan.isActive ? "نشطة" : "متوقفة"}
                        </Badge>
                        <ChevronDown
                          className={`h-4 w-4 transition ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="grid gap-2 bg-slate-50/60 p-3 sm:grid-cols-2 dark:bg-slate-950/50">
                        {definitions.map(definition => {
                          const link = featureMap.get(definition.key);
                          const enabled = link?.enabled === true;
                          return (
                            <div
                              key={definition.id}
                              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs ${enabled ? "border-emerald-200 bg-emerald-50/70" : "border-slate-200 bg-white"}`}
                            >
                              <span
                                className={`flex min-w-0 items-center gap-2 font-semibold ${enabled ? "text-emerald-800" : "text-slate-400"}`}
                              >
                                {enabled ? (
                                  <Check className="h-3.5 w-3.5 shrink-0" />
                                ) : (
                                  <X className="h-3.5 w-3.5 shrink-0" />
                                )}
                                <span className="truncate">
                                  {definition.label}
                                </span>
                              </span>
                              <span className="shrink-0 font-mono text-[10px] text-slate-400">
                                {enabled &&
                                link?.featureLimit !== null &&
                                link?.featureLimit !== undefined
                                  ? `حد ${link.featureLimit}`
                                  : definition.isAddOn
                                    ? "إضافة"
                                    : "—"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-[22px] border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-l from-emerald-50 via-white to-white p-3.5 dark:border-slate-800 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900">
            <CardTitle className="text-sm font-black md:text-base">كتالوج المميزات المتاحة</CardTitle>
            <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
              المفاتيح الموجودة حاليًا في قاعدة البيانات، مع التبعيات والإضافات وأسعارها.
            </p>
          </CardHeader>
          <CardContent className="p-3.5">
            {catalogError ? (
              <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                تعذر تحميل تعريفات المميزات. Request ID: feature-definitions
              </p>
            ) : catalogLoading ? (
              <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
            ) : definitions.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                لا توجد مميزات معرفة بعد.
              </p>
            ) : (
              <div className="space-y-2">
                {visibleDefinitions.map(definition => (
                  <div
                    key={definition.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 transition hover:border-emerald-200 hover:bg-emerald-50/30 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-emerald-500/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-slate-800 dark:text-slate-100">
                          {definition.label}
                        </p>
                        <p className="mt-1 truncate font-mono text-[10px] text-slate-400">
                          {definition.key}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 rounded-lg">
                        {definition.isAddOn
                          ? `إضافة ${formatCatalogMoney(definition.addonPrice)} SAR`
                          : "ضمن الباقة"}
                      </Badge>
                    </div>
                    {definition.dependencyKey ? (
                      <p className="mt-2 text-[11px] text-slate-500">
                        يعتمد على:{" "}
                        <span className="font-mono">
                          {definition.dependencyKey}
                        </span>
                      </p>
                    ) : null}
                  </div>
                ))}
                {definitions.length > 8 && (
                  <button
                    type="button"
                    onClick={() => setShowAllFeatures(value => !value)}
                        className="mt-2 w-full rounded-xl border border-orange-200 px-3 py-2 text-[11px] font-black text-[#c65325] transition hover:bg-orange-50 dark:border-orange-500/30 dark:hover:bg-orange-500/10"
                  >
                    {showAllFeatures
                      ? "عرض المميزات الأساسية فقط"
                      : `عرض كل المميزات (${definitions.length})`}
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
