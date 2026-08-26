import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Eye,
  FileImage,
  HardDrive,
  Languages,
  LayoutDashboard,
  ReceiptText,
  Megaphone,
  MonitorPlay,
  Package,
  Printer,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Table2,
  TrendingDown,
  Truck,
  UploadCloud,
  Users,
  Utensils,
  WalletCards,
  Wifi,
  WifiOff,
  Zap,
  ArrowDownAZ,
  SlidersHorizontal,
  AlertTriangle,
} from "lucide-react";
import Barcode from "react-barcode";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { defaultMenuDisplaySettings, normalizeMenuDisplaySettings, type MenuDisplayToolKey, type MenuGridColumns } from "@shared/menuDisplaySettings";
import { trpc } from "@/lib/trpc";
import { publicMenuUrl } from "@/lib/publicMenuUrl";
import { validateRemoteTaskDraft } from "@/lib/remoteTaskValidation";
import { getVisibleTables, hasRecentAutoCancellation, type TableFilter, type TableSort } from "@/lib/tableViewModel";
import {
  enqueueOfflineItem,
  readOfflineQueue,
  writeOfflineQueue,
} from "@/lib/offlineQueue";
import {
  enqueueAdminOfflineOperation,
  readAdminOfflineQueue,
  replayAdminOfflineQueue,
  type AdminOfflineOperation,
} from "@/lib/adminOfflineSync";
import {
  buildMenuTranslations,
  primaryMenuTranslation,
  readLocalizedDraft,
  type LocalizedDraft,
  type MenuLanguage,
} from "@/lib/menuLanguageDraft";
import { getMissingTranslationTasks } from "@/lib/menuBulkTranslation";
import { detectMenuSourceLanguage } from "@/lib/translationSource";
import { useLanguage } from "@/contexts/LanguageContext";
import { MenuAddonsPanel } from "@/components/MenuAddonsPanel";
import { TranslationGlossaryPanel } from "@/components/TranslationGlossaryPanel";
import { TranslationReviewPanel } from "@/components/TranslationReviewPanel";
import AccountManagementPanel from "@/components/AccountManagementPanel";
import { RestaurantTeamAccountsPanel } from "@/components/RestaurantTeamAccountsPanel";
import { RestaurantCustomersPanel } from "@/components/RestaurantCustomersPanel";
import { RestaurantAccessControlPanel } from "@/components/RestaurantAccessControlPanel";
import { MediaLibraryPanel } from "@/components/MediaLibraryPanel";
import { ContentOrdersPanel } from "@/components/ContentOrdersPanel";
import { MenuImportReviewPanel } from "@/components/MenuImportReviewPanel";
import { ReservationsView } from "@/pages/ReservationsView";
import { PlatformSettingsPanel } from "@/components/PlatformSettingsPanel";
import { ActivityAnalyticsPanel } from "@/components/ActivityAnalyticsPanel";
import { CreateRestaurantDialog } from "@/components/CreateRestaurantDialog";
import { LoyaltyPanel } from "@/components/LoyaltyPanel";
import { ReviewsPanel } from "@/components/ReviewsPanel";
import { DriverDeliveryView } from "@/components/DriverDeliveryView";
import { CompactOrdersBoard } from "@/components/CompactOrdersBoard";
import { OperationalModuleShell } from "@/components/OperationalModuleShell";
import { CompactModuleSummary } from "@/components/CompactModuleSummary";
import SubscriptionReceiptsAdminPage from "@/pages/SubscriptionReceiptsAdminPage";
import { KitchenPrinterSettings } from "@/components/KitchenPrinterSettings";
import { RestaurantPricingSettings } from "@/components/RestaurantPricingSettings";
import { RestaurantIntegrationSettings } from "@/components/RestaurantIntegrationSettings";
import { CustomerRewardsWalletPanel } from "@/components/CustomerRewardsWalletPanel";
import { ReceiptCustomizationPanel } from "@/components/ReceiptCustomizationPanel";
import { BrandingFeatureMatrix } from "@/components/BrandingFeatureMatrix";
import { BrandingEditorPanel } from "@/components/BrandingEditorPanel";
import { ReceiptDeliveryPanel } from "@/components/ReceiptDeliveryPanel";
import { EmailTemplatesPanel } from "@/components/EmailTemplatesPanel";
import { KitchenTicketBoard } from "@/components/KitchenTicketBoard";
import { KdsOperationsBoard } from "@/components/KdsOperationsBoard";
import { KitchenPerformancePanel } from "@/components/KitchenPerformancePanel";
import { OrderRealtimeAlerts } from "@/components/OrderRealtimeAlerts";
import { RestaurantDisplayMarketingPanel } from "@/components/RestaurantDisplayMarketingPanel";
import { RestaurantMenuInsightsPanel } from "@/components/RestaurantMenuInsightsPanel";
import { MediaTemplateStudio } from "@/components/MediaTemplateStudio";
import { DeliveryOperationsPanel } from "@/components/DeliveryOperationsPanel";
import { ReservationSchedulePanel } from "@/components/ReservationSchedulePanel";
import { ReservationPolicyPanel } from "@/components/ReservationPolicyPanel";
import { QROperationsPanel } from "@/components/QROperationsPanel";
import {
  RemoteTaskDialog,
  type RemoteTaskDraft,
} from "@/components/RemoteTaskDialog";
import CustomerProfileSettings from "@/pages/CustomerProfileSettings";
import VcardAccountBinding from "@/pages/VcardAccountBinding";
import ContentMarketplace from "@/pages/ContentMarketplace";
import CustomerContentLibrary from "@/pages/CustomerContentLibrary";
import {
  navItems,
  navTranslationKeys,
  type NavKey,
  type Order,
  type OrderStatus,
} from "@/components/homeNavigation";
import { actionPalette, getOrderStatusPalette } from "@/lib/statusPalette";
import {
  calculateCartCents,
  formatCents,
  parsePriceToCents,
} from "@/lib/posPricing";
import { printReceipt as printBrandedReceipt } from "@/lib/receiptPrint";
import { formatPaymentCents, getPaymentSplitRemainingCents, hasExactPaymentSplit, normalizePaymentSplits, type PosPaymentMethod } from "@/lib/posPaymentModel";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function money(value: number) {
  return `${value.toLocaleString("ar-SA-u-ca-gregory-nu-latn")} SAR`;
}
function escapePrintText(value: string) {
  return value.replace(
    /[&<>"']/g,
    character =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character
  );
}
function printThermalReceipt(
  receipt: {
    orderId: number;
    items: Array<{ name: string; quantity: number; unitPrice: number }>;
    pricing: {
      subtotal: string;
      discountPercent: number;
      discountAmount: string;
      taxPercent: number;
      taxAmount: string;
      total: string;
      couponCode?: string | null;
    };
  },
  template: "thermal" | "detailed"
) {
  const popup = window.open(
    "",
    "nfood-thermal-receipt",
    "width=420,height=720"
  );
  if (!popup) {
    window.print();
    return;
  }
  const items = receipt.items
    .map(
      item =>
        `<div class=\"row\"><span>${escapePrintText(item.name)} × ${item.quantity}</span><strong>${money(item.unitPrice * item.quantity)}</strong></div>`
    )
    .join("");
  const extra =
    template === "detailed"
      ? `<div class=\"row muted\"><span>نسبة الخصم</span><span>${receipt.pricing.discountPercent}%${receipt.pricing.couponCode ? ` · ${escapePrintText(receipt.pricing.couponCode)}` : ""}</span></div><div class=\"row muted\"><span>نسبة الضريبة</span><span>${receipt.pricing.taxPercent}%</span></div>`
      : "";
  popup.document.write(
    `<html dir=\"rtl\"><head><title>إيصال #${receipt.orderId}</title><style>body{font-family:Arial,sans-serif;width:80mm;margin:0 auto;padding:8px;color:#111;font-size:12px}.title{text-align:center;font-size:17px;font-weight:800;margin-bottom:12px}.row{display:flex;justify-content:space-between;gap:8px;border-bottom:1px dashed #bbb;padding:7px 0}.muted{color:#666}.total{font-size:16px;font-weight:800;border-top:2px solid #111;margin-top:8px}.small{text-align:center;color:#666;margin-top:14px;font-size:10px}@media print{body{width:80mm}}</style></head><body><div class=\"title\">NFOOD · إيصال الطلب #${receipt.orderId}</div>${items}<div class=\"row muted\"><span>قبل الخصم</span><span>${escapePrintText(money(Number(receipt.pricing.subtotal)))}</span></div><div class=\"row muted\"><span>الخصم</span><span>- ${escapePrintText(money(Number(receipt.pricing.discountAmount)))}</span></div>${extra}<div class=\"row total\"><span>الإجمالي</span><span>${escapePrintText(money(Number(receipt.pricing.total)))}</span></div><div class=\"small\">شكرًا لزيارتكم</div><script>window.onload=()=>{window.focus();window.print();}</script></body></html>`
  );
  popup.document.close();
}

function RestaurantMarketingCenter({
  restaurantId,
  branchId,
}: {
  restaurantId: number;
  branchId?: number;
}) {
  const [section, setSection] = useState<
    "overview" | "studio" | "campaigns" | "screens" | "orders"
  >("overview");
  const tabs = [
    { id: "overview", label: "نظرة عامة", icon: Eye },
    { id: "studio", label: "استوديو المحتوى", icon: Sparkles },
    { id: "orders", label: "طلبات المحتوى", icon: ReceiptText },
    { id: "campaigns", label: "الحملات والكوبونات", icon: Megaphone },
    { id: "screens", label: "شاشات العرض", icon: MonitorPlay },
  ] as const;
  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-2">
          <div
            className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5"
            role="tablist"
            aria-label="مركز التسويق والشاشات"
          >
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={section === id}
                onClick={() => setSection(id)}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-black transition ${section === id ? "bg-[#111c2e] text-white shadow-sm" : "text-slate-500 hover:bg-orange-50 hover:text-[#e76f3c]"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      {section === "overview" && (
        <div className="space-y-6">
          <RestaurantMenuInsightsPanel restaurantId={restaurantId} />
          <Card className="rounded-3xl border-orange-100 bg-orange-50/60 shadow-sm">
            <CardContent className="grid gap-3 p-5 md:grid-cols-3">
              <div>
                <p className="text-xs font-black text-orange-900">مركز موحد</p>
                <p className="mt-1 text-sm leading-6 text-orange-800">
                  انتقل من هذه التبويبات إلى المحتوى أو الحملات أو الشاشات دون
                  تكرار البطاقات في الصفحة.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSection("studio")}
                className="rounded-2xl bg-white px-4 py-3 text-xs font-black text-[#111c2e] shadow-sm"
              >
                فتح استوديو المحتوى
              </button>
              <button
                type="button"
                onClick={() => setSection("screens")}
                className="rounded-2xl bg-[#e76f3c] px-4 py-3 text-xs font-black text-white shadow-sm"
              >
                إدارة الشاشات
              </button>
            </CardContent>
          </Card>
        </div>
      )}
      {section === "studio" && <MediaTemplateStudio />}
      {section === "orders" && (
        <ContentOrdersPanel restaurantId={restaurantId} />
      )}
      {section === "campaigns" && (
        <div className="space-y-6">
          <MarketingView restaurantId={restaurantId} />
        </div>
      )}
      {section === "screens" && (
        <RestaurantDisplayMarketingPanel
          restaurantId={restaurantId}
          branchId={branchId}
        />
      )}
    </div>
  );
}

export function ModuleView({
  active,
  orders,
  advanceOrder,
  orderUpdatePending,
  setActive,
  restaurantId,
  branchId,
  ordersLoading,
  ordersError,
  role,
}: {
  active: NavKey;
  orders: Order[];
  advanceOrder: (id: string) => void;
  orderUpdatePending: boolean;
  setActive: (key: NavKey) => void;
  restaurantId: number;
  branchId?: number;
  ordersLoading: boolean;
  ordersError: boolean;
  role?: string;
}) {
  const kdsOrdersByStatus = useMemo(
    () =>
      (["new", "preparing", "ready", "completed"] as OrderStatus[]).reduce<
        Record<OrderStatus, Order[]>
      >(
        (groups, status) => {
          groups[status] = orders.filter(order => order.status === status);
          return groups;
        },
        { new: [], preparing: [], ready: [], completed: [] }
      ),
    [orders]
  );
  const labels: Record<
    NavKey,
    { title: string; description: string; icon: typeof LayoutDashboard }
  > = {
    overview: { title: "نظرة عامة", description: "", icon: LayoutDashboard },
    admin: {
      title: "Super Admin",
      description: "إدارة المطاعم والعملاء والاشتراكات والصلاحيات.",
      icon: ShieldCheck,
    },
    accounts: {
      title: "مركز الحسابات",
      description: "إدارة الدخول والحالة وبيانات جميع أدوار النظام.",
      icon: Users,
    },
    settings: {
      title: "الإعدادات العامة",
      description: "الهوية والملف العام والسياسات وروابط التواصل والإعدادات المتاحة لدورك.",
      icon: Settings2,
    },
    operations: {
      title: "مركز تشغيل المطعم",
      description: "الطاولات والحجوزات والفتحات وواجهة المنيو والقوالب في مركز واحد.",
      icon: Clock3,
    },
    files: {
      title: "مكتبة الملفات",
      description: "رفع وتنظيم صور المنيو وملفات المطعم ضمن مساحة معزولة.",
      icon: HardDrive,
    },
    trend: {
      title: "Trend Kitchen · سوق نفود",
      description: "عروض المحتوى والوصفات والاتجاهات الغذائية في سوق عام موثوق.",
      icon: Sparkles,
    },
    branches: {
      title: "الفروع والإعدادات",
      description: "إدارة الفروع وساعات العمل وإعداداتها التشغيلية.",
      icon: Store,
    },
    orders: {
      title: "إدارة الطلبات",
      description: "تابع الطلبات وحدّث مراحلها من شاشة واحدة.",
      icon: ShoppingBag,
    },
    pos: {
      title: "نقطة البيع POS",
      description: "أنشئ طلباً جديداً بسرعة واربطه بالفرع والطاولة.",
      icon: WalletCards,
    },
    printers: {
      title: "إعداد الطابعات",
      description: "اربط أقسام المنيو بالطابعات وحدد توجيه تذاكر الطلبات.",
      icon: Printer,
    },
    kds: {
      title: "شاشة المطبخ KDS",
      description: "تنظيم الطلبات الواردة ومتابعة زمن التحضير لحظياً.",
      icon: ChefHat,
    },
    menu: {
      title: "المنيو والأصناف",
      description: "إدارة التصنيفات والأصناف والأسعار والتوفر.",
      icon: Utensils,
    },
    tables: {
      title: "الطاولات",
      description: "عرض إشغال الطاولات وربطها بالطلبات الحالية.",
      icon: Table2,
    },
    qr: {
      title: "تخصيص QR والباركود",
      description: "أنشئ رموزًا ثابتة للطاولات والطلبات واستدعاء النادل.",
      icon: QrCode,
    },
    inventory: {
      title: "المخزون والمشتريات",
      description: "متابعة المواد الخام والتنبيهات وتسجيل المشتريات.",
      icon: Package,
    },
    team: {
      title: "الموظفون والحضور",
      description: "إدارة الفريق والأدوار وسجل الحضور.",
      icon: Users,
    },
    marketing: {
      title: "التسويق والحملات",
      description: "العروض والكوبونات والحملات في مكان واحد.",
      icon: Megaphone,
    },
    reservations: {
      title: "الحجوزات وقائمة الانتظار",
      description: "إدارة مواعيد الضيوف وحالات الوصول من مساحة المطعم.",
      icon: Clock3,
    },
    remote: {
      title: "التوظيف عن بُعد",
      description: "أنشئ مهامًا مدفوعة وتواصل مع الموظفين من مكان واحد.",
      icon: Users,
    },
    security: {
      title: "أمان الحساب والجلسات",
      description: "أدر الأجهزة والجلسات والتحقق بخطوتين.",
      icon: ShieldCheck,
    },
    health: {
      title: "صحة النظام",
      description: "راقب حالة API وقاعدة البيانات والخدمات الأساسية.",
      icon: Activity,
    },
  };
  const info = labels[active];
  const Icon = info.icon;
  const station = role === "bar" ? "bar" : role === "kitchen" ? "kitchen" : undefined;
  if (role === "customer" && active === "overview")
    return (
      <OperationalModuleShell title="مساحة العميل">
        <CustomerRewardsWalletPanel />
      </OperationalModuleShell>
    );
  if (active === "orders" && role === "driver")
    return (
      <OperationalModuleShell title="مركز السائق والتوصيل">
        <DriverDeliveryView restaurantId={restaurantId} />
      </OperationalModuleShell>
    );
  if (active === "orders")
    return (
      <OperationalModuleShell title="إدارة الطلبات">
        <CompactOrdersBoard
          orders={orders}
          advanceOrder={advanceOrder}
          orderUpdatePending={orderUpdatePending}
          ordersLoading={ordersLoading}
          ordersError={ordersError}
          restaurantId={restaurantId}
        />
      </OperationalModuleShell>
    );
  if (active === "kds")
    return (
          <OperationalModuleShell compact title={station === "bar" ? "محطة البار" : station === "kitchen" ? "محطة المطبخ" : info.title}>
        <div className="min-h-0 flex-1">
          <KdsOperationsBoard
            key={restaurantId}
            restaurantId={restaurantId}
            orders={orders}
            advanceOrder={advanceOrder}
            orderUpdatePending={orderUpdatePending}
            station={station}
          />
          <OrderRealtimeAlerts orders={orders} mode="kds" />
        </div>
      </OperationalModuleShell>
    );
  if (active === "pos")
    return (
      <OperationalModuleShell title="نقطة البيع POS">
        <div className="space-y-5">
          <OrderRealtimeAlerts orders={orders} mode="pos" />
          <PosView restaurantId={restaurantId} />
        </div>
      </OperationalModuleShell>
    );
  if (active === "printers")
    return (
      <OperationalModuleShell title="إعداد الطابعات">
        <KitchenPrinterSettings restaurantId={restaurantId} />
      </OperationalModuleShell>
    );
  if (active === "menu") return <MenuView restaurantId={restaurantId} />;
  if (active === "tables")
    return (
      <OperationalModuleShell title="الطاولات">
        <TablesView restaurantId={restaurantId} branchId={branchId} />
      </OperationalModuleShell>
    );
  if (active === "qr")
    return (
      <OperationalModuleShell title="QR المنيو والرموز التشغيلية">
        <QROperationsPanel restaurantId={restaurantId} branchId={branchId} />
      </OperationalModuleShell>
    );
  if (active === "inventory")
    return (
      <OperationalModuleShell title="المخزون والمشتريات">
        <InventoryView restaurantId={restaurantId} />
      </OperationalModuleShell>
    );
  if (active === "team")
    return (
      <div className="space-y-4">
        <TeamView restaurantId={restaurantId} />
        <RestaurantTeamAccountsPanel restaurantId={restaurantId} />
        <RestaurantCustomersPanel restaurantId={restaurantId} />
        <RestaurantAccessControlPanel restaurantId={restaurantId} />
      </div>
    );
  if (active === "marketing")
    return (
      <RestaurantMarketingCenter
        restaurantId={restaurantId}
        branchId={branchId}
      />
    );
  if (active === "reservations")
    return (
      <OperationalModuleShell title="الحجوزات والأوقات">
        <RestaurantOperationsHub restaurantId={restaurantId} branchId={branchId} defaultTab="reservations" />
      </OperationalModuleShell>
    );
  if (active === "operations")
    return (
      <OperationalModuleShell title="مركز تشغيل المطعم">
        <RestaurantOperationsHub restaurantId={restaurantId} branchId={branchId} />
      </OperationalModuleShell>
    );
  if (active === "admin") return <SubscriptionReceiptsAdminPage />;
  if (active === "settings")
    return role === "admin" ? (
      <PlatformSettingsPanel />
    ) : (
      <RestaurantSettingsHub restaurantId={restaurantId} />
    );
  if (active === "accounts") return <AccountManagementPanel />;
  if (active === "trend") return <ContentMarketplace />;
  if (active === "files")
    return (
      <div className="space-y-4">
        <MediaLibraryPanel
          isCentralAdmin={role === "admin"}
          restaurantId={restaurantId}
        />
        {role !== "admin" && <CustomerContentLibrary />}
      </div>
    );
  if (active === "branches")
    return (
      <OperationalModuleShell title="الفروع والإعدادات">
        <div className="space-y-5">
          <BranchesView restaurantId={restaurantId} />
        </div>
      </OperationalModuleShell>
    );
  if (active === "remote")
    return <RemoteWorkView restaurantId={restaurantId} />;
  if (active === "security")
    return <SecurityView restaurantId={restaurantId} />;
  if (active === "health") return <SystemHealthView />;
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#e76f3c]">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{info.title}</h2>
          <p className="text-sm text-slate-500">{info.description}</p>
        </div>
      </div>
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="flex min-h-[380px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-[#e76f3c]">
            <Icon className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold">وحدة {info.title}</h3>
          <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
            تم تجهيز مساحة العمل لهذه الوحدة ضمن النظام الموحد. ستظهر هنا أدوات
            الإدارة والتقارير والعمليات المرتبطة بالفرع المختار.
          </p>
          <Button
            onClick={() => {
              setActive("overview");
              toast.success("تم الرجوع إلى لوحة النظرة العامة");
            }}
            className="mt-6 rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"
          >
            العودة للوحة الرئيسية
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

type MenuProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  tags: string[];
  available: boolean;
  imageUrl?: string | null;
};
function parseMenuTags(raw?: string | null) {
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    return Array.from(
      new Set(
        Array.isArray(parsed)
          ? parsed
              .filter((tag): tag is string => typeof tag === "string")
              .map(tag => tag.trim())
              .filter(Boolean)
          : []
      )
    ).slice(0, 12);
  } catch {
    return [];
  }
}
const menuLanguageLabels: Record<
  MenuLanguage,
  { native: string; label: string; placeholder: string }
> = {
  ar: { native: "العربية", label: "Arabic", placeholder: "مثال: برجر كلاسيك" },
  en: {
    native: "English",
    label: "English",
    placeholder: "Example: Classic Burger",
  },
  fr: {
    native: "Français",
    label: "French",
    placeholder: "Exemple : Burger classique",
  },
};
const emptyLocalizedField = { name: "", description: "" };

function MenuImportPanel({ restaurantId }: { restaurantId: number }) {
  const [draft, setDraft] = useState<{
    categories: Array<{
      name: string;
      confidence: number;
      needsReview: boolean;
    }>;
    items: Array<{
      categoryName: string;
      name: string;
      description: string;
      price: number;
      compareAtPrice: number;
      confidence: number;
      needsReview: boolean;
    }>;
  } | null>(null);
  const [fileName, setFileName] = useState("");
  const importDraft = trpc.platform.importMenuDraft.useMutation({
    onSuccess: result => {
      setDraft(result.draft as typeof draft);
      toast.success("تم استخراج مسودة المنيو؛ راجع الأسعار قبل الاعتماد");
    },
    onError: error => toast.error(`تعذر قراءة المنيو: ${error.message}`),
  });
  const readFile = (file: File) => {
    if (file.size > 6 * 1024 * 1024) {
      toast.error("حجم الملف يجب ألا يتجاوز 6 ميجابايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      setFileName(file.name);
      importDraft.mutate({
        restaurantId,
        fileName: file.name,
        mimeType: file.type as
          | "application/pdf"
          | "image/png"
          | "image/jpeg"
          | "image/webp",
        fileBase64: value,
      });
    };
    reader.readAsDataURL(file);
  };
  const exportDraft = () => {
    if (!draft) return;
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nfood-menu-draft-${restaurantId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("تم تنزيل مسودة المنيو");
  };
  const reviewCount = draft
    ? draft.categories.filter(item => item.needsReview).length +
      draft.items.filter(item => item.needsReview).length
    : 0;
  return (
    <Card className="mb-5 overflow-hidden rounded-[28px] border-orange-200 bg-gradient-to-l from-orange-50 via-white to-violet-50 shadow-sm">
      <CardHeader className="border-b border-orange-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-black text-[#111c2e]">
              <Sparkles className="h-5 w-5 text-orange-500" /> استيراد المنيو
              خلال دقائق
            </CardTitle>
            <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-600">
              ارفع PDF أو صورة واضحة للمنيو الورقي. سيستخرج النظام الفئات
              والأصناف والأسعار كمسودة، ولن ينشر أي عنصر قبل مراجعتك واعتماده.
            </p>
          </div>
          <Badge className="bg-[#111c2e] text-white">
            PDF · PNG · JPG · WEBP
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-200 bg-white/80 text-center transition hover:border-orange-400 hover:bg-white">
          <input
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={event => {
              const file = event.target.files?.[0];
              if (file) readFile(file);
              event.currentTarget.value = "";
            }}
          />
          <UploadCloud className="mb-2 h-7 w-7 text-orange-500" />
          <span className="text-sm font-black text-slate-800">
            {importDraft.isPending
              ? "جارٍ تحليل المنيو..."
              : fileName || "اسحب الملف هنا أو اضغط لاختياره"}
          </span>
          <span className="mt-1 text-[11px] text-slate-500">
            يفضل PDF نصي أو صورة عالية الدقة، والحد الأقصى 6MB
          </span>
        </label>
        {draft && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-black text-emerald-900">
                مسودة جاهزة للمراجعة: {draft.categories.length} فئات و
                {draft.items.length} أصناف
              </p>
              <div className="flex gap-2">
                <Badge
                  className={
                    reviewCount
                      ? "bg-amber-500 text-white"
                      : "bg-emerald-600 text-white"
                  }
                >
                  {reviewCount ? `${reviewCount} تحتاج مراجعة` : "قراءة واضحة"}
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={exportDraft}
                  className="rounded-xl text-xs"
                >
                  تنزيل JSON
                </Button>
              </div>
            </div>
            <div className="mt-3 max-h-52 overflow-auto rounded-xl bg-white/80 p-3 text-xs">
              <div className="grid gap-2 sm:grid-cols-2">
                {draft.items.slice(0, 20).map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="rounded-xl border border-slate-100 p-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-slate-800">
                        {item.name}
                      </span>
                      <span className="font-bold text-orange-700">
                        {item.price || "—"}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {item.categoryName}
                      {item.needsReview ? " · راجع القراءة" : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-emerald-800">
              راجع المسودة قبل الاعتماد؛ لا تُضاف أصناف أو أسعار غير واضحة
              تلقائيًا.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MenuView({ restaurantId }: { restaurantId: number }) {
  const { language } = useLanguage();
  const [translationGlossary, setTranslationGlossary] = useState(
    "برجر = Burger / Hamburger\nبطاطس مقلية = French fries / Frites"
  );
  const { user } = useAuth();
  const remoteMenu = trpc.platform.menuItems.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const remoteCategories = trpc.platform.menuCategories.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const [bulkTranslationPending, setBulkTranslationPending] = useState(false);
  const translateAllMissing = async () => {
    if (bulkTranslationPending) return;
    const tasks = getMissingTranslationTasks(
      remoteCategories.data ?? [],
      remoteMenu.data ?? []
    );
    if (!tasks.length) {
      toast.info("لا توجد ترجمات ناقصة حاليًا");
      return;
    }
    setBulkTranslationPending(true);
    let completed = 0;
    try {
      for (const task of tasks) {
        await translateMenuEntity.mutateAsync({
          restaurantId,
          entityType: task.entityType,
          entityId: task.entityId,
          sourceName: task.sourceName,
          sourceDescription: task.sourceDescription,
          glossary: translationGlossary,
          sourceLanguage: detectMenuSourceLanguage(task.sourceName),
          languages: ["ar", "en", "fr"],
        });
        completed += 1;
      }
      toast.success(`اكتملت ترجمة ${completed} عنصرًا كمسودات للمراجعة`);
    } catch {
      toast.error(
        `توقفت الترجمة بعد ${completed} عناصر؛ يمكنك المتابعة لاحقًا`
      );
    } finally {
      setBulkTranslationPending(false);
    }
  };

  const kitchenSections = trpc.platform.listKitchenSections.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const products = useMemo(
    () =>
      (remoteMenu.data ?? []).map(item => ({
        id: item.id,
        name: item.name,
        category:
          remoteCategories.data?.find(
            categoryItem => categoryItem.id === item.categoryId
          )?.name ?? `تصنيف ${item.categoryId}`,
        price: Number(item.price),
        compareAtPrice:
          item.compareAtPrice == null ? null : Number(item.compareAtPrice),
        tags: parseMenuTags(item.tagsJson),
        description: item.description ?? "",
        available: item.isAvailable,
        imageUrl: item.imageUrl ?? null,
      })),
    [remoteMenu.data, remoteCategories.data]
  );
  const [menuSection, setMenuSection] = useState<
    "items" | "categories" | "addons"
  >("items");
  const [showItemForm, setShowItemForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("الكل");
  const [itemSearch, setItemSearch] = useState("");
  const [itemSort, setItemSort] = useState<
    "newest" | "priceAsc" | "priceDesc" | "discountDesc"
  >("newest");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySort, setNewCategorySort] = useState("0");
  const [newCategoryKitchen, setNewCategoryKitchen] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryImageUrl, setNewCategoryImageUrl] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newKitchenSectionId, setNewKitchenSectionId] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedItemLanguages, setSelectedItemLanguages] = useState<
    MenuLanguage[]
  >(["ar"]);
  const [localizedItemDraft, setLocalizedItemDraft] = useState<LocalizedDraft>({
    ar: { ...emptyLocalizedField },
    en: { ...emptyLocalizedField },
    fr: { ...emptyLocalizedField },
  });
  const [newPrice, setNewPrice] = useState("");
  const [newCompareAtPrice, setNewCompareAtPrice] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [editingItemPrice, setEditingItemPrice] = useState("");
  const [editingItemCompareAtPrice, setEditingItemCompareAtPrice] =
    useState("");
  const [editingItemTags, setEditingItemTags] = useState("");
  const utils = trpc.useUtils();
  const generateCategoryDescription =
    trpc.platform.generateCategoryDescription.useMutation({
      onSuccess: result => {
        setNewCategoryDescription(result.description);
        toast.success("تم توليد الوصف بالذكاء الاصطناعي");
      },
      onError: error => toast.error(`تعذر توليد الوصف: ${error.message}`),
    });
  const translateMenuEntity = trpc.platform.translateMenuEntity.useMutation({
    onSuccess: result =>
      toast.success(
        `تم إنشاء ${result.translations.length} ترجمة كمسودة للمراجعة`
      ),
    onError: error => toast.error(`تعذر إكمال الترجمة: ${error.message}`),
  });
  const approveMenuTranslation =
    trpc.platform.approveMenuTranslation.useMutation({
      onSuccess: result => {
        toast.success(`تم اعتماد ${result.approvedCount} ترجمة ونشرها`);
        void utils.platform.menuItems.invalidate({ restaurantId });
      },
      onError: error => toast.error(`تعذر اعتماد الترجمة: ${error.message}`),
    });
  const createMenuCategory = trpc.platform.createMenuCategory.useMutation({
    onSuccess: async () => {
      await utils.platform.menuCategories.invalidate({ restaurantId });
      setShowCategoryForm(false);
      setNewCategoryName("");
      setNewCategoryDescription("");
      setNewCategoryImageUrl("");
      toast.success("تمت إضافة الفئة");
    },
    onError: error => toast.error(`تعذر إضافة الفئة: ${error.message}`),
  });
  const updateMenuCategory = trpc.platform.updateMenuCategory.useMutation({
    onSuccess: async () => {
      await utils.platform.menuCategories.invalidate({ restaurantId });
      setEditingCategoryId(null);
      toast.success("تم تحديث الفئة");
    },
    onError: error => toast.error(`تعذر تحديث الفئة: ${error.message}`),
  });
  const deleteMenuCategory = trpc.platform.deleteMenuCategory.useMutation({
    onSuccess: async () => {
      await utils.platform.menuCategories.invalidate({ restaurantId });
      toast.success("تم حذف الفئة");
    },
    onError: error => toast.error(`تعذر حذف الفئة: ${error.message}`),
  });
  const createMenuItem = trpc.platform.createMenuItem.useMutation({
    onSuccess: async () => {
      await utils.platform.menuItems.invalidate({ restaurantId });
      setShowItemForm(false);
      setNewName("");
      setNewDescription("");
      setNewPrice("");
      setNewCompareAtPrice("");
      setNewTags("");
      setNewImageUrl("");
      setSelectedItemLanguages(["ar"]);
      setLocalizedItemDraft({
        ar: { ...emptyLocalizedField },
        en: { ...emptyLocalizedField },
        fr: { ...emptyLocalizedField },
      });
      toast.success("تمت إضافة الصنف إلى المنيو");
    },
    onError: error => toast.error(`تعذر إضافة الصنف: ${error.message}`),
  });
  const updateMenuItem = trpc.platform.updateMenuItem.useMutation({
    onSuccess: async () => {
      await utils.platform.menuItems.invalidate({ restaurantId });
      setEditingItemId(null);
      setEditingItemCompareAtPrice("");
      setEditingItemTags("");
      toast.success("تم تحديث الصنف");
    },
    onError: error => toast.error(`تعذر تحديث الصنف: ${error.message}`),
  });
  const deleteMenuItem = trpc.platform.deleteMenuItem.useMutation({
    onSuccess: async () => {
      await utils.platform.menuItems.invalidate({ restaurantId });
      toast.success("تم حذف الصنف");
    },
    onError: error => toast.error(`تعذر حذف الصنف: ${error.message}`),
  });
  const uploadMenuImage = trpc.media.upload.useMutation();
  const prepareSquareImage = (file: File) =>
    new Promise<File>((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);
      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const size = Math.min(image.naturalWidth, image.naturalHeight);
        const canvas = document.createElement("canvas");
        canvas.width = 500;
        canvas.height = 500;
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("تعذر تجهيز الصورة"));
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(
          image,
          (image.naturalWidth - size) / 2,
          (image.naturalHeight - size) / 2,
          size,
          size,
          0,
          0,
          500,
          500
        );
        canvas.toBlob(
          blob =>
            blob
              ? resolve(
                  new File(
                    [blob],
                    file.name.replace(/\.[^.]+$/, "") + "-500x500.webp",
                    { type: "image/webp" }
                  )
                )
              : reject(new Error("تعذر قص الصورة")),
          "image/webp",
          0.9
        );
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("تعذر قراءة أبعاد الصورة"));
      };
      image.src = objectUrl;
    });
  const uploadPreparedImage = async (
    file: File,
    onUploaded: (url: string) => void,
    successMessage: string
  ) => {
    if (!file.type.startsWith("image/"))
      return toast.error("اختر ملف صورة صالحًا");
    if (file.size > 8 * 1024 * 1024)
      return toast.error("حجم الصورة يتجاوز 8 ميجابايت");
    setImageUploading(true);
    try {
      const prepared = await prepareSquareImage(file);
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("تعذر قراءة الصورة"));
        reader.readAsDataURL(prepared);
      });
      const result = await uploadMenuImage.mutateAsync({
        fileName: prepared.name,
        contentType: prepared.type,
        base64,
        category: "menu",
        scope: "restaurant",
        restaurantId,
      });
      onUploaded(result.url);
      toast.success(successMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر رفع الصورة");
    } finally {
      setImageUploading(false);
    }
  };
  const handleCategoryImage = (file: File) => {
    void uploadPreparedImage(
      file,
      url => setNewCategoryImageUrl(url),
      "تم قص الصورة إلى 500×500 ورفعها بنجاح"
    );
  };
  const handleMenuImage = (file: File) => {
    void uploadPreparedImage(
      file,
      url => setNewImageUrl(url),
      "تم تجهيز صورة الصنف ورفعها بنجاح"
    );
  };
  const updateCategoryImage = (categoryId: number, file: File) => {
    void uploadPreparedImage(
      file,
      url => {
        void updateMenuCategory
          .mutateAsync({ restaurantId, id: categoryId, imageUrl: url })
          .then(() => toast.success("تم تحديث الصورة وأرشفة النسخة الجديدة"));
      },
      "تم قص الصورة ورفعها بنجاح"
    );
  };
  const categories = remoteCategories.data ?? [];
  const shown = useMemo(() => {
    const query = itemSearch.trim().toLocaleLowerCase();
    const filtered = products.filter(
      product =>
        (categoryFilter === "الكل" || product.category === categoryFilter) &&
        (!query ||
          `${product.name} ${product.category}`
            .toLocaleLowerCase()
            .includes(query))
    );
    const discountPercent = (product: (typeof products)[number]) =>
      product.compareAtPrice && product.compareAtPrice > product.price
        ? (1 - product.price / product.compareAtPrice) * 100
        : 0;
    return [...filtered].sort((a, b) =>
      itemSort === "priceAsc"
        ? a.price - b.price
        : itemSort === "priceDesc"
          ? b.price - a.price
          : itemSort === "discountDesc"
            ? discountPercent(b) - discountPercent(a) || b.id - a.id
            : b.id - a.id
    );
  }, [categoryFilter, itemSearch, itemSort, products]);
  const resetItemForm = () => {
    setShowItemForm(false);
    setNewName("");
    setNewDescription("");
    setNewPrice("");
    setNewCompareAtPrice("");
    setNewTags("");
    setNewImageUrl("");
    setNewCategoryId("");
    setNewKitchenSectionId("");
    setSelectedItemLanguages(["ar"]);
    setLocalizedItemDraft({
      ar: { ...emptyLocalizedField },
      en: { ...emptyLocalizedField },
      fr: { ...emptyLocalizedField },
    });
  };
  const toggleItemLanguage = (nextLanguage: MenuLanguage) =>
    setSelectedItemLanguages(current =>
      current.includes(nextLanguage)
        ? current.length > 1
          ? current.filter(item => item !== nextLanguage)
          : current
        : [...current, nextLanguage]
    );
  const updateLocalizedItemDraft = (
    nextLanguage: MenuLanguage,
    field: "name" | "description",
    value: string
  ) =>
    setLocalizedItemDraft(current => ({
      ...current,
      [nextLanguage]: { ...current[nextLanguage], [field]: value },
    }));
  const selectedTranslations = buildMenuTranslations(
    selectedItemLanguages,
    localizedItemDraft
  );
  const primaryLocalizedItem = primaryMenuTranslation(
    selectedItemLanguages,
    localizedItemDraft
  );
  const [bulkTranslation, setBulkTranslation] = useState({
    running: false,
    total: 0,
    completed: 0,
    success: 0,
    errors: 0,
  });
  const [bulkTranslationErrors, setBulkTranslationErrors] = useState<string[]>(
    []
  );
  const bulkTranslateEntity = trpc.platform.translateMenuEntity.useMutation();
  const bulkTranslationTasks = useMemo(
    () => getMissingTranslationTasks(categories, remoteMenu.data ?? []),
    [categories, remoteMenu.data]
  );
  const runBulkTranslation = async () => {
    if (bulkTranslationTasks.length === 0) {
      toast.info("لا توجد فئات أو أصناف ناقصة الترجمة");
      return;
    }
    setBulkTranslation({
      running: true,
      total: bulkTranslationTasks.length,
      completed: 0,
      success: 0,
      errors: 0,
    });
    setBulkTranslationErrors([]);
    let success = 0;
    let errors = 0;
    const errorLabels: string[] = [];
    for (const task of bulkTranslationTasks) {
      try {
        await bulkTranslateEntity.mutateAsync({
          restaurantId,
          entityType: task.entityType,
          entityId: task.entityId,
          sourceName: task.sourceName,
          sourceDescription: task.sourceDescription,
          targetLanguage: task.targetLanguage,
          glossary: translationGlossary,
          sourceLanguage: "ar",
          languages: ["ar", "en", "fr"],
        });
        success += 1;
      } catch {
        errors += 1;
        errorLabels.push(
          `${task.label} · ${task.targetLanguage.toUpperCase()}`
        );
      }
      setBulkTranslation(current => ({
        ...current,
        completed: current.completed + 1,
        success,
        errors,
      }));
    }
    setBulkTranslationErrors(errorLabels);
    await Promise.all([
      utils.platform.menuItems.invalidate({ restaurantId }),
      utils.platform.menuCategories.invalidate({ restaurantId }),
    ]);
    setBulkTranslation(current => ({ ...current, running: false }));
    toast.success(
      `اكتملت الترجمة الجماعية: ${success} ناجحة${errors ? ` و${errors} تحتاج مراجعة` : ""}`
    );
  };
  if (menuSection === "addons")
    return (
      <div className="space-y-5">
        <TranslationGlossaryPanel restaurantId={restaurantId} />
        <CatalogSwitch active={menuSection} onChange={setMenuSection} />
        <MenuAddonsPanel restaurantId={restaurantId} />
      </div>
    );
  return (
    <div className="space-y-6">
      <CatalogSwitch active={menuSection} onChange={setMenuSection} />
      <TranslationGlossaryPanel restaurantId={restaurantId} />
      <TranslationReviewPanel restaurantId={restaurantId} />
      <div className="flex flex-col gap-4 rounded-[26px] border-0 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#e76f3c]">
            <Utensils className="h-4 w-4" /> كتالوج المطعم
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#111c2e]">
            الفئات والأصناف
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            نظّم قائمة الطعام بصور واضحة، أسعار دقيقة، وحالة جاهزة للنشر.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void runBulkTranslation()}
            disabled={
              bulkTranslation.running || bulkTranslationTasks.length === 0
            }
            className="rounded-xl border-[#12c99a] text-[#078c70] hover:bg-emerald-50"
          >
            <Sparkles className="ml-2 h-4 w-4" />
            {bulkTranslation.running
              ? `جارٍ الترجمة ${bulkTranslation.completed}/${bulkTranslation.total}`
              : `ترجمة الناقص (${bulkTranslationTasks.length})`}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowCategoryForm(v => !v);
              setMenuSection("categories");
            }}
            className="rounded-xl border-slate-200"
          >
            <Plus className="ml-2 h-4 w-4" /> فئة جديدة
          </Button>
          <Button
            onClick={() => {
              setShowItemForm(v => !v);
              setMenuSection("items");
            }}
            className="rounded-xl bg-[#e4298f] shadow-lg shadow-pink-100 hover:bg-[#c91d79]"
          >
            <Plus className="ml-2 h-4 w-4" /> إضافة صنف
          </Button>
        </div>
      </div>
      {bulkTranslation.total > 0 && (
        <Card className="rounded-2xl border-cyan-200 bg-cyan-50/70">
          <CardContent className="space-y-2 p-4">
            <div className="flex items-center justify-between gap-3 text-xs font-black text-cyan-900"><span>{bulkTranslation.running ? "جارٍ ترجمة عناصر المنيو" : "اكتملت مهمة الترجمة"}</span><span>{bulkTranslation.completed}/{bulkTranslation.total} · {Math.round((bulkTranslation.completed / bulkTranslation.total) * 100)}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-cyan-100"><div className="h-full rounded-full bg-cyan-600 transition-[width] duration-300" style={{ width: `${Math.round((bulkTranslation.completed / bulkTranslation.total) * 100)}%` }} /></div>
            <p className="text-[11px] text-cyan-800">نجاح: {bulkTranslation.success} · أخطاء تحتاج مراجعة: {bulkTranslation.errors}</p>
          </CardContent>
        </Card>
      )}
      {bulkTranslationErrors.length > 0 && (
        <Card className="rounded-2xl border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm font-black text-amber-900">
              عناصر تحتاج إعادة المحاولة ({bulkTranslationErrors.length})
            </p>
            <p className="mt-1 text-xs leading-6 text-amber-800">
              {bulkTranslationErrors.join(" · ")}
            </p>
          </CardContent>
        </Card>
      )}
      {menuSection === "categories" ? (
        <CategoryManager
          restaurantId={restaurantId}
          categories={categories}
          showForm={showCategoryForm}
          setShowForm={setShowCategoryForm}
          name={newCategoryName}
          setName={setNewCategoryName}
          sort={newCategorySort}
          setSort={setNewCategorySort}
          kitchen={newCategoryKitchen}
          setKitchen={setNewCategoryKitchen}
          description={newCategoryDescription}
          setDescription={setNewCategoryDescription}
          imageUrl={newCategoryImageUrl}
          setImageUrl={setNewCategoryImageUrl}
          handleImage={handleCategoryImage}
          updateImage={updateCategoryImage}
          imageUploading={imageUploading}
          generateDescription={generateCategoryDescription}
          translateEntity={translateMenuEntity}
          approveTranslation={approveMenuTranslation}
          kitchenSections={kitchenSections.data ?? []}
          create={createMenuCategory}
          editingId={editingCategoryId}
          setEditingId={setEditingCategoryId}
          editingName={editingCategoryName}
          setEditingName={setEditingCategoryName}
          update={updateMenuCategory}
          remove={deleteMenuCategory}
          bulkTranslationPending={bulkTranslationPending}
          translateAllMissing={translateAllMissing}
        />
      ) : (
        <>
          {showItemForm && (
            <Card className="overflow-hidden rounded-[26px] border-orange-100 bg-gradient-to-br from-orange-50/80 via-white to-white shadow-sm">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-[#111c2e]">
                      إضافة صنف جديد
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      أدخل بيانات الصنف كما ستظهر للعميل في المنيو.
                    </p>
                  </div>
                  <button
                    onClick={resetItemForm}
                    className="rounded-full p-2 text-slate-400 hover:bg-white"
                    aria-label="إغلاق"
                  >
                    ×
                  </button>
                </div>
                <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-800">
                            لغات هذا الصنف
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            اختر لغة واحدة أو أكثر. يجب إدخال الاسم في كل لغة
                            مختارة قبل الحفظ.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(
                            Object.keys(menuLanguageLabels) as MenuLanguage[]
                          ).map(itemLanguage => (
                            <button
                              key={itemLanguage}
                              type="button"
                              onClick={() => toggleItemLanguage(itemLanguage)}
                              className={`rounded-xl px-3 py-2 text-xs font-black transition ${selectedItemLanguages.includes(itemLanguage) ? "bg-[#111c2e] text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}
                            >
                              {menuLanguageLabels[itemLanguage].native}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        {selectedItemLanguages.map(itemLanguage => (
                          <div
                            key={itemLanguage}
                            className="rounded-xl border border-slate-200 bg-white p-3"
                          >
                            <p className="mb-2 text-xs font-black text-[#e76f3c]">
                              {menuLanguageLabels[itemLanguage].native}{" "}
                              <span className="font-normal text-slate-400">
                                · {menuLanguageLabels[itemLanguage].label}
                              </span>
                            </p>
                            <Input
                              value={localizedItemDraft[itemLanguage].name}
                              onChange={event => {
                                updateLocalizedItemDraft(
                                  itemLanguage,
                                  "name",
                                  event.target.value
                                );
                                if (itemLanguage === "ar" || !newName.trim())
                                  setNewName(event.target.value);
                              }}
                              placeholder={
                                menuLanguageLabels[itemLanguage].placeholder
                              }
                              dir={itemLanguage === "ar" ? "rtl" : "ltr"}
                              className="h-10"
                            />
                            <textarea
                              value={
                                localizedItemDraft[itemLanguage].description
                              }
                              onChange={event => {
                                updateLocalizedItemDraft(
                                  itemLanguage,
                                  "description",
                                  event.target.value
                                );
                                if (
                                  itemLanguage === "ar" ||
                                  !newDescription.trim()
                                )
                                  setNewDescription(event.target.value);
                              }}
                              placeholder={
                                itemLanguage === "ar"
                                  ? "وصف الصنف بالعربية"
                                  : itemLanguage === "en"
                                    ? "Item description in English"
                                    : "Description du plat en français"
                              }
                              dir={itemLanguage === "ar" ? "rtl" : "ltr"}
                              className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-orange-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <Field label="السعر الحالي" required>
                      <Input
                        value={newPrice}
                        onChange={e => setNewPrice(e.target.value)}
                        placeholder="30.00"
                        inputMode="decimal"
                      />
                    </Field>
                    <Field label="السعر قبل الخصم">
                      <Input
                        value={newCompareAtPrice}
                        onChange={e => setNewCompareAtPrice(e.target.value)}
                        placeholder="45.00"
                        inputMode="decimal"
                      />
                      <span className="text-[11px] text-slate-400">
                        اختياري — يجب أن يكون أعلى من السعر الحالي.
                      </span>
                    </Field>
                    <Field label="العلامات">
                      <Input
                        value={newTags}
                        onChange={e => setNewTags(e.target.value)}
                        placeholder="نباتي, الأكثر مبيعًا, جديد"
                      />
                      <span className="text-[11px] text-slate-400">
                        افصل بين العلامات بفاصلة
                      </span>
                    </Field>
                    <Field label="الفئة" required>
                      <select
                        value={newCategoryId}
                        onChange={e => setNewCategoryId(e.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                      >
                        <option value="">اختر الفئة</option>
                        {categories.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="قسم المطبخ">
                      <select
                        value={newKitchenSectionId}
                        onChange={e => setNewKitchenSectionId(e.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                      >
                        <option value="">اختياري</option>
                        {(kitchenSections.data ?? []).map(section => (
                          <option key={section.id} value={section.id}>
                            {section.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <label className="flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-200 bg-white/80 p-5 text-center transition hover:border-orange-400">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleMenuImage(file);
                        e.currentTarget.value = "";
                      }}
                    />
                    {newImageUrl ? (
                      <img
                        src={newImageUrl}
                        alt="معاينة الصنف"
                        className="mb-3 h-36 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="mb-3 rounded-full bg-orange-50 p-4 text-[#e76f3c]">
                        <Eye className="h-7 w-7" />
                      </div>
                    )}
                    <span className="font-bold text-slate-700">
                      {imageUploading ? "جارٍ رفع الصورة..." : "رفع صورة الصنف"}
                    </span>
                    <span className="mt-1 text-xs text-slate-400">
                      PNG أو JPG أو WEBP · حتى 8MB
                    </span>
                  </label>
                </div>
                <div className="mt-6 flex justify-end gap-2 border-t border-orange-100 pt-5">
                  <Button
                    variant="outline"
                    onClick={resetItemForm}
                    className="rounded-xl"
                  >
                    إلغاء
                  </Button>
                  <Button
                    disabled={
                      createMenuItem.isPending ||
                      imageUploading ||
                      selectedTranslations.length === 0 ||
                      selectedTranslations.length !==
                        selectedItemLanguages.length ||
                      !primaryLocalizedItem.name.trim() ||
                      !newPrice ||
                      !newCategoryId
                    }
                    onClick={() =>
                      createMenuItem.mutate({
                        restaurantId,
                        categoryId: Number(newCategoryId),
                        kitchenSectionId: newKitchenSectionId
                          ? Number(newKitchenSectionId)
                          : null,
                        name: primaryLocalizedItem.name.trim(),
                        description:
                          primaryLocalizedItem.description.trim() || undefined,
                        translationsJson: JSON.stringify(selectedTranslations),
                        price: newPrice,
                        compareAtPrice: newCompareAtPrice || null,
                        tagsJson: JSON.stringify(
                          newTags
                            .split(",")
                            .map(tag => tag.trim())
                            .filter(Boolean)
                        ),
                        imageUrl: newImageUrl || undefined,
                      })
                    }
                    className="rounded-xl bg-[#111c2e] hover:bg-[#1b2b43]"
                  >
                    {createMenuItem.isPending ? "جارٍ الحفظ..." : "حفظ الصنف"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm sm:flex-row sm:items-center">
            <div className="flex gap-2 overflow-x-auto">
              {["الكل", ...categories.map(item => item.name)].map(item => (
                <button
                  key={item}
                  onClick={() => setCategoryFilter(item)}
                  className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition ${categoryFilter === item ? "bg-[#111c2e] text-white" : "text-slate-500 hover:bg-orange-50 hover:text-[#e76f3c]"}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="flex w-full flex-col gap-2 sm:mr-auto sm:w-auto sm:flex-row">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  value={itemSearch}
                  onChange={event => setItemSearch(event.target.value)}
                  placeholder="ابحث بالاسم أو الفئة"
                  aria-label="بحث متقدم في الأصناف"
                  className="h-10 w-full rounded-xl pr-9 sm:w-56"
                />
              </div>
              <select
                value={itemSort}
                onChange={event =>
                  setItemSort(event.target.value as typeof itemSort)
                }
                aria-label="ترتيب الأصناف"
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600"
              >
                <option value="newest">الأحدث أولًا</option>
                <option value="priceAsc">السعر: من الأقل</option>
                <option value="priceDesc">السعر: من الأعلى</option>
                <option value="discountDesc">أعلى خصم أولًا</option>
              </select>
            </div>
          </div>
          <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <div className="mb-3 flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3 text-xs font-bold text-orange-800">
              <span className="rounded-full bg-orange-200 px-2 py-1">Tags</span>
              <span>
                أضف العلامات مثل «نباتي» أو «الأكثر مبيعًا» وافصل بينها بفاصلة،
                وستظهر للعميل كمرشحات في المنيو.
              </span>
            </div>
            <div className="hidden grid-cols-[64px_1.5fr_1fr_120px_130px_150px] gap-4 bg-[#111c2e] px-5 py-4 text-xs font-bold text-white md:grid">
              <span>#</span>
              <span>الصنف</span>
              <span>الفئة</span>
              <span>السعر</span>
              <span>الحالة</span>
              <span>الإجراء</span>
            </div>
            {remoteMenu.isLoading ? (
              <div className="p-12 text-center text-sm text-slate-500">
                جارٍ تحميل الأصناف...
              </div>
            ) : remoteMenu.isError ? (
              <div className="p-12 text-center text-sm text-red-600">
                تعذر تحميل الأصناف.{" "}
                <button
                  onClick={() => void remoteMenu.refetch()}
                  className="font-bold underline"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : shown.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-500">
                لا توجد أصناف محفوظة لهذا المطعم بعد.
              </div>
            ) : (
              shown.map((product, index) => (
                <div
                  key={product.id}
                  className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-0 md:grid-cols-[64px_1.5fr_1fr_120px_130px_150px] md:items-center md:gap-4"
                >
                  <span className="text-xs font-bold text-slate-400">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-14 w-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-16 items-center justify-center rounded-xl bg-orange-50 text-[#e76f3c]">
                        <Utensils className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-black text-[#111c2e]">
                        {product.name}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                        صنف من قائمة المطعم
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-600">
                    {product.category}
                  </span>
                  <div>
                    <p className="font-black text-[#111c2e]">
                      {money(product.price)}
                    </p>
                    {product.compareAtPrice !== null &&
                    product.compareAtPrice > product.price ? (
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 line-through">
                          {money(product.compareAtPrice)}
                        </span>
                        <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-black text-red-600">
                          خصم{" "}
                          {Math.round(
                            (1 - product.price / product.compareAtPrice) * 100
                          )}
                          %
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <button
                    onClick={() =>
                      updateMenuItem.mutate({
                        restaurantId,
                        id: product.id,
                        isAvailable: !product.available,
                      })
                    }
                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${product.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {product.available ? "مباشر ✓" : "متوقف"}
                  </button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingItemId(product.id);
                        setEditingItemName(product.name);
                        setEditingItemPrice(String(product.price));
                        setEditingItemCompareAtPrice(
                          product.compareAtPrice == null
                            ? ""
                            : String(product.compareAtPrice)
                        );
                        setEditingItemTags(product.tags.join(", "));
                      }}
                      className="rounded-lg text-xs"
                    >
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        approveMenuTranslation.mutate({
                          restaurantId,
                          entityType: "item",
                          entityId: product.id,
                        })
                      }
                      className="rounded-lg border-blue-200 text-xs text-blue-700 hover:bg-blue-50"
                    >
                      اعتماد
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        deleteMenuItem.mutate({ restaurantId, id: product.id })
                      }
                      className="rounded-lg text-xs text-red-500 hover:bg-red-50"
                    >
                      حذف
                    </Button>
                  </div>
                  {editingItemId === product.id && (
                    <div className="md:col-span-full grid gap-3 rounded-xl bg-orange-50 p-3 sm:grid-cols-[1fr_150px_150px_auto]">
                      <Input
                        value={editingItemName}
                        onChange={e => setEditingItemName(e.target.value)}
                        placeholder="اسم الصنف"
                      />
                      <Input
                        value={editingItemPrice}
                        onChange={e => setEditingItemPrice(e.target.value)}
                        placeholder="السعر الحالي"
                        inputMode="decimal"
                      />
                      <Input
                        value={editingItemCompareAtPrice}
                        onChange={e =>
                          setEditingItemCompareAtPrice(e.target.value)
                        }
                        placeholder="السعر قبل الخصم"
                        inputMode="decimal"
                      />
                      <Input
                        value={editingItemTags}
                        onChange={e => setEditingItemTags(e.target.value)}
                        placeholder="العلامات: نباتي, الأكثر مبيعًا"
                      />
                      <Button
                        onClick={() =>
                          updateMenuItem.mutate({
                            restaurantId,
                            id: product.id,
                            name: editingItemName.trim(),
                            price: editingItemPrice.trim(),
                            compareAtPrice:
                              editingItemCompareAtPrice.trim() || null,
                            tagsJson: JSON.stringify(
                              editingItemTags
                                .split(",")
                                .map(tag => tag.trim())
                                .filter(Boolean)
                            ),
                          })
                        }
                        className="rounded-xl bg-[#e76f3c]"
                      >
                        حفظ التعديل
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CatalogSwitch({
  active,
  onChange,
}: {
  active: "items" | "categories" | "addons";
  onChange: (value: "items" | "categories" | "addons") => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <span className="px-3 text-xs font-black text-[#111c2e]">
        إدارة المنيو
      </span>
      <div className="flex gap-1">
        <Button
          variant={active === "items" ? "default" : "ghost"}
          onClick={() => onChange("items")}
          className="rounded-xl text-xs"
        >
          الأصناف
        </Button>
        <Button
          variant={active === "categories" ? "default" : "ghost"}
          onClick={() => onChange("categories")}
          className="rounded-xl text-xs"
        >
          الفئات
        </Button>
        <Button
          variant={active === "addons" ? "default" : "ghost"}
          onClick={() => onChange("addons")}
          className="rounded-xl text-xs"
        >
          الإضافات
        </Button>
      </div>
    </div>
  );
}
function Field({
  label,
  required,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="text-xs font-bold text-slate-700">
        {label}
        {required ? <b className="mr-1 text-red-500">*</b> : null}
      </span>
      {children}
    </label>
  );
}
function CategoryManager({
  restaurantId,
  categories,
  showForm,
  setShowForm,
  name,
  setName,
  sort,
  setSort,
  kitchen,
  setKitchen,
  description,
  setDescription,
  imageUrl,
  setImageUrl,
  handleImage,
  updateImage,
  imageUploading,
  generateDescription,
  translateEntity,
  approveTranslation,
  kitchenSections,
  create,
  editingId,
  setEditingId,
  editingName,
  setEditingName,
  update,
  remove,
  bulkTranslationPending,
  translateAllMissing,
}: any) {
  const { user } = useAuth();
  const glossaryQuery = trpc.platform.translationGlossary.useQuery({ restaurantId }, { enabled: Boolean(user), retry: false });
  const translationGlossary = useMemo(() => (glossaryQuery.data ?? []).filter((entry) => entry.isProtected).map((entry) => `${entry.sourceTerm} = ${entry.translatedTerm}`).join("\n"), [glossaryQuery.data]);
  const { language } = useLanguage();
  const [selectedCategoryLanguages, setSelectedCategoryLanguages] = useState<
    MenuLanguage[]
  >(["ar"]);
  const [localizedCategoryDraft, setLocalizedCategoryDraft] =
    useState<LocalizedDraft>({
      ar: { ...emptyLocalizedField },
      en: { ...emptyLocalizedField },
      fr: { ...emptyLocalizedField },
    });
  const toggleCategoryLanguage = (nextLanguage: MenuLanguage) =>
    setSelectedCategoryLanguages(current =>
      current.includes(nextLanguage)
        ? current.length > 1
          ? current.filter(item => item !== nextLanguage)
          : current
        : [...current, nextLanguage]
    );
  const updateLocalizedCategoryDraft = (
    nextLanguage: MenuLanguage,
    field: "name" | "description",
    value: string
  ) => {
    setLocalizedCategoryDraft(current => ({
      ...current,
      [nextLanguage]: { ...current[nextLanguage], [field]: value },
    }));
    if (nextLanguage === "ar") {
      if (field === "name") setName(value);
      else setDescription(value);
    }
  };
  const selectedCategoryTranslations = buildMenuTranslations(
    selectedCategoryLanguages,
    localizedCategoryDraft
  );
  const primaryCategory = primaryMenuTranslation(
    selectedCategoryLanguages,
    localizedCategoryDraft
  );
  const openCategoryEdit = (item: any) => {
    const draft = readLocalizedDraft(
      item.translationsJson,
      item.name,
      item.description ?? ""
    );
    const available = (
      Object.keys(menuLanguageLabels) as MenuLanguage[]
    ).filter(itemLanguage => draft[itemLanguage].name.trim());
    setLocalizedCategoryDraft(draft);
    setSelectedCategoryLanguages(available.length ? available : ["ar"]);
    setName(draft.ar.name || item.name);
    setDescription(draft.ar.description || item.description || "");
    setEditingId(item.id);
    setEditingName(draft.ar.name || item.name);
    setShowForm(true);
  };
  const autoTranslateCategory = async () => {
    const source = localizedCategoryDraft.ar;
    if (source.name.trim().length < 2) {
      toast.error("أدخل اسم الفئة بالعربية أولًا");
      return;
    }
    try {
      for (const targetLanguage of ["en", "fr"] as const) {
        const result = await translateEntity.mutateAsync({
          restaurantId,
          entityType: "category",
          entityId: editingId ?? 0,
          sourceName: source.name.trim(),
          sourceDescription: source.description.trim(),
          targetLanguage,
          glossary: translationGlossary,
          sourceLanguage: "ar",
          languages: ["ar", "en", "fr"],
        });
        const translated = (result.translations ?? []).find(
          (entry: any) => entry.language === targetLanguage
        );
        if (translated?.name)
          setLocalizedCategoryDraft(current => ({
            ...current,
            [targetLanguage]: {
              name: translated.name,
              description: translated.description ?? "",
            },
          }));
      }
      setSelectedCategoryLanguages(current =>
        Array.from(new Set<MenuLanguage>([...current, "ar", "en", "fr"]))
      );
      toast.success("تمت تعبئة الإنجليزية والفرنسية كمسودات للمراجعة");
    } catch {
      /* mutation displays the localized error */
    }
  };
  return (
    <div className="space-y-5">
      <MenuImportReviewPanel restaurantId={restaurantId} />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[26px] border-0 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
        <div>
          <p className="mb-1 text-xs font-black text-[#e4298f]">
            كتالوج المطعم
          </p>
          <h3 className="text-xl font-black text-[#111c2e]">الفئات</h3>
          <p className="mt-1 text-xs text-slate-500">
            أنشئ الفئات ورتبها لتظهر بشكل واضح في قائمة الطعام.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void translateAllMissing()}
            disabled={bulkTranslationPending}
            className="rounded-xl border-[#12c99a] text-xs text-[#078c70] hover:bg-emerald-50"
          >
            <Languages className="ml-2 h-4 w-4" />
            {bulkTranslationPending
              ? "جارٍ ترجمة القائمة..."
              : "ترجمة القائمة كاملة"}
          </Button>
          <Button
            onClick={() => setShowForm((v: boolean) => !v)}
            className="rounded-xl bg-[#e4298f] shadow-md shadow-pink-100 hover:bg-[#c91d79]"
          >
            <Plus className="ml-2 h-4 w-4" /> إضافة فئة جديدة
          </Button>
        </div>
      </div>
      {showForm && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Card className="order-2 overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] lg:order-1">
            <CardContent className="p-6">
              <div className="mb-6 flex items-start justify-between border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-lg font-black text-[#111c2e]">
                    {editingId ? "تعديل الفئة" : "إنشاء فئة"}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    أضف اسمًا ووصفًا يساعد العملاء على التصفح.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(menuLanguageLabels) as MenuLanguage[]).map(
                    itemLanguage => (
                      <button
                        key={itemLanguage}
                        type="button"
                        onClick={() => toggleCategoryLanguage(itemLanguage)}
                        className={`rounded-xl px-3 py-2 text-xs font-black transition ${selectedCategoryLanguages.includes(itemLanguage) ? "bg-[#111c2e] text-white" : "bg-purple-50 text-purple-700"}`}
                      >
                        {menuLanguageLabels[itemLanguage].native}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="space-y-5">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <div className="mb-3">
                    <p className="text-sm font-black text-slate-800">
                      لغات هذه الفئة
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="mt-1 text-[11px] text-slate-500">
                        اختر اللغات التي ستظهر بها الفئة، وأكمل الاسم والوصف لكل
                        لغة.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void autoTranslateCategory()}
                        disabled={
                          !editingId ||
                          translateEntity.isPending ||
                          localizedCategoryDraft.ar.name.trim().length < 2
                        }
                        className="gap-1 rounded-xl border-[#12c99a] text-xs text-[#078c70] hover:bg-emerald-50"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {translateEntity.isPending
                          ? "جارٍ الترجمة..."
                          : "ترجمة الإنجليزية والفرنسية"}
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {selectedCategoryLanguages.map(itemLanguage => (
                      <div
                        key={itemLanguage}
                        className="rounded-xl border border-slate-200 bg-white p-3"
                      >
                        <p className="mb-2 text-xs font-black text-[#e76f3c]">
                          {menuLanguageLabels[itemLanguage].native}{" "}
                          <span className="font-normal text-slate-400">
                            · {menuLanguageLabels[itemLanguage].label}
                          </span>
                        </p>
                        <Input
                          value={localizedCategoryDraft[itemLanguage].name}
                          onChange={event =>
                            updateLocalizedCategoryDraft(
                              itemLanguage,
                              "name",
                              event.target.value
                            )
                          }
                          placeholder={
                            itemLanguage === "ar"
                              ? "اسم الفئة بالعربية"
                              : itemLanguage === "en"
                                ? "Category name in English"
                                : "Nom de catégorie en français"
                          }
                          dir={itemLanguage === "ar" ? "rtl" : "ltr"}
                          className="h-10"
                        />
                        <textarea
                          value={
                            localizedCategoryDraft[itemLanguage].description
                          }
                          onChange={event =>
                            updateLocalizedCategoryDraft(
                              itemLanguage,
                              "description",
                              event.target.value
                            )
                          }
                          placeholder={
                            itemLanguage === "ar"
                              ? "وصف الفئة بالعربية"
                              : itemLanguage === "en"
                                ? "Category description in English"
                                : "Description de la catégorie en français"
                          }
                          dir={itemLanguage === "ar" ? "rtl" : "ltr"}
                          className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-orange-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <Field label="الترتيب التلقائي">
                  <div className="flex h-12 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3">
                    <span className="text-sm font-bold text-[#111c2e]">
                      سيُسند تلقائيًا
                    </span>
                    <span className="rounded-full bg-[#111c2e] px-3 py-1 text-xs font-black text-white">
                      {categories.length + 1}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    تتسلسل الفئات 1، 2، 3… لا حاجة لإدخال الرقم يدويًا.
                  </p>
                </Field>
                <Field label="قسم المطبخ">
                  <select
                    value={kitchen}
                    onChange={e => setKitchen(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e4298f]"
                  >
                    <option value="">اختر قسم المطبخ (اختياري)</option>
                    {kitchenSections.map((section: any) => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[#111c2e]">
                        صورة الفئة
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        المقاس المفضل 500 × 500 بكسل · PNG أو JPG أو WEBP · حتى
                        8MB
                      </p>
                    </div>
                    <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#12c99a] px-4 text-xs font-black text-white transition hover:bg-[#0eaf86]">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleImage(file);
                          e.currentTarget.value = "";
                        }}
                      />
                      <Sparkles className="h-4 w-4" /> إرفاق الصورة
                    </label>
                  </div>
                  {imageUrl ? (
                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-white p-3">
                      <img
                        src={imageUrl}
                        alt="معاينة صورة الفئة"
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-emerald-700">
                          {imageUploading ? "جارٍ الرفع..." : "تم تجهيز الصورة"}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          ستظهر الصورة في جدول الفئات والمنيو العامة.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-300">
                        <Eye className="h-5 w-5" />
                      </div>
                      <span>
                        لم تُرفق صورة بعد — يمكنك الإضافة الآن أو المتابعة بدون
                        صورة.
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-7 flex justify-between gap-2 border-t border-slate-100 pt-5">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl px-6"
                >
                  إلغاء
                </Button>
                <Button
                  disabled={
                    create.isPending ||
                    update.isPending ||
                    selectedCategoryTranslations.length !==
                      selectedCategoryLanguages.length ||
                    !primaryCategory.name.trim()
                  }
                  onClick={() => {
                    const payload = {
                      restaurantId,
                      name: primaryCategory.name.trim(),
                      description:
                        primaryCategory.description.trim() || undefined,
                      translationsJson: JSON.stringify(
                        selectedCategoryTranslations
                      ),
                      sortOrder: Number(sort) || 0,
                      kitchenSectionId: kitchen ? Number(kitchen) : null,
                      imageUrl: imageUrl || undefined,
                    };
                    if (editingId) update.mutate({ ...payload, id: editingId });
                    else create.mutate(payload);
                  }}
                  className="rounded-xl bg-[#e4298f] px-7 shadow-md shadow-pink-100 hover:bg-[#c91d79]"
                >
                  {create.isPending || update.isPending
                    ? "جارٍ الحفظ..."
                    : editingId
                      ? "حفظ التعديل"
                      : "إرسال"}
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="order-1 rounded-[28px] border-0 bg-gradient-to-br from-[#111c2e] to-[#263b58] text-white shadow-[0_18px_50px_rgba(17,28,46,0.16)] lg:order-2">
            <CardContent className="flex min-h-[280px] flex-col justify-between p-7">
              <div>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#ff9c72]">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h4 className="text-xl font-black">أنشئ فئة واضحة</h4>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  قسّم المنيو إلى مجموعات سهلة التصفح مثل المشروبات، الحلويات
                  والوجبات الرئيسية.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-2xl font-black">{categories.length}</p>
                  <span className="text-white/55">فئة محفوظة</span>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-2xl font-black">
                    {categories.filter((item: any) => item.name).length}
                  </p>
                  <span className="text-white/55">جاهزة للنشر</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <CardHeader className="flex-row items-center justify-between border-b border-slate-100 bg-slate-50/70">
          <div>
            <CardTitle className="text-base font-black text-[#111c2e]">
              قائمة الفئات
            </CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              راجع الاسم والترتيب والحالة من مكان واحد.
            </p>
          </div>
          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
            {categories.length} فئات
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto overscroll-x-contain">
            <div className="min-w-[760px]">
              <div className="hidden grid-cols-[70px_110px_1.4fr_150px_140px_170px] gap-4 bg-[#202e43] px-6 py-4 text-xs font-black text-white md:grid">
                <span>#</span>
                <span>صورة</span>
                <span>العنوان</span>
                <span>اللغات</span>
                <span>الحالة</span>
                <span>إجراء</span>
              </div>
              {categories.length === 0 ? (
                <div className="p-14 text-center text-sm text-slate-500">
                  لا توجد فئات محفوظة بعد.
                </div>
              ) : (
                categories.map((item: any, index: number) => (
                  <div
                    key={item.id}
                    className="grid gap-3 border-b border-slate-100 px-6 py-4 last:border-0 md:grid-cols-[70px_110px_1.4fr_150px_140px_170px] md:items-center md:gap-4"
                  >
                    <span className="text-sm font-bold text-slate-500">
                      {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-14 w-20 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-slate-100 text-[#e76f3c]">
                          <Utensils className="h-5 w-5" />
                        </div>
                      )}
                      <label
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-[#12c99a] text-white transition hover:bg-[#0eaf86]"
                        title="تحديث صورة الفئة"
                      >
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="sr-only"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) updateImage(item.id, file);
                            e.currentTarget.value = "";
                          }}
                        />
                        <Sparkles className="h-4 w-4" />
                      </label>
                    </div>
                    <div>
                      <p className="font-black text-[#111c2e]">{item.name}</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        معرف الفئة: {item.id}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-black ${readLocalizedDraft(item.translationsJson, item.name, item.description ?? "").ar.name ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}
                      >
                        AR{" "}
                        {readLocalizedDraft(
                          item.translationsJson,
                          item.name,
                          item.description ?? ""
                        ).ar.name
                          ? "✓"
                          : "—"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-black ${readLocalizedDraft(item.translationsJson, item.name, item.description ?? "").en.name ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                      >
                        EN{" "}
                        {readLocalizedDraft(
                          item.translationsJson,
                          item.name,
                          item.description ?? ""
                        ).en.name
                          ? "✓"
                          : "—"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-black ${readLocalizedDraft(item.translationsJson, item.name, item.description ?? "").fr.name ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                      >
                        FR{" "}
                        {readLocalizedDraft(
                          item.translationsJson,
                          item.name,
                          item.description ?? ""
                        ).fr.name
                          ? "✓"
                          : "—"}
                      </span>
                    </div>
                    <span className="w-fit rounded-full bg-[#0bb36b] px-4 py-1.5 text-xs font-black text-white shadow-sm">
                      مباشر <span className="mr-1">✓</span>
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => openCategoryEdit(item)}
                        className="rounded-lg bg-[#e4298f] text-xs hover:bg-[#c91d79]"
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          approveTranslation.mutate({
                            restaurantId,
                            entityType: "category",
                            entityId: item.id,
                          })
                        }
                        className="rounded-lg border-blue-200 text-xs text-blue-700 hover:bg-blue-50"
                      >
                        اعتماد
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          remove.mutate({
                            restaurantId: item.restaurantId ?? restaurantId,
                            id: item.id,
                          })
                        }
                        className="rounded-lg border-red-200 text-xs text-red-500 hover:bg-red-50"
                      >
                        حذف
                      </Button>
                    </div>
                    {editingId === item.id && (
                      <div className="md:col-span-full flex gap-2 rounded-xl bg-pink-50 p-3">
                        <Input
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                        />
                        <Button
                          onClick={() =>
                            update.mutate({
                              restaurantId,
                              id: item.id,
                              name: editingName.trim(),
                            })
                          }
                          className="rounded-xl bg-[#111c2e]"
                        >
                          حفظ التعديل
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureControlCenter({
  restaurantId,
  restaurantName,
}: {
  restaurantId: number;
  restaurantName: string;
}) {
  const utils = trpc.useUtils();
  const query = trpc.features.allAccess.useQuery(
    { restaurantId },
    { retry: false }
  );
  const setOverride = trpc.features.setOverride.useMutation({
    onSuccess: () => {
      void query.refetch();
      void utils.admin.featureUsageMetrics.invalidate();
      toast.success("تم تحديث ميزة المطعم");
    },
    onError: error => toast.error(`تعذر تحديث الميزة: ${error.message}`),
  });
  const rows = query.data ?? [];
  const enabledCount = rows.filter(row => row.access.enabled).length;
  const missingCount = rows.filter(row => !row.access.enabled).length;
  return (
    <Card className="mt-5 overflow-hidden rounded-2xl border-cyan-100 bg-white shadow-sm">
      <CardHeader className="border-b border-cyan-100 bg-gradient-to-l from-cyan-50 via-white to-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-xl bg-cyan-100 p-2 text-cyan-700">
                <Zap className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-[11px] font-black text-cyan-800">
                مركز التحكم بالمميزات
              </span>
            </div>
            <CardTitle className="text-base">
              مميزات {restaurantName || `المطعم #${restaurantId}`}
            </CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              إدارة الباقة والـ Overrides من مكان واحد. لا تُفتح الميزة لبقية
              المطاعم تلقائيًا.
            </p>
          </div>
          <div className="flex gap-2 text-center">
            <div className="rounded-xl bg-emerald-50 px-3 py-2">
              <p className="text-lg font-black text-emerald-700">
                {query.isLoading ? "—" : enabledCount}
              </p>
              <p className="text-[10px] text-emerald-700">مفعّلة</p>
            </div>
            <div className="rounded-xl bg-amber-50 px-3 py-2">
              <p className="text-lg font-black text-amber-700">
                {query.isLoading ? "—" : missingCount}
              </p>
              <p className="text-[10px] text-amber-700">محجوبة</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {query.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            تعذر تحميل مميزات المطعم. Request ID: feature-center-{restaurantId}
            <button
              onClick={() => void query.refetch()}
              className="mr-2 font-bold underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : query.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(row => (
              <div
                key={row.id}
                className={`rounded-2xl border p-4 transition ${row.access.enabled ? "border-emerald-100 bg-emerald-50/40" : "border-slate-200 bg-slate-50"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">
                      {row.label}
                    </p>
                    <p className="mt-1 truncate font-mono text-[10px] text-slate-400">
                      {row.key}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${row.access.enabled ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}
                  >
                    {row.access.enabled ? "مفعّلة" : "محجوبة"}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    {row.access.limit === null
                      ? "غير محدود"
                      : `الحد ${row.access.limit}`}
                    {row.isAddOn ? " · إضافة مستقلة" : " · ضمن الخطة"}
                  </span>
                  <button
                    type="button"
                    disabled={setOverride.isPending}
                    onClick={() =>
                      setOverride.mutate({
                        restaurantId,
                        featureId: row.id,
                        enabled: !row.access.enabled,
                        limit: row.access.limit,
                      })
                    }
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-black transition ${row.access.enabled ? "border border-red-200 bg-white text-red-600 hover:bg-red-50" : "bg-[#e76f3c] text-white hover:bg-[#d85f2e]"}`}
                  >
                    {row.access.enabled ? "تعطيل" : "تفعيل"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {restaurantName === "Nasser Cafe" && (
          <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-xs leading-6 text-cyan-900">
            <strong>Nasser Cafe:</strong> هذه بطاقة الاختبار الشاملة. جميع
            المميزات الحالية مفعّلة له عبر خطة All Features ويمكنك تعديل أي ميزة
            من هنا.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NasserCafeDetailsPanel({
  restaurantId,
  plan,
}: {
  restaurantId: number;
  plan: string;
}) {
  const query = trpc.features.allAccess.useQuery(
    { restaurantId },
    { retry: false }
  );
  const rows = query.data ?? [];
  const enabled = rows.filter(row => row.access.enabled);
  const addOns = rows.filter(row => row.isAddOn);
  return (
    <Card className="mt-5 overflow-hidden rounded-2xl border-violet-100 bg-white shadow-sm">
      <CardHeader className="border-b border-violet-100 bg-gradient-to-l from-violet-50 via-white to-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
                <Store className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-[11px] font-black text-violet-800">
                ملف المطعم
              </span>
            </div>
            <CardTitle className="text-base">تفاصيل Nasser Cafe</CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              ملخص قابل للمراجعة لجميع المميزات والصلاحيات المفعلة للمطعم
              التجريبي.
            </p>
          </div>
          <Badge className="rounded-lg bg-violet-600 text-white">
            {plan || "All Features"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {query.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            تعذر تحميل تفاصيل Nasser Cafe. Request ID: nasser-cafe-details{" "}
            <button
              onClick={() => void query.refetch()}
              className="mr-2 font-bold underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : query.isLoading ? (
          <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="text-[11px] text-emerald-700">المميزات المفعلة</p>
                <p className="mt-1 text-2xl font-black text-emerald-700">
                  {enabled.length}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">إجمالي التعريفات</p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {rows.length}
                </p>
              </div>
              <div className="rounded-xl bg-cyan-50 p-3">
                <p className="text-[11px] text-cyan-700">الإضافات المستقلة</p>
                <p className="mt-1 text-2xl font-black text-cyan-700">
                  {addOns.length}
                </p>
              </div>
              <div className="rounded-xl bg-violet-50 p-3">
                <p className="text-[11px] text-violet-700">نسبة التفعيل</p>
                <p className="mt-1 text-2xl font-black text-violet-700">
                  {rows.length
                    ? Math.round((enabled.length / rows.length) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map(row => (
                <div
                  key={row.id}
                  className="flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2"
                >
                  <CheckCircle2
                    className={`h-4 w-4 ${row.access.enabled ? "text-emerald-600" : "text-slate-300"}`}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800">
                      {row.label}
                    </p>
                    <p className="truncate font-mono text-[10px] text-slate-400">
                      {row.access.enabled ? "مفعّلة" : "محجوبة"} ·{" "}
                      {row.access.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PosView({ restaurantId }: { restaurantId: number }) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const remoteMenu = trpc.platform.menuItems.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const remoteBranches = trpc.platform.branches.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const receiptBrandingQuery = trpc.platform.receiptTemplate.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const branchId = remoteBranches.data?.[0]?.id;
  const posProducts: MenuProduct[] = (remoteMenu.data ?? []).map(item => ({
    id: item.id,
    name: item.name,
    category: String(item.categoryId),
    price: parsePriceToCents(item.price) / 100,
    compareAtPrice:
      item.compareAtPrice == null
        ? null
        : parsePriceToCents(item.compareAtPrice) / 100,
    tags: parseMenuTags(item.tagsJson),
    available: item.isAvailable,
  }));
  const [productSearch, setProductSearch] = useState("");
  const availableProducts = posProducts.filter(
    product =>
      product.available &&
      product.name
        .toLocaleLowerCase()
        .includes(productSearch.trim().toLocaleLowerCase())
  );
  const [cart, setCart] = useState<
    { product: MenuProduct; quantity: number }[]
  >([]);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [queuedCount, setQueuedCount] = useState(0);
  const [tableName, setTableName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PosPaymentMethod>("cash");
  const [paymentSplits, setPaymentSplits] = useState<Array<{ method: PosPaymentMethod; amount: string }>>([]);
  const [refundPin, setRefundPin] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [cashierNotes, setCashierNotes] = useState("");
  const [receiptTemplate, setReceiptTemplate] = useState<
    "thermal" | "detailed"
  >("thermal");
  const [lastReceipt, setLastReceipt] = useState<{
    orderId: number;
    paymentStatus: "unpaid" | "paid" | "refunded";
    items: Array<{ name: string; quantity: number; unitPrice: number }>;
    pricing: {
      subtotal: string;
      discountPercent: number;
      discountAmount: string;
      taxPercent: number;
      taxAmount: string;
      total: string;
      couponCode?: string | null;
      discountSource?: "default" | "coupon_or_default";
    };
  } | null>(null);
  const createOrder = trpc.platform.createOrder.useMutation({
    onSuccess: result => {
      setLastReceipt({
        orderId: result.orderId,
        paymentStatus: result.paymentStatus,
        items: cart.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
        pricing: result.pricing,
      });
      toast.success(`تم حفظ الطلب #${result.orderId} وإرساله للمطبخ`);
      setCart([]);
      setPaymentSplits([]);
    },
    onError: error => toast.error(`تعذر حفظ الطلب: ${error.message}`),
  });
  const markOrderPaid = trpc.platform.markOrderPaid.useMutation({
    onSuccess: () => {
      setLastReceipt(current =>
        current ? { ...current, paymentStatus: "paid" } : current
      );
      toast.success("تم تأكيد الدفع ويمكن الآن طباعة الإيصال");
    },
    onError: error => toast.error(`تعذر تأكيد الدفع: ${error.message}`),
  });
  const refundOrder = trpc.platform.refundOrder.useMutation({
    onSuccess: () => {
      setLastReceipt(current => current ? { ...current, paymentStatus: "refunded" } : current);
      setRefundDialogOpen(false);
      setRefundPin("");
      setRefundReason("");
      toast.success("تم تسجيل المرتجع في سجل التدقيق");
    },
    onError: error => toast.error(`تعذر تنفيذ المرتجع: ${error.message}`),
  });
  const queueKey = `nfood-offline-orders:${restaurantId ?? "none"}:${branchId ?? "none"}`;
  const readQueue = () =>
    readOfflineQueue<Parameters<typeof createOrder.mutate>[0]>(
      localStorage,
      queueKey
    );
  const syncQueue = async () => {
    if (!navigator.onLine || !branchId) return;
    const queue = readQueue();
    let remaining = [...queue];
    for (const payload of queue) {
      try {
        const { offlineId: _offlineId, ...orderPayload } = payload;
        await createOrder.mutateAsync(orderPayload);
        remaining = remaining.slice(1);
        writeOfflineQueue(localStorage, queueKey, remaining);
        setQueuedCount(remaining.length);
      } catch {
        break;
      }
    }
    if (queue.length > 0 && remaining.length === 0) {
      toast.success(`تمت مزامنة ${queue.length} طلبات محفوظة`);
      window.dispatchEvent(
        new CustomEvent("nfood:sync-complete", {
          detail: { count: queue.length },
        })
      );
    }
  };
  const submitOrder = () => {
    if (!branchId) {
      toast.error("لا يوجد فرع مرتبط لاستقبال الطلب");
      return;
    }
    const payload = {
      restaurantId,
      branchId,
      clientRequestId: crypto.randomUUID(),
      channel:
        channel === "داخل المطعم"
          ? ("dine_in" as const)
          : channel === "استلام"
            ? ("takeaway" as const)
            : channel === "حجز"
            ? ("reservation" as const)
            : channel === "فندق"
              ? ("hotel" as const)
              : ("delivery" as const),
      total: formatCents(totalCents),
      tableName: tableName.trim() || undefined,
      paymentMethod: normalizedPaymentSplits[0]?.method ?? paymentMethod,
      paymentSplits: normalizedPaymentSplits.length ? normalizedPaymentSplits.map(split => ({ method: split.method, amount: formatPaymentCents(split.amountCents) })) : undefined,
      couponCode: couponCode.trim() || undefined,
      notes: customerNote.trim() || undefined,
      cashierNotes: cashierNotes.trim() || undefined,
      items: cart.map(item => ({
        menuItemId: item.product.id,
        quantity: item.quantity,
        unitPrice: formatCents(parsePriceToCents(item.product.price)),
      })),
    };
    const normalizedSplits = normalizePaymentSplits(paymentSplits);
    if (paymentSplits.length > 0 && !hasExactPaymentSplit(totalCents, normalizedSplits)) {
      toast.error(`المتبقي للدفع: ${money(getPaymentSplitRemainingCents(totalCents, normalizedSplits) / 100)}`);
      return;
    }
    if (!isOnline) {
      const queue = enqueueOfflineItem(
        localStorage,
        queueKey,
        payload,
        crypto.randomUUID()
      );
      setQueuedCount(queue.length);
      setCart([]);
      toast.info("تم حفظ الطلب محليًا وسيُرسل تلقائيًا عند عودة الاتصال");
      return;
    }
    createOrder.mutate(payload);
  };
  useEffect(() => {
    const refresh = () => {
      setIsOnline(navigator.onLine);
      setQueuedCount(readQueue().length);
      if (navigator.onLine) void syncQueue();
    };
    setQueuedCount(readQueue().length);
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    window.addEventListener("nfood:sync-request", refresh);
    if (navigator.onLine) void syncQueue();
    return () => {
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
      window.removeEventListener("nfood:sync-request", refresh);
    };
  }, [queueKey, branchId, createOrder]);
  const [channel, setChannel] = useState("داخل المطعم");
  const totalCents = calculateCartCents(
    cart.map(item => ({ price: item.product.price, quantity: item.quantity }))
  );
  const total = totalCents / 100;
  const normalizedPaymentSplits = normalizePaymentSplits(paymentSplits);
  const splitRemainingCents = getPaymentSplitRemainingCents(totalCents, normalizedPaymentSplits);
  const splitIsExact = hasExactPaymentSplit(totalCents, normalizedPaymentSplits);
  const add = (product: MenuProduct) =>
    setCart(items => {
      const found = items.find(item => item.product.name === product.name);
      return found
        ? items.map(item =>
            item.product.name === product.name
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...items, { product, quantity: 1 }];
    });
  const printReceipt = () => {
    if (!lastReceipt) return;
    printBrandedReceipt(lastReceipt, receiptTemplate, {
      restaurantName: receiptBrandingQuery.data?.headerText || "NFOOD",
      headerText: receiptBrandingQuery.data?.headerText,
      footerText: receiptBrandingQuery.data?.footerText,
      logoUrl: receiptBrandingQuery.data?.logoUrl,
    });
  };
  return (
    <div>
      {lastReceipt && (
        <Card className="mb-5 overflow-hidden rounded-2xl border-emerald-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-emerald-100 bg-emerald-50/70 px-5 py-4">
            <div>
              <CardTitle className="text-base">
                إيصال الطلب #{lastReceipt.orderId}
              </CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                تم الحساب مركزيًا من الخادم
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                disabled={
                  lastReceipt.paymentStatus === "paid" ||
                  markOrderPaid.isPending
                }
                onClick={() =>
                  markOrderPaid.mutate({
                    restaurantId,
                    orderId: lastReceipt.orderId,
                  })
                }
                className="rounded-xl bg-[#e76f3c] text-xs hover:bg-[#d85f2e]"
              >
                {markOrderPaid.isPending
                  ? "جارٍ تأكيد الدفع..."
                  : lastReceipt.paymentStatus === "paid"
                    ? "تم الدفع"
                    : "تأكيد الدفع"}
              </Button>
              <select
                value={receiptTemplate}
                onChange={event =>
                  setReceiptTemplate(
                    event.target.value as "thermal" | "detailed"
                  )
                }
                aria-label="قالب الإيصال"
                className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-xs"
              >
                <option value="thermal">قالب حراري مختصر</option>
                <option value="detailed">قالب تفصيلي</option>
              </select>
              <Button
                disabled={lastReceipt.paymentStatus !== "paid"}
                onClick={printReceipt}
                className="rounded-xl bg-[#111c2e] text-xs hover:bg-[#1b2b45]"
              >
                طباعة الإيصال
              </Button>
              {lastReceipt.paymentStatus === "paid" && (
                <Button
                  variant="outline"
                  onClick={() => setRefundDialogOpen(true)}
                  className="rounded-xl border-rose-200 text-xs text-rose-700 hover:bg-rose-50"
                >
                  مرتجع
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="space-y-2">
              {lastReceipt.items.map(item => (
                <div
                  key={`${item.name}-${item.unitPrice}`}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold">
                    {money(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-slate-100 pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">قبل الخصم</span>
                <span>{money(Number(lastReceipt.pricing.subtotal))}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>
                  الخصم ({lastReceipt.pricing.discountPercent}%)
                  {lastReceipt.pricing.couponCode
                    ? ` · ${lastReceipt.pricing.couponCode}`
                    : ""}
                </span>
                <span>
                  - {money(Number(lastReceipt.pricing.discountAmount))}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>الضريبة ({lastReceipt.pricing.taxPercent}%)</span>
                <span>{money(Number(lastReceipt.pricing.taxAmount))}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-black">
                <span>الإجمالي النهائي</span>
                <span>{money(Number(lastReceipt.pricing.total))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد مرتجع الطلب #{lastReceipt?.orderId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="rounded-xl bg-rose-50 p-3 text-xs leading-6 text-rose-700">
              يتطلب المرتجع PIN مشرف POS ويتم تسجيل العملية في سجل التدقيق.
            </p>
            <Input
              value={refundPin}
              onChange={event => setRefundPin(event.target.value.replace(/\\D/g, "").slice(0, 8))}
              inputMode="numeric"
              type="password"
              placeholder="PIN المشرف (4 إلى 8 أرقام)"
              aria-label="PIN مشرف POS"
              className="rounded-xl"
            />
            <Textarea
              value={refundReason}
              onChange={event => setRefundReason(event.target.value)}
              placeholder="سبب المرتجع (اختياري)"
              aria-label="سبب المرتجع"
              className="min-h-20 rounded-xl text-xs"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRefundDialogOpen(false)} className="rounded-xl">إلغاء</Button>
              <Button
                disabled={!lastReceipt || refundPin.length < 4 || refundOrder.isPending}
                onClick={() => lastReceipt && refundOrder.mutate({ restaurantId, orderId: lastReceipt.orderId, pin: refundPin, reason: refundReason.trim() || undefined })}
                className="rounded-xl bg-rose-600 hover:bg-rose-700"
              >
                {refundOrder.isPending ? "جارٍ تسجيل المرتجع..." : "تأكيد المرتجع"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ReceiptDeliveryPanel
        restaurantId={restaurantId}
        receipt={lastReceipt}
        branding={{
          headerText: receiptBrandingQuery.data?.headerText,
          footerText: receiptBrandingQuery.data?.footerText,
          logoUrl: receiptBrandingQuery.data?.logoUrl,
          messageTemplatesJson: receiptBrandingQuery.data?.messageTemplatesJson,
          restaurantName: "NFOOD",
        }}
      />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">نقطة البيع POS</h2>
          <p className="mt-1 text-sm text-slate-500">
            أنشئ طلباً جديداً واختر القناة والطاولة ووسيلة الدفع؛ تُحفظ حالة
            الدفع غير مدفوعة حتى تأكيد مزود خارجي.
          </p>
        </div>
        <Badge
          className={`rounded-lg ${isOnline ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "bg-amber-50 text-amber-700 hover:bg-amber-50"}`}
        >
          <Activity className="ml-1 h-3.5 w-3.5" />{" "}
          {isOnline ? "متصل" : "وضع عدم الاتصال"}
          {queuedCount > 0 && ` · ${queuedCount} بانتظار المزامنة`}
        </Badge>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base">الأصناف المتاحة</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={productSearch}
                  onChange={event => setProductSearch(event.target.value)}
                  placeholder="ابحث عن صنف..."
                  aria-label="البحث عن صنف"
                  className="h-9 w-44 rounded-xl bg-slate-50 text-xs"
                />
                <div className="flex gap-2">
                  {["داخل المطعم", "استلام", "توصيل", "حجز", "فندق"].map(item => (
                    <button
                      key={item}
                      onClick={() => setChannel(item)}
                      className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold ${channel === item ? "bg-orange-50 text-[#e76f3c]" : "text-slate-400"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3 sm:p-5">
            {remoteMenu.isLoading ? (
              <div className="col-span-full rounded-2xl bg-slate-50 p-10 text-center text-sm text-slate-500">
                جارٍ تحميل الأصناف...
              </div>
            ) : remoteMenu.isError ? (
              <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700">
                تعذر تحميل الأصناف.{" "}
                <button
                  onClick={() => void remoteMenu.refetch()}
                  className="font-bold underline"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : availableProducts.length === 0 ? (
              <div className="col-span-full rounded-2xl bg-slate-50 p-10 text-center text-sm text-slate-500">
                لا توجد أصناف متاحة للبيع لهذا المطعم.
              </div>
            ) : (
              availableProducts.map(product => (
                <button
                  key={product.name}
                  onClick={() => add(product)}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 text-right transition hover:border-orange-200 hover:bg-orange-50/40 sm:rounded-2xl sm:p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">🍽</span>
                    <Plus className="h-4 w-4 text-[#e76f3c]" />
                  </div>
                  <p className="mt-4 text-sm font-bold">{product.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {money(product.price)}
                  </p>
                </button>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 px-5 py-4">
            <CardTitle className="flex items-center justify-between text-base">
              الطلب الحالي
              <span className="text-xs font-normal text-slate-400">
                {channel}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input
                value={tableName}
                onChange={event => setTableName(event.target.value)}
                placeholder="رقم الطاولة (اختياري)"
                className="rounded-xl"
              />
              <Input
                value={couponCode}
                onChange={event =>
                  setCouponCode(event.target.value.toUpperCase())
                }
                placeholder="كود الخصم (اختياري)"
                aria-label="كود الخصم"
                className="rounded-xl"
              />
              <select
                value={paymentMethod}
                onChange={event =>
                  setPaymentMethod(event.target.value as typeof paymentMethod)
                }
                aria-label="وسيلة الدفع"
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-orange-400"
              >
                <option value="cash">نقدي</option>
                <option value="card">بطاقة</option>
                <option value="bank_transfer">تحويل بنكي</option>
                <option value="online">دفع إلكتروني</option>
                <option value="other">أخرى</option>
              </select>
              <Textarea value={customerNote} onChange={event => setCustomerNote(event.target.value)} placeholder="ملاحظات العميل (اختياري)" aria-label="ملاحظات العميل" className="min-h-16 rounded-xl text-xs" />
              <Textarea value={cashierNotes} onChange={event => setCashierNotes(event.target.value)} placeholder="ملاحظات الكاشير (داخلية)" aria-label="ملاحظات الكاشير" className="min-h-16 rounded-xl text-xs" />
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-800">الدفع المجزأ</p>
                  <p className="mt-1 text-[10px] text-slate-500">قسّم الإجمالي على أكثر من وسيلة دفع مع تحقق مركزي.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-lg text-[10px]"
                  onClick={() => setPaymentSplits(current => current.length ? [] : [{ method: paymentMethod, amount: formatPaymentCents(totalCents) }])}
                >
                  {paymentSplits.length ? "إلغاء التقسيم" : "تفعيل التقسيم"}
                </Button>
              </div>
              {paymentSplits.length > 0 && (
                <div className="mt-3 space-y-2">
                  {paymentSplits.map((split, index) => (
                    <div key={`${split.method}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <select
                        value={split.method}
                        onChange={event => setPaymentSplits(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, method: event.target.value as PosPaymentMethod } : item))}
                        aria-label={`وسيلة الدفع ${index + 1}`}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-[10px]"
                      >
                        <option value="cash">نقدي</option><option value="card">بطاقة</option><option value="bank_transfer">تحويل بنكي</option><option value="online">دفع إلكتروني</option><option value="other">أخرى</option>
                      </select>
                      <Input
                        value={split.amount}
                        onChange={event => setPaymentSplits(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, amount: event.target.value.replace(/[^0-9.]/g, "").slice(0, 12) } : item))}
                        inputMode="decimal"
                        placeholder="المبلغ"
                        aria-label={`مبلغ الدفعة ${index + 1}`}
                        className="h-9 rounded-lg bg-white text-xs"
                      />
                      <Button type="button" variant="outline" className="h-9 rounded-lg px-2 text-rose-600" onClick={() => setPaymentSplits(current => current.filter((_, itemIndex) => itemIndex !== index))}>×</Button>
                    </div>
                  ))}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                    <span className={splitIsExact ? "font-bold text-emerald-700" : "font-bold text-amber-700"}>
                      {splitIsExact ? "مكتمل" : `المتبقي: ${money(splitRemainingCents / 100)}`}
                    </span>
                    <div className="flex gap-2">
                      {!splitIsExact && <Button type="button" variant="outline" className="h-7 rounded-lg px-2 text-[10px]" onClick={() => setPaymentSplits(current => [...current, { method: "cash" as PosPaymentMethod, amount: formatPaymentCents(splitRemainingCents) }].slice(0, 5))} disabled={splitRemainingCents <= 0 || paymentSplits.length >= 5}>إضافة المتبقي</Button>}
                      <Button type="button" variant="outline" className="h-7 rounded-lg px-2 text-[10px]" onClick={() => setPaymentSplits(current => current.length ? [{ ...current[0], amount: formatPaymentCents(totalCents) }, ...current.slice(1)] : current)}>تعبئة الإجمالي</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="min-h-[180px] space-y-3 sm:min-h-[220px]">
              {cart.length === 0 ? (
                <div className="flex h-[220px] flex-col items-center justify-center text-center text-slate-400">
                  <ShoppingBag className="mb-3 h-8 w-8" />
                  <p className="text-sm">السلة فارغة</p>
                  <p className="mt-1 text-xs">اختر صنفاً لإضافته للطلب</p>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.product.name}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                  >
                    <div>
                      <p className="text-xs font-bold">{item.product.name}</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {item.quantity} × {money(item.product.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCart(items =>
                            items.flatMap(current =>
                              current.product.name === item.product.name
                                ? current.quantity > 1
                                  ? [
                                      {
                                        ...current,
                                        quantity: current.quantity - 1,
                                      },
                                    ]
                                  : []
                                : [current]
                            )
                          )
                        }
                        className="rounded-md bg-white px-2 py-1 text-xs"
                      >
                        −
                      </button>
                      <span className="text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => add(item.product)}
                        className="rounded-md bg-white px-2 py-1 text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-slate-100 pt-4">
              <div className="mb-3 flex justify-between text-sm">
                <span className="text-slate-500">الإجمالي</span>
                <strong className="text-lg">{money(total)}</strong>
              </div>
              <Button
                disabled={!cart.length || !branchId || createOrder.isPending}
                onClick={submitOrder}
                className="w-full rounded-xl bg-[#e76f3c] py-5 hover:bg-[#d85f2e]"
              >
                {remoteBranches.isLoading
                  ? t("loadingBranches")
                  : !branchId
                    ? "لا يوجد فرع مرتبط"
                    : createOrder.isPending
                      ? "جارٍ حفظ الطلب..."
                      : "إرسال الطلب للمطبخ"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AccessDeniedView({ feature }: { feature: string }) {
  return (
    <Card dir="rtl" className="rounded-2xl border-amber-200 bg-amber-50 shadow-sm">
      <CardContent className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-amber-600 shadow-sm">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          403 · الوصول غير مسموح
        </h2>
        <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
          لا تملك صلاحية استخدام هذه الوحدة أو أن الميزة غير مفعّلة ضمن باقة
          مطعمك.
        </p>
        <p className="mt-2 font-mono text-[11px] text-slate-400">
          رمز الوحدة: {feature}
        </p>
      </CardContent>
    </Card>
  );
}

function SystemHealthView() {
  const [timestamp] = useState(() => Date.now());
  const health = trpc.system.health.useQuery(
    { timestamp },
    { retry: false, refetchInterval: 30000 }
  );
  const auditLogsQuery = trpc.platform.auditLogs.useQuery(undefined, {
    retry: false,
    refetchInterval: 15000,
  });
  const requestId = `health-${timestamp.toString(36)}`;
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold">صحة النظام</h2>
        <p className="mt-1 text-sm text-slate-500">
          مراقبة سريعة لحالة API وقاعدة البيانات والخدمات الأساسية.
        </p>
      </div>
      {health.isError ? (
        <Card className="rounded-2xl border-red-200 bg-red-50 shadow-sm">
          <CardContent className="p-6">
            <p className="font-bold text-red-700">تعذر فحص صحة النظام</p>
            <p className="mt-2 text-xs text-red-600">رقم الطلب: {requestId}</p>
            <Button
              onClick={() => health.refetch()}
              className="mt-4 rounded-xl bg-red-600 hover:bg-red-700"
            >
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs text-slate-500">واجهة API</p>
              <p className="mt-2 text-lg font-bold text-emerald-700">
                {health.isLoading
                  ? "جارٍ الفحص..."
                  : health.data?.api === "healthy"
                    ? "تعمل"
                    : "غير متاحة"}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs text-slate-500">قاعدة البيانات</p>
              <p className="mt-2 text-lg font-bold">
                {health.isLoading
                  ? "جارٍ الفحص..."
                  : health.data?.database === "configured"
                    ? "مهيأة"
                    : "غير متاحة"}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs text-slate-500">آخر فحص</p>
              <p className="mt-2 text-sm font-bold">
                {health.data?.checkedAt
                  ? new Date(health.data.checkedAt).toLocaleString("ar-SA-u-ca-gregory-nu-latn")
                  : "—"}
              </p>
              <p className="mt-2 text-[10px] text-slate-400">
                Request ID: {requestId}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      <Card className="mt-5 rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
          <CardTitle className="text-base">آخر أحداث التدقيق</CardTitle>
          <Button
            variant="outline"
            onClick={() => auditLogsQuery.refetch()}
            className="rounded-xl text-xs"
          >
            تحديث
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 p-5">
          {auditLogsQuery.isLoading ? (
            <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
          ) : auditLogsQuery.isError ? (
            <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              تعذر تحميل سجل التدقيق. Request ID: audit-{timestamp.toString(36)}
            </p>
          ) : (auditLogsQuery.data ?? []).length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
              لا توجد أحداث تدقيق بعد.
            </p>
          ) : (
            (auditLogsQuery.data ?? []).slice(0, 8).map(event => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{event.action}</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {event.entityType || "نظام"}{" "}
                    {event.entityId ? `#${event.entityId}` : ""} ·{" "}
                    {event.actorRole || "غير معروف"}
                  </p>
                </div>
                <div className="text-left">
                  <Badge
                    className={
                      event.outcome === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }
                  >
                    {event.outcome === "success"
                      ? "ناجح"
                      : event.outcome === "denied"
                        ? "مرفوض"
                        : "فشل"}
                  </Badge>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {new Date(event.createdAt).toLocaleString("ar-SA-u-ca-gregory-nu-latn")}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
function RestaurantRolePanel({ restaurantId }: { restaurantId: number }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const rolesQuery = trpc.platform.restaurantRoles.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const permissionsQuery = trpc.platform.restaurantPermissions.useQuery(
    undefined,
    { enabled: Boolean(user), retry: false }
  );
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>();
  const rolePermissionsQuery = trpc.platform.restaurantRolePermissions.useQuery(
    { restaurantId, roleId: selectedRoleId ?? 0 },
    { enabled: Boolean(selectedRoleId), retry: false }
  );
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(
    []
  );
  const [roleFormOpen, setRoleFormOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [pendingDeleteRoleId, setPendingDeleteRoleId] = useState<number | null>(
    null
  );
  useEffect(() => {
    setSelectedRoleId(current =>
      current && (rolesQuery.data ?? []).some(role => role.id === current)
        ? current
        : rolesQuery.data?.[0]?.id
    );
  }, [rolesQuery.data]);
  useEffect(() => {
    setSelectedPermissionIds(
      (rolePermissionsQuery.data ?? []).map(
        permission => permission.permissionId
      )
    );
  }, [rolePermissionsQuery.data]);
  const createRole = trpc.platform.createRestaurantRole.useMutation({
    onSuccess: () => {
      void utils.platform.restaurantRoles.invalidate();
      toast.success("تم إنشاء دور المطعم");
    },
    onError: error => toast.error(`تعذر إنشاء الدور: ${error.message}`),
  });
  const updateRole = trpc.platform.updateRestaurantRole.useMutation({
    onSuccess: () => {
      void utils.platform.restaurantRoles.invalidate();
      toast.success("تم تحديث دور المطعم");
    },
    onError: error => toast.error(`تعذر تحديث الدور: ${error.message}`),
  });
  const deleteRole = trpc.platform.deleteRestaurantRole.useMutation({
    onSuccess: () => {
      void utils.platform.restaurantRoles.invalidate();
      toast.success("تم حذف دور المطعم");
    },
    onError: error => toast.error(`تعذر حذف الدور: ${error.message}`),
  });
  const setPermissions = trpc.platform.setRestaurantRolePermissions.useMutation(
    {
      onSuccess: () => {
        void rolePermissionsQuery.refetch();
        toast.success("تم حفظ صلاحيات الدور");
      },
      onError: error => toast.error(`تعذر حفظ الصلاحيات: ${error.message}`),
    }
  );
  const roles = rolesQuery.data ?? [];
  return (
    <Card className="mt-5 rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">أدوار المطعم وصلاحياته</CardTitle>
        <p className="mt-1 text-xs text-slate-500">
          إدارة أدوار فريق هذا المطعم فقط مع حفظ الصلاحيات في قاعدة البيانات.
        </p>
      </CardHeader>
      <CardContent>
        {roleFormOpen && (
          <div className="mb-4 grid gap-2 rounded-2xl border border-orange-100 bg-orange-50/50 p-4 sm:grid-cols-[1fr_auto_auto]">
            <Input
              value={roleName}
              onChange={event => setRoleName(event.target.value)}
              placeholder="اسم الدور"
              className="rounded-xl bg-white"
            />
            <Button
              disabled={
                roleName.trim().length < 2 ||
                createRole.isPending ||
                updateRole.isPending
              }
              onClick={() => {
                if (editingRoleId !== null)
                  updateRole.mutate({
                    restaurantId,
                    id: editingRoleId,
                    name: roleName.trim(),
                  });
                else createRole.mutate({ restaurantId, name: roleName.trim() });
                setRoleFormOpen(false);
                setEditingRoleId(null);
                setRoleName("");
              }}
              className="rounded-xl bg-[#e76f3c]"
            >
              {createRole.isPending || updateRole.isPending
                ? "جارٍ الحفظ..."
                : editingRoleId !== null
                  ? "حفظ التعديل"
                  : "إنشاء الدور"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setRoleFormOpen(false);
                setEditingRoleId(null);
                setRoleName("");
              }}
              className="rounded-xl"
            >
              إلغاء
            </Button>
          </div>
        )}
        {rolesQuery.isError || permissionsQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            تعذر تحميل أدوار المطعم. Request ID: restaurant-roles-{restaurantId}{" "}
            <button
              onClick={() => {
                void rolesQuery.refetch();
                void permissionsQuery.refetch();
              }}
              className="font-bold underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : rolesQuery.isLoading || permissionsQuery.isLoading ? (
          <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
        ) : roles.length === 0 ? (
          <div className="space-y-3">
            <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
              لا توجد أدوار مخصصة لهذا المطعم بعد.
            </p>
            <Button
              onClick={() => {
                setEditingRoleId(null);
                setRoleName("");
                setRoleFormOpen(true);
              }}
              className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"
            >
              إنشاء أول دور
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {roles.map(role => (
                <div
                  key={role.id}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${selectedRoleId === role.id ? "border-orange-300 bg-orange-50" : "border-slate-200"}`}
                >
                  <button
                    onClick={() => setSelectedRoleId(role.id)}
                    className="font-semibold"
                  >
                    {role.name}
                  </button>
                  <button
                    onClick={() => {
                      setEditingRoleId(role.id);
                      setRoleName(role.name);
                      setRoleFormOpen(true);
                    }}
                    className="text-slate-500"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => setPendingDeleteRoleId(role.id)}
                    className="text-red-500"
                  >
                    حذف
                  </button>
                  {pendingDeleteRoleId === role.id && (
                    <span className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[10px] text-red-700">
                      <span>تأكيد؟</span>
                      <button
                        onClick={() => {
                          deleteRole.mutate({ restaurantId, id: role.id });
                          setPendingDeleteRoleId(null);
                        }}
                        className="font-bold underline"
                      >
                        نعم
                      </button>
                      <button
                        onClick={() => setPendingDeleteRoleId(null)}
                        className="font-bold underline"
                      >
                        لا
                      </button>
                    </span>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  setEditingRoleId(null);
                  setRoleName("");
                  setRoleFormOpen(true);
                }}
                className="rounded-xl text-xs"
              >
                دور جديد
              </Button>
            </div>
            {rolePermissionsQuery.isError ? (
              <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                تعذر تحميل صلاحيات الدور. Request ID:
                restaurant-role-permissions-{restaurantId}
              </p>
            ) : rolePermissionsQuery.isLoading ? (
              <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
            ) : (
              <>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(permissionsQuery.data ?? []).map(permission => (
                    <label
                      key={permission.id}
                      className="flex items-center gap-2 rounded-xl border border-slate-100 p-3 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissionIds.includes(permission.id)}
                        onChange={event =>
                          setSelectedPermissionIds(current =>
                            event.target.checked
                              ? Array.from(new Set([...current, permission.id]))
                              : current.filter(id => id !== permission.id)
                          )
                        }
                      />
                      <span>{permission.label}</span>
                    </label>
                  ))}
                </div>
                <Button
                  disabled={!selectedRoleId || setPermissions.isPending}
                  onClick={() =>
                    selectedRoleId &&
                    setPermissions.mutate({
                      restaurantId,
                      roleId: selectedRoleId,
                      permissionIds: selectedPermissionIds,
                    })
                  }
                  className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"
                >
                  {setPermissions.isPending
                    ? "جارٍ الحفظ..."
                    : "حفظ صلاحيات الدور"}
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SecurityView({ restaurantId }: { restaurantId?: number }) {
  const sessionsQuery = trpc.security.sessions.useQuery(undefined, {
    retry: false,
  });
  const securityQuery = trpc.security.security.useQuery(undefined, {
    retry: false,
  });
  const utils = trpc.useUtils();
  const revokeAll = trpc.security.revokeAllSessions.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل الخروج من جميع الأجهزة");
      sessionsQuery.refetch();
    },
  });
  const setTwoFactor = trpc.security.setTwoFactor.useMutation({
    onSuccess: result => {
      toast.success(result.enabled ? "تم تفعيل 2FA" : "تم تعطيل 2FA");
      utils.security.security.invalidate();
    },
  });
  const twoFactorEnabled = securityQuery.data?.twoFactorEnabled ?? false;
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold">أمان الحساب والجلسات</h2>
        <p className="mt-1 text-sm text-slate-500">
          إدارة الأجهزة المسجلة وخيارات الحماية من داخل الحساب.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
            <CardTitle className="text-base">الأجهزة والجلسات</CardTitle>
            <Button
              variant="outline"
              onClick={() => revokeAll.mutate()}
              disabled={revokeAll.isPending}
              className="rounded-xl text-xs text-red-600"
            >
              تسجيل الخروج من الجميع
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {sessionsQuery.isLoading ? (
              <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ) : (sessionsQuery.data ?? []).length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                لا توجد جلسات محفوظة.
              </p>
            ) : (
              (sessionsQuery.data ?? []).map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {session.deviceLabel || "جهاز غير معروف"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {session.ipAddress || "IP غير متاح"} · آخر نشاط{" "}
                      {new Date(session.lastSeenAt).toLocaleString("ar-SA-u-ca-gregory-nu-latn")}
                    </p>
                  </div>
                  <Badge
                    className={
                      session.revokedAt
                        ? "bg-slate-100 text-slate-500"
                        : "bg-emerald-50 text-emerald-700"
                    }
                  >
                    {session.revokedAt ? "منتهية" : "نشطة"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">التحقق بخطوتين</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-5 text-sm leading-6 text-slate-500">
              أضف طبقة حماية إضافية للحساب. تفعيل 2FA هنا محفوظ فعليًا ويمكن
              ربطه بمزود OTP في المرحلة التالية.
            </p>
            <Button
              onClick={() =>
                setTwoFactor.mutate({ enabled: !twoFactorEnabled })
              }
              disabled={setTwoFactor.isPending}
              className={`w-full rounded-xl ${twoFactorEnabled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#e76f3c] hover:bg-[#d85f2e]"}`}
            >
              {twoFactorEnabled ? "2FA مفعّل — تعطيل" : "تفعيل 2FA"}
            </Button>
          </CardContent>
        </Card>
      </div>
      {restaurantId ? (
        <RestaurantRolePanel restaurantId={restaurantId} />
      ) : null}
    </div>
  );
}

function SectionHeading({
  title,
  description,
  action,
  onAction,
}: {
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action && onAction ? (
        <Button
          onClick={onAction}
          className="gap-2 rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"
        >
          <Plus className="h-4 w-4" /> {action}
        </Button>
      ) : null}
    </div>
  );
}

function SeatingSectionsPanel({ restaurantId }: { restaurantId: number }) {
  const utils = trpc.useUtils();
  const [branchId, setBranchId] = useState("");
  const [name, setName] = useState("");
  const [seatingType, setSeatingType] = useState<"indoor" | "outdoor">(
    "indoor"
  );
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const validBranchId = Number(branchId) > 0 ? Number(branchId) : 0;
  const sections = trpc.platform.seatingSections.useQuery(
    { restaurantId, branchId: validBranchId },
    { enabled: validBranchId > 0, retry: false }
  );
  const create = trpc.platform.createSeatingSection.useMutation({
    onSuccess: () => {
      void sections.refetch();
      toast.success("تمت إضافة قسم الجلسات");
    },
    onError: error => toast.error(`تعذر حفظ القسم: ${error.message}`),
  });
  const update = trpc.platform.updateSeatingSection.useMutation({
    onSuccess: () => {
      void sections.refetch();
      toast.success("تم تحديث قسم الجلسات");
    },
    onError: error => toast.error(`تعذر تحديث القسم: ${error.message}`),
  });
  const defaults = [
    {
      name: "خارجي مدخنين",
      seatingType: "outdoor" as const,
      smokingAllowed: true,
    },
    {
      name: "خارجي غير مدخنين",
      seatingType: "outdoor" as const,
      smokingAllowed: false,
    },
    {
      name: "داخلي مدخنين",
      seatingType: "indoor" as const,
      smokingAllowed: true,
    },
    {
      name: "داخلي غير مدخنين",
      seatingType: "indoor" as const,
      smokingAllowed: false,
    },
  ];
  const addDefaultSections = async () => {
    if (!validBranchId) {
      toast.error("أدخل رقم الفرع أولًا");
      return;
    }
    const existingNames = new Set(
      (sections.data ?? []).map(section => section.name)
    );
    const missing = defaults.filter(item => !existingNames.has(item.name));
    if (!missing.length) {
      toast.info("الأقسام الأساسية موجودة بالفعل");
      return;
    }
    await Promise.all(
      missing.map(item =>
        create.mutateAsync({ restaurantId, branchId: validBranchId, ...item })
      )
    );
    void sections.refetch();
  };
  return (
    <Card className="mb-4 rounded-2xl border-violet-100 bg-violet-50/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">أقسام الجلسات</CardTitle>
        <p className="text-xs leading-6 text-slate-500">
          حدد القسم الذي يريده العميل في الحجز. الأقسام الأربعة الأساسية قابلة
          للتعديل ويمكن إضافة أقسام أخرى.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-[120px_1fr_130px_auto]">
          <Input
            value={branchId}
            onChange={event => setBranchId(event.target.value)}
            inputMode="numeric"
            placeholder="رقم الفرع"
            className="rounded-xl bg-white"
          />
          <Input
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="اسم قسم مخصص"
            className="rounded-xl bg-white"
          />
          <select
            value={seatingType}
            onChange={event =>
              setSeatingType(event.target.value as "indoor" | "outdoor")
            }
            className="rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="indoor">داخلي</option>
            <option value="outdoor">خارجي</option>
          </select>
          <Button
            type="button"
            disabled={
              create.isPending || validBranchId < 1 || name.trim().length < 2
            }
            onClick={() =>
              create.mutate({
                restaurantId,
                branchId: validBranchId,
                name: name.trim(),
                seatingType,
                smokingAllowed,
              })
            }
            className="rounded-xl bg-violet-600 hover:bg-violet-700"
          >
            إضافة
          </Button>
        </div>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <input
            type="checkbox"
            checked={smokingAllowed}
            onChange={event => setSmokingAllowed(event.target.checked)}
          />
          قسم مدخنين
        </label>
        <Button
          type="button"
          variant="outline"
          disabled={create.isPending || validBranchId < 1}
          onClick={() => void addDefaultSections()}
          className="rounded-xl border-violet-200 bg-white text-violet-700"
        >
          تهيئة الأقسام الأربعة الأساسية
        </Button>
        {validBranchId > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {sections.isLoading ? (
              <p className="text-xs text-slate-400">جارٍ تحميل الأقسام...</p>
            ) : sections.isError ? (
              <p className="text-xs text-red-600">
                تعذر تحميل الأقسام. Request ID: seating-sections-{restaurantId}-
                {validBranchId}
              </p>
            ) : (sections.data ?? []).length === 0 ? (
              <p className="text-xs text-slate-400">
                لا توجد أقسام لهذا الفرع.
              </p>
            ) : (
              (sections.data ?? []).map(section => (
                <div
                  key={section.id}
                  className={`flex items-center justify-between rounded-xl border bg-white p-3 ${section.isActive ? "border-emerald-200" : "border-slate-200 opacity-60"}`}
                >
                  <div>
                    <p className="text-sm font-black text-slate-800">
                      {section.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {section.seatingType === "indoor" ? "داخلي" : "خارجي"} ·{" "}
                      {section.smokingAllowed ? "مدخنين" : "غير مدخنين"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      update.mutate({
                        restaurantId,
                        id: section.id,
                        name: section.name,
                        seatingType: section.seatingType,
                        smokingAllowed: section.smokingAllowed,
                        isActive: !section.isActive,
                      })
                    }
                    className="rounded-lg text-xs"
                  >
                    {section.isActive ? "تعطيل" : "تفعيل"}
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TablesView({ restaurantId, branchId, onOpenQrTables }: { restaurantId: number; branchId?: number; onOpenQrTables?: () => void }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [tableFormOpen, setTableFormOpen] = useState(false);
  const [tableBranchId, setTableBranchId] = useState("");
  const [tableName, setTableName] = useState("");
  const [tableSeats, setTableSeats] = useState("2");
  const [tableType, setTableType] = useState("standard");
  const [minimumCharge, setMinimumCharge] = useState("0");
  const [tableFee, setTableFee] = useState("0");
  const [tableFilter, setTableFilter] = useState<TableFilter>("all");
  const [tableSort, setTableSort] = useState<TableSort>("name");
  const [tableSearch, setTableSearch] = useState("");
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [quickCustomerName, setQuickCustomerName] = useState("");
  const [quickPartySize, setQuickPartySize] = useState("2");
  const [quickReservedFor, setQuickReservedFor] = useState(() => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16));
  const remoteReservations = trpc.platform.reservations.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const remoteTables = trpc.platform.tables.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const remoteBranches = trpc.platform.branches.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const selectedTableBranchId = Number(tableBranchId) > 0 ? Number(tableBranchId) : Number(branchId ?? 0);
  const tableSections = trpc.platform.seatingSections.useQuery(
    { restaurantId, branchId: selectedTableBranchId },
    { enabled: selectedTableBranchId > 0, retry: false }
  );
  const selectedTableBranch = (remoteBranches.data ?? []).find(branch => branch.id === selectedTableBranchId);
  const remoteOrders = trpc.platform.orders.useQuery(
    { branchId: Number(branchId ?? 0), restaurantId },
    { enabled: Boolean(user) && Boolean(branchId), retry: false }
  );
  const createReservation = trpc.platform.createReservation.useMutation({
    onSuccess: () => {
      void utils.platform.reservations.invalidate();
      void utils.platform.tables.invalidate();
      setQuickCustomerName("");
      toast.success("تم تعيين الحجز للطاولة");
    },
    onError: error => toast.error(`تعذر تعيين الحجز: ${error.message}`),
  });
  const createTable = trpc.platform.createTable.useMutation({
    onSuccess: () => {
      void utils.platform.tables.invalidate();
      toast.success("تمت إضافة الطاولة");
    },
    onError: error => toast.error(`تعذر إضافة الطاولة: ${error.message}`),
  });
  const updateTableFee = trpc.platform.updateBranchTableFee.useMutation({
    onSuccess: () => {
      void utils.platform.branches.invalidate();
      toast.success("تم حفظ الرسوم الثابتة للطاولات");
    },
    onError: error => toast.error(`تعذر حفظ الرسوم الثابتة: ${error.message}`),
  });
  const updateTable = trpc.platform.updateTableStatus.useMutation({
    onSuccess: () => {
      void utils.platform.tables.invalidate();
      toast.success("تم تحديث حالة الطاولة");
    },
    onError: error => toast.error(`تعذر تحديث الطاولة: ${error.message}`),
  });
  const deleteTable = trpc.platform.deleteTable.useMutation({
    onSuccess: () => {
      void utils.platform.tables.invalidate();
      toast.success("تم حذف الطاولة");
    },
    onError: error => toast.error(`تعذر حذف الطاولة: ${error.message}`),
  });
  const tables = remoteTables.data ?? [];
  const reservations = remoteReservations.data ?? [];
  const seatingSections = tableSections.data ?? [];
  useEffect(() => {
    if (branchId && !tableBranchId) setTableBranchId(String(branchId));
  }, [branchId, tableBranchId]);
  useEffect(() => {
    if (selectedTableBranch?.defaultTableFee !== undefined && tableFee === "0") {
      setTableFee(String(selectedTableBranch.defaultTableFee ?? "0"));
    }
  }, [selectedTableBranch?.defaultTableFee, tableFee]);
  const visibleTables = useMemo(
    () => getVisibleTables(tables, reservations, tableFilter, tableSort).filter(table => {
      const query = tableSearch.trim().toLocaleLowerCase("ar");
      return !query || table.name.toLocaleLowerCase("ar").includes(query) || String(table.id).includes(query);
    }),
    [reservations, tableFilter, tableSort, tableSearch, tables]
  );
  const selectedTable = tables.find(table => table.id === selectedTableId) ?? null;
  const selectedReservations = selectedTable ? reservations.filter(reservation => reservation.assignedTableId === selectedTable.id) : [];
  const currentOrder = selectedTable ? (remoteOrders.data ?? []).find(order => order.tableName === selectedTable.name && !["completed", "cancelled"].includes(order.status)) : null;
  return (
    <div>
      <SectionHeading
        title="إدارة الطاولات"
        description="حالة الطاولات محفوظة في قاعدة البيانات مع عزل المطعم."
        action="إضافة طاولة"
              onAction={() => {
                if (branchId) setTableBranchId(String(branchId));
                setTableFormOpen(value => !value);
              }}
      />
      {onOpenQrTables && (
        <Card className="mb-4 rounded-2xl border-cyan-200 bg-cyan-50/70 dark:border-cyan-900/60 dark:bg-cyan-950/20">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-2"><QrCode className="h-4 w-4 text-cyan-700 dark:text-cyan-300" /><div><p className="text-sm font-black text-slate-900 dark:text-white">تخصيص QR للطاولات</p><p className="text-[11px] text-slate-600 dark:text-slate-400">اختر أرقام الطاولات واطبع رموزها من دون البحث داخل إعدادات المنيو.</p></div></div>
            <Button type="button" onClick={onOpenQrTables} className="h-9 gap-2 rounded-xl bg-cyan-600 px-4 text-xs font-black text-white hover:bg-cyan-500"><QrCode className="h-3.5 w-3.5" />فتح تخصيص الطاولات</Button>
          </CardContent>
        </Card>
      )}
      <SeatingSectionsPanel restaurantId={restaurantId} />
      {tableFormOpen && (
        <Card className="mb-4 rounded-2xl border-orange-100 bg-orange-50/40">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[140px_1fr_130px_150px_130px_130px_auto]">
            <Input
              value={selectedTableBranchId > 0 ? String(selectedTableBranchId) : ""}
              readOnly
              aria-label="الفرع المحدد تلقائيًا"
              placeholder="الفرع المحدد"
              className="rounded-xl bg-slate-100 text-slate-600"
            />
            <Input
              value={tableName}
              onChange={event => setTableName(event.target.value)}
              placeholder="اسم الطاولة"
              className="rounded-xl bg-white"
            />
            <Input
              value={tableSeats}
              onChange={event => setTableSeats(event.target.value)}
              inputMode="numeric"
              placeholder="عدد المقاعد"
              className="rounded-xl bg-white"
            />
            <select
              value={tableType}
              onChange={event => {
                const section = seatingSections.find(item => item.name === event.target.value);
                setTableType(event.target.value);
              }}
              aria-label="قسم الطاولة المحفوظ"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              <option value="standard">اختر القسم المحفوظ</option>
              {seatingSections.map(section => <option key={section.id} value={section.name}>{section.name}</option>)}
            </select>
            <Input
              value={minimumCharge}
              onChange={event => setMinimumCharge(event.target.value)}
              inputMode="decimal"
              placeholder="الحد الأدنى"
              className="rounded-xl bg-white"
            />
            <Input
              value={tableFee}
              onChange={event => setTableFee(event.target.value)}
              inputMode="decimal"
              placeholder="الرسوم الثابتة للطاولات"
              aria-label="الرسوم الثابتة للطاولات"
              className="rounded-xl bg-white"
            />
            <Button
              type="button"
              variant="outline"
              disabled={updateTableFee.isPending || selectedTableBranchId < 1 || !Number.isFinite(Number(tableFee)) || Number(tableFee) < 0}
              onClick={() => updateTableFee.mutate({ restaurantId, branchId: selectedTableBranchId, defaultTableFee: Number(tableFee) || 0 })}
              className="rounded-xl border-orange-200 text-orange-700"
            >{updateTableFee.isPending ? "جارٍ حفظ الرسم..." : "حفظ الرسم الثابت"}</Button>
            <Button
              disabled={
                createTable.isPending ||
                !Number.isInteger(Number(tableBranchId)) ||
                Number(tableBranchId) < 1 ||
                tableName.trim().length < 1 ||
                !Number.isInteger(Number(tableSeats)) ||
                Number(tableSeats) < 1 ||
                !Number.isFinite(Number(minimumCharge)) || Number(minimumCharge) < 0 ||
                !Number.isFinite(Number(tableFee)) || Number(tableFee) < 0
              }
              onClick={() =>
                createTable.mutate({
                  restaurantId,
                  branchId: Number(tableBranchId),
                  name: tableName.trim(),
                  seats: Number(tableSeats),
                  tableType: tableType.trim() || "standard",
                  seatingSectionId: seatingSections.find(section => section.name === tableType)?.id ?? null,
                  minimumCharge: Number(minimumCharge) || 0,
                  tableFee: Number(tableFee) || 0,
                })
              }
              className="rounded-xl bg-[#e76f3c]"
            >
              {createTable.isPending ? "جارٍ الحفظ..." : "حفظ الطاولة"}
            </Button>
          </CardContent>
        </Card>
      )}
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-slate-700">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-orange-500" />
            <span className="hidden sm:inline">تصفية وترتيب الطاولات</span>
            <Badge variant="secondary" className="shrink-0 rounded-full text-[10px]">{visibleTables.length} ظاهرة</Badge>
            <div className="relative min-w-0 flex-1 sm:w-48">
              <Search className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
              <Input aria-label="البحث عن طاولة" value={tableSearch} onChange={event => setTableSearch(event.target.value)} placeholder="ابحث بالاسم أو الرقم" className="h-8 rounded-lg border-slate-200 pr-7 text-[11px]" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select aria-label="تصفية الطاولات" value={tableFilter} onChange={event => setTableFilter(event.target.value as TableFilter)} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700">
              <option value="all">كل الطاولات</option>
              <option value="available">متاحة</option>
              <option value="occupied">مشغولة</option>
              <option value="reserved">محجوزة</option>
              <option value="auto_cancelled">إلغاء تلقائي حديث</option>
            </select>
            <select aria-label="ترتيب الطاولات" value={tableSort} onChange={event => setTableSort(event.target.value as TableSort)} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700">
              <option value="name">حسب الاسم</option>
              <option value="seats">الأكثر مقاعد</option>
              <option value="minimumCharge">الأعلى حدًا أدنى</option>
            </select>
            <ArrowDownAZ className="hidden h-4 w-4 text-slate-400 sm:block" />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {remoteTables.isError ? (
            <div className="col-span-full p-6 text-sm text-red-600">
              تعذر تحميل الطاولات. Request ID: tables-{restaurantId}{" "}
              <button
                onClick={() => void remoteTables.refetch()}
                className="font-bold underline"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : remoteTables.isLoading ? (
            <div className="col-span-full p-6 text-center text-sm text-slate-400">
              جارٍ تحميل الطاولات...
            </div>
          ) : tables.length === 0 ? (
            <div className="col-span-full p-8 text-center text-sm text-slate-400">
              لا توجد طاولات محفوظة لهذا المطعم.
            </div>
          ) : visibleTables.length === 0 ? (
            <div className="col-span-full p-8 text-center text-sm text-slate-400">لا توجد طاولات مطابقة للتصفية الحالية.</div>
          ) : (
            visibleTables.map(table => {
              const occupied = table.status === "occupied";
              const recentlyAutoCancelled = hasRecentAutoCancellation(table.id, reservations);
              return (
                <div
                  key={table.id}
                  tabIndex={0}
                  onClick={() => {
                    setSelectedTableId(table.id);
                    setTableDialogOpen(true);
                  }}
                  className={`group relative flex aspect-square flex-col items-center justify-center rounded-3xl border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${recentlyAutoCancelled ? "border-amber-400 bg-amber-50 text-amber-800 shadow-[0_0_0_3px_rgba(245,158,11,0.15)]" : occupied ? "border-orange-200 bg-orange-50 text-orange-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
                >
                  <Table2 className="mb-2 h-7 w-7" />
                  <span className="text-sm font-bold">{table.name}</span>
                  <span className="mt-1 text-[10px]">{table.tableType} · {table.seats} مقاعد</span>
                  <span className="mt-1 text-[10px]">حد أدنى {table.minimumCharge ?? "0.00"} · رسوم {table.tableFee ?? "0.00"}</span>
                  <span className="mt-1 text-[10px]">
                    {occupied
                      ? "مشغولة"
                      : table.status === "reserved"
                        ? "محجوزة"
                        : "متاحة"}
                  </span>
                  {recentlyAutoCancelled && (
                    <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-[9px] font-bold text-white animate-pulse">
                      <AlertTriangle className="h-3 w-3" /> أُلغي تلقائيًا مؤخرًا
                    </span>
                  )}
                  {occupied && !recentlyAutoCancelled && (
                    <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-orange-500" />
                  )}
                  <div className="pointer-events-none absolute inset-x-2 top-12 z-10 rounded-2xl border border-slate-200 bg-white/95 p-3 text-right text-[10px] text-slate-700 opacity-0 shadow-xl transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                    <p className="font-black text-slate-900">ملخص الرسوم</p>
                    <p className="mt-1">الإكرامية: تُطبق حسب إعدادات المطعم</p>
                    <p>رسوم الخدمة: تُطبق حسب إعدادات المطعم</p>
                    <p className="mt-1 font-bold text-orange-600">حد أدنى {table.minimumCharge ?? "0.00"} · رسوم طاولة {table.tableFee ?? "0.00"}</p>
                  </div>
                  <div className="absolute bottom-3 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={event => {
                        event.stopPropagation();
                        updateTable.mutate({ restaurantId, tableId: table.id, status: occupied ? "available" : "occupied" });
                      }}
                      className="rounded-md bg-slate-900/90 px-2 py-1 text-[10px] text-white"
                    >
                      {occupied ? "إتاحة" : "إشغال"}
                    </button>
                    <button
                      type="button"
                      onClick={event => {
                        event.stopPropagation();
                        setSelectedTableId(table.id);
                        setTableDialogOpen(true);
                      }}
                      className="rounded-md bg-orange-500 px-2 py-1 text-[10px] text-white"
                    >
                      حجز جديد
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={event => {
                      event.stopPropagation();
                      deleteTable.mutate({ restaurantId, tableId: table.id });
                    }}
                    className="absolute left-3 top-3 rounded-md bg-white/80 px-2 py-1 text-[10px] text-red-500"
                  >
                    حذف
                  </button>
                </div>
              );
            })
          )}
        </CardContent>
                </Card>
      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent dir="rtl" className="max-h-[88vh] max-w-2xl overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Table2 className="h-5 w-5 text-orange-500" />
              {selectedTable ? `تفاصيل ${selectedTable.name}` : "تفاصيل الطاولة"}
            </DialogTitle>
          </DialogHeader>
          {selectedTable && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="rounded-2xl border-slate-200 bg-slate-50/70">
                <CardContent className="space-y-2 p-4 text-sm">
                  <p className="font-black text-slate-900">الطلب الحالي</p>
                  {currentOrder ? (
                    <>
                      <p>رقم الطلب: <strong>#{currentOrder.id}</strong></p>
                      <p>الحالة: <strong>{currentOrder.status}</strong></p>
                      <p>الإجمالي: <strong>{currentOrder.total} {currentOrder.currencyCode ?? "SAR"}</strong></p>
                    </>
                  ) : <p className="text-xs text-slate-500">لا يوجد طلب نشط مرتبط بهذه الطاولة.</p>}
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-200 bg-white">
                <CardContent className="space-y-2 p-4 text-sm">
                  <p className="font-black text-slate-900">تعيين حجز جديد</p>
                  <Input value={quickCustomerName} onChange={event => setQuickCustomerName(event.target.value)} placeholder="اسم العميل" className="rounded-xl" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={quickPartySize} onChange={event => setQuickPartySize(event.target.value)} inputMode="numeric" placeholder="عدد الأشخاص" className="rounded-xl" />
                    <Input value={quickReservedFor} onChange={event => setQuickReservedFor(event.target.value)} type="datetime-local" className="rounded-xl text-xs" />
                  </div>
                  <Button type="button" disabled={createReservation.isPending || quickCustomerName.trim().length < 2} onClick={() => createReservation.mutate({ restaurantId, branchId: selectedTable.branchId, assignedTableId: selectedTable.id, customerName: quickCustomerName.trim(), partySize: Number(quickPartySize) || 1, reservedFor: new Date(quickReservedFor), durationMinutes: 60 })} className="w-full rounded-xl bg-orange-500 text-white">
                    {createReservation.isPending ? "جارٍ التعيين..." : "تعيين الحجز على هذه الطاولة"}
                  </Button>
                </CardContent>
              </Card>
              <Card className="sm:col-span-2 rounded-2xl border-slate-200 bg-white">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-black text-slate-900">سجل الحجوزات</p>
                    <Badge variant="secondary" className="rounded-full text-[10px]">{selectedReservations.length} حجز</Badge>
                  </div>
                  {selectedReservations.length === 0 ? <p className="text-xs text-slate-500">لا يوجد سجل حجوزات لهذه الطاولة.</p> : <div className="space-y-2">{selectedReservations.slice(0, 12).map(reservation => <div key={reservation.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs"><span><strong>{reservation.customerName}</strong><span className="mr-2 text-slate-500">{new Date(reservation.reservedFor).toLocaleString("ar-SA-u-ca-gregory-nu-latn")}</span></span><Badge className={`rounded-full text-[10px] ${reservation.noShowNotifiedAt ? "bg-amber-500" : "bg-slate-200 text-slate-700"}`}>{reservation.noShowNotifiedAt ? "إلغاء تلقائي" : reservation.status}</Badge></div>)}</div>}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InventoryView({ restaurantId }: { restaurantId: number }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [inventoryFormOpen, setInventoryFormOpen] = useState(false);
  const [purchaseFormOpen, setPurchaseFormOpen] = useState(false);
  const [inventoryName, setInventoryName] = useState("");
  const [inventoryUnit, setInventoryUnit] = useState("كجم");
  const [inventoryQuantity, setInventoryQuantity] = useState("0");
  const [inventoryMinimum, setInventoryMinimum] = useState("0");
  const [purchaseSupplier, setPurchaseSupplier] = useState("");
  const [purchaseTotal, setPurchaseTotal] = useState("");
  const [editingInventoryId, setEditingInventoryId] = useState<number | null>(
    null
  );
  const [editingInventoryName, setEditingInventoryName] = useState("");
  const [editingInventoryUnit, setEditingInventoryUnit] = useState("");
  const [editingInventoryMinimum, setEditingInventoryMinimum] = useState("0");
  const [editingPurchaseId, setEditingPurchaseId] = useState<number | null>(
    null
  );
  const [editingPurchaseSupplier, setEditingPurchaseSupplier] = useState("");
  const [editingPurchaseTotal, setEditingPurchaseTotal] = useState("");
  const [editingPurchaseStatus, setEditingPurchaseStatus] = useState<
    "draft" | "received" | "cancelled"
  >("received");
  const remoteInventory = trpc.platform.inventory.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const remotePurchases = trpc.platform.purchases.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const createInventoryItem = trpc.platform.createInventoryItem.useMutation({
    onSuccess: () => {
      void utils.platform.inventory.invalidate();
      toast.success("تمت إضافة مادة المخزون");
    },
    onError: error => toast.error(`تعذر إضافة المادة: ${error.message}`),
  });
  const updateInventoryItem = trpc.platform.updateInventoryItem.useMutation({
    onSuccess: () => {
      void utils.platform.inventory.invalidate();
      toast.success("تم تحديث الكمية");
    },
    onError: error => toast.error(`تعذر تحديث المخزون: ${error.message}`),
  });
  const deleteInventoryItem = trpc.platform.deleteInventoryItem.useMutation({
    onSuccess: () => {
      void utils.platform.inventory.invalidate();
      toast.success("تم حذف مادة المخزون");
    },
    onError: error => toast.error(`تعذر حذف المادة: ${error.message}`),
  });
  const createPurchase = trpc.platform.createPurchase.useMutation({
    onSuccess: () => {
      void utils.platform.purchases.invalidate();
      toast.success("تم تسجيل الشراء");
    },
    onError: error => toast.error(`تعذر تسجيل الشراء: ${error.message}`),
  });
  const updatePurchase = trpc.platform.updatePurchase.useMutation({
    onSuccess: () => {
      void utils.platform.purchases.invalidate();
      toast.success("تم تحديث الشراء");
    },
    onError: error => toast.error(`تعذر تحديث الشراء: ${error.message}`),
  });
  const deletePurchase = trpc.platform.deletePurchase.useMutation({
    onSuccess: () => {
      void utils.platform.purchases.invalidate();
      toast.success("تم حذف الشراء");
    },
    onError: error => toast.error(`تعذر حذف الشراء: ${error.message}`),
  });
  const items = (remoteInventory.data ?? []).map(item => ({
    id: item.id,
    name: item.name,
    quantity: Number(item.quantity),
    unit: item.unit,
    minimum: Number(item.minimumQuantity),
  }));
  const lowStockCount = items.filter(
    item => item.quantity < item.minimum
  ).length;
  const totalUnits = items
    .reduce((sum, item) => sum + item.quantity, 0)
    .toLocaleString("ar-SA-u-ca-gregory-nu-latn");
  const purchaseCount = remotePurchases.data?.length ?? 0;
  return (
    <div className="space-y-3">
      <CompactModuleSummary
        metrics={[
          {
            label: "مواد المخزون",
            value: items.length,
            hint: "مسجلة في الفرع",
            icon: Package,
            tone: "orange",
          },
          {
            label: "تحتاج إعادة طلب",
            value: lowStockCount,
            hint: "تنبيهات المخزون",
            icon: TrendingDown,
            tone: "violet",
          },
          {
            label: "الوحدات المتاحة",
            value: totalUnits,
            hint: "إجمالي الكميات",
            icon: Package,
            tone: "blue",
          },
          {
            label: "عمليات الشراء",
            value: purchaseCount,
            hint: "في سجل المشتريات",
            icon: WalletCards,
            tone: "emerald",
          },
        ]}
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <SectionHeading
          title="المخزون والمشتريات"
          description="بيانات المخزون تُقرأ من قاعدة البيانات مع عزل المطعم."
          action="إضافة مادة"
          onAction={() => setInventoryFormOpen(value => !value)}
        />
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => setPurchaseFormOpen(value => !value)}
        >
          تسجيل شراء
        </Button>
      </div>
      {inventoryFormOpen && (
        <Card className="mb-4 rounded-2xl border-orange-100 bg-orange-50/40">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_130px_150px_150px_auto]">
            <Input
              value={inventoryName}
              onChange={event => setInventoryName(event.target.value)}
              placeholder="اسم المادة"
              className="rounded-xl bg-white"
            />
            <Input
              value={inventoryUnit}
              onChange={event => setInventoryUnit(event.target.value)}
              placeholder="الوحدة"
              className="rounded-xl bg-white"
            />
            <Input
              value={inventoryQuantity}
              onChange={event => setInventoryQuantity(event.target.value)}
              inputMode="decimal"
              placeholder="الكمية الحالية"
              className="rounded-xl bg-white"
            />
            <Input
              value={inventoryMinimum}
              onChange={event => setInventoryMinimum(event.target.value)}
              inputMode="decimal"
              placeholder="الحد الأدنى"
              className="rounded-xl bg-white"
            />
            <Button
              disabled={
                createInventoryItem.isPending ||
                inventoryName.trim().length < 1 ||
                inventoryUnit.trim().length < 1 ||
                !/^\d+(\.\d{1,2})?$/.test(inventoryQuantity) ||
                !/^\d+(\.\d{1,2})?$/.test(inventoryMinimum)
              }
              onClick={() =>
                createInventoryItem.mutate({
                  restaurantId,
                  name: inventoryName.trim(),
                  unit: inventoryUnit.trim(),
                  quantity: inventoryQuantity,
                  minimumQuantity: inventoryMinimum,
                })
              }
              className="rounded-xl bg-[#e76f3c]"
            >
              {createInventoryItem.isPending ? "جارٍ الحفظ..." : "حفظ المادة"}
            </Button>
          </CardContent>
        </Card>
      )}
      {purchaseFormOpen && (
        <Card className="mb-4 rounded-2xl border-slate-200 bg-slate-50">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_180px_auto]">
            <Input
              value={purchaseSupplier}
              onChange={event => setPurchaseSupplier(event.target.value)}
              placeholder="اسم المورد"
              className="rounded-xl bg-white"
            />
            <Input
              value={purchaseTotal}
              onChange={event => setPurchaseTotal(event.target.value)}
              inputMode="decimal"
              placeholder="إجمالي الشراء"
              className="rounded-xl bg-white"
            />
            <Button
              disabled={
                createPurchase.isPending ||
                purchaseSupplier.trim().length < 1 ||
                !/^\d+(\.\d{1,2})?$/.test(purchaseTotal)
              }
              onClick={() =>
                createPurchase.mutate({
                  restaurantId,
                  supplier: purchaseSupplier.trim(),
                  total: purchaseTotal,
                  status: "received",
                })
              }
              className="rounded-xl bg-[#111c2e]"
            >
              {createPurchase.isPending ? "جارٍ الحفظ..." : "حفظ الشراء"}
            </Button>
          </CardContent>
        </Card>
      )}
      {editingInventoryId !== null && (
        <Card className="mb-4 rounded-2xl border-slate-200 bg-slate-50">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_130px_150px_auto]">
            <Input
              value={editingInventoryName}
              onChange={event => setEditingInventoryName(event.target.value)}
              placeholder="اسم المادة"
              className="rounded-xl bg-white"
            />
            <Input
              value={editingInventoryUnit}
              onChange={event => setEditingInventoryUnit(event.target.value)}
              placeholder="الوحدة"
              className="rounded-xl bg-white"
            />
            <Input
              value={editingInventoryMinimum}
              onChange={event => setEditingInventoryMinimum(event.target.value)}
              inputMode="decimal"
              placeholder="الحد الأدنى"
              className="rounded-xl bg-white"
            />
            <div className="flex gap-2">
              <Button
                disabled={
                  updateInventoryItem.isPending ||
                  editingInventoryName.trim().length < 1 ||
                  editingInventoryUnit.trim().length < 1 ||
                  !/^\d+(\.\d{1,2})?$/.test(editingInventoryMinimum)
                }
                onClick={() => {
                  updateInventoryItem.mutate({
                    restaurantId,
                    id: editingInventoryId,
                    name: editingInventoryName.trim(),
                    unit: editingInventoryUnit.trim(),
                    minimumQuantity: editingInventoryMinimum,
                  });
                  setEditingInventoryId(null);
                }}
                className="rounded-xl bg-[#111c2e]"
              >
                حفظ التعديل
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingInventoryId(null)}
                className="rounded-xl"
              >
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {editingPurchaseId !== null && (
        <Card className="mb-4 rounded-2xl border-slate-200 bg-slate-50">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_180px_150px_auto]">
            <Input
              value={editingPurchaseSupplier}
              onChange={event => setEditingPurchaseSupplier(event.target.value)}
              placeholder="اسم المورد"
              className="rounded-xl bg-white"
            />
            <Input
              value={editingPurchaseTotal}
              onChange={event => setEditingPurchaseTotal(event.target.value)}
              inputMode="decimal"
              placeholder="الإجمالي"
              className="rounded-xl bg-white"
            />
            <select
              value={editingPurchaseStatus}
              onChange={event =>
                setEditingPurchaseStatus(
                  event.target.value as typeof editingPurchaseStatus
                )
              }
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="draft">مسودة</option>
              <option value="received">مستلم</option>
              <option value="cancelled">ملغى</option>
            </select>
            <div className="flex gap-2">
              <Button
                disabled={
                  updatePurchase.isPending ||
                  editingPurchaseSupplier.trim().length < 1 ||
                  !/^\d+(\.\d{1,2})?$/.test(editingPurchaseTotal)
                }
                onClick={() => {
                  updatePurchase.mutate({
                    restaurantId,
                    id: editingPurchaseId,
                    supplier: editingPurchaseSupplier.trim(),
                    total: editingPurchaseTotal,
                    status: editingPurchaseStatus,
                  });
                  setEditingPurchaseId(null);
                }}
                className="rounded-xl bg-[#111c2e]"
              >
                حفظ
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingPurchaseId(null)}
                className="rounded-xl"
              >
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">قيمة المخزون التقديرية</p>
            <p className="mt-2 text-2xl font-bold">
              {remoteInventory.isLoading ? "..." : `${items.length} مادة`}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">أصناف منخفضة</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {items.filter(item => item.quantity < item.minimum).length}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">آخر عملية شراء</p>
            <p className="mt-2 text-lg font-bold">
              {remotePurchases.isLoading
                ? "جارٍ التحميل"
                : remotePurchases.data?.length
                  ? `آخر شراء #${remotePurchases.data[0].id}`
                  : "لا توجد مشتريات"}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          {remoteInventory.isError ? (
            <div className="p-6 text-sm text-red-600">
              تعذر تحميل المخزون. Request ID: inventory-{restaurantId}{" "}
              <button
                onClick={() => void remoteInventory.refetch()}
                className="font-bold underline"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : remoteInventory.isLoading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              جارٍ تحميل المخزون...
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">
              لا توجد مواد مخزنة بعد.
            </div>
          ) : (
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3">المادة</th>
                  <th className="px-5 py-3">الكمية الحالية</th>
                  <th className="px-5 py-3">الحد الأدنى</th>
                  <th className="px-5 py-3">الحالة</th>
                  <th className="px-5 py-3">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const low = item.quantity < item.minimum;
                  return (
                    <tr key={item.name} className="border-t border-slate-100">
                      <td className="px-5 py-4 font-semibold">{item.name}</td>
                      <td className="px-5 py-4">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {item.minimum} {item.unit}
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className={`rounded-lg text-[11px] ${low ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
                        >
                          {low ? "يحتاج إعادة طلب" : "مستقر"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingInventoryId(item.id);
                              setEditingInventoryName(item.name);
                              setEditingInventoryUnit(item.unit);
                              setEditingInventoryMinimum(String(item.minimum));
                            }}
                            className="text-xs font-semibold text-slate-600"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() =>
                              updateInventoryItem.mutate({
                                restaurantId,
                                id: item.id,
                                quantity: (item.quantity + 10).toFixed(2),
                              })
                            }
                            className="text-xs font-semibold text-[#e76f3c]"
                          >
                            + إضافة كمية
                          </button>
                          <button
                            onClick={() =>
                              deleteInventoryItem.mutate({
                                restaurantId,
                                id: item.id,
                              })
                            }
                            className="text-xs font-semibold text-red-500"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      <Card className="mt-5 rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">سجل المشتريات</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {remotePurchases.isError ? (
            <div className="p-6 text-sm text-red-600">
              تعذر تحميل المشتريات. Request ID: purchases-{restaurantId}{" "}
              <button
                onClick={() => void remotePurchases.refetch()}
                className="font-bold underline"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : remotePurchases.isLoading ? (
            <div className="p-8 text-center text-sm text-slate-400">
              جارٍ تحميل المشتريات...
            </div>
          ) : (remotePurchases.data ?? []).length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              لا توجد مشتريات محفوظة بعد.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-5 py-3">المورد</th>
                    <th className="px-5 py-3">الإجمالي</th>
                    <th className="px-5 py-3">الحالة</th>
                    <th className="px-5 py-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {(remotePurchases.data ?? []).map(purchase => (
                    <tr key={purchase.id} className="border-t border-slate-100">
                      <td className="px-5 py-4 font-semibold">
                        {purchase.supplier}
                      </td>
                      <td className="px-5 py-4">{purchase.total} SAR</td>
                      <td className="px-5 py-4">{purchase.status}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingPurchaseId(purchase.id);
                              setEditingPurchaseSupplier(purchase.supplier);
                              setEditingPurchaseTotal(String(purchase.total));
                              setEditingPurchaseStatus(
                                purchase.status as typeof editingPurchaseStatus
                              );
                            }}
                            className="text-xs font-semibold text-slate-600"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => {
                              setEditingPurchaseId(purchase.id);
                              setEditingPurchaseSupplier(purchase.supplier);
                              setEditingPurchaseTotal(String(purchase.total));
                              setEditingPurchaseStatus(
                                purchase.status as typeof editingPurchaseStatus
                              );
                            }}
                            className="text-xs font-semibold text-[#e76f3c]"
                          >
                            تحديث الحالة
                          </button>
                          <button
                            onClick={() =>
                              deletePurchase.mutate({
                                restaurantId,
                                id: purchase.id,
                              })
                            }
                            className="text-xs font-semibold text-red-500"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TeamView({ restaurantId }: { restaurantId: number }) {
  const { user } = useAuth();
  const [pendingDeleteEmployeeId, setPendingDeleteEmployeeId] = useState<
    number | null
  >(null);
  const utils = trpc.useUtils();
  const [employeeFormOpen, setEmployeeFormOpen] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [employeeRole, setEmployeeRole] = useState<
    "waiter" | "kitchen" | "cashier" | "driver" | "manager" | "host"
  >("waiter");
  const [employeeBranchId, setEmployeeBranchId] = useState("");
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(
    null
  );
  const remoteEmployees = trpc.platform.employees.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const employeeLimit = trpc.platform.employeeLimit.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const attendanceQuery = trpc.platform.attendanceByRestaurant.useQuery(
    { restaurantId, workDate: new Date().toISOString().slice(0, 10) },
    { enabled: Boolean(user), retry: false }
  );
  const createEmployee = trpc.platform.createEmployee.useMutation({
    onSuccess: () => {
      void utils.platform.employees.invalidate();
      void employeeLimit.refetch();
      toast.success("تمت إضافة الموظف");
    },
    onError: error => toast.error(`تعذر إضافة الموظف: ${error.message}`),
  });
  const updateEmployee = trpc.platform.updateEmployee.useMutation({
    onSuccess: () => {
      void utils.platform.employees.invalidate();
      toast.success("تم تحديث الموظف");
    },
    onError: error => toast.error(`تعذر تحديث الموظف: ${error.message}`),
  });
  const deleteEmployee = trpc.platform.deleteEmployee.useMutation({
    onSuccess: () => {
      void utils.platform.employees.invalidate();
      toast.success("تم حذف الموظف");
    },
    onError: error => toast.error(`تعذر حذف الموظف: ${error.message}`),
  });
  const recordAttendance = trpc.platform.recordAttendance.useMutation({
    onSuccess: () => toast.success("تم تسجيل حضور اليوم"),
    onError: error => toast.error(`تعذر تسجيل الحضور: ${error.message}`),
  });
  const staff = remoteEmployees.data ?? [];
  const todayAttendance = attendanceQuery.data ?? [];
  return (
    <div>
      <SectionHeading
        title="الموظفون والحضور"
        description="بيانات الموظفين محفوظة في قاعدة البيانات مع عزل المطعم."
        action="إضافة موظف"
        onAction={() => {
          if (employeeLimit.data && !employeeLimit.data.canCreate) {
            toast.error(
              `تم بلوغ حد الموظفين في باقة ${employeeLimit.data.plan ?? "الحالية"}. قم بترقية الباقة لإضافة النادل أو السائق.`
            );
            return;
          }
          setEmployeeFormOpen(value => !value);
        }}
      />
      {employeeFormOpen && (
        <Card className="mb-4 rounded-2xl border-orange-100 bg-orange-50/40">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_180px_150px_auto]">
            <Input
              value={employeeName}
              onChange={event => setEmployeeName(event.target.value)}
              placeholder="اسم الموظف"
              className="rounded-xl bg-white"
            />
            <select
              value={employeeRole}
              onChange={event =>
                setEmployeeRole(event.target.value as typeof employeeRole)
              }
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="waiter">نادل</option>
              <option value="kitchen">مطبخ</option>
              <option value="cashier">كاشير</option>
              <option value="driver">سائق</option>
              <option value="manager">مدير</option>
              <option value="host">استقبال</option>
            </select>
            <Input
              value={employeeBranchId}
              onChange={event => setEmployeeBranchId(event.target.value)}
              inputMode="numeric"
              placeholder="رقم الفرع اختياري"
              className="rounded-xl bg-white"
            />
            <Button
              disabled={
                createEmployee.isPending ||
                employeeName.trim().length < 2 ||
                (employeeBranchId.trim() !== "" &&
                  (!Number.isInteger(Number(employeeBranchId)) ||
                    Number(employeeBranchId) < 1))
              }
              onClick={() =>
                createEmployee.mutate({
                  restaurantId,
                  branchId: employeeBranchId.trim()
                    ? Number(employeeBranchId)
                    : null,
                  name: employeeName.trim(),
                  role: employeeRole,
                  status: "active",
                })
              }
              className="rounded-xl bg-[#e76f3c]"
            >
              {createEmployee.isPending ? "جارٍ الحفظ..." : "حفظ الموظف"}
            </Button>
          </CardContent>
        </Card>
      )}
      <Card className="mb-4 rounded-2xl border-orange-100 bg-orange-50/50 shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">
              حصة الموظفين حسب الباقة
            </p>
            <p className="mt-1 text-xs text-slate-500">
              تشمل النادل والسائق والكاشير والمطبخ وبقية فريق المطعم.
            </p>
          </div>
          {employeeLimit.isLoading ? (
            <span className="text-xs text-slate-500">جارٍ حساب الحد...</span>
          ) : employeeLimit.isError ? (
            <span className="text-xs text-red-600">
              تعذر تحميل حد الموظفين. Request ID: employee-limit-{restaurantId}
            </span>
          ) : (
            <div className="rounded-xl bg-white px-4 py-2 text-center">
              <span className="text-lg font-bold text-[#e76f3c]">
                {employeeLimit.data?.used ?? 0}
              </span>
              <span className="mx-1 text-xs text-slate-400">/</span>
              <span className="text-sm font-semibold text-slate-700">
                {employeeLimit.data?.limit === null
                  ? "غير محدود"
                  : (employeeLimit.data?.limit ?? 0)}
              </span>
              <p className="text-[10px] text-slate-400">
                {employeeLimit.data?.plan
                  ? `باقة ${employeeLimit.data.plan}`
                  : "الحد الافتراضي"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
        <span className="font-semibold">حضور اليوم: </span>
        {attendanceQuery.isLoading ? (
          "جارٍ تحميل سجل الحضور..."
        ) : attendanceQuery.isError ? (
          <span className="text-red-600">
            تعذر تحميل السجل. Request ID: attendance-{restaurantId}{" "}
            <button
              onClick={() => void attendanceQuery.refetch()}
              className="font-bold underline"
            >
              إعادة المحاولة
            </button>
          </span>
        ) : (
          `${todayAttendance.filter(item => item.status === "present").length} حاضر · ${todayAttendance.filter(item => item.status === "late").length} متأخر · ${todayAttendance.filter(item => item.status === "absent").length} غائب`
        )}
      </div>
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="grid gap-3 p-5 md:grid-cols-2">
          {remoteEmployees.isError ? (
            <div className="p-6 text-sm text-red-600">
              تعذر تحميل الموظفين. Request ID: employees-{restaurantId}{" "}
              <button
                onClick={() => void remoteEmployees.refetch()}
                className="font-bold underline"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : remoteEmployees.isLoading ? (
            <div className="col-span-full p-8 text-center text-sm text-slate-400">
              جارٍ تحميل الموظفين...
            </div>
          ) : staff.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              لا يوجد موظفون محفوظون بعد.
            </div>
          ) : (
            staff.map(member => (
              <div
                key={member.name}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111c2e] text-sm font-bold text-white">
                  {member.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{member.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{member.role}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingEmployeeId(member.id);
                    setEmployeeName(member.name);
                    setEmployeeRole(member.role as typeof employeeRole);
                    setEmployeeBranchId(
                      member.branchId ? String(member.branchId) : ""
                    );
                  }}
                  className="text-xs font-semibold text-[#e76f3c]"
                >
                  تعديل
                </button>
                {editingEmployeeId === member.id && (
                  <div className="absolute inset-x-4 bottom-14 z-10 grid gap-2 rounded-xl border border-orange-100 bg-white p-3 shadow-lg">
                    <Input
                      value={employeeName}
                      onChange={event => setEmployeeName(event.target.value)}
                      placeholder="اسم الموظف"
                      className="h-9 rounded-lg text-xs"
                    />
                    <select
                      value={employeeRole}
                      onChange={event =>
                        setEmployeeRole(
                          event.target.value as typeof employeeRole
                        )
                      }
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs"
                    >
                      <option value="waiter">نادل</option>
                      <option value="kitchen">مطبخ</option>
                      <option value="cashier">كاشير</option>
                      <option value="driver">سائق</option>
                      <option value="manager">مدير</option>
                      <option value="host">استقبال</option>
                    </select>
                    <Input
                      value={employeeBranchId}
                      onChange={event =>
                        setEmployeeBranchId(event.target.value)
                      }
                      placeholder="رقم الفرع"
                      inputMode="numeric"
                      className="h-9 rounded-lg text-xs"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={
                          updateEmployee.isPending ||
                          employeeName.trim().length < 2 ||
                          (employeeBranchId.trim() !== "" &&
                            (!Number.isInteger(Number(employeeBranchId)) ||
                              Number(employeeBranchId) < 1))
                        }
                        onClick={() => {
                          updateEmployee.mutate({
                            restaurantId,
                            id: member.id,
                            branchId: employeeBranchId.trim()
                              ? Number(employeeBranchId)
                              : undefined,
                            name: employeeName.trim(),
                            role: employeeRole,
                          });
                          setEditingEmployeeId(null);
                        }}
                        className="h-8 flex-1 rounded-lg text-xs"
                      >
                        حفظ
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingEmployeeId(null)}
                        className="h-8 rounded-lg text-xs"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                )}
                <button
                  onClick={() =>
                    updateEmployee.mutate({
                      restaurantId,
                      id: member.id,
                      status:
                        member.status === "active" ? "inactive" : "active",
                    })
                  }
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${member.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                >
                  {member.status === "active" ? "نشط" : "غير نشط"}
                </button>
                <button
                  onClick={() =>
                    recordAttendance.mutate({
                      restaurantId,
                      employeeId: member.id,
                      workDate: new Date().toISOString().slice(0, 10),
                      status: "present",
                    })
                  }
                  className="text-xs font-semibold text-emerald-600"
                >
                  حضور اليوم
                </button>
                <button
                  onClick={() => setPendingDeleteEmployeeId(member.id)}
                  className="text-xs font-semibold text-red-500"
                >
                  حذف
                </button>
                {pendingDeleteEmployeeId === member.id && (
                  <span className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[10px] text-red-700">
                    <span>تأكيد؟</span>
                    <button
                      onClick={() => {
                        deleteEmployee.mutate({ restaurantId, id: member.id });
                        setPendingDeleteEmployeeId(null);
                      }}
                      className="font-bold underline"
                    >
                      نعم
                    </button>
                    <button
                      onClick={() => setPendingDeleteEmployeeId(null)}
                      className="font-bold underline"
                    >
                      لا
                    </button>
                  </span>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MarketingView({ restaurantId }: { restaurantId: number }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [campaignFormOpen, setCampaignFormOpen] = useState(false);
  const [couponFormOpen, setCouponFormOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignKind, setCampaignKind] = useState<
    "birthday" | "reengagement" | "general"
  >("general");
  const [reengagementDays, setReengagementDays] = useState("30");
  const [couponCampaignId, setCouponCampaignId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("10");
  const [couponUsageLimit, setCouponUsageLimit] = useState("");
  const [editingCouponId, setEditingCouponId] = useState<number | null>(null);
  const [campaignCron, setCampaignCron] = useState("0 0 9 * * *");
  const remoteCampaigns = trpc.platform.campaigns.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const audiencePreview = trpc.platform.campaignAudiencePreview.useQuery(
    {
      restaurantId,
      kind: campaignKind,
      reengagementDays:
        campaignKind === "reengagement" ? Number(reengagementDays) : undefined,
    },
    {
      enabled: Boolean(
        user &&
          campaignFormOpen &&
          (campaignKind !== "reengagement" || Number(reengagementDays) >= 1)
      ),
      retry: false,
    }
  );
  const remoteCoupons = trpc.platform.coupons.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const createCampaign = trpc.platform.createCampaign.useMutation({
    onSuccess: () => {
      void utils.platform.campaigns.invalidate();
      toast.success("تم إنشاء الحملة");
    },
    onError: error => toast.error(`تعذر إنشاء الحملة: ${error.message}`),
  });
  const scheduleCampaign = trpc.platform.scheduleCampaign.useMutation({
    onSuccess: () => {
      void utils.platform.campaigns.invalidate();
      toast.success("تم حفظ جدولة الحملة");
    },
    onError: error => toast.error(`تعذر جدولة الحملة: ${error.message}`),
  });
  const updateCampaign = trpc.platform.updateCampaign.useMutation({
    onSuccess: () => {
      void utils.platform.campaigns.invalidate();
      toast.success("تم تحديث الحملة");
    },
    onError: error => toast.error(`تعذر تحديث الحملة: ${error.message}`),
  });
  const deleteCampaign = trpc.platform.deleteCampaign.useMutation({
    onSuccess: () => {
      void utils.platform.campaigns.invalidate();
      toast.success("تم حذف الحملة");
    },
    onError: error => toast.error(`تعذر حذف الحملة: ${error.message}`),
  });
  const createCoupon = trpc.platform.createCoupon.useMutation({
    onSuccess: () => {
      void utils.platform.coupons.invalidate();
      toast.success("تم إنشاء الكوبون");
    },
    onError: error => toast.error(`تعذر إنشاء الكوبون: ${error.message}`),
  });
  const updateCoupon = trpc.platform.updateCoupon.useMutation({
    onSuccess: () => {
      void utils.platform.coupons.invalidate();
      toast.success("تم تحديث الكوبون");
    },
    onError: error => toast.error(`تعذر تحديث الكوبون: ${error.message}`),
  });
  const deleteCoupon = trpc.platform.deleteCoupon.useMutation({
    onSuccess: () => {
      void utils.platform.coupons.invalidate();
      toast.success("تم حذف الكوبون");
    },
    onError: error => toast.error(`تعذر حذف الكوبون: ${error.message}`),
  });
  const campaigns = remoteCampaigns.data ?? [];
  const coupons = remoteCoupons.data ?? [];
  return (
    <div>
      <SectionHeading
        title="التسويق والحملات"
        description="الحملات محفوظة في قاعدة البيانات مع عزل المطعم."
        action="حملة جديدة"
        onAction={() => setCampaignFormOpen(value => !value)}
      />
      {campaignFormOpen && (
        <Card className="mb-5 rounded-2xl border-violet-100 bg-violet-50/40">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_180px_150px_auto]">
            <Input
              value={campaignName}
              onChange={event => setCampaignName(event.target.value)}
              placeholder="اسم الحملة"
              className="rounded-xl bg-white"
            />
            <select
              value={campaignKind}
              onChange={event =>
                setCampaignKind(event.target.value as typeof campaignKind)
              }
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="general">عامة</option>
              <option value="birthday">أعياد الميلاد</option>
              <option value="reengagement">إعادة تفاعل</option>
            </select>
            <Input
              value={reengagementDays}
              onChange={event => setReengagementDays(event.target.value)}
              disabled={campaignKind !== "reengagement"}
              inputMode="numeric"
              placeholder="أيام الخمول"
              className="rounded-xl bg-white"
            />
            <Button
              disabled={
                createCampaign.isPending ||
                campaignName.trim().length < 2 ||
                (campaignKind === "reengagement" &&
                  Number(reengagementDays) < 1)
              }
              onClick={() =>
                createCampaign.mutate({
                  restaurantId,
                  name: campaignName.trim(),
                  kind: campaignKind,
                  reengagementDays:
                    campaignKind === "reengagement"
                      ? Number(reengagementDays)
                      : undefined,
                  status: "draft",
                })
              }
              className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"
            >
              {createCampaign.isPending ? "جارٍ الحفظ..." : "حفظ الحملة"}
            </Button>
            <p className="sm:col-span-4 text-xs text-slate-500">
              {audiencePreview.isLoading
                ? "جارٍ حساب الجمهور..."
                : audiencePreview.isError
                  ? "تعذر حساب الجمهور الآن."
                  : `الجمهور المتوقع: ${audiencePreview.data?.count ?? 0} عميل · الإرسال متوقف حتى إعداد مزود الرسائل من لوحة الإعدادات.`}
            </p>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {remoteCampaigns.isError ? (
          <div className="p-6 text-sm text-red-600">
            تعذر تحميل الحملات. Request ID: campaigns-{restaurantId}{" "}
            <button
              onClick={() => void remoteCampaigns.refetch()}
              className="font-bold underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : remoteCampaigns.isLoading ? (
          <div className="col-span-full p-8 text-center text-sm text-slate-400">
            جارٍ تحميل الحملات...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            لا توجد حملات محفوظة بعد.
          </div>
        ) : (
          campaigns.map(campaign => (
            <Card
              key={campaign.id}
              className="rounded-2xl border-slate-200 bg-white shadow-sm"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-lg border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"
                  >
                    {campaign.status}
                  </Badge>
                </div>
                <h3 className="mt-5 font-bold">{campaign.name}</h3>
                <p className="mt-2 inline-block rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                  #{campaign.id} ·{" "}
                  {campaign.kind === "birthday"
                    ? "ميلاد"
                    : campaign.kind === "reengagement"
                      ? `استرجاع بعد ${campaign.reengagementDays ?? 30} يومًا`
                      : "عامة"}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="text-slate-500">الحالة</span>
                  <div className="flex gap-2">
                    <select
                      value={campaign.status}
                      onChange={event =>
                        updateCampaign.mutate({
                          restaurantId,
                          id: campaign.id,
                          status: event.target.value as
                            | "draft"
                            | "scheduled"
                            | "active"
                            | "ended",
                        })
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-[#e76f3c]"
                    >
                      <option value="draft">مسودة</option>
                      <option value="scheduled">مجدولة</option>
                      <option value="active">نشطة</option>
                      <option value="ended">منتهية</option>
                    </select>
                    <div className="flex items-center gap-1">
                      <Input
                        value={campaignCron}
                        onChange={event => setCampaignCron(event.target.value)}
                        aria-label="جدول Cron للحملة"
                        className="h-8 w-36 rounded-lg text-[10px]"
                      />
                      <button
                        onClick={() =>
                          scheduleCampaign.mutate({
                            restaurantId,
                            id: campaign.id,
                            cron: campaignCron.trim(),
                          })
                        }
                        disabled={
                          scheduleCampaign.isPending ||
                          campaignCron.trim().split(/\s+/).length !== 6
                        }
                        className="font-semibold text-sky-600 disabled:opacity-50"
                      >
                        جدولة
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        deleteCampaign.mutate({ restaurantId, id: campaign.id })
                      }
                      className="font-semibold text-red-500"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <Card className="mt-5 rounded-2xl border-slate-200 bg-white shadow-sm">
        {couponFormOpen && (
          <CardContent className="grid gap-3 border-b border-slate-100 bg-orange-50/40 p-4 sm:grid-cols-[180px_1fr_150px_150px_auto]">
            <select
              value={couponCampaignId}
              onChange={event => setCouponCampaignId(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">اختر الحملة</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
            <Input
              value={couponCode}
              onChange={event =>
                setCouponCode(event.target.value.toUpperCase())
              }
              placeholder="رمز الكوبون"
              className="rounded-xl bg-white"
            />
            <Input
              value={couponDiscount}
              onChange={event => setCouponDiscount(event.target.value)}
              inputMode="numeric"
              placeholder="الخصم %"
              className="rounded-xl bg-white"
            />
            <Input
              value={couponUsageLimit}
              onChange={event => setCouponUsageLimit(event.target.value)}
              inputMode="numeric"
              placeholder="حد الاستخدام"
              className="rounded-xl bg-white"
            />
            <Button
              disabled={
                createCoupon.isPending ||
                !couponCampaignId ||
                couponCode.trim().length < 2 ||
                Number(couponDiscount) < 0 ||
                Number(couponDiscount) > 100
              }
              onClick={() =>
                editingCouponId !== null
                  ? updateCoupon.mutate({
                      restaurantId,
                      id: editingCouponId,
                      code: couponCode.trim(),
                      discountPercent: Number(couponDiscount),
                      usageLimit: couponUsageLimit
                        ? Number(couponUsageLimit)
                        : null,
                    })
                  : createCoupon.mutate({
                      restaurantId,
                      campaignId: Number(couponCampaignId),
                      code: couponCode.trim(),
                      discountPercent: Number(couponDiscount),
                      usageLimit: couponUsageLimit
                        ? Number(couponUsageLimit)
                        : null,
                    })
              }
              className="rounded-xl bg-[#111c2e]"
            >
              {createCoupon.isPending || updateCoupon.isPending
                ? "جارٍ الحفظ..."
                : editingCouponId !== null
                  ? "حفظ تعديل الكوبون"
                  : "حفظ الكوبون"}
            </Button>
          </CardContent>
        )}
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">الكوبونات</CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              الكوبونات مرتبطة بحملات هذا المطعم وتُحفظ في قاعدة البيانات.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setCouponFormOpen(value => !value)}
            className="rounded-xl bg-[#e76f3c] text-xs"
          >
            كوبون جديد
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {remoteCoupons.isError ? (
            <div className="p-6 text-sm text-red-600">
              تعذر تحميل الكوبونات. Request ID: coupons-{restaurantId}{" "}
              <button
                onClick={() => void remoteCoupons.refetch()}
                className="font-bold underline"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : remoteCoupons.isLoading ? (
            <div className="p-8 text-center text-sm text-slate-400">
              جارٍ تحميل الكوبونات...
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              لا توجد كوبونات محفوظة بعد.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {coupons.map(coupon => (
                <div
                  key={coupon.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                >
                  <div>
                    <p className="font-mono text-sm font-bold">{coupon.code}</p>
                    <p className="text-xs text-slate-500">
                      خصم {coupon.discountPercent}% · مستخدم {coupon.usedCount}
                      {coupon.usageLimit ? ` من ${coupon.usageLimit}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCouponId(coupon.id);
                        setCouponCampaignId(String(coupon.campaignId));
                        setCouponCode(coupon.code);
                        setCouponDiscount(String(coupon.discountPercent));
                        setCouponUsageLimit(
                          coupon.usageLimit ? String(coupon.usageLimit) : ""
                        );
                        setCouponFormOpen(true);
                      }}
                      className="text-xs font-semibold text-[#e76f3c]"
                    >
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        deleteCoupon.mutate({ restaurantId, id: coupon.id })
                      }
                      className="text-xs font-semibold text-red-500"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type PackageFeatureLink = {
  planId: number;
  featureId: number;
  enabled: boolean;
  featureLimit: number | null;
  key: string;
};
type PackagePlanRecord = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  planType: "free" | "monthly" | "yearly" | "trial" | "enterprise";
  monthlyPrice: string;
  yearlyPrice: string;
  isActive: boolean;
  features: PackageFeatureLink[];
};

function PackagePlanCard({
  plan,
  definitions,
  onSaved,
}: {
  plan: PackagePlanRecord;
  definitions: Array<{
    id: number;
    key: string;
    label: string;
    defaultLimit: number | null;
  }>;
  onSaved: () => void;
}) {
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description ?? "");
  const [planType, setPlanType] = useState(plan.planType ?? "monthly");
  const [monthlyPrice, setMonthlyPrice] = useState(plan.monthlyPrice);
  const [yearlyPrice, setYearlyPrice] = useState(plan.yearlyPrice);
  const [isActive, setIsActive] = useState(plan.isActive);
  const [isOpen, setIsOpen] = useState(false);
  const isRecommended = ["growth", "pro", "business"].includes(
    plan.key.toLowerCase()
  );
  const [limits, setLimits] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      plan.features.map(feature => [
        feature.key,
        feature.featureLimit === null ? "" : String(feature.featureLimit),
      ])
    )
  );
  const update = trpc.admin.updatePackagePlan.useMutation({
    onSuccess: () => {
      onSaved();
      toast.success(`تم تحديث باقة ${name}`);
    },
    onError: error => toast.error(`تعذر تحديث الباقة: ${error.message}`),
  });
  const setFeature = trpc.admin.setPackagePlanFeature.useMutation({
    onSuccess: onSaved,
    onError: error => toast.error(`تعذر تحديث ميزة الباقة: ${error.message}`),
  });
  const links = new Map(plan.features.map(feature => [feature.key, feature]));
  const enabledCount = definitions.filter(
    definition => links.get(definition.key)?.enabled === true
  ).length;
  const savePlan = (
    input: Extract<
      AdminOfflineOperation,
      { procedure: "admin.updatePackagePlan" }
    >["input"]
  ) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      enqueueAdminOfflineOperation(localStorage, {
        procedure: "admin.updatePackagePlan",
        input,
      });
      window.dispatchEvent(new Event("nfood:admin-queue-changed"));
      toast.info("تم حفظ بيانات الباقة محليًا وستتم مزامنتها عند عودة الاتصال");
      return;
    }
    update.mutate(input);
  };
  const saveFeature = (
    input: Extract<
      AdminOfflineOperation,
      { procedure: "admin.setPackagePlanFeature" }
    >["input"]
  ) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      enqueueAdminOfflineOperation(localStorage, {
        procedure: "admin.setPackagePlanFeature",
        input,
      });
      window.dispatchEvent(new Event("nfood:admin-queue-changed"));
      toast.info("تم حفظ ربط الميزة محليًا وستتم مزامنته عند عودة الاتصال");
      return;
    }
    setFeature.mutate(input);
  };
  const savePlanChanges = () =>
    savePlan({
      id: plan.id,
      name: name.trim(),
      description: description.trim() || null,
      planType,
      monthlyPrice: monthlyPrice.trim() || "0",
      yearlyPrice: yearlyPrice.trim() || "0",
      isActive,
    });
  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-0">
        <div className="flex items-center gap-3 p-4">
          <button
            type="button"
            onClick={() => setIsOpen(value => !value)}
            aria-expanded={isOpen}
            className="flex min-w-0 flex-1 items-center gap-3 text-right transition-transform duration-200 ease-out active:scale-[0.99]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
              <Package className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-mono text-[10px] text-slate-400">
                {plan.key}
              </span>
              <span className="mt-1 block truncate text-base font-black text-slate-900">
                {plan.name}
              </span>
              {isRecommended && (
                <span className="shrink-0 rounded-full bg-orange-100 px-2 py-1 text-[10px] font-black text-orange-700">
                  الأكثر شيوعًا
                </span>
              )}
            </span>
            <span className="mr-auto flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600">
                {enabledCount}/{definitions.length} مميزة
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              const nextIsActive = !isActive;
              setIsActive(nextIsActive);
              savePlan({ id: plan.id, isActive: nextIsActive });
            }}
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black transition-transform duration-150 active:scale-95 ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}
          >
            {isActive ? "نشطة" : "متوقفة"}
          </button>
        </div>
      </CardHeader>
      <div
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder="اسم الباقة"
                className="rounded-xl"
              />
              <Input
                value={description}
                onChange={event => setDescription(event.target.value)}
                placeholder="وصف الباقة"
                className="rounded-xl"
              />
              <select
                value={planType}
                onChange={event =>
                  setPlanType(event.target.value as typeof planType)
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="free">مجانية</option>
                <option value="monthly">شهرية</option>
                <option value="yearly">سنوية</option>
                <option value="trial">تجريبية</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <Input
                value={monthlyPrice}
                onChange={event => setMonthlyPrice(event.target.value)}
                placeholder="السعر الشهري"
                inputMode="decimal"
                className="rounded-xl"
              />
              <Input
                value={yearlyPrice}
                onChange={event => setYearlyPrice(event.target.value)}
                placeholder="السعر السنوي"
                inputMode="decimal"
              />
            </div>
            <Button
              type="button"
              disabled={update.isPending || name.trim().length < 2}
              onClick={savePlanChanges}
              className="rounded-xl bg-[#111c2e] text-xs"
            >
              {update.isPending ? "جارٍ الحفظ..." : "حفظ بيانات الباقة"}
            </Button>
            <div className="grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
              {definitions.map(definition => {
                const link = links.get(definition.key);
                const enabled = link?.enabled === true;
                const limit =
                  limits[definition.key] ??
                  (link?.featureLimit === null || !link
                    ? ""
                    : String(link.featureLimit));
                return (
                  <div
                    key={definition.id}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${enabled ? "border-emerald-200 bg-emerald-50/60" : "border-slate-100 bg-slate-50"}`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        saveFeature({
                          planId: plan.id,
                          featureId: definition.id,
                          enabled: !enabled,
                          featureLimit: limit === "" ? null : Number(limit),
                        })
                      }
                      className={`flex min-w-0 flex-1 items-center gap-2 text-right text-xs font-bold ${enabled ? "text-emerald-800" : "text-slate-500"}`}
                    >
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 ${enabled ? "text-emerald-600" : "text-slate-300"}`}
                      />
                      {definition.label}
                    </button>
                    <Input
                      aria-label={`حد ${plan.name} - ${definition.label}`}
                      value={limit}
                      onChange={event =>
                        setLimits(current => ({
                          ...current,
                          [definition.key]: event.target.value.replace(
                            /[^0-9]/g,
                            ""
                          ),
                        }))
                      }
                      onBlur={() =>
                        saveFeature({
                          planId: plan.id,
                          featureId: definition.id,
                          enabled,
                          featureLimit: limit === "" ? null : Number(limit),
                        })
                      }
                      placeholder={
                        definition.defaultLimit === null
                          ? "∞"
                          : String(definition.defaultLimit)
                      }
                      inputMode="numeric"
                      className="h-8 w-20 rounded-lg bg-white text-center text-[11px]"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
function PackagePlansAdminPanel() {
  const utils = trpc.useUtils();
  const query = trpc.admin.packagePlans.useQuery(undefined, { retry: false });
  const definitionsQuery = trpc.admin.featureDefinitions.useQuery(undefined, {
    retry: false,
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("0");
  const [yearlyPrice, setYearlyPrice] = useState("0");
  const create = trpc.admin.createPackagePlan.useMutation({
    onSuccess: () => {
      void query.refetch();
      setCreateOpen(false);
      setKey("");
      setName("");
      setDescription("");
      setMonthlyPrice("0");
      setYearlyPrice("0");
      toast.success("تم إنشاء الباقة");
    },
    onError: error => toast.error(`تعذر إنشاء الباقة: ${error.message}`),
  });
  const receiptsQuery = trpc.admin.subscriptionTransferReceipts.useQuery(
    undefined,
    { retry: false }
  );
  const reviewReceipt =
    trpc.admin.reviewSubscriptionTransferReceipt.useMutation({
      onSuccess: () => {
        void receiptsQuery.refetch();
        toast.success("تم تحديث حالة إيصال التحويل");
      },
      onError: error => toast.error(`تعذر تحديث الإيصال: ${error.message}`),
    });
  const definitions = definitionsQuery.data ?? [];
  const plans = (query.data ?? []) as PackagePlanRecord[];
  return (
    <Card className="mt-6 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-l from-cyan-50 via-white to-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-xl bg-cyan-100 p-2 text-cyan-700">
                <Package className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-[11px] font-black text-cyan-800">
                محرر الباقات
              </span>
            </div>
            <CardTitle className="text-base">
              الباقات وربط المميزات والحدود
            </CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              أنشئ باقة مستقلة، ثم فعّل الوحدات وحدد حدًا خاصًا لكل ميزة. لا
              يتأثر Nasser Cafe إلا إذا غُيّرت خطته أو Override الخاص به.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setCreateOpen(value => !value)}
            className="rounded-xl bg-cyan-700 text-xs hover:bg-cyan-800"
          >
            {createOpen ? "إغلاق" : "باقة جديدة"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        {createOpen && (
          <div className="grid gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4 sm:grid-cols-2">
            <Input
              value={key}
              onChange={event =>
                setKey(
                  event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "")
                )
              }
              placeholder="المفتاح مثل pro_plus"
              className="rounded-xl bg-white"
            />
            <Input
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="اسم الباقة"
              className="rounded-xl bg-white"
            />
            <Input
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder="وصف الباقة"
              className="rounded-xl bg-white"
            />
            <Input
              value={monthlyPrice}
              onChange={event => setMonthlyPrice(event.target.value)}
              placeholder="السعر الشهري"
              inputMode="decimal"
              className="rounded-xl bg-white"
            />
            <Input
              value={yearlyPrice}
              onChange={event => setYearlyPrice(event.target.value)}
              placeholder="السعر السنوي"
              inputMode="decimal"
              className="rounded-xl bg-white"
            />
            <Button
              type="button"
              disabled={
                create.isPending || key.length < 2 || name.trim().length < 2
              }
              onClick={() =>
                create.mutate({
                  key,
                  name: name.trim(),
                  description: description.trim() || undefined,
                  monthlyPrice: monthlyPrice || "0",
                  yearlyPrice: yearlyPrice || "0",
                })
              }
              className="rounded-xl bg-[#111c2e] text-xs"
            >
              {create.isPending ? "جارٍ الإنشاء..." : "إنشاء الباقة"}
            </Button>
          </div>
        )}
        {query.isError || definitionsQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            تعذر تحميل محرر الباقات.{" "}
            <button
              type="button"
              onClick={() => {
                void query.refetch();
                void definitionsQuery.refetch();
              }}
              className="mr-2 font-bold underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : query.isLoading || definitionsQuery.isLoading ? (
          <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ) : plans.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
            لا توجد باقات معرفة بعد.
          </p>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {plans.map(plan => (
              <PackagePlanCard
                key={plan.id}
                plan={plan}
                definitions={definitions}
                onSaved={() => void query.refetch()}
              />
            ))}
          </div>
        )}
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div>
                <p className="font-black text-amber-900">
                  إيصالات التحويل البنكي
                </p>
                <p className="text-xs text-amber-700">
                  راجع الطلبات المعلقة قبل تفعيل أي باقة مدفوعة.
                </p>
              </div>
              <Link
                href="/admin/subscription-receipts"
                className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-black text-amber-800"
              >
                صفحة المراجعة والتصدير
              </Link>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void receiptsQuery.refetch()}
              className="rounded-xl bg-white text-xs"
            >
              تحديث
            </Button>
          </div>
          {receiptsQuery.isLoading ? (
            <div className="mt-3 h-16 animate-pulse rounded-xl bg-white/70" />
          ) : receiptsQuery.isError ? (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">
              تعذر تحميل الإيصالات.
            </p>
          ) : receiptsQuery.data?.length ? (
            <div className="mt-3 space-y-2">
              {receiptsQuery.data.map(receipt => (
                <div
                  key={receipt.id}
                  className="grid gap-2 rounded-xl border border-amber-100 bg-white p-3 text-xs sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="font-bold">
                      {receipt.plan} ·{" "}
                      {receipt.billingCycle === "yearly" ? "سنوي" : "شهري"} ·{" "}
                      {receipt.amount} SAR
                    </p>
                    <p className="mt-1 text-slate-500" dir="ltr">
                      {receipt.email}
                    </p>
                    <a
                      href={receipt.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block font-bold text-cyan-700 underline"
                    >
                      فتح الإيصال
                    </a>
                    <span className="mr-2 text-amber-700">
                      {receipt.status === "pending"
                        ? "قيد المراجعة"
                        : receipt.status === "approved"
                          ? "معتمد"
                          : "مرفوض"}
                    </span>
                  </div>
                  {receipt.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        disabled={reviewReceipt.isPending}
                        onClick={() =>
                          reviewReceipt.mutate({
                            id: receipt.id,
                            status: "approved",
                          })
                        }
                        className="rounded-lg bg-emerald-600 px-3 text-xs"
                      >
                        اعتماد
                      </Button>
                      <Button
                        type="button"
                        disabled={reviewReceipt.isPending}
                        onClick={() =>
                          reviewReceipt.mutate({
                            id: receipt.id,
                            status: "rejected",
                            reviewNote:
                              "يرجى مراجعة بيانات التحويل وإعادة الرفع.",
                          })
                        }
                        className="rounded-lg bg-red-600 px-3 text-xs"
                      >
                        رفض
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-xl bg-white/70 p-3 text-xs text-amber-800">
              لا توجد إيصالات تحويل حتى الآن.
            </p>
          )}
        </section>
      </CardContent>
    </Card>
  );
}

type FeatureStatus = "ON" | "OFF" | "LIMITED" | "ADD_ON" | "ENTERPRISE_ONLY";
type FeatureDefinitionAdminRecord = {
  id: number;
  key: string;
  label: string;
  category: string;
  description: string | null;
  status: FeatureStatus;
  dependencyKey: string | null;
  defaultLimit: number | null;
  isAddOn: boolean;
  addonPrice: string | null;
};

function FeatureDefinitionRow({
  definition,
  onSaved,
}: {
  definition: FeatureDefinitionAdminRecord;
  onSaved: () => void;
}) {
  const [label, setLabel] = useState(definition.label);
  const [category, setCategory] = useState(definition.category ?? "core");
  const [description, setDescription] = useState(definition.description ?? "");
  const [status, setStatus] = useState<FeatureStatus>(
    definition.status ?? "ON"
  );
  const [dependencyKey, setDependencyKey] = useState(
    definition.dependencyKey ?? ""
  );
  const [defaultLimit, setDefaultLimit] = useState(
    definition.defaultLimit === null ? "" : String(definition.defaultLimit)
  );
  const [isAddOn, setIsAddOn] = useState(definition.isAddOn);
  const [addonPrice, setAddonPrice] = useState(definition.addonPrice ?? "");
  const update = trpc.admin.updateFeatureDefinition.useMutation({
    onSuccess: () => {
      onSaved();
      toast.success("تم حفظ تعريف الميزة");
    },
    onError: error => toast.error(`تعذر حفظ تعريف الميزة: ${error.message}`),
  });
  const saveDefinition = () => {
    const input = {
      id: definition.id,
      label: label.trim(),
      category: category.trim() || "core",
      description: description.trim() || null,
      status,
      dependencyKey: dependencyKey.trim() || null,
      defaultLimit: defaultLimit === "" ? null : Number(defaultLimit),
      isAddOn,
      addonPrice: isAddOn ? addonPrice.trim() || null : null,
    };
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      enqueueAdminOfflineOperation(localStorage, {
        procedure: "admin.updateFeatureDefinition",
        input,
      });
      window.dispatchEvent(new Event("nfood:admin-queue-changed"));
      toast.info("تم حفظ التعديل محليًا وسيُرسل عند عودة الاتصال");
      return;
    }
    update.mutate(input);
  };
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 lg:grid-cols-[1.1fr_1fr_1.4fr_150px_1fr_130px_130px_100px_auto] lg:items-end">
      <div>
        <p className="mb-1 font-mono text-[10px] text-slate-400">
          {definition.key}
        </p>
        <Input
          aria-label={`اسم الميزة ${definition.key}`}
          value={label}
          onChange={event => setLabel(event.target.value)}
          className="rounded-xl bg-white"
        />
      </div>
      <div>
        <p className="mb-1 text-[11px] font-bold text-slate-500">التصنيف</p>
        <Input
          value={category}
          onChange={event => setCategory(event.target.value)}
          placeholder="core"
          className="rounded-xl bg-white"
        />
      </div>
      <div>
        <p className="mb-1 text-[11px] font-bold text-slate-500">الوصف</p>
        <Input
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder="وصف الميزة"
          className="rounded-xl bg-white"
        />
      </div>
      <div>
        <p className="mb-1 text-[11px] font-bold text-slate-500">حالة التحكم</p>
        <select
          value={status}
          onChange={event => setStatus(event.target.value as FeatureStatus)}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs"
        >
          <option value="ON">ON</option>
          <option value="OFF">OFF</option>
          <option value="LIMITED">LIMITED</option>
          <option value="ADD_ON">ADD-ON</option>
          <option value="ENTERPRISE_ONLY">Enterprise Only</option>
        </select>
      </div>
      <div>
        <p className="mb-1 text-[11px] font-bold text-slate-500">
          المفتاح التابع
        </p>
        <Input
          value={dependencyKey}
          onChange={event => setDependencyKey(event.target.value)}
          placeholder="بدون تبعية"
          className="rounded-xl bg-white"
        />
      </div>
      <div>
        <p className="mb-1 text-[11px] font-bold text-slate-500">
          الحد الافتراضي
        </p>
        <Input
          value={defaultLimit}
          onChange={event =>
            setDefaultLimit(event.target.value.replace(/[^0-9]/g, ""))
          }
          placeholder="غير محدود"
          inputMode="numeric"
          className="rounded-xl bg-white"
        />
      </div>
      <div>
        <p className="mb-1 text-[11px] font-bold text-slate-500">سعر الإضافة</p>
        <Input
          value={addonPrice}
          onChange={event => setAddonPrice(event.target.value)}
          placeholder="0.00"
          inputMode="decimal"
          disabled={!isAddOn}
          className="rounded-xl bg-white"
        />
      </div>
      <button
        type="button"
        onClick={() => setIsAddOn(value => !value)}
        className={`h-10 rounded-xl px-3 text-xs font-black ${isAddOn ? "bg-cyan-600 text-white" : "border border-slate-200 bg-white text-slate-500"}`}
      >
        {isAddOn ? "إضافة مستقلة" : "ضمن الباقة"}
      </button>
      <Button
        type="button"
        disabled={
          update.isPending ||
          label.trim().length < 2 ||
          (isAddOn &&
            addonPrice !== "" &&
            !/^\\d+(\\.\\d{1,2})?$/.test(addonPrice))
        }
        onClick={saveDefinition}
        className="rounded-xl bg-[#111c2e] text-xs"
      >
        {update.isPending ? "جارٍ الحفظ..." : "حفظ"}
      </Button>
    </div>
  );
}

function FeatureDefinitionAdminPanel() {
  const query = trpc.admin.featureDefinitions.useQuery(undefined, {
    retry: false,
  });
  const rows = query.data ?? [];
  return (
    <Card className="mt-6 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-l from-orange-50 via-white to-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-xl bg-orange-100 p-2 text-[#e76f3c]">
                <Settings2 className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-[11px] font-black text-orange-800">
                حوكمة الباقات
              </span>
            </div>
            <CardTitle className="text-base">
              تعريفات الباقات وحدود المميزات
            </CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              عدّل الحدود والتبعيات ونوع الإضافة من مركز واحد. التغيير يؤثر على
              الحسابات التي لا تملك Override خاصًا.
            </p>
          </div>
          <Badge variant="outline" className="rounded-lg">
            {query.isLoading ? "جارٍ التحميل" : `${rows.length} ميزة`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {query.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            تعذر تحميل تعريفات المميزات. Request ID: feature-definitions{" "}
            <button
              onClick={() => void query.refetch()}
              className="mr-2 font-bold underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : query.isLoading ? (
          <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
        ) : rows.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
            لا توجد تعريفات مميزات بعد.
          </p>
        ) : (
          rows.map(definition => (
            <FeatureDefinitionRow
              key={definition.id}
              definition={definition}
              onSaved={() => void query.refetch()}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function FeatureOverrideAuditPanel({
  restaurants = [],
}: {
  restaurants?: Array<{ id: number; name: string }>;
}) {
  const [restaurantId, setRestaurantId] = useState("");
  const [actorUserId, setActorUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const filters = useMemo(
    () => ({
      ...(restaurantId ? { restaurantId: Number(restaurantId) } : {}),
      ...(actorUserId ? { actorUserId: Number(actorUserId) } : {}),
      ...(from ? { from: new Date(`${from}T00:00:00`).toISOString() } : {}),
      ...(to ? { to: new Date(`${to}T23:59:59.999`).toISOString() } : {}),
      limit: 100,
    }),
    [restaurantId, actorUserId, from, to]
  );
  const query = trpc.platform.auditLogs.useQuery(filters, { retry: false });
  const rows = (query.data ?? []).filter(event =>
    event.action.startsWith("feature.override")
  );
  const actorOptions = useMemo(
    () =>
      Array.from(
        new Map(
          rows
            .filter(event => event.actorUserId)
            .map(event => [
              event.actorUserId,
              { id: event.actorUserId!, role: event.actorRole ?? "أدمن" },
            ])
        ).values()
      ),
    [rows]
  );
  const hasFilters = Boolean(restaurantId || actorUserId || from || to);
  const clearFilters = () => {
    setRestaurantId("");
    setActorUserId("");
    setFrom("");
    setTo("");
  };
  return (
    <Card className="mt-6 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">سجل تغييرات المميزات</CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              راجع عمليات التفعيل والتعطيل مع فلترة المطعم والفاعل والنطاق
              الزمني.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void query.refetch()}
            className="rounded-xl text-xs"
          >
            تحديث السجل
          </Button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1.5 text-xs font-semibold text-slate-600">
            <span>المطعم</span>
            <select
              value={restaurantId}
              onChange={event => setRestaurantId(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800"
            >
              <option value="">كل المطاعم</option>
              {restaurants.map(restaurant => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600">
            <span>الفاعل</span>
            <select
              value={actorUserId}
              onChange={event => setActorUserId(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-800"
            >
              <option value="">كل الفاعلين</option>
              {actorOptions.map(actor => (
                <option key={actor.id} value={actor.id}>
                  #{actor.id} · {actor.role}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600">
            <span>من تاريخ</span>
            <Input
              type="date"
              value={from}
              onChange={event => setFrom(event.target.value)}
              className="h-10 rounded-xl text-sm"
            />
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600">
            <span>إلى تاريخ</span>
            <Input
              type="date"
              value={to}
              onChange={event => setTo(event.target.value)}
              className="h-10 rounded-xl text-sm"
            />
          </label>
        </div>
        {hasFilters ? (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-orange-50 px-3 py-2 text-xs text-orange-800">
            <span>الفلاتر مفعلة على السجل الحالي.</span>
            <button
              type="button"
              onClick={clearFilters}
              className="font-bold underline underline-offset-2"
            >
              مسح الفلاتر
            </button>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="p-5">
        {query.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            تعذر تحميل سجل المميزات. Request ID: feature-audit{" "}
            <button
              onClick={() => void query.refetch()}
              className="mr-2 font-bold underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : query.isLoading ? (
          <div className="space-y-2">
            <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-600">
              لا توجد تغييرات مطابقة للفلاتر الحالية.
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 text-xs font-bold text-[#c65b2d] underline"
              >
                عرض كامل السجل
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            {rows.slice(0, 12).map(event => (
              <div
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
              >
                <div>
                  <p className="font-mono text-xs font-bold text-slate-800">
                    {event.action}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    مطعم #{event.restaurantId ?? "منصة"} · الميزة #
                    {event.entityId ?? "—"} · {event.actorRole ?? "أدمن"} ·
                    الفاعل #{event.actorUserId ?? "—"}
                  </p>
                </div>
                <div className="text-left">
                  <Badge className="rounded-lg bg-emerald-50 text-emerald-700">
                    {event.outcome === "success" ? "ناجح" : event.outcome}
                  </Badge>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {new Date(event.createdAt).toLocaleString("ar-SA-u-ca-gregory-nu-latn")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AdminPwaSyncCard() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [queuedCount, setQueuedCount] = useState(0);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null
  );
  const [pwaInstalled, setPwaInstalled] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(display-mode: standalone)").matches
  );
  const syncingRef = useRef(false);
  const utils = trpc.useUtils();
  const updateFeatureDefinition =
    trpc.admin.updateFeatureDefinition.useMutation();
  const updatePackagePlan = trpc.admin.updatePackagePlan.useMutation();
  const setPackagePlanFeature = trpc.admin.setPackagePlanFeature.useMutation();
  const executeAdminOperation = async (operation: AdminOfflineOperation) => {
    switch (operation.procedure) {
      case "admin.updateFeatureDefinition":
        await updateFeatureDefinition.mutateAsync(operation.input);
        break;
      case "admin.updatePackagePlan":
        await updatePackagePlan.mutateAsync(operation.input);
        break;
      case "admin.setPackagePlanFeature":
        await setPackagePlanFeature.mutateAsync(operation.input);
        break;
    }
  };
  useEffect(() => {
    const captureInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const installed = () => {
      setPwaInstalled(true);
      setInstallPrompt(null);
      toast.success("تم تثبيت Admin Web على هذا الجهاز");
    };
    window.addEventListener("beforeinstallprompt", captureInstall);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstall);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  useEffect(() => {
    const countQueued = () =>
      Object.keys(localStorage)
        .filter(key => key.startsWith("nfood-offline-orders:"))
        .reduce(
          (total, key) =>
            total + readOfflineQueue<unknown>(localStorage, key).length,
          0
        ) + readAdminOfflineQueue(localStorage).length;
    const syncAdminQueue = async () => {
      if (
        !navigator.onLine ||
        syncingRef.current ||
        readAdminOfflineQueue(localStorage).length === 0
      )
        return;
      syncingRef.current = true;
      try {
        const result = await replayAdminOfflineQueue(
          localStorage,
          executeAdminOperation
        );
        if (result.syncedCount > 0) {
          void utils.admin.featureDefinitions.invalidate();
          void utils.admin.packagePlans.invalidate();
          void utils.platform.auditLogs.invalidate();
          window.dispatchEvent(
            new CustomEvent("nfood:admin-sync-complete", { detail: result })
          );
        }
      } finally {
        syncingRef.current = false;
        setQueuedCount(countQueued());
        setLastSyncAt(new Date().toISOString());
      }
    };
    const refresh = () => {
      setIsOnline(navigator.onLine);
      setQueuedCount(countQueued());
      if (navigator.onLine) {
        navigator.serviceWorker?.controller?.postMessage({
          type: "REQUEST_SYNC",
        });
        void syncAdminQueue();
        setLastSyncAt(new Date().toISOString());
      }
    };
    const handleSyncComplete = (event: Event) => {
      const count =
        (event as CustomEvent<{ count?: number }>).detail?.count ?? 0;
      setQueuedCount(countQueued());
      setLastSyncAt(new Date().toISOString());
      if (count > 0) toast.success(`اكتملت مزامنة ${count} عملية`);
    };
    const handleAdminSyncComplete = (event: Event) => {
      const count =
        (event as CustomEvent<{ syncedCount?: number }>).detail?.syncedCount ??
        0;
      setQueuedCount(countQueued());
      if (count > 0) toast.success(`اكتملت مزامنة ${count} عملية إدارية`);
    };
    const handleServiceWorkerMessage = (
      event: MessageEvent<{ type?: string }>
    ) => {
      if (event.data?.type === "NFOOD_SYNC_REQUEST") {
        setIsOnline(navigator.onLine);
        setQueuedCount(countQueued());
        void syncAdminQueue();
        setLastSyncAt(new Date().toISOString());
      }
    };
    refresh();
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    window.addEventListener("nfood:sync-request", refresh);
    window.addEventListener("nfood:admin-queue-changed", refresh);
    window.addEventListener("nfood:sync-complete", handleSyncComplete);
    window.addEventListener(
      "nfood:admin-sync-complete",
      handleAdminSyncComplete
    );
    navigator.serviceWorker?.addEventListener(
      "message",
      handleServiceWorkerMessage
    );
    return () => {
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
      window.removeEventListener("nfood:sync-request", refresh);
      window.removeEventListener("nfood:admin-queue-changed", refresh);
      window.removeEventListener("nfood:sync-complete", handleSyncComplete);
      window.removeEventListener(
        "nfood:admin-sync-complete",
        handleAdminSyncComplete
      );
      navigator.serviceWorker?.removeEventListener(
        "message",
        handleServiceWorkerMessage
      );
    };
  }, []);
  return (
    <Card className="mb-5 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-xl p-2 ${isOnline ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
          >
            {isOnline ? (
              <Wifi className="h-5 w-5" />
            ) : (
              <WifiOff className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">
              تطبيق Admin Web · {isOnline ? "متصل" : "دون اتصال"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {queuedCount
                ? `${queuedCount} عملية بانتظار المزامنة`
                : "لا توجد عمليات معلقة للمزامنة"}
              {lastSyncAt
                ? ` · آخر فحص ${new Date(lastSyncAt).toLocaleTimeString("ar-SA-u-ca-gregory-nu-latn")}`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1.5 text-[11px] font-black ${isOnline ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
          >
            {isOnline ? "جاهز للمزامنة" : "سيُزامن عند عودة الاتصال"}
          </span>
          {pwaInstalled ? (
            <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-[11px] font-black text-cyan-700">
              Admin Web مثبت
            </span>
          ) : installPrompt ? (
            <Button
              type="button"
              size="sm"
              onClick={async () => {
                await installPrompt.prompt();
                const result = await installPrompt.userChoice;
                if (result.outcome === "accepted")
                  toast.success("بدأ تثبيت Admin Web");
                setInstallPrompt(null);
              }}
              className="rounded-xl bg-cyan-500 text-xs font-black text-white hover:bg-cyan-600"
            >
              تثبيت Admin Web
            </Button>
          ) : (
            <span className="max-w-44 text-[10px] leading-4 text-slate-400">
              إن لم يظهر زر التثبيت، استخدم قائمة المتصفح ثم اختر «تثبيت
              التطبيق».
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!isOnline}
            onClick={() => {
              navigator.serviceWorker?.controller?.postMessage({
                type: "REQUEST_SYNC",
              });
              window.dispatchEvent(new Event("nfood:sync-request"));
            }}
            className="gap-1 rounded-xl text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> مزامنة الآن
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewMetricSkeleton({ compact = false }: { compact?: boolean }) {
  return <Card className={`rounded-2xl border-slate-200 bg-white shadow-sm ${compact ? "min-h-24" : "min-h-28"}`} aria-label="جارٍ تحميل الإحصائية"><CardContent className="flex items-center justify-between p-4"><div className="space-y-3"><Skeleton className="h-3 w-24 rounded-full" /><Skeleton className={compact ? "h-5 w-20 rounded-full" : "h-7 w-28 rounded-full"} /></div><Skeleton className="h-10 w-10 rounded-xl" /></CardContent></Card>;
}
function OverviewPanelSkeleton({ rows = 3 }: { rows?: number }) {
  return <div className="space-y-3" aria-label="جارٍ تحميل البيانات">{Array.from({ length: rows }, (_, index) => <div key={index} className="flex items-center justify-between rounded-xl border border-slate-100 p-3"><div className="space-y-2"><Skeleton className="h-3 w-32 rounded-full" /><Skeleton className="h-2.5 w-20 rounded-full" /></div><Skeleton className="h-6 w-16 rounded-full" /></div>)}</div>;
}
function SuperAdminView() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const remoteRestaurants = trpc.admin.restaurants.useQuery(undefined, {
    enabled: Boolean(user),
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
  const remoteCustomers = trpc.admin.customers.useQuery(undefined, {
    enabled: Boolean(user),
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
  const roleCatalog = trpc.admin.roles.useQuery(
    {},
    { enabled: Boolean(user), retry: false }
  );
  const permissionCatalog = trpc.admin.permissions.useQuery(undefined, {
    enabled: Boolean(user),
    retry: false,
  });
  const saasMetrics = trpc.admin.saasMetrics.useQuery(undefined, {
    enabled: Boolean(user),
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
  const platformSummary = trpc.admin.platformSummary.useQuery(undefined, {
    enabled: Boolean(user),
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
  const systemHealth = trpc.admin.systemHealth.useQuery(undefined, {
    enabled: Boolean(user),
    retry: 2,
    refetchInterval: 30000,
  });
  const createRestaurant = trpc.admin.createRestaurant.useMutation({
    onSuccess: () => {
      void utils.admin.restaurants.invalidate();
      toast.success("تم إنشاء المطعم");
    },
    onError: error => toast.error(`تعذر إنشاء المطعم: ${error.message}`),
  });
  const updateRestaurant = trpc.admin.updateRestaurant.useMutation({
    onSuccess: () => {
      void utils.admin.restaurants.invalidate();
      toast.success("تم تحديث المطعم");
    },
    onError: error => toast.error(`تعذر تحديث المطعم: ${error.message}`),
  });
  const deleteRestaurant = trpc.admin.deleteRestaurant.useMutation({
    onSuccess: () => {
      void utils.admin.restaurants.invalidate();
      toast.success("تم تعليق المطعم");
    },
    onError: error => toast.error(`تعذر تعليق المطعم: ${error.message}`),
  });
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [selectedAccount, setSelectedAccount] = useState<{
    name: string;
    barcode: string;
  } | null>(null);
  const [selectedFeatureRestaurantId, setSelectedFeatureRestaurantId] =
    useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [restaurantEditOpen, setRestaurantEditOpen] = useState(false);
  const [restaurantEditId, setRestaurantEditId] = useState<number | null>(null);
  const [restaurantEditName, setRestaurantEditName] = useState("");
  const [restaurantEditPlan, setRestaurantEditPlan] = useState("");
  const [pendingDeleteRestaurantId, setPendingDeleteRestaurantId] = useState<
    number | null
  >(null);
  const accountRows = (remoteRestaurants.data ?? []).map(item => ({
    id: item.id,
    name: item.name,
    barcode: item.barcode,
    branches: item.branchCount,
    plan: item.plan,
    status:
      item.status === "active"
        ? "نشط"
        : item.status === "trial"
          ? "تجربة"
          : "معلّق",
  }));
  const shown = accountRows.filter(
    item => statusFilter === "الكل" || item.status === statusFilter
  );
  const liveCount = remoteRestaurants.data?.length ?? 0;
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">لوحة Super Admin</h2>
          <p className="mt-1 text-sm text-slate-500">
            تحكم مركزي في المطاعم والعملاء والاشتراكات والصلاحيات مع حفظ السجل
            التشغيلي.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"
        >
          <Plus className="h-4 w-4" /> مطعم جديد
        </Button>
      </div>
      <CreateRestaurantDialog
        open={createOpen}
        pending={createRestaurant.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={input => {
          createRestaurant.mutate(input);
          setCreateOpen(false);
        }}
      />
      <AdminPwaSyncCard />
      {restaurantEditOpen && (
        <div className="mb-5 grid gap-2 rounded-2xl border border-orange-100 bg-orange-50/50 p-4 sm:grid-cols-[1fr_1fr_auto_auto]">
          <Input
            value={restaurantEditName}
            onChange={event => setRestaurantEditName(event.target.value)}
            placeholder="اسم المطعم"
            className="rounded-xl bg-white"
          />
          <Input
            value={restaurantEditPlan}
            onChange={event => setRestaurantEditPlan(event.target.value)}
            placeholder="الباقة"
            className="rounded-xl bg-white"
          />
          <Button
            disabled={
              restaurantEditName.trim().length < 2 ||
              !restaurantEditPlan.trim() ||
              updateRestaurant.isPending
            }
            onClick={() => {
              if (restaurantEditId !== null)
                updateRestaurant.mutate({
                  id: restaurantEditId,
                  name: restaurantEditName.trim(),
                  plan: restaurantEditPlan.trim(),
                });
              setRestaurantEditOpen(false);
              setRestaurantEditId(null);
            }}
            className="rounded-xl bg-[#e76f3c]"
          >
            {updateRestaurant.isPending ? "جارٍ الحفظ..." : "حفظ التعديل"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setRestaurantEditOpen(false);
              setRestaurantEditId(null);
            }}
            className="rounded-xl"
          >
            إلغاء
          </Button>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            [
              "المطاعم النشطة",
              String(
                remoteRestaurants.data?.filter(item => item.status === "active")
                  .length ?? 0
              ),
              Store,
            ],
            [
              "MRR",
              saasMetrics.isError
                ? "تعذر"
                : saasMetrics.data
                  ? `${saasMetrics.data.mrr.toFixed(2)} SAR`
                  : "...",
              CircleDollarSign,
            ],
            [
              "ARR",
              saasMetrics.isError
                ? "تعذر"
                : saasMetrics.data
                  ? `${saasMetrics.data.arr.toFixed(2)} SAR`
                  : "...",
              WalletCards,
            ],
            [
              "Churn آخر 30 يومًا",
              saasMetrics.isError
                ? "تعذر"
                : saasMetrics.data
                  ? `${saasMetrics.data.churnRate.toFixed(1)}%`
                  : "...",
              TrendingDown,
            ],
          ] as const
        ).map(([label, value, Icon]) => {
          const StatIcon = Icon;
          return (
            <Card
              key={label}
              className="rounded-2xl border-slate-200 bg-white shadow-sm"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">{label}</p>
                  <div className="rounded-xl bg-orange-50 p-2 text-[#e76f3c]">
                    <StatIcon className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-4 text-2xl font-bold">{value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card className="mt-6 rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex-row items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <CardTitle className="text-base">صحة SaaS</CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              توزيع الاشتراكات ومؤشرات الاستقرار التجاري من البيانات الفعلية.
            </p>
          </div>
          <Badge variant="outline" className="rounded-lg">
            {saasMetrics.isLoading
              ? "جارٍ التحميل"
              : saasMetrics.isError
                ? "تعذر التحميل"
                : "محدّثة"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          {saasMetrics.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              تعذر تحميل صحة SaaS. Request ID: saas-health{" "}
              <button
                onClick={() => void saasMetrics.refetch()}
                className="font-bold underline"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : saasMetrics.isLoading ? (
            <OverviewPanelSkeleton rows={3} />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  [
                    "نشطة",
                    saasMetrics.data?.activeSubscriptions ?? 0,
                    "text-emerald-600",
                  ],
                  [
                    "تجريبية",
                    saasMetrics.data?.trialSubscriptions ?? 0,
                    "text-amber-600",
                  ],
                  [
                    "متأخرة",
                    saasMetrics.data?.pastDueSubscriptions ?? 0,
                    "text-red-600",
                  ],
                  [
                    "ملغاة آخر 30 يومًا",
                    saasMetrics.data?.cancelledLast30Days ?? 0,
                    "text-slate-600",
                  ],
                ].map(([label, value, color]) => (
                  <div
                    key={String(label)}
                    className="rounded-xl bg-slate-50 p-3"
                  >
                    <p className="text-[11px] text-slate-500">{label}</p>
                    <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-500">
                  التوزيع حسب الباقة
                </p>
                {Object.keys(saasMetrics.data?.byPlan ?? {}).length === 0 ? (
                  <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
                    لا توجد باقات محفوظة بعد.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-3">
                    {Object.entries(saasMetrics.data?.byPlan ?? {}).map(
                      ([plan, value]) => (
                        <div
                          key={plan}
                          className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-xs"
                        >
                          <span className="font-semibold">{plan}</span>
                          <span className="text-slate-500">
                            {value.active} نشطة · {value.mrr.toFixed(2)} SAR
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Card className="mt-6 rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex-row items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <CardTitle className="text-base">المطاعم والعملاء</CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              آخر المطاعم المسجلة وحالة اشتراكها.
            </p>
          </div>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {["الكل", "نشط", "تجربة", "معلّق"].map(item => (
              <button
                key={item}
                onClick={() => setStatusFilter(item)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold ${statusFilter === item ? "bg-white text-[#e76f3c] shadow-sm" : "text-slate-500"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-right text-sm">
              <thead className="bg-slate-50 text-[11px] text-slate-500">
                <tr>
                  <th className="px-5 py-3">المطعم</th>
                  <th className="px-5 py-3">الباركود</th>
                  <th className="px-5 py-3">الفروع</th>
                  <th className="px-5 py-3">الباقة</th>
                  <th className="px-5 py-3">الحالة</th>
                  <th className="px-5 py-3">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {remoteRestaurants.isError ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-red-600"
                    >
                      تعذر تحميل المطاعم.{" "}
                      <button
                        onClick={() => void remoteRestaurants.refetch()}
                        className="mr-1 font-bold underline"
                      >
                        إعادة المحاولة
                      </button>
                    </td>
                  </tr>
                ) : remoteRestaurants.isLoading ? (
                  Array.from({ length: 4 }, (_, index) => <tr key={index} aria-label="جارٍ تحميل المطعم"><td colSpan={6} className="px-5 py-4"><div className="grid grid-cols-6 items-center gap-4"><Skeleton className="h-4 w-28 rounded-full" /><Skeleton className="h-4 w-24 rounded-full" /><Skeleton className="h-4 w-12 rounded-full" /><Skeleton className="h-4 w-16 rounded-full" /><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-8 w-20 rounded-lg" /></div></td></tr>)
                ) : shown.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      لا توجد مطاعم محفوظة في قاعدة البيانات لهذا الفلتر.
                    </td>
                  </tr>
                ) : (
                  shown.map(item => (
                    <tr key={item.name} className="border-t border-slate-100">
                      <td className="px-5 py-4 font-bold">{item.name}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(item.barcode);
                              toast.success(`تم نسخ ${item.barcode}`);
                            }}
                            className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1 text-left"
                            title="نسخ الباركود"
                          >
                            <Barcode
                              value={item.barcode}
                              width={0.8}
                              height={24}
                              displayValue={false}
                              margin={0}
                            />
                            <span className="font-mono text-[10px] text-slate-500">
                              {item.barcode}
                            </span>
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="rounded-lg px-2 py-1 text-[10px] font-semibold text-[#e76f3c] hover:bg-orange-50"
                            title="طباعة الباركود"
                          >
                            طباعة
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {item.branches === null
                          ? "غير متاح"
                          : `${item.branches} فروع`}
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className="rounded-lg text-[11px]"
                        >
                          {item.plan}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-bold ${item.status === "نشط" ? "text-emerald-600" : item.status === "تجربة" ? "text-amber-600" : "text-slate-400"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setSelectedAccount({
                                name: item.name,
                                barcode: item.barcode,
                              })
                            }
                            className="text-xs font-semibold text-[#e76f3c]"
                          >
                            عرض
                          </button>
                          {item.id > 0 && (
                            <>
                              <button
                                onClick={() => {
                                  setRestaurantEditId(item.id);
                                  setRestaurantEditName(item.name);
                                  setRestaurantEditPlan(item.plan);
                                  setRestaurantEditOpen(true);
                                }}
                                className="text-xs font-semibold text-slate-600"
                              >
                                تعديل
                              </button>
                              <button
                                onClick={() =>
                                  setPendingDeleteRestaurantId(item.id)
                                }
                                className="text-xs font-semibold text-red-500"
                              >
                                تعليق
                              </button>
                              {pendingDeleteRestaurantId === item.id && (
                                <span className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[10px] text-red-700">
                                  <span>تأكيد؟</span>
                                  <button
                                    onClick={() => {
                                      deleteRestaurant.mutate({ id: item.id });
                                      setPendingDeleteRestaurantId(null);
                                    }}
                                    className="font-bold underline"
                                  >
                                    نعم
                                  </button>
                                  <button
                                    onClick={() =>
                                      setPendingDeleteRestaurantId(null)
                                    }
                                    className="font-bold underline"
                                  >
                                    لا
                                  </button>
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {selectedAccount && (
        <Card className="mt-5 rounded-2xl border-orange-200 bg-orange-50/40 shadow-sm">
          <CardContent className="flex flex-wrap items-center gap-5 p-5">
            <div>
              <p className="text-xs text-slate-500">ملف الحساب</p>
              <h3 className="mt-1 font-bold">{selectedAccount.name}</h3>
              <p className="mt-1 font-mono text-xs text-slate-500">
                {selectedAccount.barcode}
              </p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <Barcode
                value={selectedAccount.barcode}
                width={1.25}
                height={52}
                displayValue={false}
                margin={0}
              />
            </div>
            <div className="mr-auto flex gap-2">
              <Button
                onClick={() => {
                  navigator.clipboard?.writeText(selectedAccount.barcode);
                  toast.success("تم نسخ باركود الحساب");
                }}
                variant="outline"
                size="sm"
                className="rounded-lg text-xs"
              >
                نسخ الباركود
              </Button>
              <Button
                onClick={() => window.print()}
                size="sm"
                className="rounded-lg bg-[#e76f3c] text-xs hover:bg-[#d85f2e]"
              >
                طباعة الباركود
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            [
              "إجمالي المطاعم",
              platformSummary.data?.restaurants.total ?? "…",
              Store,
              "text-orange-600",
            ],
            [
              "العملاء",
              platformSummary.data?.customers ?? "…",
              Users,
              "text-blue-600",
            ],
            [
              "الموظفون",
              platformSummary.data?.employees ?? "…",
              ShieldCheck,
              "text-violet-600",
            ],
            [
              "الطلبات",
              platformSummary.data?.orders.total ?? "…",
              ShoppingBag,
              "text-emerald-600",
            ],
            [
              "قيد التنفيذ",
              platformSummary.data?.orders.pending ?? "…",
              Clock3,
              "text-amber-600",
            ],
            [
              "الإيرادات المكتملة",
              platformSummary.data
                ? `${platformSummary.data.revenue.toFixed(2)} SAR`
                : "…",
              WalletCards,
              "text-cyan-600",
            ],
            [
              "متوسط الاشتراك",
              platformSummary.data
                ? `${platformSummary.data.subscriptions.averageMonthlyPrice.toFixed(2)} SAR`
                : "…",
              CircleDollarSign,
              "text-pink-600",
            ],
            [
              "الملغاة",
              platformSummary.data?.orders.cancelled ?? "…",
              TrendingDown,
              "text-red-600",
            ],
          ] as const
        ).map(([label, value, Icon, color]) => {
          const StatIcon = Icon as typeof Store;
          if (platformSummary.isLoading) return <OverviewMetricSkeleton key={String(label)} />;
          if (platformSummary.isError) return <Card key={String(label)} className="rounded-2xl border-red-100 bg-white shadow-sm"><CardContent className="flex min-h-28 flex-col justify-between p-4"><div className="flex items-center justify-between"><p className="text-xs text-slate-500">{label}</p><StatIcon className={`h-5 w-5 ${color}`} /></div><button onClick={() => void platformSummary.refetch()} className="mt-3 w-fit text-xs font-bold text-red-600 underline">تعذر التحميل · إعادة المحاولة</button></CardContent></Card>;
          return (
            <Card
              key={String(label)}
              className="rounded-2xl border-slate-200 bg-white shadow-sm"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-2 text-xl font-black text-slate-900">
                    {value}
                  </p>
                </div>
                <StatIcon className={`h-5 w-5 ${color}`} />
              </CardContent>
            </Card>
          );
        })}
      </div>
      <PlatformSettingsPanel />
      <ActivityAnalyticsPanel title="نشاط ومبيعات المنصة" />{" "}
      {remoteRestaurants.data?.[0]?.id ? (
        <>
          <LoyaltyPanel
            restaurantId={
              selectedFeatureRestaurantId ?? remoteRestaurants.data[0].id
            }
          />
          <ReviewsPanel
            restaurantId={
              selectedFeatureRestaurantId ?? remoteRestaurants.data[0].id
            }
          />
        </>
      ) : null}{" "}
      <SubscriptionAdminPanel /> <CustomerAdminPanel /> <RoleAdminPanel />{" "}
      <RolePermissionsPanel roles={roleCatalog.data ?? []} />{" "}
      <FeatureUsagePanel /> <PackagePlansAdminPanel />{" "}
      <FeatureDefinitionAdminPanel />{" "}
      <FeatureOverrideAuditPanel restaurants={remoteRestaurants.data ?? []} />{" "}
      {remoteRestaurants.data?.length ? (
        <FeatureControlCenter
          restaurantId={
            selectedFeatureRestaurantId ?? remoteRestaurants.data[0].id
          }
          restaurantName={
            remoteRestaurants.data.find(
              restaurant =>
                restaurant.id ===
                (selectedFeatureRestaurantId ?? remoteRestaurants.data?.[0]?.id)
            )?.name ?? ""
          }
        />
      ) : null}{" "}
      {remoteRestaurants.data?.find(
        restaurant => restaurant.name === "Nasser Cafe"
      ) ? (
        <NasserCafeDetailsPanel
          restaurantId={
            remoteRestaurants.data.find(
              restaurant => restaurant.name === "Nasser Cafe"
            )!.id
          }
          plan={
            remoteRestaurants.data.find(
              restaurant => restaurant.name === "Nasser Cafe"
            )!.plan
          }
        />
      ) : null}{" "}
      {remoteRestaurants.data?.length ? (
        <>
          <Card className="mt-5 rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-bold">المطعم المستهدف للصلاحيات</p>
                <p className="mt-1 text-xs text-slate-500">
                  اختر مطعمًا فعليًا لإدارة Feature Override.
                </p>
              </div>
              <select
                value={
                  selectedFeatureRestaurantId ?? remoteRestaurants.data[0].id
                }
                onChange={event =>
                  setSelectedFeatureRestaurantId(Number(event.target.value))
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value={remoteRestaurants.data[0].id}>
                  {remoteRestaurants.data[0].name}
                </option>
                {remoteRestaurants.data.slice(1).map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
          <FeatureAccessPanel
            restaurantId={
              selectedFeatureRestaurantId ?? remoteRestaurants.data[0].id
            }
          />
        </>
      ) : null}
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#e76f3c]" />
              <div>
                <p className="font-bold">الأدوار والصلاحيات</p>
                <p className="mt-1 text-xs text-slate-500">
                  {roleCatalog.isLoading || permissionCatalog.isLoading
                    ? "جارٍ تحميل الكتالوج"
                    : roleCatalog.isError || permissionCatalog.isError
                      ? "تعذر تحميل الكتالوج"
                      : `${roleCatalog.data?.length ?? 0} أدوار · ${permissionCatalog.data?.length ?? 0} صلاحية محفوظة`}
                </p>
              </div>
              <span className="mr-auto rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500">
                عرض الكتالوج
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <CircleDollarSign className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-bold">الاشتراكات</p>
                <p className="mt-1 text-xs text-slate-500">
                  {liveCount} حسابًا في النظام
                  {remoteRestaurants.isFetching ? " · جارٍ التحديث" : ""} ·{" "}
                  {remoteCustomers.isLoading
                    ? "جارٍ حساب العملاء"
                    : `${remoteCustomers.data?.length ?? 0} عميل محفوظ`}
                  .
                </p>
              </div>
              <span className="mr-auto rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500">
                البيانات متاحة بالأعلى
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Activity
                className={`h-5 w-5 ${systemHealth.data?.status === "healthy" ? "text-emerald-600" : "text-amber-600"}`}
              />
              <div>
                <p className="font-bold">صحة النظام</p>
                <p className="mt-1 text-xs text-slate-500">
                  {systemHealth.isLoading
                    ? "جارٍ فحص الخدمات..."
                    : systemHealth.isError
                      ? "تعذر فحص الصحة"
                      : systemHealth.data?.status === "healthy"
                        ? `API وDB يعملان · ${new Date(systemHealth.data.checkedAt).toLocaleTimeString("ar-SA-u-ca-gregory-nu-latn")}`
                        : `الحالة متدهورة · قاعدة البيانات: ${systemHealth.data?.database ?? "غير متاحة"}`}
                </p>
              </div>
              <span className="mr-auto rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500">
                تحديث كل 30 ثانية
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CustomerAdminPanel() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(
    null
  );
  const [pendingDeleteCustomerId, setPendingDeleteCustomerId] = useState<
    number | null
  >(null);
  const customers = trpc.admin.customers.useQuery(undefined, {
    enabled: Boolean(user),
    retry: 2,
  });
  const createCustomer = trpc.admin.createCustomer.useMutation({
    onSuccess: () => {
      void utils.admin.customers.invalidate();
      toast.success("تم إنشاء العميل");
    },
    onError: error => toast.error(`تعذر إنشاء العميل: ${error.message}`),
  });
  const updateCustomer = trpc.admin.updateCustomer.useMutation({
    onSuccess: () => {
      void utils.admin.customers.invalidate();
      toast.success("تم تحديث العميل");
    },
    onError: error => toast.error(`تعذر تحديث العميل: ${error.message}`),
  });
  const rows = customers.data ?? [];
  return (
    <Card className="mt-5 rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex-row items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <CardTitle className="text-base">العملاء</CardTitle>
          <p className="mt-1 text-xs text-slate-500">
            بيانات الحسابات العامة فقط؛ لا تظهر كلمات المرور أو رموز الجلسات.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCustomerId(null);
            setCustomerName("");
            setCustomerEmail("");
            setCustomerFormOpen(true);
          }}
          className="rounded-xl bg-[#e76f3c] text-xs hover:bg-[#d85f2e]"
        >
          عميل جديد
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {customerFormOpen && (
          <div className="m-5 grid gap-2 rounded-2xl border border-orange-100 bg-orange-50/50 p-4 sm:grid-cols-[1fr_1fr_auto_auto]">
            <Input
              value={customerName}
              onChange={event => setCustomerName(event.target.value)}
              placeholder="اسم العميل"
              className="rounded-xl bg-white"
            />
            <Input
              value={customerEmail}
              onChange={event => setCustomerEmail(event.target.value)}
              placeholder="البريد الإلكتروني اختياري"
              className="rounded-xl bg-white"
            />
            <Button
              disabled={
                customerName.trim().length < 2 ||
                (customerEmail.trim() &&
                  !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(
                    customerEmail.trim()
                  )) ||
                createCustomer.isPending ||
                updateCustomer.isPending
              }
              onClick={() => {
                if (editingCustomerId !== null)
                  updateCustomer.mutate({ id: editingCustomerId, name: customerName.trim() });
                else
                  createCustomer.mutate({
                    name: customerName.trim(),
                    ...(customerEmail.trim() ? { email: customerEmail.trim() } : {}),
                  });
                setCustomerFormOpen(false);
                setEditingCustomerId(null);
                setCustomerName("");
                setCustomerEmail("");
              }}
              className="rounded-xl bg-[#e76f3c]"
            >
              {createCustomer.isPending || updateCustomer.isPending
                ? "جارٍ الحفظ..."
                : editingCustomerId !== null
                  ? "حفظ التعديل"
                  : "إنشاء العميل"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCustomerFormOpen(false);
                setEditingCustomerId(null);
                setCustomerName("");
                setCustomerEmail("");
              }}
              className="rounded-xl"
            >
              إلغاء
            </Button>
          </div>
        )}
        {customers.isError ? (
          <div className="p-6 text-sm text-red-600">
            تعذر تحميل العملاء. Request ID: customers-admin{" "}
            <button
              onClick={() => void customers.refetch()}
              className="font-bold underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : customers.isLoading ? (
          <div className="m-5 h-20 animate-pulse rounded-xl bg-slate-100" />
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            لا يوجد عملاء محفوظون بعد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-right text-sm">
              <thead className="bg-slate-50 text-[11px] text-slate-500">
                <tr>
                  <th className="px-5 py-3">الاسم</th>
                  <th className="px-5 py-3">البريد</th>
                  <th className="px-5 py-3">طريقة الدخول</th>
                  <th className="px-5 py-3">آخر دخول</th>
                  <th className="px-5 py-3">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(customer => (
                  <tr key={customer.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-semibold">
                      {customer.name || "بدون اسم"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {customer.email || "غير متاح"}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {customer.loginMethod || "غير محددة"}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {customer.lastSignedIn
                        ? new Date(customer.lastSignedIn).toLocaleString(
                            "ar-SA"
                          )
                        : "لم يسجل الدخول"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditingCustomerId(customer.id);
                            setCustomerName(customer.name ?? "");
                            setCustomerEmail(customer.email ?? "");
                            setCustomerFormOpen(true);
                          }}
                          className="text-xs font-semibold text-[#e76f3c]"
                        >
                          تعديل
                        </button>
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] text-slate-500">الحذف من حساب العميل فقط</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SubscriptionAdminPanel() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [subscriptionFormOpen, setSubscriptionFormOpen] = useState(false);
  const [subscriptionRestaurantId, setSubscriptionRestaurantId] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState("Growth");
  const [subscriptionMonthlyPrice, setSubscriptionMonthlyPrice] = useState("0");
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    "trial" | "active" | "past_due" | "cancelled"
  >("trial");
  const [editingSubscriptionId, setEditingSubscriptionId] = useState<
    number | null
  >(null);
  const [pendingCancelSubscriptionId, setPendingCancelSubscriptionId] =
    useState<number | null>(null);
  const remoteSubscriptions = trpc.admin.subscriptions.useQuery(
    {},
    { enabled: Boolean(user), retry: false }
  );
  const createSubscription = trpc.admin.createSubscription.useMutation({
    onSuccess: () => {
      void utils.admin.subscriptions.invalidate();
      toast.success("تم إنشاء الاشتراك");
    },
    onError: error => toast.error(`تعذر إنشاء الاشتراك: ${error.message}`),
  });
  const updateSubscription = trpc.admin.updateSubscription.useMutation({
    onSuccess: () => {
      void utils.admin.subscriptions.invalidate();
      toast.success("تم تحديث الاشتراك");
    },
    onError: error => toast.error(`تعذر تحديث الاشتراك: ${error.message}`),
  });
  const cancelSubscription = trpc.admin.cancelSubscription.useMutation({
    onSuccess: () => {
      void utils.admin.subscriptions.invalidate();
      toast.success("تم إلغاء الاشتراك");
    },
    onError: error => toast.error(`تعذر إلغاء الاشتراك: ${error.message}`),
  });
  const subscriptions = remoteSubscriptions.data ?? [];
  return (
    <Card className="mt-5 rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">إدارة الاشتراكات</CardTitle>
          <p className="mt-1 text-xs text-slate-500">
            حفظ فعلي للحزمة والحالة؛ الإلغاء يحافظ على السجل ولا يحذف الاشتراك.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingSubscriptionId(null);
            setSubscriptionRestaurantId("");
            setSubscriptionPlan("Growth");
            setSubscriptionMonthlyPrice("0");
            setSubscriptionStatus("trial");
            setSubscriptionFormOpen(true);
          }}
          className="rounded-xl bg-[#e76f3c] text-xs hover:bg-[#d85f2e]"
        >
          اشتراك جديد
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {subscriptionFormOpen && (
          <div className="m-5 grid gap-2 rounded-2xl border border-orange-100 bg-orange-50/50 p-4 md:grid-cols-2 xl:grid-cols-5">
            <Input
              type="number"
              min={1}
              value={subscriptionRestaurantId}
              onChange={event =>
                setSubscriptionRestaurantId(event.target.value)
              }
              placeholder="رقم المطعم"
              className="rounded-xl bg-white"
            />
            <Input
              value={subscriptionPlan}
              onChange={event => setSubscriptionPlan(event.target.value)}
              placeholder="الباقة"
              className="rounded-xl bg-white"
            />
            <Input
              value={subscriptionMonthlyPrice}
              onChange={event =>
                setSubscriptionMonthlyPrice(event.target.value)
              }
              placeholder="السعر الشهري"
              className="rounded-xl bg-white"
            />
            <select
              value={subscriptionStatus}
              onChange={event =>
                setSubscriptionStatus(
                  event.target.value as typeof subscriptionStatus
                )
              }
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="trial">تجريبية</option>
              <option value="active">نشطة</option>
              <option value="past_due">متأخرة</option>
              <option value="cancelled">ملغاة</option>
            </select>
            <div className="flex gap-2">
              <Button
                disabled={
                  Number(subscriptionRestaurantId) <= 0 ||
                  !subscriptionPlan.trim() ||
                  !/^\\d+(\\.\\d{1,2})?$/.test(subscriptionMonthlyPrice) ||
                  createSubscription.isPending ||
                  updateSubscription.isPending
                }
                onClick={() => {
                  if (editingSubscriptionId !== null)
                    updateSubscription.mutate({
                      id: editingSubscriptionId,
                      plan: subscriptionPlan.trim(),
                      monthlyPrice: subscriptionMonthlyPrice,
                      status: subscriptionStatus,
                    });
                  else
                    createSubscription.mutate({
                      restaurantId: Number(subscriptionRestaurantId),
                      plan: subscriptionPlan.trim(),
                      monthlyPrice: subscriptionMonthlyPrice,
                      status: subscriptionStatus,
                    });
                  setSubscriptionFormOpen(false);
                  setEditingSubscriptionId(null);
                }}
                className="rounded-xl bg-[#e76f3c]"
              >
                {createSubscription.isPending || updateSubscription.isPending
                  ? "جارٍ الحفظ..."
                  : editingSubscriptionId !== null
                    ? "حفظ التحديث"
                    : "إنشاء الاشتراك"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubscriptionFormOpen(false);
                  setEditingSubscriptionId(null);
                }}
                className="rounded-xl"
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}
        {remoteSubscriptions.isError ? (
          <div className="p-6 text-sm text-red-600">
            تعذر تحميل الاشتراكات. Request ID: admin-subscriptions{" "}
            <button
              onClick={() => void remoteSubscriptions.refetch()}
              className="font-bold underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : remoteSubscriptions.isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            جارٍ تحميل الاشتراكات...
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            لا توجد اشتراكات محفوظة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3">المطعم</th>
                  <th className="px-5 py-3">الباقة</th>
                  <th className="px-5 py-3">السعر الشهري</th>
                  <th className="px-5 py-3">الحالة</th>
                  <th className="px-5 py-3">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(subscription => (
                  <tr
                    key={subscription.id}
                    className="border-t border-slate-100"
                  >
                    <td className="px-5 py-4">#{subscription.restaurantId}</td>
                    <td className="px-5 py-4 font-semibold">
                      {subscription.plan}
                    </td>
                    <td className="px-5 py-4">
                      {subscription.monthlyPrice} SAR
                    </td>
                    <td className="px-5 py-4">{subscription.status}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingSubscriptionId(subscription.id);
                            setSubscriptionRestaurantId(
                              String(subscription.restaurantId)
                            );
                            setSubscriptionPlan(subscription.plan);
                            setSubscriptionMonthlyPrice(
                              String(subscription.monthlyPrice ?? "0")
                            );
                            setSubscriptionStatus(
                              subscription.status as typeof subscriptionStatus
                            );
                            setSubscriptionFormOpen(true);
                          }}
                          className="text-xs font-semibold text-[#e76f3c]"
                        >
                          تحديث
                        </button>
                        {subscription.status !== "cancelled" && (
                          <>
                            <button
                              onClick={() =>
                                setPendingCancelSubscriptionId(subscription.id)
                              }
                              className="text-xs font-semibold text-red-500"
                            >
                              إلغاء
                            </button>
                            {pendingCancelSubscriptionId ===
                              subscription.id && (
                              <span className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[10px] text-red-700">
                                <span>تأكيد؟</span>
                                <button
                                  onClick={() => {
                                    cancelSubscription.mutate({
                                      id: subscription.id,
                                    });
                                    setPendingCancelSubscriptionId(null);
                                  }}
                                  className="font-bold underline"
                                >
                                  نعم
                                </button>
                                <button
                                  onClick={() =>
                                    setPendingCancelSubscriptionId(null)
                                  }
                                  className="font-bold underline"
                                >
                                  لا
                                </button>
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RoleAdminPanel() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [roleFormOpen, setRoleFormOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleRestaurantId, setRoleRestaurantId] = useState("");
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [pendingDeleteRoleId, setPendingDeleteRoleId] = useState<number | null>(
    null
  );
  const rolesQuery = trpc.admin.roles.useQuery(
    {},
    { enabled: Boolean(user), retry: false }
  );
  const createRole = trpc.admin.createRole.useMutation({
    onSuccess: () => {
      void utils.admin.roles.invalidate();
      toast.success("تم إنشاء الدور");
    },
    onError: error => toast.error(`تعذر إنشاء الدور: ${error.message}`),
  });
  const updateRole = trpc.admin.updateRole.useMutation({
    onSuccess: () => {
      void utils.admin.roles.invalidate();
      toast.success("تم تحديث الدور");
    },
    onError: error => toast.error(`تعذر تحديث الدور: ${error.message}`),
  });
  const deleteRole = trpc.admin.deleteRole.useMutation({
    onSuccess: () => {
      void utils.admin.roles.invalidate();
      toast.success("تم حذف الدور");
    },
    onError: error => toast.error(`تعذر حذف الدور: ${error.message}`),
  });
  const roles = rolesQuery.data ?? [];
  return (
    <Card className="mt-5 rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">إدارة الأدوار</CardTitle>
          <p className="mt-1 text-xs text-slate-500">
            إنشاء وتعديل وحذف أدوار المنصة والمطاعم من قاعدة البيانات.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingRoleId(null);
            setRoleName("");
            setRoleRestaurantId("");
            setRoleFormOpen(true);
          }}
          className="rounded-xl bg-[#e76f3c] text-xs hover:bg-[#d85f2e]"
        >
          دور جديد
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {roleFormOpen && (
          <div className="m-5 grid gap-2 rounded-2xl border border-orange-100 bg-orange-50/50 p-4 sm:grid-cols-[1fr_220px_auto_auto]">
            <Input
              value={roleName}
              onChange={event => setRoleName(event.target.value)}
              placeholder="اسم الدور"
              className="rounded-xl bg-white"
            />
            <Input
              type="number"
              min={1}
              value={roleRestaurantId}
              onChange={event => setRoleRestaurantId(event.target.value)}
              placeholder="رقم المطعم، فارغ لدور المنصة"
              className="rounded-xl bg-white"
            />
            <Button
              disabled={
                roleName.trim().length < 2 ||
                (roleRestaurantId.trim() && Number(roleRestaurantId) <= 0) ||
                createRole.isPending ||
                updateRole.isPending
              }
              onClick={() => {
                if (editingRoleId !== null)
                  updateRole.mutate({
                    id: editingRoleId,
                    name: roleName.trim(),
                  });
                else
                  createRole.mutate({
                    name: roleName.trim(),
                    ...(roleRestaurantId.trim()
                      ? { restaurantId: Number(roleRestaurantId) }
                      : {}),
                  });
                setRoleFormOpen(false);
                setEditingRoleId(null);
              }}
              className="rounded-xl bg-[#e76f3c]"
            >
              {createRole.isPending || updateRole.isPending
                ? "جارٍ الحفظ..."
                : editingRoleId !== null
                  ? "حفظ التعديل"
                  : "إنشاء الدور"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setRoleFormOpen(false);
                setEditingRoleId(null);
              }}
              className="rounded-xl"
            >
              إلغاء
            </Button>
          </div>
        )}
        {rolesQuery.isError ? (
          <div className="p-6 text-sm text-red-600">
            تعذر تحميل الأدوار. Request ID: admin-roles{" "}
            <button
              onClick={() => void rolesQuery.refetch()}
              className="font-bold underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : rolesQuery.isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            جارٍ تحميل الأدوار...
          </div>
        ) : roles.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            لا توجد أدوار محفوظة بعد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3">الدور</th>
                  <th className="px-5 py-3">النطاق</th>
                  <th className="px-5 py-3">المطعم</th>
                  <th className="px-5 py-3">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-semibold">{role.name}</td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {role.scope}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {role.restaurantId ? `#${role.restaurantId}` : "المنصة"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditingRoleId(role.id);
                            setRoleName(role.name);
                            setRoleRestaurantId(
                              role.restaurantId ? String(role.restaurantId) : ""
                            );
                            setRoleFormOpen(true);
                          }}
                          className="text-xs font-semibold text-slate-600"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => setPendingDeleteRoleId(role.id)}
                          className="text-xs font-semibold text-red-500"
                        >
                          حذف
                        </button>
                        {pendingDeleteRoleId === role.id && (
                          <span className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[10px] text-red-700">
                            <span>تأكيد؟</span>
                            <button
                              onClick={() => {
                                deleteRole.mutate({ id: role.id });
                                setPendingDeleteRoleId(null);
                              }}
                              className="font-bold underline"
                            >
                              نعم
                            </button>
                            <button
                              onClick={() => setPendingDeleteRoleId(null)}
                              className="font-bold underline"
                            >
                              لا
                            </button>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RolePermissionsPanel({
  roles,
}: {
  roles: Array<{ id: number; name: string }>;
}) {
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(
    roles[0]?.id
  );
  const permissionsQuery = trpc.admin.permissions.useQuery(undefined, {
    retry: false,
  });
  const rolePermissionsQuery = trpc.admin.rolePermissions.useQuery(
    { roleId: selectedRoleId ?? 0 },
    { enabled: Boolean(selectedRoleId), retry: false }
  );
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(
    []
  );
  useEffect(() => {
    setSelectedRoleId(current =>
      current && roles.some(role => role.id === current)
        ? current
        : roles[0]?.id
    );
  }, [roles]);
  useEffect(() => {
    setSelectedPermissionIds(
      (rolePermissionsQuery.data ?? []).map(
        permission => permission.permissionId
      )
    );
  }, [rolePermissionsQuery.data]);
  const setRolePermissions = trpc.admin.setRolePermissions.useMutation({
    onSuccess: () => {
      void rolePermissionsQuery.refetch();
      toast.success("تم حفظ صلاحيات الدور");
    },
    onError: error => toast.error(`تعذر حفظ صلاحيات الدور: ${error.message}`),
  });
  return (
    <Card className="mt-5 rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">صلاحيات الأدوار</CardTitle>
        <p className="mt-1 text-xs text-slate-500">
          اختر دورًا ثم حدّد الصلاحيات المسموح بها واحفظها في rolePermissions.
        </p>
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
            أنشئ دورًا أولًا لإدارة صلاحياته.
          </p>
        ) : (
          <>
            <select
              value={selectedRoleId ?? ""}
              onChange={event => setSelectedRoleId(Number(event.target.value))}
              className="mb-4 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {permissionsQuery.isError || rolePermissionsQuery.isError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                تعذر تحميل صلاحيات الدور. Request ID: role-permissions{" "}
                <button
                  onClick={() => {
                    void permissionsQuery.refetch();
                    void rolePermissionsQuery.refetch();
                  }}
                  className="font-bold underline"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : permissionsQuery.isLoading || rolePermissionsQuery.isLoading ? (
              <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
            ) : (
              <>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {(permissionsQuery.data ?? []).map(permission => (
                    <label
                      key={permission.id}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-100 p-3 text-xs hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissionIds.includes(permission.id)}
                        onChange={event =>
                          setSelectedPermissionIds(current =>
                            event.target.checked
                              ? Array.from(new Set([...current, permission.id]))
                              : current.filter(id => id !== permission.id)
                          )
                        }
                      />
                      <span>
                        <span className="block font-semibold">
                          {permission.label}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {permission.key}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <Button
                  disabled={!selectedRoleId || setRolePermissions.isPending}
                  onClick={() =>
                    selectedRoleId &&
                    setRolePermissions.mutate({
                      roleId: selectedRoleId,
                      permissionIds: selectedPermissionIds,
                    })
                  }
                  className="mt-4 rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"
                >
                  {setRolePermissions.isPending
                    ? "جارٍ الحفظ..."
                    : "حفظ الصلاحيات"}
                </Button>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function FeatureUsagePanel() {
  const query = trpc.admin.featureUsageMetrics.useQuery(undefined, {
    retry: false,
  });
  const rows = query.data ?? [];
  return (
    <Card className="mt-5 rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-base">استخدام الميزات عبر المطاعم</CardTitle>
        <p className="mt-1 text-xs text-slate-500">
          مؤشرات حقيقية من إعدادات الميزات المحفوظة، وليست بيانات تجريبية.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {query.isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            جارٍ تحميل التحليلات...
          </div>
        ) : query.isError ? (
          <div className="p-6 text-sm text-red-600">
            تعذر تحميل تحليلات الميزات. Request ID: feature-usage{" "}
            <button
              onClick={() => void query.refetch()}
              className="font-bold underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            لا توجد بيانات استخدام ميزات بعد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3">الميزة</th>
                  <th className="px-5 py-3">المطاعم المهيّأة</th>
                  <th className="px-5 py-3">المطاعم المفعّلة</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.featureId} className="border-t border-slate-100">
                    <td className="px-5 py-4">
                      <p className="font-semibold">{row.label}</p>
                      <p className="mt-1 font-mono text-[10px] text-slate-400">
                        {row.key}
                      </p>
                    </td>
                    <td className="px-5 py-4">{row.configuredRestaurants}</td>
                    <td className="px-5 py-4 font-bold text-emerald-600">
                      {row.enabledRestaurants}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FeatureAccessPanel({ restaurantId }: { restaurantId: number }) {
  const [forbiddenAction, setForbiddenAction] = useState<string | null>(null);
  const definitions = trpc.features.definitions.useQuery(undefined, {
    retry: false,
  });
  const [selectedKey, setSelectedKey] = useState("offline_pos");
  const selected =
    definitions.data?.find(feature => feature.key === selectedKey) ??
    definitions.data?.[0];
  const access = trpc.features.access.useQuery(
    { restaurantId, key: selected?.key ?? selectedKey },
    { retry: false, enabled: Boolean(selected?.key ?? selectedKey) }
  );
  const setOverride = trpc.features.setOverride.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ إعداد الميزة للمطعم");
      access.refetch();
    },
    onError: error => {
      if (error.data?.code === "FORBIDDEN")
        setForbiddenAction("feature.override.update");
      else toast.error(error.message);
    },
  });
  if (forbiddenAction) return <AccessDeniedView feature={forbiddenAction} />;
  return (
    <Card className="mt-5 rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex-row items-center justify-between border-b border-slate-100">
        <div>
          <CardTitle className="text-base">الميزات الديناميكية</CardTitle>
          <p className="mt-1 text-xs text-slate-500">
            تحكم في التفعيل والحدود والتبعيات دون تغيير الباقة.
          </p>
        </div>
        <Badge
          className={
            access.data?.enabled
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }
        >
          {access.isLoading
            ? "جارٍ الفحص"
            : access.data?.enabled
              ? "مفعّلة"
              : "غير مفعّلة"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        {(definitions.data ?? []).length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
            لا توجد تعريفات ميزات بعد.
          </p>
        ) : (
          <>
            <select
              value={selected?.key ?? selectedKey}
              onChange={event => setSelectedKey(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
            >
              {(definitions.data ?? []).map(feature => (
                <option key={feature.key} value={feature.key}>
                  {feature.label} · {feature.key}
                  {feature.isAddOn
                    ? ` · Add-on${feature.addonPrice ? ` ${feature.addonPrice} SAR` : ""}`
                    : ""}
                </option>
              ))}
            </select>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">الحالة</p>
                <p className="mt-1 text-sm font-bold">
                  {access.data?.reason ?? "—"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">الحد الحالي</p>
                <p className="mt-1 text-sm font-bold">
                  {access.data?.limit ?? "غير محدود"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">المعرف</p>
                <p className="mt-1 truncate text-sm font-bold">
                  {selected?.key}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">النوع</p>
                <p className="mt-1 text-sm font-bold">
                  {selected?.isAddOn
                    ? `Add-on${selected.addonPrice ? ` · ${selected.addonPrice} SAR` : ""}`
                    : "ضمن الباقة"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                disabled={!selected || setOverride.isPending}
                onClick={() =>
                  selected &&
                  setOverride.mutate({
                    restaurantId,
                    featureId: selected.id,
                    enabled: !access.data?.enabled,
                    limit: access.data?.limit ?? null,
                  })
                }
                className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"
              >
                {access.data?.enabled ? "تعطيل Override" : "تفعيل Override"}
              </Button>
              <Button
                variant="outline"
                onClick={() => access.refetch()}
                className="rounded-xl"
              >
                تحديث
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

const restaurantThemePresets = [
  {
    id: "nfood-sunset",
    name: "NFOOD Sunset",
    color: "#e76f3c",
    dark: "#1f1720",
  },
  { id: "olive-cream", name: "Olive Cream", color: "#6b7a45", dark: "#1b2119" },
  {
    id: "midnight-berry",
    name: "Midnight Berry",
    color: "#8b5cf6",
    dark: "#151225",
  },
  { id: "ocean-mint", name: "Ocean Mint", color: "#0f9f96", dark: "#102322" },
] as const;
const restaurantMenuTemplates = [
  { id: "editorial", name: "Editorial", description: "فاخر وواضح", swatch: "linear-gradient(135deg, #fff8f2, #f4c7a1)" },
  { id: "bistro", name: "Bistro", description: "دافئ وحميم", swatch: "linear-gradient(135deg, #f3ebe2, #b86b45)" },
  { id: "glass", name: "NFOOD Glass", description: "داكن وزجاجي", swatch: "linear-gradient(135deg, #0b0f17, #f97316)" },
] as const;
const menuScheduleDays = [
  { value: 0, label: "الأحد" },
  { value: 1, label: "الاثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" },
] as const;
type MenuTemplateId = (typeof restaurantMenuTemplates)[number]["id"];
type MenuTemplateRuleDraft = { days: number[]; start: string; end: string; template: MenuTemplateId };
const defaultMenuTemplateRule: MenuTemplateRuleDraft = { days: [0, 1, 2, 3, 4, 5, 6], start: "18:00", end: "02:00", template: "glass" };
function BrandingPanel({ restaurantId }: { restaurantId: number }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const brandingQuery = trpc.platform.branding.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const customDomainAccess = trpc.features.access.useQuery(
    { restaurantId, key: "custom_domain" },
    { enabled: Boolean(user), retry: false }
  );
  const publicOrigin =
    customDomainAccess.data?.enabled && brandingQuery.data?.customDomain
      ? `https://${brandingQuery.data.customDomain}`
      : window.location.origin;
  const [draft, setDraft] = useState({
    brandName: "",
    brandColor: "#e76f3c",
    themeMode: "light" as "light" | "dark" | "system",
    themePreset: "nfood-sunset" as
      | "nfood-sunset"
      | "olive-cream"
      | "midnight-berry"
      | "ocean-mint",
    menuTemplate: "editorial" as "editorial" | "bistro" | "glass",
    menuTemplateScheduleEnabled: false,
    menuTemplateScheduleTimezone: "Asia/Riyadh",
    menuTemplateScheduleFallback: "editorial" as MenuTemplateId,
    menuTemplateScheduleRules: [defaultMenuTemplateRule] as MenuTemplateRuleDraft[],
    glassGlowColor: "#F97316",
    glassCardOpacity: 0.1,
    brandLogoUrl: "",
    pwaInstallMessage: "ثبّت منيو مطعمنا للوصول الأسرع",
    pwaInstallIconUrl: "",
    brandDescription: "",
    homepageContent: "",
    termsOfService: "",
    privacyPolicy: "",
    refundPolicy: "",
    phone: "",
    whatsapp: "",
    instagramUrl: "",
    facebookUrl: "",
    tiktokUrl: "",
    websiteUrl: "",
    address: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    seoHashtags: "",
    seoImageUrl: "",
    seoCanonicalUrl: "",
    seoRobots: "index,follow",
    googleSearchConsoleVerification: "",
    googleAnalyticsMeasurementId: "",
    googleTagManagerId: "",
    structuredDataJson: "",
    reservationEnabled: true,
    cancellationEnabled: true,
    cancellationWindowMinutes: 15,
    reservationNoShowGraceMinutes: 10,
    tipsEnabled: false,
    tipPercent: 0,
    serviceFeeEnabled: false,
    serviceFeePercent: 0,
    showBranchesOnMenu: false,
    menuDisplaySettingsJson: JSON.stringify(defaultMenuDisplaySettings),
    customDomain: "",
  });
  useEffect(() => {
    if (brandingQuery.data)
      setDraft({
        brandName: brandingQuery.data.brandName,
        brandColor: brandingQuery.data.brandColor,
        themeMode: brandingQuery.data.themeMode,
        themePreset: brandingQuery.data.themePreset as
          | "nfood-sunset"
          | "olive-cream"
          | "midnight-berry"
          | "ocean-mint",
        menuTemplate: brandingQuery.data.menuTemplate as "editorial" | "bistro" | "glass",
        menuTemplateScheduleEnabled: (() => { try { return Boolean(JSON.parse(brandingQuery.data.menuTemplateScheduleJson ?? "{}").enabled); } catch { return false; } })(),
        menuTemplateScheduleTimezone: brandingQuery.data.menuTemplateScheduleTimezone ?? "Asia/Riyadh",
        menuTemplateScheduleFallback: (() => { try { const parsed = JSON.parse(brandingQuery.data.menuTemplateScheduleJson ?? "{}"); return ["editorial", "bistro", "glass"].includes(parsed.fallbackTemplate) ? parsed.fallbackTemplate : brandingQuery.data.menuTemplate as MenuTemplateId; } catch { return brandingQuery.data.menuTemplate as MenuTemplateId; } })(),
        menuTemplateScheduleRules: (() => { try { const parsed = JSON.parse(brandingQuery.data.menuTemplateScheduleJson ?? "{}"); return Array.isArray(parsed.rules) && parsed.rules.length ? parsed.rules : [defaultMenuTemplateRule]; } catch { return [defaultMenuTemplateRule]; } })(),
        glassGlowColor: brandingQuery.data.glassGlowColor ?? "#F97316",
        glassCardOpacity: Number(brandingQuery.data.glassCardOpacity ?? 0.1),
        brandLogoUrl: brandingQuery.data.brandLogoUrl,
        pwaInstallMessage: brandingQuery.data.pwaInstallMessage,
        pwaInstallIconUrl: brandingQuery.data.pwaInstallIconUrl,
        brandDescription: brandingQuery.data.brandDescription,
        homepageContent: brandingQuery.data.homepageContent,
        termsOfService: brandingQuery.data.termsOfService,
        privacyPolicy: brandingQuery.data.privacyPolicy,
        refundPolicy: brandingQuery.data.refundPolicy,
        phone: brandingQuery.data.phone,
        whatsapp: brandingQuery.data.whatsapp,
        instagramUrl: brandingQuery.data.instagramUrl,
        facebookUrl: brandingQuery.data.facebookUrl,
        tiktokUrl: brandingQuery.data.tiktokUrl,
        websiteUrl: brandingQuery.data.websiteUrl,
        address: brandingQuery.data.address,
        seoTitle: brandingQuery.data.seoTitle,
        seoDescription: brandingQuery.data.seoDescription,
        seoKeywords: brandingQuery.data.seoKeywords,
        seoHashtags: brandingQuery.data.seoHashtags,
        seoImageUrl: brandingQuery.data.seoImageUrl,
        seoCanonicalUrl: brandingQuery.data.seoCanonicalUrl,
        seoRobots: brandingQuery.data.seoRobots,
        googleSearchConsoleVerification: brandingQuery.data.googleSearchConsoleVerification,
        googleAnalyticsMeasurementId: brandingQuery.data.googleAnalyticsMeasurementId,
        googleTagManagerId: brandingQuery.data.googleTagManagerId,
        structuredDataJson: brandingQuery.data.structuredDataJson,
        reservationEnabled: brandingQuery.data.reservationEnabled,
        cancellationEnabled: brandingQuery.data.cancellationEnabled,
        cancellationWindowMinutes: brandingQuery.data.cancellationWindowMinutes,
        reservationNoShowGraceMinutes:
          brandingQuery.data.reservationNoShowGraceMinutes,
        tipsEnabled: brandingQuery.data.tipsEnabled,
        tipPercent: Number(brandingQuery.data.tipPercent),
        serviceFeeEnabled: brandingQuery.data.serviceFeeEnabled,
        serviceFeePercent: Number(brandingQuery.data.serviceFeePercent),
        showBranchesOnMenu: brandingQuery.data.showBranchesOnMenu,
        menuDisplaySettingsJson: brandingQuery.data.menuDisplaySettingsJson ?? JSON.stringify(defaultMenuDisplaySettings),
        customDomain: brandingQuery.data.customDomain,
      });
  }, [brandingQuery.data]);
  const updateBranding = trpc.platform.updateBranding.useMutation({
    onSuccess: () => {
      void utils.platform.branding.invalidate();
      toast.success("تم حفظ هوية المطعم");
    },
    onError: error => toast.error(`تعذر حفظ الهوية: ${error.message}`),
  });
  const updateCustomDomain = trpc.platform.updateCustomDomain.useMutation({
    onSuccess: () => {
      void utils.platform.branding.invalidate({ restaurantId });
      void customDomainAccess.refetch();
      toast.success("تم حفظ نطاق المطعم");
    },
    onError: error => toast.error(`تعذر حفظ النطاق: ${error.message}`),
  });
  const updateMenuTemplateSchedule = trpc.platform.updateMenuTemplateSchedule.useMutation({
    onSuccess: async () => {
      await brandingQuery.refetch();
      toast.success("تم حفظ جدولة قالب المنيو");
    },
    onError: error => toast.error(`تعذر حفظ جدولة القالب: ${error.message}`),
  });
  const publicPreviewUrl = useMemo(() => {
    if (!brandingQuery.data?.slug) return "";
    const url = new URL(publicMenuUrl(publicOrigin, brandingQuery.data.slug), window.location.origin);
    url.searchParams.set("template", draft.menuTemplate);
    url.searchParams.set("preview", "1");
    if (draft.menuTemplate === "glass") {
      url.searchParams.set("glassGlow", draft.glassGlowColor);
      url.searchParams.set("glassOpacity", draft.glassCardOpacity.toFixed(2));
    }
    return url.toString();
  }, [brandingQuery.data?.slug, draft.glassCardOpacity, draft.glassGlowColor, draft.menuTemplate, publicOrigin]);
  const openPublicPreview = () => {
    if (!publicPreviewUrl) return;
    window.open(publicPreviewUrl, "_blank", "noopener,noreferrer");
  };
  const updateScheduleRule = (index: number, patch: Partial<MenuTemplateRuleDraft>) => setDraft(current => ({ ...current, menuTemplateScheduleRules: current.menuTemplateScheduleRules.map((rule, ruleIndex) => ruleIndex === index ? { ...rule, ...patch } : rule) }));
  const toggleScheduleDay = (index: number, day: number) => setDraft(current => ({ ...current, menuTemplateScheduleRules: current.menuTemplateScheduleRules.map((rule, ruleIndex) => ruleIndex === index ? { ...rule, days: rule.days.includes(day) ? rule.days.filter(value => value !== day) : [...rule.days, day].sort((a, b) => a - b) } : rule) }));
  const addScheduleRule = () => setDraft(current => ({ ...current, menuTemplateScheduleRules: current.menuTemplateScheduleRules.length >= 12 ? current.menuTemplateScheduleRules : [...current.menuTemplateScheduleRules, { ...defaultMenuTemplateRule, days: [...defaultMenuTemplateRule.days] }] }));
  const removeScheduleRule = (index: number) => setDraft(current => ({ ...current, menuTemplateScheduleRules: current.menuTemplateScheduleRules.filter((_, ruleIndex) => ruleIndex !== index) }));
  const saveSchedule = () => updateMenuTemplateSchedule.mutate({ restaurantId, enabled: draft.menuTemplateScheduleEnabled, timezone: draft.menuTemplateScheduleTimezone, fallbackTemplate: draft.menuTemplateScheduleFallback, rules: draft.menuTemplateScheduleRules.filter(rule => rule.days.length) });
  const menuToolLabels: Record<MenuDisplayToolKey, string> = { search: "البحث عن الأصناف", categories: "أقسام المنيو", pdf: "تنزيل PDF نصي (إجراء ثانوي)", templatePicker: "اختيار نمط المنيو", qr: "QR Menu", branchPicker: "اختيار الفرع", workingHours: "مواعيد العمل", contactFooter: "التواصل في الفوتر", mediaShowcase: "محتوى المطعم" };
  const menuDisplayDraft = normalizeMenuDisplaySettings(draft.menuDisplaySettingsJson);
  const toggleMenuTool = (key: MenuDisplayToolKey) => setDraft(current => ({ ...current, menuDisplaySettingsJson: JSON.stringify({ ...menuDisplayDraft, tools: { ...menuDisplayDraft.tools, [key]: !menuDisplayDraft.tools[key] } }) }));
  const setMenuGridColumns = (gridColumns: MenuGridColumns) => setDraft(current => ({ ...current, menuDisplaySettingsJson: JSON.stringify({ ...menuDisplayDraft, gridColumns }) }));
  return (
    <Card className="mb-6 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">هوية المطعم وWhite Label</CardTitle>
        <p className="text-xs text-slate-500">
          خصّص الاسم واللون والوصف الذي يظهران لعملاء هذا المطعم.
        </p>
      </CardHeader>
      <CardContent>
        {brandingQuery.isError ? (
          <div className="p-4 text-sm text-red-600">
            تعذر تحميل الهوية. Request ID: branding-{restaurantId}{" "}
            <button
              onClick={() => void brandingQuery.refetch()}
              className="font-bold underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : brandingQuery.isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            جارٍ تحميل هوية المطعم...
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold">
                اسم العرض
                <Input
                  value={draft.brandName}
                  onChange={event =>
                    setDraft({ ...draft, brandName: event.target.value })
                  }
                  className="mt-1 rounded-xl"
                  placeholder="اسم المطعم للعملاء"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold">
                اللون الأساسي
                <div className="mt-1 flex gap-2">
                  <Input
                    value={draft.brandColor}
                    onChange={event =>
                      setDraft({ ...draft, brandColor: event.target.value })
                    }
                    className="rounded-xl font-mono"
                    placeholder="#e76f3c"
                  />
                  <input
                    type="color"
                    value={
                      /^#[0-9A-Fa-f]{6}$/.test(draft.brandColor)
                        ? draft.brandColor
                        : "#e76f3c"
                    }
                    onChange={event =>
                      setDraft({ ...draft, brandColor: event.target.value })
                    }
                    className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                    aria-label="اختيار لون الهوية"
                  />
                </div>
              </label>
              <div className="space-y-3 sm:col-span-2">
                <p className="text-sm font-semibold">
                  قالب المظهر والوضع الداكن
                </p>
                <div className="grid gap-2 sm:grid-cols-4">
                  {restaurantThemePresets.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          themePreset: preset.id,
                          brandColor: preset.color,
                        })
                      }
                      className={`rounded-xl border p-3 text-right transition ${draft.themePreset === preset.id ? "border-orange-400 bg-orange-50 shadow-sm" : "border-slate-200 bg-white hover:border-orange-200"}`}
                    >
                      <span
                        className="mb-2 block h-6 rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${preset.color}, ${preset.dark})`,
                        }}
                      />
                      <span className="text-xs font-bold text-slate-800">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: "light", label: "فاتح" },
                      { id: "dark", label: "داكن" },
                      { id: "system", label: "حسب الجهاز" },
                    ] as const
                  ).map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setDraft({ ...draft, themeMode: mode.id })}
                      className={`rounded-lg px-3 py-2 text-xs font-bold ${draft.themeMode === mode.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
                <p className="mb-2 text-sm font-semibold">القالب الافتراضي للمنيو</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {restaurantMenuTemplates.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      aria-pressed={draft.menuTemplate === template.id}
                      onClick={() => setDraft({ ...draft, menuTemplate: template.id })}
                      className={`rounded-xl border p-2 text-right transition ${draft.menuTemplate === template.id ? "border-orange-400 bg-orange-50 shadow-sm" : "border-slate-200 bg-slate-50 hover:border-orange-200"}`}
                    >
                      <span className="mb-2 block h-8 rounded-lg" style={{ background: template.swatch }} />
                      <span className="block text-xs font-black text-slate-800">{template.name}</span>
                      <span className="mt-0.5 block text-[10px] text-slate-500">{template.description}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  سيظهر القالب والوضع المختار في صفحة المنيو العامة بعد الحفظ. يمكن للزائر معاينة نمط آخر مؤقتًا.
                </p>
              </div>
              <section className="space-y-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 sm:col-span-2" data-menu-template-schedule>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-900"><Clock3 className="h-4 w-4 text-indigo-600" />جدولة قالب المنيو</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">فعّل التبديل التلقائي حسب توقيت المطعم. المثال الافتراضي يعرض NFOOD Glass من 18:00 حتى 02:00.</p>
                  </div>
                  <button type="button" role="switch" aria-checked={draft.menuTemplateScheduleEnabled} onClick={() => setDraft(current => ({ ...current, menuTemplateScheduleEnabled: !current.menuTemplateScheduleEnabled }))} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${draft.menuTemplateScheduleEnabled ? "bg-indigo-600" : "bg-slate-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${draft.menuTemplateScheduleEnabled ? "start-6" : "start-1"}`} /></button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-xs font-bold">القالب خارج الفترات<select value={draft.menuTemplateScheduleFallback} onChange={event => setDraft({ ...draft, menuTemplateScheduleFallback: event.target.value as MenuTemplateId })} className="mt-1 h-10 w-full rounded-xl border border-indigo-100 bg-white px-3 text-sm"><option value="editorial">Editorial</option><option value="bistro">Bistro</option><option value="glass">NFOOD Glass</option></select></label>
                  <label className="space-y-1 text-xs font-bold">المنطقة الزمنية<select value={draft.menuTemplateScheduleTimezone} onChange={event => setDraft({ ...draft, menuTemplateScheduleTimezone: event.target.value })} className="mt-1 h-10 w-full rounded-xl border border-indigo-100 bg-white px-3 text-sm" dir="ltr"><option value="Asia/Riyadh">Asia/Riyadh · الرياض</option><option value="Asia/Dubai">Asia/Dubai · دبي</option><option value="Africa/Cairo">Africa/Cairo · القاهرة</option><option value="Europe/Paris">Europe/Paris · باريس</option><option value="UTC">UTC</option></select></label>
                </div>
                <div className="space-y-2">
                  {draft.menuTemplateScheduleRules.map((rule, index) => <div key={`schedule-rule-${index}`} className="rounded-xl border border-indigo-100 bg-white p-3 shadow-sm"><div className="flex flex-wrap items-end gap-2"><label className="text-xs font-bold">من<input type="time" value={rule.start} onChange={event => updateScheduleRule(index, { start: event.target.value })} className="mt-1 h-9 rounded-lg border border-slate-200 px-2 text-sm" dir="ltr" /></label><label className="text-xs font-bold">إلى<input type="time" value={rule.end} onChange={event => updateScheduleRule(index, { end: event.target.value })} className="mt-1 h-9 rounded-lg border border-slate-200 px-2 text-sm" dir="ltr" /></label><label className="min-w-40 flex-1 text-xs font-bold">القالب<select value={rule.template} onChange={event => updateScheduleRule(index, { template: event.target.value as MenuTemplateId })} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm"><option value="editorial">Editorial</option><option value="bistro">Bistro</option><option value="glass">NFOOD Glass</option></select></label><button type="button" onClick={() => removeScheduleRule(index)} disabled={draft.menuTemplateScheduleRules.length <= 1} className="h-9 rounded-lg px-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="حذف فترة الجدولة">حذف</button></div><div className="mt-2 flex flex-wrap gap-1">{menuScheduleDays.map(day => <button key={day.value} type="button" aria-pressed={rule.days.includes(day.value)} onClick={() => toggleScheduleDay(index, day.value)} className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${rule.days.includes(day.value) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-indigo-50"}`}>{day.label}</button>)}</div></div>)}
                  <div className="flex flex-wrap items-center justify-between gap-2"><button type="button" onClick={addScheduleRule} disabled={draft.menuTemplateScheduleRules.length >= 12} className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50 disabled:opacity-40"><Plus className="h-3.5 w-3.5" />إضافة فترة</button><Button type="button" onClick={saveSchedule} disabled={updateMenuTemplateSchedule.isPending || (draft.menuTemplateScheduleEnabled && draft.menuTemplateScheduleRules.some(rule => !rule.days.length))} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs hover:bg-indigo-700">{updateMenuTemplateSchedule.isPending ? "جارٍ حفظ الجدولة..." : "حفظ الجدولة"}</Button></div>
                </div>
              </section>
              {draft.menuTemplate === "glass" && <section className="space-y-3 rounded-2xl border border-slate-700 bg-slate-950 p-4 text-white sm:col-span-2" data-glass-customization><div className="flex items-start gap-3"><SlidersHorizontal className="mt-0.5 h-5 w-5 text-orange-400" /><div><h3 className="text-sm font-black">تخصيص NFOOD Glass</h3><p className="mt-1 text-xs leading-5 text-slate-400">اضبط لون التوهج ووضوح البطاقات، وستظهر القيم في المعاينة والمنيو العام بعد الحفظ.</p></div></div><div className="grid gap-3 sm:grid-cols-2"><label className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-bold">لون التوهج<div className="mt-2 flex items-center gap-2"><input type="color" value={draft.glassGlowColor} onChange={event => setDraft({ ...draft, glassGlowColor: event.target.value })} className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent" aria-label="لون توهج NFOOD Glass" /><Input value={draft.glassGlowColor} onChange={event => setDraft({ ...draft, glassGlowColor: event.target.value })} dir="ltr" className="h-9 border-white/10 bg-white/10 font-mono text-xs text-white" /></div></label><label className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-bold">شفافية البطاقات<div className="mt-3 flex items-center gap-3"><input type="range" min="0.05" max="0.35" step="0.01" value={draft.glassCardOpacity} onChange={event => setDraft({ ...draft, glassCardOpacity: Number(event.target.value) })} className="w-full accent-orange-500" /><span className="min-w-12 rounded-lg bg-white/10 px-2 py-1 text-center font-mono text-[11px] text-orange-300">{Math.round(draft.glassCardOpacity * 100)}%</span></div><div className="mt-1 flex justify-between text-[10px] font-normal text-slate-500"><span>أكثر شفافية</span><span>أوضح</span></div></label></div></section>}
              <section className="space-y-3 rounded-2xl border border-orange-100 bg-orange-50/50 p-4 sm:col-span-2" data-menu-display-settings><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-black text-slate-900">أدوات المنيو تحت الهيدر</h3><p className="mt-1 text-xs leading-5 text-slate-500">تحكم في الأدوات التي تظهر للعميل مباشرة بعد الهيدر وقبل شبكة الأصناف.</p></div><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-orange-700">معاينة فورية بعد الحفظ</span></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{(Object.keys(menuToolLabels) as MenuDisplayToolKey[]).map(key => <label key={key} className="flex cursor-pointer items-center gap-2 rounded-xl border border-white bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm"><input type="checkbox" checked={menuDisplayDraft.tools[key]} onChange={() => toggleMenuTool(key)} className="h-4 w-4 accent-orange-500" />{menuToolLabels[key]}</label>)}</div><label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm"><input type="checkbox" checked={menuDisplayDraft.showCustomerAccount} onChange={event => setDraft(current => ({ ...current, menuDisplaySettingsJson: JSON.stringify({ ...menuDisplayDraft, showCustomerAccount: event.target.checked }) }))} className="h-4 w-4 accent-orange-500" />إظهار التسجيل والدخول للعميل في الهيدر</label><div className="rounded-xl border border-white bg-white p-3"><p className="text-xs font-black text-slate-700">تخطيط شبكة الأصناف</p><p className="mt-1 text-[11px] text-slate-500">اختر عدد البطاقات في الصف على الشاشات الكبيرة.</p><div className="mt-2 grid grid-cols-4 gap-2">{([4, 3, 2, 1] as MenuGridColumns[]).map(columns => <button key={columns} type="button" onClick={() => setMenuGridColumns(columns)} aria-pressed={menuDisplayDraft.gridColumns === columns} className={`rounded-xl border px-2 py-2 text-xs font-black transition ${menuDisplayDraft.gridColumns === columns ? "border-orange-500 bg-orange-500 text-white shadow-sm" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-orange-200"}`}>{columns}×{columns}<span className="mt-1 block text-[10px] font-medium opacity-70">{columns === 4 ? "كثيف" : columns === 3 ? "متوازن" : columns === 2 ? "واسع" : "مفرد"}</span></button>)}</div><div className="mt-3 rounded-xl border border-orange-200 bg-slate-950 p-3 text-white" data-menu-grid-live-preview><div className="flex items-center justify-between gap-2"><div><p className="text-xs font-black">معاينة مباشرة للتخطيط</p><p className="mt-1 text-[10px] text-white/60">تتغير فورًا قبل اعتماد الحفظ: {menuDisplayDraft.gridColumns}×{menuDisplayDraft.gridColumns}</p></div><span className="rounded-full bg-orange-500/20 px-2 py-1 text-[10px] font-black text-orange-200">مسودة</span></div><div className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${menuDisplayDraft.gridColumns}, minmax(0, 1fr))` }}>{Array.from({ length: menuDisplayDraft.gridColumns === 1 ? 4 : menuDisplayDraft.gridColumns * 2 }, (_, index) => <div key={index} className="min-h-10 rounded-lg border border-white/10 bg-white/10 p-1.5"><div className="h-4 rounded bg-white/15" /><div className="mt-1 h-1.5 w-3/4 rounded bg-orange-300/70" /></div>)}</div></div></div></section>
              <label className="space-y-2 text-sm font-semibold sm:col-span-2">
                رابط الشعار
                <Input
                  value={draft.brandLogoUrl}
                  onChange={event =>
                    setDraft({ ...draft, brandLogoUrl: event.target.value })
                  }
                  className="mt-1 rounded-xl"
                  placeholder="https://..."
                  dir="ltr"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold">
                الهاتف
                <Input
                  value={draft.phone}
                  onChange={event =>
                    setDraft({ ...draft, phone: event.target.value })
                  }
                  className="mt-1 rounded-xl"
                  dir="ltr"
                  placeholder="05xxxxxxxx"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold">
                واتساب
                <Input
                  value={draft.whatsapp}
                  onChange={event =>
                    setDraft({ ...draft, whatsapp: event.target.value })
                  }
                  className="mt-1 rounded-xl"
                  dir="ltr"
                  placeholder="9665xxxxxxxx"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold">
                Instagram
                <Input
                  value={draft.instagramUrl}
                  onChange={event =>
                    setDraft({ ...draft, instagramUrl: event.target.value })
                  }
                  className="mt-1 rounded-xl"
                  dir="ltr"
                  placeholder="https://instagram.com/..."
                />
              </label>
              <label className="space-y-2 text-sm font-semibold">
                Facebook
                <Input
                  value={draft.facebookUrl}
                  onChange={event =>
                    setDraft({ ...draft, facebookUrl: event.target.value })
                  }
                  className="mt-1 rounded-xl"
                  dir="ltr"
                  placeholder="https://facebook.com/..."
                />
              </label>
              <label className="space-y-2 text-sm font-semibold">
                TikTok
                <Input
                  value={draft.tiktokUrl}
                  onChange={event =>
                    setDraft({ ...draft, tiktokUrl: event.target.value })
                  }
                  className="mt-1 rounded-xl"
                  dir="ltr"
                  placeholder="https://tiktok.com/@..."
                />
              </label>
              <label className="space-y-2 text-sm font-semibold">
                الموقع الإلكتروني
                <Input
                  value={draft.websiteUrl}
                  onChange={event =>
                    setDraft({ ...draft, websiteUrl: event.target.value })
                  }
                  className="mt-1 rounded-xl"
                  dir="ltr"
                  placeholder="https://..."
                />
              </label>
              <label className="space-y-2 text-sm font-semibold sm:col-span-2">
                العنوان
                <Input
                  value={draft.address}
                  onChange={event =>
                    setDraft({ ...draft, address: event.target.value })
                  }
                  className="mt-1 rounded-xl"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold">
                مهلة عدم الحضور بالدقائق
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={draft.reservationNoShowGraceMinutes}
                  onChange={event =>
                    setDraft({
                      ...draft,
                      reservationNoShowGraceMinutes: Number(event.target.value),
                    })
                  }
                  className="mt-1 rounded-xl"
                />
                <span className="text-xs font-normal text-slate-500">
                  بعد وقت الحجز بهذه المدة يُسجّل الحجز كعدم حضور وتُرسل رسالة
                  للعميل.
                </span>
              </label>
              <label className="space-y-2 text-sm font-semibold sm:col-span-2">
                نطاق المطعم المستقل
                {customDomainAccess.data?.enabled ? (
                  <span className="mr-2 text-xs font-normal text-emerald-600">
                    متاح ضمن الباقة
                  </span>
                ) : (
                  <span className="mr-2 text-xs font-normal text-amber-600">
                    غير مفعّل ضمن الباقة
                  </span>
                )}
                <div className="mt-1 flex gap-2">
                  <Input
                    value={draft.customDomain}
                    onChange={event =>
                      setDraft({
                        ...draft,
                        customDomain: event.target.value
                          .toLowerCase()
                          .replace(/^https?:\/\//, "")
                          .replace(/\/+$/, ""),
                      })
                    }
                    className="rounded-xl font-mono"
                    dir="ltr"
                    placeholder="restaurant.example.com"
                    disabled={!customDomainAccess.data?.enabled}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={
                      !customDomainAccess.data?.enabled ||
                      updateCustomDomain.isPending ||
                      !/^[a-z0-9.-]+$/i.test(draft.customDomain)
                    }
                    onClick={() =>
                      updateCustomDomain.mutate({
                        restaurantId,
                        customDomain: draft.customDomain,
                      })
                    }
                  >
                    حفظ النطاق
                  </Button>
                </div>
                <p className="mt-1 text-xs font-normal text-slate-500">
                  هذا النطاق منفصل عن نطاق NFOOD ويحتاج توجيه DNS عند مزود
                  النطاق.
                </p>
              </label>
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold sm:col-span-2">
                <input
                  type="checkbox"
                  checked={draft.showBranchesOnMenu}
                  onChange={event =>
                    setDraft({
                      ...draft,
                      showBranchesOnMenu: event.target.checked,
                    })
                  }
                  className="mt-1 h-4 w-4 accent-orange-500"
                />
                <span>
                  <span className="block text-slate-900">
                    إظهار الفروع في المنيو
                  </span>
                  <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
                    فعّل هذا الخيار إذا أردت أن يرى العميل محدد الفروع
                    ومواعيدها. عند إيقافه تبقى بيانات الفرع محفوظة للطلب، لكن لا
                    تشغل مساحة من واجهة المنيو.
                  </span>
                </span>
              </label>
              <div className="sm:col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      تخصيص تنبيه تثبيت المنيو
                    </p>
                    <p className="mt-1 text-xs font-normal leading-5 text-slate-500">
                      اكتب رسالة قصيرة تعكس هوية المطعم، واستخدم رابط شعار أو
                      أيقونة مربعة من مكتبة الوسائط.
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                  <label className="space-y-2 text-sm font-semibold">
                    رسالة التنبيه
                    <Input
                      value={draft.pwaInstallMessage}
                      maxLength={180}
                      onChange={event =>
                        setDraft({
                          ...draft,
                          pwaInstallMessage: event.target.value,
                        })
                      }
                      placeholder="ثبّت منيو مطعمنا للوصول الأسرع"
                      className="mt-1 rounded-xl bg-white"
                    />
                    <span className="text-[10px] font-normal text-slate-400">
                      {draft.pwaInstallMessage.length}/180
                    </span>
                  </label>
                  <label className="space-y-2 text-sm font-semibold">
                    رابط الأيقونة أو الشعار
                    <Input
                      value={draft.pwaInstallIconUrl}
                      onChange={event =>
                        setDraft({
                          ...draft,
                          pwaInstallIconUrl: event.target.value,
                        })
                      }
                      placeholder="https://.../icon.png"
                      className="mt-1 rounded-xl bg-white"
                      dir="ltr"
                    />
                    <span className="text-[10px] font-normal text-slate-400">
                      يفضل 1:1 وبحجم واضح.
                    </span>
                  </label>
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
                    {draft.pwaInstallIconUrl ? (
                      <img
                        src={draft.pwaInstallIconUrl}
                        alt="معاينة أيقونة PWA"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Zap className="h-6 w-6 text-[#e76f3c]" />
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/80 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e76f3c] text-white">
                    <Zap className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    {draft.pwaInstallMessage || "رسالة التنبيه ستظهر هنا"}
                  </p>
                </div>
              </div>
              <label className="space-y-2 text-sm font-semibold sm:col-span-2">
                وصف قصير
                <textarea
                  value={draft.brandDescription}
                  onChange={event =>
                    setDraft({ ...draft, brandDescription: event.target.value })
                  }
                  className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-orange-200"
                  placeholder="وصف يظهر في صفحة المطعم"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold sm:col-span-2">
                محتوى الصفحة الأولى
                <textarea
                  value={draft.homepageContent}
                  onChange={event =>
                    setDraft({ ...draft, homepageContent: event.target.value })
                  }
                  className="mt-1 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  placeholder="العنوان والمزايا والعروض الخاصة بالمطعم"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold sm:col-span-2">
                الشروط والأحكام
                <textarea
                  value={draft.termsOfService}
                  onChange={event =>
                    setDraft({ ...draft, termsOfService: event.target.value })
                  }
                  className="mt-1 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold sm:col-span-2">
                سياسة الخصوصية
                <textarea
                  value={draft.privacyPolicy}
                  onChange={event =>
                    setDraft({ ...draft, privacyPolicy: event.target.value })
                  }
                  className="mt-1 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold sm:col-span-2">
                سياسة الاسترجاع
                <textarea
                  value={draft.refundPolicy}
                  onChange={event =>
                    setDraft({ ...draft, refundPolicy: event.target.value })
                  }
                  className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                />
              </label>
              <section className="space-y-4 rounded-2xl border border-orange-200 bg-orange-50/50 p-4 sm:col-span-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900">SEO وGoogle للمطعم</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">هذه البيانات تخص صفحة المطعم العامة فقط، وتبقى منفصلة عن إعدادات المنصة المركزية.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-semibold">عنوان SEO<Input value={draft.seoTitle} maxLength={180} onChange={event => setDraft({ ...draft, seoTitle: event.target.value })} className="mt-1 rounded-xl bg-white" placeholder="اسم المطعم — المنيو والحجز" /></label>
                  <label className="space-y-2 text-sm font-semibold">رابط صورة المشاركة<Input value={draft.seoImageUrl} onChange={event => setDraft({ ...draft, seoImageUrl: event.target.value })} className="mt-1 rounded-xl bg-white" dir="ltr" placeholder="https://.../og-image.png" /></label>
                  <label className="space-y-2 text-sm font-semibold sm:col-span-2">وصف SEO<Textarea value={draft.seoDescription} maxLength={320} onChange={event => setDraft({ ...draft, seoDescription: event.target.value })} className="mt-1 min-h-20 rounded-xl bg-white" placeholder="وصف مختصر يظهر عند مشاركة صفحة المطعم أو ظهورها في البحث" /><span className="text-[10px] font-normal text-slate-400">{draft.seoDescription.length}/320</span></label>
                  <label className="space-y-2 text-sm font-semibold">الكلمات المفتاحية<Textarea value={draft.seoKeywords} onChange={event => setDraft({ ...draft, seoKeywords: event.target.value })} className="mt-1 min-h-20 rounded-xl bg-white" dir="ltr" placeholder="coffee, breakfast, Riyadh" /></label>
                  <label className="space-y-2 text-sm font-semibold">هاشتاقات SEO<Textarea value={draft.seoHashtags} onChange={event => setDraft({ ...draft, seoHashtags: event.target.value })} className="mt-1 min-h-20 rounded-xl bg-white" dir="ltr" placeholder="#NasserCafe #Riyadh" /></label>
                  <label className="space-y-2 text-sm font-semibold">Canonical URL<Input value={draft.seoCanonicalUrl} onChange={event => setDraft({ ...draft, seoCanonicalUrl: event.target.value })} className="mt-1 rounded-xl bg-white" dir="ltr" placeholder="https://.../restaurant/slug" /></label>
                  <label className="space-y-2 text-sm font-semibold">سياسة الفهرسة<select value={draft.seoRobots} onChange={event => setDraft({ ...draft, seoRobots: event.target.value })} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="index,follow">فهرسة ومتابعة الروابط</option><option value="index,nofollow">فهرسة دون متابعة الروابط</option><option value="noindex,nofollow">منع الفهرسة</option></select></label>
                  <label className="space-y-2 text-sm font-semibold">Search Console Verification<Input value={draft.googleSearchConsoleVerification} onChange={event => setDraft({ ...draft, googleSearchConsoleVerification: event.target.value })} className="mt-1 rounded-xl bg-white" dir="ltr" placeholder="رمز التحقق" /></label>
                  <label className="space-y-2 text-sm font-semibold">Google Analytics Measurement ID<Input value={draft.googleAnalyticsMeasurementId} onChange={event => setDraft({ ...draft, googleAnalyticsMeasurementId: event.target.value })} className="mt-1 rounded-xl bg-white" dir="ltr" placeholder="G-XXXXXXXXXX" /></label>
                  <label className="space-y-2 text-sm font-semibold">Google Tag Manager ID<Input value={draft.googleTagManagerId} onChange={event => setDraft({ ...draft, googleTagManagerId: event.target.value })} className="mt-1 rounded-xl bg-white" dir="ltr" placeholder="GTM-XXXXXXX" /></label>
                  <label className="space-y-2 text-sm font-semibold sm:col-span-2">Structured Data JSON اختياري<Textarea value={draft.structuredDataJson} onChange={event => setDraft({ ...draft, structuredDataJson: event.target.value })} className="mt-1 min-h-24 rounded-xl bg-white font-mono text-xs" dir="ltr" placeholder='{"@context":"https://schema.org","@type":"Restaurant"}' /></label>
                </div>
              </section>
              <Button
                disabled={
                  updateBranding.isPending ||
                  brandingQuery.isLoading ||
                  !/^#[0-9A-Fa-f]{6}$/.test(draft.brandColor) ||
                  draft.brandName.trim().length < 2
                }
                onClick={() => {
                  const { customDomain: _customDomain, menuTemplateScheduleEnabled: _scheduleEnabled, menuTemplateScheduleTimezone: _scheduleTimezone, menuTemplateScheduleFallback: _scheduleFallback, menuTemplateScheduleRules: _scheduleRules, ...brandingDraft } = draft;
                  updateBranding.mutate({ restaurantId, ...brandingDraft, menuDisplaySettingsJson: draft.menuDisplaySettingsJson, menuTemplateScheduleJson: JSON.stringify({ enabled: draft.menuTemplateScheduleEnabled, timezone: draft.menuTemplateScheduleTimezone, fallbackTemplate: draft.menuTemplateScheduleFallback, rules: draft.menuTemplateScheduleRules }), menuTemplateScheduleTimezone: draft.menuTemplateScheduleTimezone });
                }}
                className="w-fit rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"
              >
                {updateBranding.isPending ? "جارٍ الحفظ..." : "حفظ الهوية"}
              </Button>
            </div>
            <div
              data-menu-template-preview={draft.menuTemplate}
              className={`rounded-2xl p-5 text-white shadow-inner transition-colors ${draft.menuTemplate === "glass" ? "border border-white/15" : ""}`}
              style={{
                  background: draft.menuTemplate === "glass"
                    ? `radial-gradient(circle at 85% 0%, ${draft.glassGlowColor}55, transparent 42%), linear-gradient(135deg, #0b0f17, #111c2d)`
                    : /^#[0-9A-Fa-f]{6}$/.test(draft.brandColor)
                      ? draft.brandColor
                      : "#e76f3c",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs opacity-80">
                    معاينة حية · {draft.menuTemplate === "glass" ? "NFOOD Glass" : draft.menuTemplate === "bistro" ? "Bistro" : "Editorial"}
                  </p>
                  {brandingQuery.data?.slug && (
                    <p
                      className="mt-1 max-w-[220px] truncate font-mono text-[10px] text-white/75"
                      dir="ltr"
                    >
                      {publicOrigin}/restaurant/{brandingQuery.data.slug}
                    </p>
                  )}
                </div>
                {brandingQuery.data?.slug && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={openPublicPreview}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1 text-[10px] font-semibold text-white hover:bg-white/25"
                    >
                      <Eye className="h-3 w-3" /> فتح معاينة المنيو
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard?.writeText(publicPreviewUrl);
                        toast.success("تم نسخ رابط المطعم");
                      }}
                      className="rounded-lg bg-white/15 px-2 py-1 text-[10px] font-semibold text-white hover:bg-white/25"
                    >
                      نسخ
                    </button>
                  </div>
                )}
              </div>
              {draft.brandLogoUrl ? (
                <img
                  src={draft.brandLogoUrl}
                  alt="شعار المطعم"
                  className="mt-5 h-14 w-14 rounded-2xl bg-white/90 object-contain p-2"
                />
              ) : (
                <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold">
                  {draft.brandName.slice(0, 1) || "N"}
                </div>
              )}
              <h3 className="mt-5 text-lg font-bold">
                {draft.brandName || "اسم المطعم"}
              </h3>
              <p className="mt-2 text-xs leading-5 text-white/80">
                {draft.brandDescription || "وصف المطعم سيظهر هنا بعد الحفظ."}
              </p>
              <div className={`mt-5 rounded-2xl p-3 ${draft.menuTemplate === "glass" ? "border border-white/15 backdrop-blur-xl" : draft.menuTemplate === "bistro" ? "bg-white/15" : "bg-white/10"}`} style={draft.menuTemplate === "glass" ? { backgroundColor: `rgba(255,255,255,${draft.glassCardOpacity})` } : undefined}>
                <div className="flex items-center justify-between gap-2 text-[10px] font-black"><span>الأقسام</span><span className="rounded-full bg-white/15 px-2 py-1">السلة · 0</span></div>
                <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl bg-white/15 p-2"><span className="block h-2 w-2/3 rounded-full bg-white/60" /><span className="mt-2 block h-2 w-1/2 rounded-full bg-white/25" /><strong className="mt-3 block text-[10px]">طبق اليوم · 32 SAR</strong></div><div className="rounded-xl bg-white/15 p-2"><span className="block h-2 w-3/4 rounded-full bg-white/60" /><span className="mt-2 block h-2 w-1/2 rounded-full bg-white/25" /><strong className="mt-3 block text-[10px]">اختيار الشيف · 28 SAR</strong></div></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LanguageSettingsPanel({ restaurantId }: { restaurantId: number }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const query = trpc.platform.branding.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const [selected, setSelected] = useState<string[]>(["ar", "en", "fr"]);
  const [notice, setNotice] = useState("");
  const update = trpc.platform.updateBranding.useMutation({
    onSuccess: async () => {
      setNotice("تم حفظ اللغات المفعّلة بنجاح");
      await utils.platform.branding.invalidate({ restaurantId });
    },
    onError: error => setNotice(error.message || "تعذر حفظ اللغات"),
  });
  useEffect(() => {
    if (!query.data) return;
    try {
      const parsed = JSON.parse(query.data.languagesJson || '["ar","en","fr"]');
      setSelected(
        Array.isArray(parsed)
          ? parsed.filter((value): value is string =>
              ["ar", "en", "fr"].includes(value)
            )
          : ["ar", "en", "fr"]
      );
    } catch {
      setSelected(["ar", "en", "fr"]);
    }
  }, [query.data?.languagesJson]);
  const toggle = (language: string) =>
    setSelected(current =>
      current.includes(language)
        ? current.filter(item => item !== language)
        : [...current, language]
    );
  const save = () => {
    if (!query.data || selected.length === 0) {
      setNotice("اختر لغة واحدة على الأقل");
      return;
    }
    update.mutate({ ...query.data, menuDisplaySettingsJson: query.data.menuDisplaySettingsJson ?? undefined, languagesJson: JSON.stringify(selected) });
  };
  const labels: Record<string, { name: string; detail: string }> = {
    ar: { name: "العربية", detail: "RTL · اللغة الأساسية" },
    en: { name: "English", detail: "LTR · English" },
    fr: { name: "Français", detail: "LTR · Français" },
  };
  return (
    <Card className="mb-6 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-l from-[#fff7f0] to-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">لغات المطعم والمنيو</CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              اختر اللغات التي ستظهر للزوار، وسيستخدمها المترجم الذكي تلقائيًا.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            {selected.length} مفعّلة
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <div className="grid gap-3 md:grid-cols-3">
          {["ar", "en", "fr"].map(language => (
            <button
              type="button"
              key={language}
              onClick={() => toggle(language)}
              className={`rounded-2xl border p-4 text-right transition ${selected.includes(language) ? "border-emerald-400 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-slate-900">
                  {language.toUpperCase()}
                </span>
                <span
                  className={`h-5 w-5 rounded-full border-2 ${selected.includes(language) ? "border-emerald-600 bg-emerald-600" : "border-slate-300"}`}
                >
                  {selected.includes(language) ? (
                    <span className="mx-auto block mt-0.5 h-2 w-2 rounded-full bg-white" />
                  ) : null}
                </span>
              </div>
              <p className="mt-2 text-sm font-bold text-slate-800">
                {labels[language].name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {labels[language].detail}
              </p>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            تظهر الترجمة العامة بعد اعتمادها، مع fallback تلقائي للغة الأساسية.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-700">{notice}</span>
            <Button
              type="button"
              onClick={save}
              disabled={update.isPending || query.isLoading}
            >
              {update.isPending ? "جارٍ الحفظ…" : "حفظ اللغات"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RestaurantProfilePanel({ restaurantId }: { restaurantId: number }) {
  const { user } = useAuth();
  const restaurantQuery = trpc.platform.restaurantById.useQuery(
    { id: restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  return (
    <Card className="mb-6 rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">بيانات المطعم</CardTitle>
        <p className="mt-1 text-xs text-slate-500">
          بيانات الحساب الأساسية والباركود محفوظة من قاعدة البيانات.
        </p>
      </CardHeader>
      <CardContent>
        {restaurantQuery.isError ? (
          <div className="p-4 text-sm text-red-600">
            تعذر تحميل بيانات المطعم. Request ID: restaurant-profile-
            {restaurantId}{" "}
            <button
              onClick={() => void restaurantQuery.refetch()}
              className="font-bold underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : restaurantQuery.isLoading ? (
          <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ) : !restaurantQuery.data ? (
          <div className="p-4 text-sm text-slate-500">
            لا توجد بيانات مطعم مرتبطة بمساحة العمل.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-[11px] text-slate-500">الاسم</p>
                <p className="mt-1 font-bold">{restaurantQuery.data.name}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">المعرّف العام</p>
                <p className="mt-1 font-mono text-sm" dir="ltr">
                  /{restaurantQuery.data.slug}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">الحالة</p>
                <p className="mt-1 font-semibold">
                  {restaurantQuery.data.status === "active"
                    ? "نشط"
                    : restaurantQuery.data.status === "trial"
                      ? "تجريبي"
                      : "معلّق"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <Barcode
                value={restaurantQuery.data.barcode}
                width={1}
                height={38}
                displayValue={false}
                margin={0}
              />
              <div>
                <p className="text-[10px] text-slate-500">باركود الحساب</p>
                <p className="font-mono text-xs" dir="ltr">
                  {restaurantQuery.data.barcode}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-100 bg-orange-50/70 p-3">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  الصفحة العامة للمطعم
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  اعرض المنيو والحجز والتواصل للعملاء مباشرة.
                </p>
              </div>
              <Button
                type="button"
                onClick={() =>
                  window.location.assign(
                    publicMenuUrl(
                      window.location.origin,
                      restaurantQuery.data.slug
                    )
                  )
                }
                className="rounded-xl bg-[#e76f3c] text-white hover:bg-[#d85f2e]"
              >
                فتح صفحة المطعم
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BranchesView({ restaurantId }: { restaurantId: number }) {
  const { user } = useAuth();
  const [pendingDeleteBranchId, setPendingDeleteBranchId] = useState<
    number | null
  >(null);
  const utils = trpc.useUtils();
  const [branchFormOpen, setBranchFormOpen] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [branchCity, setBranchCity] = useState("");
  const [branchOpeningTime, setBranchOpeningTime] = useState("09:00");
  const [branchClosingTime, setBranchClosingTime] = useState("23:00");
  const [operatingWindowsJson, setOperatingWindowsJson] = useState("");
  const [operatingWindows, setOperatingWindows] = useState<Array<{ dayOfWeek: number; startTime: string; endTime: string; channel: "all" | "takeaway" | "delivery" | "pos" }>>([]);
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
  const remoteBranches = trpc.platform.branches.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const branchLimit = trpc.platform.branchLimit.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const createBranch = trpc.platform.createBranch.useMutation({
    onSuccess: () => {
      void utils.platform.branches.invalidate();
      void branchLimit.refetch();
      toast.success("تمت إضافة الفرع");
    },
    onError: error => toast.error(`تعذر إضافة الفرع: ${error.message}`),
  });
  const updateBranch = trpc.platform.updateBranch.useMutation({
    onSuccess: () => {
      void utils.platform.branches.invalidate();
      toast.success("تم تحديث حالة الفرع");
    },
    onError: error => toast.error(`تعذر تحديث الفرع: ${error.message}`),
  });
  const deleteBranch = trpc.platform.deleteBranch.useMutation({
    onSuccess: () => {
      void utils.platform.branches.invalidate();
      toast.success("تم حذف الفرع");
    },
    onError: error => toast.error(`تعذر حذف الفرع: ${error.message}`),
  });
  const branches = remoteBranches.data ?? [];
  const openBranches = branches.filter(
    branch => branch.status === "open"
  ).length;
  const closedBranches = branches.length - openBranches;
  const branchCapacity = branchLimit.data
    ? `${branchLimit.data.used ?? 0}/${branchLimit.data.limit === null ? "∞" : (branchLimit.data.limit ?? 0)}`
    : "—";
  return (
    <div className="space-y-3">
      <CompactModuleSummary
        metrics={[
          {
            label: "إجمالي الفروع",
            value: branches.length,
            hint: "مرتبطة بالمطعم",
            icon: Store,
            tone: "orange",
          },
          {
            label: "فروع مفتوحة",
            value: openBranches,
            hint: "تستقبل الطلبات",
            icon: CheckCircle2,
            tone: "emerald",
          },
          {
            label: "فروع مغلقة",
            value: closedBranches,
            hint: "يمكن تفعيلها",
            icon: Clock3,
            tone: "violet",
          },
          {
            label: "استخدام الباقة",
            value: branchCapacity,
            hint: branchLimit.data?.plan
              ? `باقة ${branchLimit.data.plan}`
              : "الحد الحالي",
            icon: WalletCards,
            tone: "blue",
          },
        ]}
      />
      <SectionHeading
        title="الفروع والإعدادات"
        description="الفروع محفوظة في قاعدة البيانات مع عزل المطعم."
        action="إضافة فرع"
        onAction={() => {
          if (branchLimit.data && !branchLimit.data.canCreate) {
            toast.error(
              `تم بلوغ حد الفروع في باقة ${branchLimit.data.plan ?? "الحالية"}. قم بترقية الباقة لإضافة فرع جديد.`
            );
            return;
          }
          setBranchFormOpen(value => !value);
        }}
      />
      {branchFormOpen && (
        <Card className="mb-6 rounded-2xl border-orange-100 bg-orange-50/40">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_1fr_150px_150px_auto]">
            <Input
              value={branchName}
              onChange={event => setBranchName(event.target.value)}
              placeholder="اسم الفرع"
              className="rounded-xl bg-white"
            />
            <Input
              value={branchCity}
              onChange={event => setBranchCity(event.target.value)}
              placeholder="المدينة"
              className="rounded-xl bg-white"
            />
            <Input
              value={branchOpeningTime}
              onChange={event => setBranchOpeningTime(event.target.value)}
              placeholder="يفتح HH:MM"
              className="rounded-xl bg-white"
            />
            <Input
              value={branchClosingTime}
              onChange={event => setBranchClosingTime(event.target.value)}
              placeholder="يغلق HH:MM"
              className="rounded-xl bg-white"
            />
            <div className="col-span-full rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold text-slate-700">فتحات التشغيل حسب اليوم والقناة</span><Button type="button" variant="outline" size="sm" onClick={() => setOperatingWindows((current) => [...current, { dayOfWeek: 0, startTime: branchOpeningTime, endTime: branchClosingTime, channel: "all" }])} className="h-7 rounded-lg text-[10px]">+ إضافة فترة</Button></div>{operatingWindows.length === 0 ? <p className="text-[10px] text-slate-400">استخدم ساعات الفرع العامة أو أضف فترة مستقلة للاستلام والتوصيل وPOS.</p> : operatingWindows.map((window, index) => <div key={`${index}-${window.dayOfWeek}`} className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-5"><select value={window.dayOfWeek} onChange={(event) => setOperatingWindows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, dayOfWeek: Number(event.target.value) } : item))} className="h-8 rounded-lg border bg-white text-[10px]" aria-label="اليوم"><option value={0}>الأحد</option><option value={1}>الإثنين</option><option value={2}>الثلاثاء</option><option value={3}>الأربعاء</option><option value={4}>الخميس</option><option value={5}>الجمعة</option><option value={6}>السبت</option></select><Input type="time" value={window.startTime} onChange={(event) => setOperatingWindows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, startTime: event.target.value } : item))} className="h-8 text-[10px]" aria-label="بداية الفترة" /><Input type="time" value={window.endTime} onChange={(event) => setOperatingWindows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, endTime: event.target.value } : item))} className="h-8 text-[10px]" aria-label="نهاية الفترة" /><select value={window.channel} onChange={(event) => setOperatingWindows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, channel: event.target.value as typeof item.channel } : item))} className="h-8 rounded-lg border bg-white text-[10px]" aria-label="قناة الطلب"><option value="all">كل القنوات</option><option value="takeaway">الاستلام</option><option value="delivery">التوصيل</option><option value="pos">نقاط البيع</option></select><Button type="button" variant="ghost" size="sm" onClick={() => setOperatingWindows((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="h-8 text-[10px] text-red-500">حذف</Button></div>)}</div>
            <Button
              disabled={
                createBranch.isPending ||
                branchName.trim().length < 2 ||
                !/^\d{2}:\d{2}$/.test(branchOpeningTime) ||
                !/^\d{2}:\d{2}$/.test(branchClosingTime)
              }
              onClick={() =>
                createBranch.mutate({
                  restaurantId,
                  name: branchName.trim(),
                  city: branchCity.trim() || undefined,
                  status: "open",
                  openingTime: branchOpeningTime,
                  closingTime: branchClosingTime,
                  operatingWindowsJson: operatingWindows.length ? JSON.stringify(operatingWindows.map(({ channel, ...window }) => ({ ...window, channels: channel === "all" ? undefined : [channel] }))) : operatingWindowsJson.trim() || undefined,
                })
              }
              className="rounded-xl bg-[#e76f3c]"
            >
              {createBranch.isPending ? "جارٍ الحفظ..." : "حفظ الفرع"}
            </Button>
          </CardContent>
        </Card>
      )}
      <Card className="mb-6 rounded-2xl border-orange-100 bg-orange-50/50 shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">
              استخدام الفروع حسب الباقة
            </p>
            <p className="mt-1 text-xs text-slate-500">
              تُطبق الصلاحية من الخادم قبل إنشاء أي فرع جديد.
            </p>
          </div>
          {branchLimit.isLoading ? (
            <span className="text-xs text-slate-500">جارٍ حساب الحد...</span>
          ) : branchLimit.isError ? (
            <span className="text-xs text-red-600">
              تعذر تحميل حد الباقة. Request ID: branch-limit-{restaurantId}
            </span>
          ) : (
            <div className="rounded-xl bg-white px-4 py-2 text-center">
              <span className="text-lg font-bold text-[#e76f3c]">
                {branchLimit.data?.used ?? 0}
              </span>
              <span className="mx-1 text-xs text-slate-400">/</span>
              <span className="text-sm font-semibold text-slate-700">
                {branchLimit.data?.limit === null
                  ? "غير محدود"
                  : (branchLimit.data?.limit ?? 0)}
              </span>
              <p className="text-[10px] text-slate-400">
                {branchLimit.data?.plan
                  ? `باقة ${branchLimit.data.plan}`
                  : "الحد الافتراضي"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <RestaurantProfilePanel restaurantId={restaurantId} />
      <RestaurantPricingSettings restaurantId={restaurantId} />
      <RestaurantIntegrationSettings restaurantId={restaurantId} />
      <ReceiptCustomizationPanel restaurantId={restaurantId} />
      <EmailTemplatesPanel restaurantId={restaurantId} />
      <BrandingPanel restaurantId={restaurantId} />
      <BrandingFeatureMatrix restaurantId={restaurantId} />
      <BrandingEditorPanel restaurantId={restaurantId} />
      <LanguageSettingsPanel restaurantId={restaurantId} />
      <div className="grid gap-4 md:grid-cols-3">
        {remoteBranches.isError ? (
          <div className="p-6 text-sm text-red-600">
            تعذر تحميل الفروع. Request ID: branches-{restaurantId}{" "}
            <button
              onClick={() => void remoteBranches.refetch()}
              className="font-bold underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : remoteBranches.isLoading ? (
          <div className="col-span-full p-8 text-center text-sm text-slate-400">
            جارٍ تحميل الفروع...
          </div>
        ) : branches.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            لا توجد فروع محفوظة بعد.
          </div>
        ) : (
          branches.map(branch => (
            <Card
              key={branch.id}
              className="rounded-2xl border-slate-200 bg-white shadow-sm"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#e76f3c]">
                    <Store className="h-5 w-5" />
                  </div>
                  <Badge
                    variant="outline"
                    className={`rounded-lg text-[10px] ${branch.status === "open" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}
                  >
                    {branch.status === "open" ? "مفتوح" : "مغلق"}
                  </Badge>
                </div>
                <h3 className="mt-5 font-bold">{branch.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{branch.city}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="text-slate-500">ساعات العمل</span>
                  <strong>
                    {branch.openingTime && branch.closingTime
                      ? `${branch.openingTime} — ${branch.closingTime}`
                      : "غير محددة"}
                  </strong>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={() => {
                      setEditingBranchId(branch.id);
                      setBranchName(branch.name);
                      setBranchCity(branch.city ?? "");
                      setBranchOpeningTime(branch.openingTime ?? "09:00");
                      setBranchClosingTime(branch.closingTime ?? "23:00");
                      setOperatingWindowsJson(branch.operatingWindowsJson ?? "");
                      try { const parsed = JSON.parse(branch.operatingWindowsJson ?? "[]"); setOperatingWindows(Array.isArray(parsed) ? parsed.map((window) => ({ dayOfWeek: Number(window.dayOfWeek) || 0, startTime: window.startTime ?? "09:00", endTime: window.endTime ?? "23:00", channel: window.channels?.[0] === "takeaway" || window.channels?.[0] === "delivery" || window.channels?.[0] === "pos" ? window.channels[0] : "all" })) : []); } catch { setOperatingWindows([]); }
                    }}
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs"
                  >
                    تعديل
                  </Button>
                  {editingBranchId === branch.id && (
                    <div className="absolute inset-x-4 bottom-16 z-10 grid gap-2 rounded-xl border border-orange-100 bg-white p-3 shadow-lg">
                      <Input
                        value={branchName}
                        onChange={event => setBranchName(event.target.value)}
                        placeholder="اسم الفرع"
                        className="h-9 rounded-lg text-xs"
                      />
                      <Input
                        value={branchCity}
                        onChange={event => setBranchCity(event.target.value)}
                        placeholder="المدينة"
                        className="h-9 rounded-lg text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={branchOpeningTime}
                          onChange={event =>
                            setBranchOpeningTime(event.target.value)
                          }
                          placeholder="يفتح HH:MM"
                          className="h-9 rounded-lg text-xs"
                        />
                        <Input
                          value={branchClosingTime}
                          onChange={event =>
                            setBranchClosingTime(event.target.value)
                          }
                          placeholder="يغلق HH:MM"
                          className="h-9 rounded-lg text-xs"
                        />
                      </div>
                      <div className="rounded-lg border border-slate-100 bg-slate-50 p-2"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-bold text-slate-700">فتحات التشغيل المستقلة</span><Button type="button" variant="outline" size="sm" onClick={() => setOperatingWindows((current) => [...current, { dayOfWeek: 0, startTime: branchOpeningTime, endTime: branchClosingTime, channel: "all" }])} className="h-7 rounded-lg text-[10px]">+ إضافة</Button></div>{operatingWindows.map((window, index) => <div key={`${index}-${window.dayOfWeek}`} className="mb-1 grid grid-cols-2 gap-1"><select value={window.dayOfWeek} onChange={(event) => setOperatingWindows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, dayOfWeek: Number(event.target.value) } : item))} className="h-7 rounded border bg-white text-[10px]" aria-label="اليوم"><option value={0}>الأحد</option><option value={1}>الإثنين</option><option value={2}>الثلاثاء</option><option value={3}>الأربعاء</option><option value={4}>الخميس</option><option value={5}>الجمعة</option><option value={6}>السبت</option></select><select value={window.channel} onChange={(event) => setOperatingWindows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, channel: event.target.value as typeof item.channel } : item))} className="h-7 rounded border bg-white text-[10px]" aria-label="القناة"><option value="all">كل القنوات</option><option value="takeaway">الاستلام</option><option value="delivery">التوصيل</option><option value="pos">POS</option></select><Input type="time" value={window.startTime} onChange={(event) => setOperatingWindows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, startTime: event.target.value } : item))} className="h-7 rounded text-[10px]" aria-label="البداية" /><Input type="time" value={window.endTime} onChange={(event) => setOperatingWindows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, endTime: event.target.value } : item))} className="h-7 rounded text-[10px]" aria-label="النهاية" /><Button type="button" variant="ghost" size="sm" onClick={() => setOperatingWindows((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="col-span-2 h-6 text-[10px] text-red-500">حذف الفترة</Button></div>)}</div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={
                            updateBranch.isPending ||
                            branchName.trim().length < 2 ||
                            !/^\d{2}:\d{2}$/.test(branchOpeningTime) ||
                            !/^\d{2}:\d{2}$/.test(branchClosingTime)
                          }
                          onClick={() => {
                            updateBranch.mutate({
                              restaurantId,
                              id: branch.id,
                              name: branchName.trim(),
                              city: branchCity.trim() || undefined,
                              openingTime: branchOpeningTime,
                              closingTime: branchClosingTime,
                              operatingWindowsJson: operatingWindows.length ? JSON.stringify(operatingWindows.map(({ channel, ...window }) => ({ ...window, channels: channel === "all" ? undefined : [channel] }))) : operatingWindowsJson.trim() || undefined,
                            });
                            setEditingBranchId(null);
                          }}
                          className="h-8 flex-1 rounded-lg text-xs"
                        >
                          حفظ
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingBranchId(null)}
                          className="h-8 rounded-lg text-xs"
                        >
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={() =>
                      updateBranch.mutate({
                        restaurantId,
                        id: branch.id,
                        status: branch.status === "open" ? "closed" : "open",
                      })
                    }
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg text-xs"
                  >
                    تبديل الحالة
                  </Button>
                  <Button
                    onClick={() => setPendingDeleteBranchId(branch.id)}
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs"
                  >
                    حذف
                  </Button>
                  {pendingDeleteBranchId === branch.id && (
                    <span className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[10px] text-red-700">
                      <span>تأكيد؟</span>
                      <button
                        onClick={() => {
                          deleteBranch.mutate({ restaurantId, id: branch.id });
                          setPendingDeleteBranchId(null);
                        }}
                        className="font-bold underline"
                      >
                        نعم
                      </button>
                      <button
                        onClick={() => setPendingDeleteBranchId(null)}
                        className="font-bold underline"
                      >
                        لا
                      </button>
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function RestaurantOperationsHub({ restaurantId, branchId, defaultTab = "tables" }: { restaurantId: number; branchId?: number; defaultTab?: "tables" | "reservations" | "menu" | "qr" | "finance" }) {
  const [activeTab, setActiveTab] = useState<"tables" | "reservations" | "menu" | "qr" | "finance">(defaultTab);
  const openTableQrCustomization = () => {
    setActiveTab("qr");
    window.setTimeout(() => document.querySelector('[data-testid="qr-table-builder"]')?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };
  const tabs = [
    { key: "tables" as const, label: "الطاولات", description: "توزيع الطاولات وحالتها" },
    { key: "qr" as const, label: "QR المنيو والرموز", description: "المنيو العام والرموز التشغيلية" },
    { key: "reservations" as const, label: "الحجوزات", description: "المواعيد والانتظار والإلغاء" },
    { key: "menu" as const, label: "واجهة المنيو والقوالب", description: "القالب والمعاينة وشبكة الأصناف" },
    { key: "finance" as const, label: "السجل المالي والودائع", description: "المدفوعات والمرتجعات والإلغاءات وودائع السائقين" },
  ];
  return (
    <div data-restaurant-operations-hub className="space-y-3">
      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-xs font-bold tracking-wide text-[#e76f3c]">تشغيل المطعم</p><h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white">كل ما يرتبط بتجربة الضيف في مكان واحد</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">تنقّل بين الطاولات والحجوزات وواجهة المنيو وساعات العمل. لكل تبويب حالة وحفظ مستقلان.</p></div>
          <span className="rounded-full bg-orange-50 px-3 py-1.5 text-[11px] font-bold text-[#c75325] dark:bg-orange-950/40 dark:text-orange-200">{tabs.find(tab => tab.key === activeTab)?.label}</span>
        </div>
        <div className="mt-3 grid gap-1.5 sm:grid-cols-2 xl:grid-cols-6" role="tablist" aria-label="مركز تشغيل المطعم">
          {tabs.map(tab => <button key={tab.key} type="button" role="tab" aria-selected={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} className={`rounded-xl border px-3 py-2.5 text-right transition-all duration-200 ${activeTab === tab.key ? "border-[#e76f3c] bg-[#e76f3c] text-white shadow-md shadow-orange-900/10" : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-orange-200 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200"}`}><span className="block text-xs font-black">{tab.label}</span><span className={`mt-1 block text-[10px] leading-4 ${activeTab === tab.key ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>{tab.description}</span></button>)}
        </div>
      </section>
      <div key={activeTab} data-operations-tab={activeTab} className="nfood-settings-tab-enter space-y-3">
        {activeTab === "tables" && <TablesView restaurantId={restaurantId} branchId={branchId} onOpenQrTables={openTableQrCustomization} />}
        {activeTab === "qr" && <QROperationsPanel restaurantId={restaurantId} branchId={branchId} />}
        {activeTab === "reservations" && <div className="space-y-4"><ReservationsView restaurantId={restaurantId} /><ReservationPolicyPanel restaurantId={restaurantId} /><ReservationSchedulePanel restaurantId={restaurantId} branchId={branchId} /><DeliveryOperationsPanel restaurantId={restaurantId} branchId={branchId} /></div>}
        {activeTab === "menu" && <BrandingPanel restaurantId={restaurantId} />}
        {activeTab === "finance" && <FinancialLedgerView restaurantId={restaurantId} branchId={branchId} />}
      </div>
    </div>
  );
}

function RestaurantSettingsHub({ restaurantId }: { restaurantId: number }) {
  const [activeTab, setActiveTab] = useState<"identity" | "commerce" | "integrations" | "preferences">("identity");
  const tabs = [
    { key: "identity" as const, label: "الهوية والمنيو", description: "البيانات العامة، القالب، SEO والمعاينة" },
    { key: "commerce" as const, label: "التسعير والإيصالات", description: "العملة، الضريبة، الخصومات وقوالب الطباعة" },
    { key: "integrations" as const, label: "التكاملات", description: "مصدر التكاملات وإعدادات الربط" },
    { key: "preferences" as const, label: "اللغة والخصائص", description: "اللغة والميزات المتاحة للمطعم" },
  ];
  return (
    <div data-settings-hub className="nfood-settings-hub space-y-3">
      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-wide text-[#e76f3c]">إعدادات المطعم</p>
            <h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white">مركز إعداد واحد، بدون تكرار</h2>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">اختر القسم الذي تريد تعديله. لن تُعرض البطاقات الثقيلة إلا عند الحاجة، وتبقى المعاينة والحفظ داخل القسم نفسه.</p>
          </div>
          <span className="rounded-full bg-orange-50 px-3 py-1.5 text-[11px] font-bold text-[#c75325] dark:bg-orange-950/40 dark:text-orange-200">{tabs.find(tab => tab.key === activeTab)?.label}</span>
        </div>
        <div className="mt-3 grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4" role="tablist" aria-label="أقسام إعدادات المطعم">
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl border px-3 py-2.5 text-right transition-all duration-200 ${activeTab === tab.key ? "border-[#e76f3c] bg-[#e76f3c] text-white shadow-md shadow-orange-900/10" : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-orange-200 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:border-orange-700/60"}`}
            >
              <span className="block text-xs font-black">{tab.label}</span>
              <span className={`mt-1 block text-[10px] leading-4 ${activeTab === tab.key ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>{tab.description}</span>
            </button>
          ))}
        </div>
      </section>
      <div key={activeTab} className="nfood-settings-tab-enter space-y-3">
        {activeTab === "identity" && <>
          <RestaurantProfilePanel restaurantId={restaurantId} />
          <BrandingPanel restaurantId={restaurantId} />
        </>}
        {activeTab === "commerce" && <>
          <RestaurantPricingSettings restaurantId={restaurantId} />
          <ReceiptCustomizationPanel restaurantId={restaurantId} />
        </>}
        {activeTab === "integrations" && <>
          <RestaurantIntegrationSettings restaurantId={restaurantId} />
        </>}
        {activeTab === "preferences" && <>
          <LanguageSettingsPanel restaurantId={restaurantId} />
          <BrandingFeatureMatrix restaurantId={restaurantId} />
        </>}
      </div>
    </div>
  );
}

const remoteTypeLabels = {
  orders: "متابعة الطلبات",
  reservations: "الحجوزات",
  social: "حسابات التواصل",
  support: "الدعم",
  marketing: "التسويق",
  other: "أخرى",
} as const;
const remoteStatusLabels = {
  published: "منشورة",
  reviewing: "قيد المراجعة",
  accepted: "مقبولة",
  in_progress: "قيد التنفيذ",
  submitted: "بانتظار المراجعة",
  completed: "مكتملة",
  cancelled: "ملغاة",
} as const;

type RemoteTaskType = keyof typeof remoteTypeLabels;
type RemoteTaskStatus = keyof typeof remoteStatusLabels;

function RemoteWorkView({ restaurantId }: { restaurantId: number }) {
  const { user } = useAuth();
  const tasksQuery = trpc.remote.tasks.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false, refetchInterval: 5000 }
  );
  const workersQuery = trpc.remote.workers.useQuery(
    { restaurantId },
    { enabled: Boolean(user), retry: false }
  );
  const utils = trpc.useUtils();
  const createWorker = trpc.remote.createWorker.useMutation({
    onSuccess: () => {
      void utils.remote.workers.invalidate();
      toast.success("تم ربط العامل بالمطعم");
    },
    onError: error => toast.error(`تعذر ربط العامل: ${error.message}`),
  });
  const updateWorker = trpc.remote.updateWorker.useMutation({
    onSuccess: () => {
      void utils.remote.workers.invalidate();
      toast.success("تم تحديث العامل");
    },
    onError: error => toast.error(`تعذر تحديث العامل: ${error.message}`),
  });
  const deleteWorker = trpc.remote.deleteWorker.useMutation({
    onSuccess: () => {
      void utils.remote.workers.invalidate();
      toast.success("تم إلغاء ارتباط العامل");
    },
    onError: error => toast.error(`تعذر إلغاء العامل: ${error.message}`),
  });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0");
  const [dueAt, setDueAt] = useState("");
  const [assignedWorkerId, setAssignedWorkerId] = useState("");
  const [taskType, setTaskType] = useState<RemoteTaskType>("orders");
  const [activeTask, setActiveTask] = useState<number | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [mode, setMode] = useState<"restaurant" | "worker">("restaurant");
  const [workerFormOpen, setWorkerFormOpen] = useState(false);
  const [workerUserId, setWorkerUserId] = useState("");
  const [workerRole, setWorkerRole] = useState("متابع طلبات");
  const [pendingDeleteWorkerId, setPendingDeleteWorkerId] = useState<
    number | null
  >(null);
  const [applicationFormOpen, setApplicationFormOpen] = useState(false);
  const [applicationRole, setApplicationRole] = useState("متابع طلبات");
  const [applicationMessage, setApplicationMessage] = useState(
    "أرغب بالعمل عن بُعد"
  );
  const currentWorkerQuery = trpc.remote.currentWorker.useQuery(
    { restaurantId },
    { enabled: Boolean(user && mode === "worker"), retry: false }
  );
  const applicationsQuery = trpc.remote.workerApplications.useQuery(
    { restaurantId },
    { enabled: Boolean(user && mode === "restaurant"), retry: false }
  );
  const myApplicationsQuery = trpc.remote.myWorkerApplications.useQuery(
    undefined,
    { enabled: Boolean(user && mode === "worker"), retry: false }
  );
  const applyWorker = trpc.remote.applyAsRemoteWorker.useMutation({
    onSuccess: () => {
      void myApplicationsQuery.refetch();
      toast.success("تم إرسال طلب الانضمام للمطعم");
    },
    onError: error => toast.error(`تعذر إرسال الطلب: ${error.message}`),
  });
  const reviewApplication = trpc.remote.reviewWorkerApplication.useMutation({
    onSuccess: () => {
      void applicationsQuery.refetch();
      void workersQuery.refetch();
      toast.success("تم تحديث طلب العامل");
    },
    onError: error => toast.error(`تعذر مراجعة الطلب: ${error.message}`),
  });
  const [message, setMessage] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const messagesQuery = trpc.remote.messages.useQuery(
    { taskId: activeTask ?? 1 },
    {
      enabled: Boolean(user && activeTask),
      retry: false,
      refetchInterval: 4000,
    }
  );
  const createTask = trpc.remote.createTask.useMutation({
    onSuccess: () => {
      tasksQuery.refetch();
      setTitle("");
      setDescription("");
      setAmount("0");
      setDueAt("");
      setAssignedWorkerId("");
      toast.success("تم نشر المهمة وحفظ قيمتها");
    },
    onError: error => toast.error(`تعذر نشر المهمة: ${error.message}`),
  });
  const updateStatus = trpc.remote.updateTaskStatus.useMutation({
    onSuccess: () => tasksQuery.refetch(),
    onError: error => toast.error(`تعذر تحديث المهمة: ${error.message}`),
  });
  const acceptTask = trpc.remote.acceptTask.useMutation({
    onSuccess: () => {
      tasksQuery.refetch();
      toast.success("تم قبول المهمة");
    },
    onError: error => toast.error(`تعذر قبول المهمة: ${error.message}`),
  });
  const sendMessage = trpc.remote.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      messagesQuery.refetch();
    },
    onError: error => toast.error(`تعذر إرسال الرسالة: ${error.message}`),
  });
  const deliverTask = () => {
    if (!activeTask || !deliveryNote.trim()) return;
    sendMessage.mutate(
      { taskId: activeTask, body: `تسليم الموظف: ${deliveryNote}` },
      {
        onSuccess: () => {
          setDeliveryNote("");
          updateStatus.mutate({ taskId: activeTask, status: "submitted" });
        },
      }
    );
  };
  const submitTask = (event: React.FormEvent) => {
    event.preventDefault();
    const validationMessage = validateRemoteTaskDraft({
      title,
      amount,
      description,
      dueAt,
    });
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }
    createTask.mutate({
      restaurantId,
      type: taskType,
      title: title.trim(),
      description: description || undefined,
      amount: Number(amount || 0).toFixed(2),
      currency: "SAR",
      paymentMethod: "manual",
      assignedWorkerId: assignedWorkerId ? Number(assignedWorkerId) : undefined,
      dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
    });
  };
  const tasks = tasksQuery.data ?? [];
  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">التوظيف عن بُعد</h2>
            <p className="mt-1 text-sm text-slate-500">
              أنشئ مهامًا للطلبات والحجوزات والتواصل الاجتماعي، وحدد القيمة
              وطريقة التواصل والتسليم.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setMode("restaurant")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${mode === "restaurant" ? "bg-white text-[#e76f3c] shadow-sm" : "text-slate-500"}`}
            >
              وضع المطعم
            </button>
            <button
              onClick={() => setMode("worker")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${mode === "worker" ? "bg-white text-[#e76f3c] shadow-sm" : "text-slate-500"}`}
            >
              وضع الموظف
            </button>
          </div>
        </div>
        {mode === "worker" && (
          <div className="mt-3 max-w-sm text-xs text-slate-500">
            {currentWorkerQuery.isLoading
              ? "جارٍ التحقق من ارتباط حسابك..."
              : currentWorkerQuery.data
                ? `مرتبط بالمطعم كـ ${currentWorkerQuery.data.role}`
                : "لم يتم قبول طلب انضمامك لهذا المطعم بعد."}
          </div>
        )}
      </div>
      <Card className="mb-5 rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex-row items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <CardTitle className="text-base">حسابات العاملين عن بُعد</CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              اربط مستخدمًا بالمطعم وحدد دوره وتوفره لاستقبال المهام.
            </p>
          </div>
          {mode === "restaurant" && (
            <Button
              type="button"
              onClick={() => {
                setWorkerUserId("");
                setWorkerRole("متابع طلبات");
                setWorkerFormOpen(true);
              }}
              className="rounded-xl bg-[#e76f3c] text-xs hover:bg-[#d85f2e]"
            >
              ربط عامل
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {workerFormOpen && mode === "restaurant" && (
            <div className="m-5 grid gap-2 rounded-2xl border border-orange-100 bg-orange-50/50 p-4 sm:grid-cols-[180px_1fr_auto_auto]">
              <Input
                type="number"
                min={1}
                value={workerUserId}
                onChange={event => setWorkerUserId(event.target.value)}
                placeholder="معرّف المستخدم"
                className="rounded-xl bg-white"
              />
              <Input
                value={workerRole}
                onChange={event => setWorkerRole(event.target.value)}
                placeholder="الدور"
                className="rounded-xl bg-white"
              />
              <Button
                disabled={
                  Number(workerUserId) <= 0 ||
                  workerRole.trim().length < 2 ||
                  createWorker.isPending
                }
                onClick={() => {
                  createWorker.mutate({
                    restaurantId,
                    userId: Number(workerUserId),
                    role: workerRole.trim(),
                    isAvailable: true,
                  });
                  setWorkerFormOpen(false);
                }}
                className="rounded-xl bg-[#e76f3c]"
              >
                {createWorker.isPending ? "جارٍ الربط..." : "حفظ الربط"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setWorkerFormOpen(false)}
                className="rounded-xl"
              >
                إلغاء
              </Button>
            </div>
          )}
          {workersQuery.isError ? (
            <div className="p-5 text-sm text-red-600">
              تعذر تحميل العاملين. Request ID: remote-workers-{restaurantId}{" "}
              <button
                onClick={() => void workersQuery.refetch()}
                className="font-bold underline"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : workersQuery.isLoading ? (
            <div className="p-6 text-center text-sm text-slate-400">
              جارٍ تحميل العاملين...
            </div>
          ) : (workersQuery.data ?? []).length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-400">
              لا توجد حسابات مرتبطة بعد.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {(workersQuery.data ?? []).map(worker => (
                <div
                  key={worker.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      مستخدم #{worker.userId}
                    </p>
                    <p className="text-xs text-slate-500">
                      {worker.role} · {worker.isAvailable ? "متاح" : "غير متاح"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateWorker.mutate({
                          restaurantId,
                          id: worker.id,
                          isAvailable: !worker.isAvailable,
                        })
                      }
                      className="text-xs font-semibold text-[#e76f3c]"
                    >
                      تبديل التوفر
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteWorkerId(worker.id)}
                      className="text-xs font-semibold text-red-500"
                    >
                      إلغاء
                    </button>
                    {pendingDeleteWorkerId === worker.id && (
                      <span className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[10px] text-red-700">
                        <span>تأكيد؟</span>
                        <button
                          onClick={() => {
                            deleteWorker.mutate({
                              restaurantId,
                              id: worker.id,
                            });
                            setPendingDeleteWorkerId(null);
                          }}
                          className="font-bold underline"
                        >
                          نعم
                        </button>
                        <button
                          onClick={() => setPendingDeleteWorkerId(null)}
                          className="font-bold underline"
                        >
                          لا
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="mb-5 rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 px-5 py-4">
          <CardTitle className="text-base">طلبات الانضمام المستقل</CardTitle>
          <p className="mt-1 text-xs text-slate-500">
            {mode === "restaurant"
              ? "راجع طلبات العاملين قبل ربطهم بالمطعم."
              : "قدّم طلبًا للعمل عن بُعد وتابع حالته."}
          </p>
        </CardHeader>
        <CardContent className="p-5">
          {mode === "worker" ? (
            <div className="space-y-3">
              <Button
                type="button"
                onClick={() => {
                  setApplicationRole("متابع طلبات");
                  setApplicationMessage("أرغب بالعمل عن بُعد");
                  setApplicationFormOpen(true);
                }}
                className="rounded-xl bg-[#e76f3c]"
              >
                إرسال طلب انضمام
              </Button>
              {applicationFormOpen && (
                <div className="grid gap-2 rounded-2xl border border-orange-100 bg-orange-50/50 p-4 sm:grid-cols-[1fr_1fr_auto_auto]">
                  <Input
                    value={applicationRole}
                    onChange={event => setApplicationRole(event.target.value)}
                    placeholder="الدور المطلوب"
                    className="rounded-xl bg-white"
                  />
                  <Input
                    value={applicationMessage}
                    onChange={event =>
                      setApplicationMessage(event.target.value)
                    }
                    placeholder="رسالة مختصرة للمطعم"
                    className="rounded-xl bg-white"
                  />
                  <Button
                    type="button"
                    disabled={
                      applyWorker.isPending || applicationRole.trim().length < 2
                    }
                    onClick={() => {
                      applyWorker.mutate({
                        restaurantId,
                        role: applicationRole.trim(),
                        message: applicationMessage.trim() || undefined,
                      });
                      setApplicationFormOpen(false);
                    }}
                    className="rounded-xl bg-[#e76f3c]"
                  >
                    {applyWorker.isPending ? "جارٍ الإرسال..." : "إرسال"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setApplicationFormOpen(false)}
                    className="rounded-xl"
                  >
                    إلغاء
                  </Button>
                </div>
              )}
              {myApplicationsQuery.isLoading ? (
                <p className="text-xs text-slate-400">جارٍ تحميل طلباتك...</p>
              ) : myApplicationsQuery.isError ? (
                <p className="text-xs text-red-600">
                  تعذر تحميل طلباتك. Request ID: remote-my-applications{" "}
                  <button
                    type="button"
                    onClick={() => void myApplicationsQuery.refetch()}
                    className="mr-1 font-bold underline"
                  >
                    إعادة المحاولة
                  </button>
                </p>
              ) : (myApplicationsQuery.data ?? []).length === 0 ? (
                <p className="text-xs text-slate-400">
                  لا توجد طلبات مرسلة بعد.
                </p>
              ) : (
                <div className="space-y-2">
                  {(myApplicationsQuery.data ?? []).map(application => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs"
                    >
                      <span>
                        {application.restaurantName} · {application.role}
                      </span>
                      <Badge variant="outline" className="rounded-lg">
                        {application.status === "pending"
                          ? "قيد المراجعة"
                          : application.status === "approved"
                            ? "مقبول"
                            : "مرفوض"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : applicationsQuery.isLoading ? (
            <p className="text-sm text-slate-400">
              جارٍ تحميل طلبات الانضمام...
            </p>
          ) : applicationsQuery.isError ? (
            <p className="text-sm text-red-600">
              تعذر تحميل طلبات الانضمام. Request ID: remote-applications-
              {restaurantId}{" "}
              <button
                type="button"
                onClick={() => void applicationsQuery.refetch()}
                className="mr-1 font-bold underline"
              >
                إعادة المحاولة
              </button>
            </p>
          ) : (applicationsQuery.data ?? []).length === 0 ? (
            <p className="text-sm text-slate-400">لا توجد طلبات جديدة.</p>
          ) : (
            <div className="space-y-3">
              {(applicationsQuery.data ?? []).map(application => (
                <div
                  key={application.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {application.applicantName ||
                        application.applicantEmail ||
                        `مستخدم #${application.applicantUserId}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {application.role} · {application.message || "بدون رسالة"}
                    </p>
                  </div>
                  {application.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          reviewApplication.mutate({
                            restaurantId,
                            applicationId: application.id,
                            status: "approved",
                          })
                        }
                        className="rounded-lg bg-emerald-600 text-xs"
                      >
                        قبول وربط
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          reviewApplication.mutate({
                            restaurantId,
                            applicationId: application.id,
                            status: "rejected",
                          })
                        }
                        className="rounded-lg text-xs text-red-600"
                      >
                        رفض
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="outline" className="rounded-lg text-xs">
                      {application.status === "approved" ? "مقبول" : "مرفوض"}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 px-5 py-4">
            <CardTitle className="text-base">مهمة جديدة</CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              افتح النموذج لإضافة مهمة وتحديد القيمة والموعد والتعيين.
            </p>
          </CardHeader>
          <CardContent className="p-5">
            <Button
              type="button"
              onClick={() => setTaskDialogOpen(true)}
              disabled={!user}
              className="w-full rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"
            >
              إنشاء مهمة جديدة
            </Button>
            {!user && (
              <p className="mt-3 text-center text-xs text-amber-600">
                سجّل الدخول لحفظ المهمة في قاعدة البيانات.
              </p>
            )}
            <RemoteTaskDialog
              open={taskDialogOpen}
              pending={createTask.isPending}
              workers={(workersQuery.data ?? []).map(worker => ({
                id: worker.id,
                role: worker.role,
              }))}
              onClose={() => setTaskDialogOpen(false)}
              onSubmit={(draft: RemoteTaskDraft) => {
                createTask.mutate({
                  restaurantId,
                  type: draft.type,
                  title: draft.title.trim(),
                  description: draft.description.trim() || undefined,
                  amount: Number(draft.amount || 0).toFixed(2),
                  currency: "SAR",
                  paymentMethod: "manual",
                  assignedWorkerId: draft.assignedWorkerId
                    ? Number(draft.assignedWorkerId)
                    : undefined,
                  dueAt: draft.dueAt
                    ? new Date(draft.dueAt).toISOString()
                    : undefined,
                });
                setTaskDialogOpen(false);
              }}
            />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">المهام المنشورة</p>
                <p className="mt-2 text-2xl font-bold">
                  {tasks.filter(task => task.status === "published").length}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">قيد التنفيذ</p>
                <p className="mt-2 text-2xl font-bold">
                  {tasks.filter(task => task.status === "in_progress").length}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">العاملون المتاحون</p>
                <p className="mt-2 text-2xl font-bold">
                  {workersQuery.data?.filter(worker => worker.isAvailable)
                    .length ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 px-5 py-4">
                <CardTitle className="text-base">المهام الحالية</CardTitle>
                <p className="mt-1 text-xs font-normal text-slate-500">
                  الدفع اليدوي يبقى معلّقًا وغير مدفوع حتى دمج بوابة دفع معتمدة.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                {tasksQuery.isLoading ? (
                  <div className="space-y-3">
                    <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                    <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                  </div>
                ) : tasksQuery.isError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
                    تعذر تحميل المهام. رقم الطلب: remote-tasks-{restaurantId}
                    <Button
                      type="button"
                      onClick={() => tasksQuery.refetch()}
                      variant="outline"
                      className="mx-auto mt-3 rounded-lg text-xs"
                    >
                      إعادة المحاولة
                    </Button>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                    لا توجد مهام محفوظة بعد.
                  </div>
                ) : (
                  tasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => setActiveTask(task.id)}
                      className={`w-full rounded-xl border p-4 text-right transition ${activeTask === task.id ? "border-orange-300 bg-orange-50/50" : "border-slate-100 bg-white hover:border-orange-200"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">{task.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {remoteTypeLabels[task.type as RemoteTaskType]} ·{" "}
                            {task.amount} {task.currency}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="rounded-lg text-[10px]"
                        >
                          {remoteStatusLabels[task.status as RemoteTaskStatus]}
                        </Badge>
                      </div>
                      <div
                        className="mt-3 flex gap-2"
                        onClick={event => event.stopPropagation()}
                      >
                        {mode === "worker" && task.status === "published" && (
                          <Button
                            type="button"
                            size="sm"
                            disabled={
                              !currentWorkerQuery.data || acceptTask.isPending
                            }
                            onClick={() => {
                              if (currentWorkerQuery.data)
                                acceptTask.mutate({
                                  taskId: task.id,
                                  workerId: currentWorkerQuery.data.id,
                                });
                            }}
                            className="h-8 rounded-lg bg-[#e76f3c] text-xs"
                          >
                            قبول المهمة
                          </Button>
                        )}
                        {mode === "restaurant" &&
                          task.status === "published" && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                updateStatus.mutate({
                                  taskId: task.id,
                                  status: "reviewing",
                                })
                              }
                              className="h-8 rounded-lg bg-[#e76f3c] text-xs"
                            >
                              بدء المراجعة
                            </Button>
                          )}
                        {task.status === "reviewing" && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              updateStatus.mutate({
                                taskId: task.id,
                                status: "in_progress",
                              })
                            }
                            className="h-8 rounded-lg bg-[#e76f3c] text-xs"
                          >
                            بدء التنفيذ
                          </Button>
                        )}
                        {mode === "restaurant" &&
                          task.status !== "completed" &&
                          task.status !== "cancelled" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateStatus.mutate({
                                  taskId: task.id,
                                  status: "cancelled",
                                })
                              }
                              className="h-8 rounded-lg text-xs text-red-600"
                            >
                              إلغاء
                            </Button>
                          )}
                        {task.status === "submitted" && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              updateStatus.mutate({
                                taskId: task.id,
                                status: "completed",
                              })
                            }
                            className="h-8 rounded-lg bg-emerald-600 text-xs"
                          >
                            اعتماد التسليم
                          </Button>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 px-5 py-4">
                <CardTitle className="text-base">التواصل مع الموظف</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {!activeTask ? (
                  <p className="py-10 text-center text-sm text-slate-500">
                    اختر مهمة لفتح المحادثة.
                  </p>
                ) : (
                  <>
                    <div className="mb-4 max-h-64 space-y-2 overflow-y-auto">
                      {(messagesQuery.data ?? []).map(item => (
                        <div
                          key={item.id}
                          className="rounded-xl bg-slate-50 p-3 text-sm"
                        >
                          {item.body}
                          <p className="mt-1 text-[10px] text-slate-400">
                            {new Date(item.createdAt).toLocaleString("ar-SA-u-ca-gregory-nu-latn")}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={message}
                        onChange={event => setMessage(event.target.value)}
                        placeholder="اكتب رسالة..."
                        className="rounded-xl"
                      />
                      <Button
                        type="button"
                        disabled={!message.trim() || sendMessage.isPending}
                        onClick={() =>
                          sendMessage.mutate({
                            taskId: activeTask,
                            body: message,
                          })
                        }
                        className="rounded-xl bg-[#e76f3c]"
                      >
                        إرسال
                      </Button>
                    </div>
                    {mode === "worker" && (
                      <div className="mt-3 flex gap-2">
                        <Input
                          value={deliveryNote}
                          onChange={event =>
                            setDeliveryNote(event.target.value)
                          }
                          placeholder="ملاحظة التسليم أو رابط النتيجة"
                          className="rounded-xl"
                        />
                        <Button
                          type="button"
                          disabled={
                            !deliveryNote.trim() || sendMessage.isPending
                          }
                          onClick={deliverTask}
                          className="rounded-xl bg-emerald-600"
                        >
                          تسليم المهمة
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


function FinancialLedgerView({ restaurantId, branchId }: { restaurantId: number; branchId?: number }) {
  const [entryType, setEntryType] = useState<"all" | "payment" | "refund" | "cancellation" | "deposit" | "withdrawal" | "adjustment">("all");
  const [driverUserId, setDriverUserId] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [transactionType, setTransactionType] = useState<"deposit" | "withdrawal" | "hold" | "release" | "adjustment">("deposit");
  const [sectionFilter, setSectionFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const utils = trpc.useUtils();
  const ledgerQuery = trpc.admin.financialLedger.useQuery({ restaurantId, branchId, userId: userFilter ? Number(userFilter) : undefined, section: sectionFilter.trim() || undefined, entryType: entryType === "all" ? undefined : entryType, from: fromDate ? new Date(`${fromDate}T00:00:00`) : undefined, to: toDate ? new Date(`${toDate}T23:59:59.999`) : undefined, limit: 200 }, { retry: false });
  const createDeposit = trpc.admin.driverSecurityDeposit.useMutation({ onSuccess: () => { toast.success("تم إنشاء حساب وديعة السائق"); setDepositAmount(""); void utils.admin.financialLedger.invalidate(); }, onError: error => toast.error(error.message) });
  const recordDeposit = trpc.admin.recordDriverSecurityDeposit.useMutation({ onSuccess: result => { toast.success(`تم تسجيل الحركة. الرصيد الحالي ${result.balanceAfter}`); setDepositAmount(""); void utils.admin.financialLedger.invalidate(); }, onError: error => toast.error(error.message) });
  const submitDeposit = () => { const driver = Number(driverUserId); if (!Number.isInteger(driver) || driver <= 0 || !/^\d+(\.\d{1,2})?$/.test(depositAmount)) { toast.error("أدخل معرف السائق ومبلغًا صحيحًا"); return; } if (transactionType === "deposit") createDeposit.mutate({ restaurantId, driverUserId: driver, openingBalance: depositAmount, currencyCode: "SAR" }); else recordDeposit.mutate({ restaurantId, driverUserId: driver, type: transactionType, amount: depositAmount }); };
  const rows = ledgerQuery.data ?? [];
  return <div className="space-y-3">
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"><CardHeader className="pb-2"><CardTitle className="flex items-center justify-between gap-2 text-base text-slate-900 dark:text-white"><span>السجل المالي الموحد</span><Badge variant="outline">{rows.length} حركة</Badge></CardTitle><p className="text-xs leading-5 text-slate-500 dark:text-slate-400">يشمل المدفوعات والمرتجعات والإلغاءات والودائع والتسويات مع مرجع العملية والمستخدم والفرع.</p></CardHeader><CardContent className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-4"><Input value={sectionFilter} onChange={event => setSectionFilter(event.target.value)} placeholder="القسم" aria-label="فلترة القسم" /><Input value={userFilter} onChange={event => setUserFilter(event.target.value.replace(/\\D/g, ""))} inputMode="numeric" placeholder="معرف المستخدم" aria-label="فلترة المستخدم" /><Input type="date" value={fromDate} onChange={event => setFromDate(event.target.value)} aria-label="من تاريخ" /><Input type="date" value={toDate} onChange={event => setToDate(event.target.value)} aria-label="إلى تاريخ" /></div><div className="flex flex-wrap gap-2">{(["all", "payment", "refund", "cancellation", "deposit", "withdrawal", "adjustment"] as const).map(type => <button key={type} type="button" onClick={() => setEntryType(type)} className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${entryType === type ? "border-[#e76f3c] bg-[#e76f3c] text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-orange-200"}`}>{type === "all" ? "الكل" : type === "payment" ? "مدفوعات" : type === "refund" ? "مرتجعات" : type === "cancellation" ? "إلغاءات" : type === "deposit" ? "ودائع" : type === "withdrawal" ? "سحوبات" : "تسويات"}</button>)}</div>
      {ledgerQuery.isLoading ? <div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /> : ledgerQuery.isError ? <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">تعذر تحميل السجل المالي. أعد المحاولة.</div> : rows.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">لا توجد قيود مالية مطابقة بعد.</div> : <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800"><div className="divide-y divide-slate-100 dark:divide-slate-800">{rows.map((row: typeof rows[number]) => <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-xs"><div><p className="font-black text-slate-800 dark:text-slate-100">{row.section} · {row.entryType}</p><p className="text-[10px] text-slate-400">{row.referenceType ?? "بدون مرجع"} {row.referenceId ? `#${row.referenceId}` : ""} · {new Date(row.createdAt).toLocaleString("ar-SA-u-ca-gregory-nu-latn")}</p></div><span className={`font-black ${row.direction === "credit" ? "text-emerald-600" : "text-red-600"}`}>{row.direction === "credit" ? "+" : "-"}{Number(row.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })} {row.currencyCode}</span></div>)}</div></div>}
    </CardContent></Card>
    <Card className="rounded-2xl border-amber-200 bg-amber-50/50 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/20"><CardHeader className="pb-2"><CardTitle className="text-base text-slate-900 dark:text-white">ودائع السائقين والأرصدة السابقة</CardTitle><p className="text-xs leading-5 text-slate-600 dark:text-slate-300">أنشئ رصيدًا افتتاحيًا أو سجّل إيداعًا أو سحبًا أو حجزًا مع منع الرصيد السالب.</p></CardHeader><CardContent><div className="grid gap-2 sm:grid-cols-4"><Input value={driverUserId} onChange={event => setDriverUserId(event.target.value)} inputMode="numeric" placeholder="معرف السائق" aria-label="معرف السائق" /><Input value={depositAmount} onChange={event => setDepositAmount(event.target.value)} inputMode="decimal" placeholder="المبلغ" aria-label="مبلغ الوديعة" /><select value={transactionType} onChange={event => setTransactionType(event.target.value as typeof transactionType)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold"><option value="deposit">رصيد افتتاحي / إيداع</option><option value="withdrawal">سحب</option><option value="hold">حجز</option><option value="release">تحرير حجز</option><option value="adjustment">تسوية</option></select><Button type="button" onClick={submitDeposit} disabled={createDeposit.isPending || recordDeposit.isPending} className="rounded-xl bg-[#e76f3c] text-white hover:bg-[#d85f2e]">{createDeposit.isPending || recordDeposit.isPending ? "جارٍ الحفظ..." : "حفظ الحركة"}</Button></div></CardContent></Card>
  </div>;
}
