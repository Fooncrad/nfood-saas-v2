import { useMemo, useState } from "react";
import { CircleDollarSign, ExternalLink, Search, Store, UserRoundCheck, UserRoundX, MessageCircle, LogIn } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import AdminBusinessOnboarding from "@/components/AdminBusinessOnboarding";

type AdminStore = {
  id: string;
  customerName: string;
  email: string;
  countryCode: string;
  city: string | null;
  timezone: string;
  currencyCode: string;
  primaryLanguage: string;
  sector: string;
  sectorLabelAr: string;
  sectorLabelEn: string;
  sectorLabelFr: string;
  status: boolean;
  plan: string;
  taxId: string;
  licensingFee: string;
  createdAt: Date | string | number;
  updatedAt: Date | string | number;
  listings: number;
  coupons: number;
};

type StoreStatusFilter = "all" | "active" | "inactive";

const PLAN_TIERS = ["Basic", "Pro", "Enterprise"] as const;

const statusLabel: Record<StoreStatusFilter, string> = { all: "كل الحالات", active: "نشطة فقط", inactive: "معطلة فقط" };

function formatDate(value: AdminStore["createdAt"]) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-GB", { calendar: "gregory", numberingSystem: "latn", dateStyle: "medium" }).format(date);
}

export default function MarketplaceStoresView() {
  const storesQuery = trpc.marketplace.adminStores.useQuery(undefined, { retry: false });
  const utils = trpc.useUtils();
  const updateStore = trpc.marketplace.adminUpdateStore.useMutation({
    onSuccess: () => {
      void utils.marketplace.adminStores.invalidate();
      setSelected(null);
    },
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StoreStatusFilter>("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [selected, setSelected] = useState<AdminStore | null>(null);
  const [draft, setDraft] = useState({ customerName: "", plan: "Basic" as (typeof PLAN_TIERS)[number], taxId: "", licensingFee: "", status: true });

  const stores = (storesQuery.data ?? []) as AdminStore[];
  const sectors = useMemo(() => {
    const byKey = new Map<string, { key: string; label: string }>();
    for (const store of stores) if (!byKey.has(store.sector)) byKey.set(store.sector, { key: store.sector, label: store.sectorLabelAr || store.sector });
    return Array.from(byKey.values()).sort((a, b) => a.label.localeCompare(b.label, "ar"));
  }, [stores]);

  const stats = useMemo(() => ({
    total: stores.length,
    active: stores.filter((store) => store.status).length,
    inactive: stores.filter((store) => !store.status).length,
    listings: stores.reduce((sum, store) => sum + store.listings, 0),
  }), [stores]);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return stores
      .filter((store) => statusFilter === "all" || (statusFilter === "active" ? store.status : !store.status))
      .filter((store) => sectorFilter === "all" || store.sector === sectorFilter)
      .filter((store) => !query || `${store.customerName} ${store.email} ${store.id}`.toLowerCase().includes(query));
  }, [search, sectorFilter, statusFilter, stores]);

  const openEditor = (store: AdminStore) => {
    setSelected(store);
    setDraft({ customerName: store.customerName, plan: (PLAN_TIERS as readonly string[]).includes(store.plan) ? store.plan as (typeof PLAN_TIERS)[number] : "Basic", taxId: store.taxId, licensingFee: String(store.licensingFee ?? ""), status: store.status });
  };

  const save = () => {
    if (!selected) return;
    updateStore.mutate({ id: selected.id, customerName: draft.customerName.trim(), plan: draft.plan, taxId: draft.taxId.trim(), licensingFee: draft.licensingFee.trim(), status: draft.status });
  };

  const toggleStatus = (store: AdminStore) => updateStore.mutate({ id: store.id, status: !store.status });

  return (
    <section dir="rtl" className="space-y-5">
      <AdminBusinessOnboarding />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[#e76f3c]">سوق نفود · المنشآت</p>
          <h2 className="mt-2 text-2xl font-black">جميع المتاجر</h2>
          <p className="mt-2 text-sm text-slate-500">تحكم مركزي في منشآت السوق: التفعيل، الباقة، رسوم الترخيص، وبيانات التعريف.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[{ label: "إجمالي المتاجر", value: stats.total }, { label: "نشطة", value: stats.active }, { label: "معطلة", value: stats.inactive }, { label: "منتجات السوق", value: stats.listings }].map((stat) => (
            <div key={stat.label} className="min-w-24 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-center shadow-sm">
              <p className="text-[10px] font-bold text-slate-400">{stat.label}</p>
              <p className="mt-1 text-lg font-black text-slate-900">{stat.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
            </div>
          ))}
        </div>
      </div>

      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Store className="h-5 w-5 text-[#e76f3c]" />
              منشآت المنصة
            </CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالاسم أو البريد أو الرقم" className="rounded-xl pr-9" />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StoreStatusFilter)} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700">
              {(Object.keys(statusLabel) as StoreStatusFilter[]).map((value) => <option key={value} value={value}>{statusLabel[value]}</option>)}
            </select>
            <select value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700">
              <option value="all">كل القطاعات</option>
              {sectors.map((sector) => <option key={sector.key} value={sector.key}>{sector.label}</option>)}
            </select>
            <span className="inline-flex h-9 items-center rounded-xl bg-slate-50 px-3 text-xs font-bold text-slate-500">عرض {rows.length.toLocaleString("en-US", { maximumFractionDigits: 0 })} من {stores.length.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {storesQuery.isLoading ? (
            <div className="space-y-3">
              <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
            </div>
          ) : storesQuery.isError ? (
            <div className="rounded-xl bg-red-50 p-5 text-sm text-red-700">
              تعذر تحميل المتاجر. Request ID: marketplace-admin-stores
              <Button variant="outline" className="mr-3 rounded-lg" onClick={() => void storesQuery.refetch()}>إعادة المحاولة</Button>
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-10 text-center text-sm text-slate-500">لا توجد منشآت مطابقة للفلاتر الحالية.</div>
          ) : (
            <div className="space-y-3">
              {rows.map((store) => (
                <div key={store.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-orange-200 hover:bg-orange-50/30">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${store.status ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                      {store.status ? <UserRoundCheck className="h-5 w-5" /> : <UserRoundX className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{store.customerName}</p>
                      <p className="truncate text-xs text-slate-500" dir="ltr">{store.email}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-1 text-[10px] font-semibold text-slate-400">
                        <span dir="ltr">ID {store.id}</span>
                        <span>·</span>
                        <span>{store.sectorLabelAr || store.sector}</span>
                        <span>·</span>
                        <span>{store.countryCode} / {store.currencyCode}</span>
                        <span>·</span>
                        <span>{store.listings.toLocaleString("en-US", { maximumFractionDigits: 0 })} منتجات</span>
                        <span>·</span>
                        <span>{store.coupons.toLocaleString("en-US", { maximumFractionDigits: 0 })} كوبونات</span>
                        <span>·</span>
                        <span>أنشئ {formatDate(store.createdAt)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{store.plan}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600" title="رسوم الترخيص"><CircleDollarSign className="h-3.5 w-3.5 text-[#e76f3c]" />{String(store.licensingFee ?? "0.00")} ر.س</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${store.status ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>{store.status ? "نشط" : "معطل"}</span>
                    <a href={`/store/${store.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-orange-300 hover:text-[#e76f3c]" title="عرض المتجر العام"><ExternalLink className="h-4 w-4" /></a>
                    <button type="button" onClick={() => openEditor(store)} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-700 transition hover:bg-blue-100" title="الدخول لإدارة المتجر عند الحاجة"><LogIn className="h-4 w-4" />إدارة المتجر</button>
                    <a href={`/support?restaurant=${store.id}&subject=${encodeURIComponent("استعلام بخصوص "+store.customerName)}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100" title="فتح استعلام دعم"><MessageCircle className="h-4 w-4" />استعلام</a>
                    <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => openEditor(store)}>تعديل</Button>
                    <Button type="button" size="sm" className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]" onClick={() => toggleStatus(store)}>{store.status ? "تعطيل" : "تفعيل"}</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent dir="rtl" className="rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل المتجر</DialogTitle>
            <DialogDescription>تعديل مباشر من Admin لبيانات المنشأة التشغيلية والاشتراك. الدولة والعملة الحالية: {selected?.countryCode ?? "—"} / {selected?.currencyCode ?? "—"}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block text-sm font-semibold">
              اسم المنشأة
              <Input value={draft.customerName} onChange={(event) => setDraft({ ...draft, customerName: event.target.value })} className="mt-2 rounded-xl" />
            </label>
            <label className="block text-sm font-semibold">
              الباقة
              <select value={draft.plan} onChange={(event) => setDraft({ ...draft, plan: event.target.value as (typeof PLAN_TIERS)[number] })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
                {PLAN_TIERS.map((plan) => <option key={plan} value={plan}>{plan}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              السجل الضريبي
              <Input value={draft.taxId} onChange={(event) => setDraft({ ...draft, taxId: event.target.value })} dir="ltr" className="mt-2 rounded-xl" />
            </label>
            <label className="block text-sm font-semibold">
              رسوم الترخيص (ر.س)
              <Input value={draft.licensingFee} onChange={(event) => setDraft({ ...draft, licensingFee: event.target.value })} dir="ltr" placeholder="0.00" className="mt-2 rounded-xl" />
            </label>
            <label className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm font-semibold">
              المتجر مفعّل
              <input type="checkbox" checked={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.checked })} className="h-4 w-4 accent-[#e76f3c]" />
            </label>
            {updateStore.isError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{updateStore.error.message}</p>}
            <Button disabled={updateStore.isPending || draft.customerName.trim().length < 2} onClick={save} className="w-full rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]">
              {updateStore.isPending ? "جارٍ الحفظ..." : "حفظ التعديلات"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}