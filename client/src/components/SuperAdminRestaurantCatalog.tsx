import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  KeyRound,
  LogIn,
  MoreHorizontal,
  Plus,
  Power,
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
import { CreateRestaurantDialog } from "@/components/CreateRestaurantDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { filterRestaurantRows } from "@/lib/restaurantCatalog";

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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("الكل");
  const [createOpen, setCreateOpen] = useState(false);
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
  const deleteRestaurant = trpc.admin.deleteRestaurant.useMutation({
    onSuccess: () => {
      void utils.admin.restaurants.invalidate();
      toast.success("تم حذف المطعم بأمان");
    },
    onError: error => toast.error(`تعذر حذف المطعم: ${error.message}`),
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

  return (
    <div dir="rtl" className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[#e76f3c]">مركز المطاعم</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">
            قائمة المطاعم
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            إدارة المطاعم المسجلة، الباقات، الحالة، والروابط العامة من شاشة
            واحدة.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 rounded-xl bg-[#e76f3c] shadow-sm hover:bg-[#d85f2e]"
        >
          <Plus className="h-4 w-4" /> إضافة مطعم جديد
        </Button>
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
                        {plan.name} · {plan.monthlyPrice} ر.س شهريًا
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
      <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="ابحث باسم المطعم أو المعرّف أو الباقة"
                className="h-11 rounded-xl pr-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["الكل", "نشط", "تجربة", "معلّق"] as Filter[]).map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition ${filter === item ? "bg-[#e76f3c] text-white" : "bg-slate-100 text-slate-500 hover:bg-orange-50 hover:text-[#e76f3c]"}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <select
              aria-label="تصفية حسب الباقة"
              value={planFilter}
              onChange={event => setPlanFilter(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 outline-none focus:border-[#e76f3c]"
            >
              <option value="الكل">كل الباقات</option>
              {planOptions.slice(1).map(plan => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
            <Button variant="outline" className="gap-2 rounded-xl">
              <MoreHorizontal className="h-4 w-4" /> إجراءات
            </Button>
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
              تعذر تحميل القائمة. Request ID: admin-restaurants{" "}
              <button
                type="button"
                onClick={() => void restaurantsQuery.refetch()}
                className="mr-2 font-bold underline"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-10 text-center text-sm text-slate-500">
              لا توجد مطاعم مطابقة للبحث الحالي.
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
                return (
                  <article
                    key={restaurant.id}
                    className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md sm:p-4"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#e76f3c]">
                          <Store className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-800">
                            {restaurant.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            حساب #{restaurant.id} ·{" "}
                            {restaurant.branchCount ?? 0} فروع
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 rounded-lg text-[10px] ${statusClass}`}
                      >
                        {status}
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="min-w-0 rounded-xl bg-slate-50 px-2.5 py-2">
                        <p className="text-slate-400">الباقة</p>
                        <p className="mt-0.5 truncate font-bold text-slate-700">
                          {restaurant.plan ?? "غير محددة"}
                        </p>
                      </div>
                      <div className="min-w-0 rounded-xl bg-slate-50 px-2.5 py-2">
                        <p className="text-slate-400">الرابط العام</p>
                        <a
                          href={`/menu/${encodeURIComponent(restaurant.slug ?? "")}`}
                          target="_blank"
                          rel="noreferrer"
                          dir="ltr"
                          className="mt-0.5 block truncate font-mono font-bold text-sky-700 hover:underline"
                        >
                          /{restaurant.slug}
                        </a>
                      </div>
                    </div>

                    <div className="mt-3 flex min-w-0 flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
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
                        className="h-8 max-w-full gap-1 rounded-lg px-2 text-[11px]"
                      >
                        <Eye className="h-3.5 w-3.5 shrink-0" /> التفاصيل
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={enterRestaurant.isPending}
                        onClick={() =>
                          enterRestaurant.mutate({ id: restaurant.id })
                        }
                        className="h-8 max-w-full gap-1 rounded-lg bg-[#111c2e] px-2 text-[11px] text-white hover:bg-[#1b2a43]"
                      >
                        <LogIn className="h-3.5 w-3.5 shrink-0" /> دخول المطعم
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={updateRestaurant.isPending}
                        onClick={() =>
                          updateRestaurant.mutate({
                            id: restaurant.id,
                            status:
                              restaurant.status === "active"
                                ? "trial"
                                : "active",
                          })
                        }
                        className="h-8 max-w-full gap-1 rounded-lg px-2 text-[11px]"
                      >
                        <Power className="h-3.5 w-3.5 shrink-0" />
                        {restaurant.status === "active"
                          ? "إيقاف مؤقت"
                          : "تفعيل المطعم"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const matchingPlan = planOptionsForEditor.find(
                            plan =>
                              plan.key === restaurant.plan ||
                              plan.name === restaurant.plan
                          );
                          setPlanEditor({
                            id: restaurant.id,
                            name: restaurant.name,
                            currentPlan: restaurant.plan ?? "",
                          });
                          setPlanDraft(
                            matchingPlan?.key ??
                              planOptionsForEditor[0]?.key ??
                              ""
                          );
                        }}
                        className="h-8 max-w-full gap-1 rounded-lg px-2 text-[11px]"
                      >
                        <Edit3 className="h-3.5 w-3.5 shrink-0" /> تعديل الباقة
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
                        className="h-8 max-w-full gap-1 rounded-lg px-2 text-[11px]"
                      >
                        <KeyRound className="h-3.5 w-3.5 shrink-0" /> إعادة
                        تعيين كلمة المرور
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (
                            window.confirm(
                              "سيتم حذف المطعم بأمان مع الحفاظ على السجل؟"
                            )
                          )
                            deleteRestaurant.mutate({ id: restaurant.id });
                        }}
                        className="h-8 max-w-full gap-1 rounded-lg px-2 text-[11px] text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5 shrink-0" /> حذف
                      </Button>
                    </div>

                    <a
                      href={`/menu/${encodeURIComponent(restaurant.slug ?? "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex max-w-full items-center gap-1 text-[11px] font-bold text-[#e76f3c] hover:underline"
                    >
                      <Utensils className="h-3.5 w-3.5 shrink-0" /> فتح Menu
                      للعميل
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                    <span className="sr-only">الترتيب {index + 1}</span>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-l from-cyan-50 via-white to-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">
                  مميزات الباقات الفعلية
                </CardTitle>
                <p className="mt-1 text-xs text-slate-500">
                  هذه البيانات تُقرأ مباشرة من packagePlans وpackagePlanFeatures
                  وfeatureDefinitions.
                </p>
              </div>
              <Badge variant="outline" className="rounded-lg">
                {catalogLoading
                  ? "جارٍ التحميل"
                  : `${plans.length} باقات · ${definitions.length} ميزة`}
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
                      className="flex w-full items-center justify-between gap-3 p-4 text-right hover:bg-slate-50"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${index % 3 === 0 ? "bg-slate-400" : index % 3 === 1 ? "bg-sky-500" : "bg-violet-500"}`}
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-slate-800">
                            {plan.name}
                          </span>
                          <span className="mt-0.5 block truncate font-mono text-[10px] text-slate-400">
                            {plan.key} · {plan.monthlyPrice} ر.س/شهري ·{" "}
                            {enabledCount} مفعّلة
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
                      <div className="grid gap-2 bg-slate-50/60 p-4 sm:grid-cols-2">
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
        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-l from-emerald-50 via-white to-white p-4">
            <CardTitle className="text-base">كتالوج المميزات المتاحة</CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              المفاتيح الموجودة حاليًا في قاعدة البيانات، مع التبعيات والإضافات
              وأسعارها.
            </p>
          </CardHeader>
          <CardContent className="p-4">
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
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {definition.label}
                        </p>
                        <p className="mt-1 truncate font-mono text-[10px] text-slate-400">
                          {definition.key}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 rounded-lg">
                        {definition.isAddOn
                          ? `إضافة ${definition.addonPrice ?? "0"} ر.س`
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
                    className="mt-2 w-full rounded-xl border border-orange-200 px-3 py-2 text-xs font-bold text-[#c65325] transition hover:bg-orange-50"
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
