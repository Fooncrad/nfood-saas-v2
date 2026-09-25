import { QRCodeSVG } from "qrcode.react";
import { BadgeCheck, Clock3, MapPin, QrCode, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type StorefrontMenuTemplate = "editorial" | "bistro" | "glass" | "market" | "signature";

export type StorefrontSettings = {
  brandName: string;
  brandColor: string;
  themePreset: string;
  menuTemplate: StorefrontMenuTemplate;
  themeMode: "light" | "dark" | "system";
  tools: Record<string, boolean>;
  reservationEnabled: boolean;
  showBranchesOnMenu: boolean;
  verifiedStorefront: boolean;
  coverUrl: string;
  brandLogoUrl: string;
  qrValue: string;
};

const demoItems = [
  { name: "شاورما دجاج", price: "24 ر.س", from: "#f59e0b" },
  { name: "برجر لحم", price: "32 ر.س", from: "#e76f3c" },
  { name: "سلطة سيزر", price: "18 ر.س", from: "#10b981" },
  { name: "كبسة لحم", price: "45 ر.س", from: "#8b5e34" },
  { name: "عصير برتقال", price: "12 ر.س", from: "#f97316" },
  { name: "موهيتو نعناع", price: "14 ر.س", from: "#84cc16" },
];

const categories = ["الكل", "مشويات", "سلطات", "مشروبات", "حلويات"];

function coverGradient(settings: StorefrontSettings) {
  return `linear-gradient(135deg, ${settings.brandColor}, ${settings.menuTemplate === "glass" ? "#0b0f17" : dressColor(settings)})`;
}

function dressColor(settings: StorefrontSettings) {
  if (settings.menuTemplate === "glass") return "#0b0f17";
  if (settings.menuTemplate === "bistro") return "#b86b45";
  if (settings.menuTemplate === "market") return "#2563eb";
  if (settings.menuTemplate === "signature") return "#d97706";
  return `${settings.brandColor}cc`;
}

function surfaceColor(settings: StorefrontSettings) {
  if (settings.menuTemplate === "glass") return "#10151f";
  if (settings.menuTemplate === "bistro") return "#f3ebe2";
  if (settings.themeMode === "dark") return "#181522";
  if (settings.menuTemplate === "market") return "#f8fafc";
  if (settings.menuTemplate === "signature") return "#fffbeb";
  return "#fffaf5";
}

function inkColor(settings: StorefrontSettings) {
  if (settings.menuTemplate === "glass" || settings.themeMode === "dark") return "#fff8f2";
  if (settings.menuTemplate === "bistro") return "#2d211d";
  return "#172235";
}

function cardColor(settings: StorefrontSettings) {
  if (settings.menuTemplate === "glass") return "rgba(255,255,255,.08)";
  if (settings.themeMode === "dark") return "#1b2432";
  if (settings.menuTemplate === "bistro") return "#fffaf4";
  if (settings.menuTemplate === "market") return "#ffffff";
  if (settings.menuTemplate === "signature") return "#ffffff";
  return "#ffffff";
}

export function StorefrontLivePreview({ settings, showDeviceFrame = true }: { settings: StorefrontSettings; showDeviceFrame?: boolean }) {
  const surface = surfaceColor(settings);
  const ink = inkColor(settings);
  const card = cardColor(settings);
  const showTool = (key: string) => settings.tools[key] !== false;
  return (
    <div dir="rtl" style={{ background: surface, color: ink }} className={showDeviceFrame ? "mx-auto w-full max-w-[300px] overflow-hidden rounded-[1.5rem] border border-black/10 shadow-xl" : "w-full overflow-hidden rounded-2xl"}>
      <div className="relative h-28" style={{ background: coverGradient(settings) }}>
        {settings.coverUrl ? <img src={settings.coverUrl} alt="" className="h-full w-full object-cover opacity-80" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute bottom-3 start-3 end-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/50 bg-white/90 shadow" style={{ color: settings.brandColor }}>
            {settings.brandLogoUrl ? <img src={settings.brandLogoUrl} alt="" className="h-full w-full object-contain" /> : <span className="text-sm font-black">{settings.brandName.slice(0, 1)}</span>}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">{settings.brandName}</p>
            <p className="text-[10px] text-white/70">{settings.reservationEnabled ? "متاح للحجز" : "مفتوح الآن"}</p>
          </div>
          {settings.verifiedStorefront ? (
            <Badge className="ms-auto gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-black text-white">
              <BadgeCheck className="h-3 w-3" /> منشأة موثقة
            </Badge>
          ) : null}
        </div>
      </div>
      <div className="p-3">
        {showTool("search") ? (
          <div className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] text-slate-400" style={{ background: settings.menuTemplate === "glass" ? "rgba(255,255,255,.06)" : "#f1f5f9", color: settings.menuTemplate === "glass" ? "#cbd5e1" : "#64748b" }}>
            <Search className="h-3.5 w-3.5" /> ابحث في المنيو
          </div>
        ) : null}
        {showTool("categories") ? (
          <div className="mb-3 flex gap-1.5 overflow-hidden">
            {categories.map((category) => (
              <span key={category} className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: category === "الكل" ? settings.brandColor : settings.menuTemplate === "glass" ? "rgba(255,255,255,.08)" : "#f1f5f9", color: category === "الكل" ? "#ffffff" : settings.menuTemplate === "glass" ? "#e2e8f0" : "#475569" }}>
                {category}
              </span>
            ))}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          {demoItems.map((item) => (
            <div key={item.name} className="overflow-hidden rounded-xl" style={{ background: card, border: `1px solid ${settings.menuTemplate === "glass" ? "rgba(255,255,255,.1)" : "#eadfce"}` }}>
              <div className="flex h-14 items-center justify-center" style={{ background: `linear-gradient(135deg, ${item.from}, ${item.from}99)` }}>
                <span className="text-2xl drop-shadow">{item.name.slice(0, 1)}</span>
              </div>
              <div className="p-2">
                <p className="truncate text-[10px] font-black">{item.name}</p>
                <p className="mt-0.5 text-[10px]" style={{ color: settings.brandColor }}>{item.price}</p>
              </div>
            </div>
          ))}
        </div>
        {showTool("workingHours") || settings.showBranchesOnMenu ? (
          <div className="mt-3 space-y-1.5 border-t pt-2 text-[9px]" style={{ borderColor: settings.menuTemplate === "glass" ? "rgba(255,255,255,.1)" : "#eadfce", color: settings.menuTemplate === "glass" ? "#94a3b8" : "#64748b" }}>
            {showTool("workingHours") ? (
              <p className="flex items-center gap-1.5"><Clock3 className="h-3 w-3" /> يوميًا 12:00 ظهرًا – 1:00 صباحًا</p>
            ) : null}
            {settings.showBranchesOnMenu ? (
              <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> فرعان · الرياض</p>
            ) : null}
          </div>
        ) : null}
        <div className="mt-3 flex items-center justify-between border-t pt-2" style={{ borderColor: settings.menuTemplate === "glass" ? "rgba(255,255,255,.1)" : "#eadfce" }}>
          {settings.verifiedStorefront ? (
            <span className="flex items-center gap-1.5 text-[9px] font-bold" style={{ color: settings.menuTemplate === "glass" ? "#34d399" : "#059669" }}>
              <BadgeCheck className="h-3.5 w-3.5" /> منشأة موثقة لدى NFOOD
            </span>
          ) : !showTool("qr") ? (
            <span className="text-[9px] text-slate-400" style={{ color: settings.menuTemplate === "glass" ? "#64748b" : "#94a3b8" }}>ختم التوثيق غير مفعّل</span>
          ) : null}
          {showTool("qr") ? (
            <span className="rounded-lg bg-white p-1 shadow-sm"><QRCodeSVG value={settings.qrValue} size={34} level="H" fgColor="#2B2B2B" /></span>
          ) : <QrCode className="h-4 w-4 opacity-30" />}
        </div>
      </div>
    </div>
  );
}