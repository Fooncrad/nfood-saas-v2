import { useEffect, useMemo, useState } from "react";
import { Check, Eye, ImagePlus, LoaderCircle, LockKeyhole, Palette, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const presets = [
  { key: "nfood-sunset", label: "Sunset", color: "#e76f3c" },
  { key: "plum-amber", label: "Plum & Amber", color: "#4a1d4a" },
  { key: "forest", label: "Forest", color: "#167a5a" },
  { key: "midnight", label: "Midnight", color: "#26344d" },
];

type AssetType = "logo" | "pwaIcon" | "cover";

export function BrandingEditorPanel({ restaurantId }: { restaurantId: number }) {
  const utils = trpc.useUtils();
  const query = trpc.platform.branding.useQuery({ restaurantId });
  const update = trpc.platform.updateBranding.useMutation({
    onSuccess: async () => { toast.success("تم حفظ إعدادات الهوية"); await utils.platform.branding.invalidate({ restaurantId }); },
    onError: (error) => toast.error(error.message || "تعذر حفظ الهوية"),
  });
  const upload = trpc.platform.uploadBrandAsset.useMutation({
    onSuccess: async () => { toast.success("تم رفع الصورة وتحديث الهوية"); await utils.platform.branding.invalidate({ restaurantId }); },
    onError: (error) => toast.error(error.message || "تعذر رفع الصورة"),
  });
  const [color, setColor] = useState("#e76f3c");
  const [preset, setPreset] = useState("nfood-sunset");
  const [mode, setMode] = useState<"light" | "dark" | "system">("light");
  const [name, setName] = useState("");
  const [orderModes, setOrderModes] = useState<string[]>(["dineIn", "takeaway", "delivery", "reservation", "hotel"]);
  const [reservationEventTypes, setReservationEventTypes] = useState<string[]>(["حفل عيد ميلاد", "فعالية", "اجتماع", "عشاء خاص"]);

  useEffect(() => {
    if (!query.data) return;
    setColor(query.data.brandColor);
    setPreset(query.data.themePreset);
    setMode(query.data.themeMode);
    setName(query.data.brandName);
    try { const parsed = JSON.parse(query.data.orderModesJson || "[]"); setOrderModes(Array.isArray(parsed) ? parsed : ["dineIn", "takeaway", "delivery", "reservation", "hotel"]); } catch { setOrderModes(["dineIn", "takeaway", "delivery", "reservation", "hotel"]); }
    try { const parsed = JSON.parse(query.data.reservationEventTypesJson || "[]"); setReservationEventTypes(Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string" && Boolean(value.trim())).slice(0, 12) : ["حفل عيد ميلاد", "فعالية", "اجتماع", "عشاء خاص"]); } catch { setReservationEventTypes(["حفل عيد ميلاد", "فعالية", "اجتماع", "عشاء خاص"]); }
  }, [query.data]);

  const access = useMemo(() => new Map((query.data?.featureAccess ?? []).map((feature) => [feature.key, feature])), [query.data?.featureAccess]);
  const colorsEnabled = access.get("branding.colors")?.enabled ?? false;
  const darkEnabled = access.get("branding.dark_mode")?.enabled ?? false;

  if (query.isLoading) return <Card className="rounded-2xl border-slate-200"><CardContent className="p-4 text-sm text-slate-500">جارٍ تحميل محرر الهوية...</CardContent></Card>;
  if (query.isError || !query.data) return null;

  const uploadAsset = (assetType: AssetType, file: File) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) { toast.error("يسمح برفع PNG أو JPG أو WEBP فقط"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("الحد الأقصى للصورة 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result || "").split(",")[1];
      if (!data) { toast.error("تعذر قراءة الصورة"); return; }
      upload.mutate({ restaurantId, assetType, data, mimeType: file.type as "image/png" | "image/jpeg" | "image/webp", fileName: file.name });
    };
    reader.onerror = () => toast.error("تعذر قراءة ملف الصورة");
    reader.readAsDataURL(file);
  };

  const save = () => update.mutate({
    restaurantId, brandName: name.trim() || query.data.brandName, brandColor: color, themeMode: mode, themePreset: preset,
    brandLogoUrl: query.data.brandLogoUrl, pwaInstallMessage: query.data.pwaInstallMessage, pwaInstallIconUrl: query.data.pwaInstallIconUrl,
    brandDescription: query.data.brandDescription, homepageContent: query.data.homepageContent, termsOfService: query.data.termsOfService,
    privacyPolicy: query.data.privacyPolicy, refundPolicy: query.data.refundPolicy, phone: query.data.phone, whatsapp: query.data.whatsapp,
    instagramUrl: query.data.instagramUrl, facebookUrl: query.data.facebookUrl, tiktokUrl: query.data.tiktokUrl, websiteUrl: query.data.websiteUrl,
    address: query.data.address, languagesJson: query.data.languagesJson, reservationEnabled: query.data.reservationEnabled,
    cancellationEnabled: query.data.cancellationEnabled, cancellationWindowMinutes: query.data.cancellationWindowMinutes,
    reservationNoShowGraceMinutes: query.data.reservationNoShowGraceMinutes, showBranchesOnMenu: query.data.showBranchesOnMenu, orderModesJson: JSON.stringify(orderModes), reservationEventTypesJson: JSON.stringify(reservationEventTypes),
  });

  const assetCard = (assetType: AssetType, label: string, hint: string, url: string, objectClass = "object-contain") => (
    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-3 text-xs font-bold text-slate-700 transition-colors hover:border-amber-300 ${upload.isPending ? "pointer-events-none opacity-70" : "border-slate-200"}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
        {upload.isPending ? <LoaderCircle className="h-5 w-5 animate-spin text-amber-600" /> : url ? <img src={url} alt="" className={`h-full w-full ${objectClass}`} /> : <ImagePlus className="h-5 w-5 text-slate-400" />}
      </span>
      <span><span className="block">{label}</span><span className="mt-1 block text-[10px] font-normal text-slate-400">{hint}</span></span>
      <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={upload.isPending} onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadAsset(assetType, file); event.currentTarget.value = ""; }} />
    </label>
  );

  return <Card className="rounded-2xl border-amber-100 bg-gradient-to-br from-white to-amber-50/40 shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3"><div><CardTitle className="text-base">محرر الهوية والمعاينة الحية</CardTitle><p className="mt-1 text-xs text-slate-500">عدّل المظهر دون كتابة CSS، وتظهر الصلاحيات حسب باقة {query.data.plan}.</p></div><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><Palette className="h-5 w-5" /></div></CardHeader>
    <CardContent className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-700">اسم العلامة<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></label>
        <div className="grid gap-2 sm:grid-cols-3">
          {assetCard("logo", "رفع الشعار", "PNG/JPG/WEBP · 5MB", query.data.brandLogoUrl)}
          {assetCard("pwaIcon", "أيقونة PWA", "تظهر في التثبيت والتنبيه", query.data.pwaInstallIconUrl)}
          {assetCard("cover", "صورة الغلاف", "واجهة المنيو الرئيسية", query.data.coverUrl, "object-cover")}
        </div>
        {upload.isPending && <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"><LoaderCircle className="h-4 w-4 animate-spin" /> جارٍ ضغط الصورة ورفعها بأمان...</div>}
        <div><p className="mb-2 text-xs font-bold text-slate-700">القالب</p><div className="grid grid-cols-2 gap-2">{presets.map((item) => <button key={item.key} type="button" onClick={() => { setPreset(item.key); if (colorsEnabled) setColor(item.color); }} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-right text-xs font-bold ${preset === item.key ? "border-amber-400 bg-white shadow-sm" : "border-slate-200 bg-white/70"}`}><span className="h-5 w-5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}{preset === item.key ? <Check className="ms-auto h-4 w-4 text-emerald-600" /> : null}</button>)}</div></div>
        <div className="grid gap-2 sm:grid-cols-2"><label className={`rounded-xl border bg-white p-3 text-xs font-bold ${colorsEnabled ? "border-slate-200" : "border-slate-100 opacity-60"}`}>اللون الأساسي<div className="mt-2 flex items-center gap-2"><input type="color" value={color} disabled={!colorsEnabled} onChange={(event) => setColor(event.target.value)} className="h-8 w-10 cursor-pointer rounded" /><Input value={color} disabled={!colorsEnabled} onChange={(event) => setColor(event.target.value)} dir="ltr" className="h-8 font-mono text-xs" /></div>{!colorsEnabled ? <span className="mt-1 flex items-center gap-1 text-[10px] text-slate-400"><LockKeyhole className="h-3 w-3" /> متاح بعد الترقية</span> : null}</label><label className={`rounded-xl border bg-white p-3 text-xs font-bold ${darkEnabled ? "border-slate-200" : "border-slate-100 opacity-60"}`}>الوضع<div className="mt-2 grid grid-cols-3 gap-1">{(["light", "dark", "system"] as const).map((item) => <button key={item} type="button" disabled={item === "dark" && !darkEnabled} onClick={() => setMode(item)} className={`rounded-lg px-2 py-1.5 text-[10px] ${mode === item ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>{item === "light" ? "فاتح" : item === "dark" ? "داكن" : "النظام"}</button>)}</div>{!darkEnabled ? <span className="mt-1 flex items-center gap-1 text-[10px] text-slate-400"><LockKeyhole className="h-3 w-3" /> الداكن حسب الباقة</span> : null}</label></div>
        <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-xs font-black text-slate-700">أنواع الطلب المتاحة في المنيو</p><p className="mt-1 text-[10px] text-slate-400">أوقف أي نوع لا يقدمه المطعم؛ الطلب الذاتي والطاولات يتزامنان مع حالة المطعم.</p><div className="mt-2 flex flex-wrap gap-2">{[{ key: "dineIn", label: "محلي" }, { key: "takeaway", label: "سفري" }, { key: "delivery", label: "توصيل" }, { key: "reservation", label: "حجز" }, { key: "hotel", label: "خدمة فنادق" }].map((item) => <button key={item.key} type="button" onClick={() => setOrderModes((current) => current.includes(item.key) ? current.filter((value) => value !== item.key) : [...current, item.key])} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${orderModes.includes(item.key) ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{item.label}</button>)}</div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-xs font-black text-slate-700">مناسبات الحجز مع الطلب المسبق</p><p className="mt-1 text-[10px] leading-5 text-slate-400">أضف الخيارات التي سيختار منها العميل، مثل: حفل عيد ميلاد، فعالية، اجتماع. افصل بين الخيارات بفاصلة.</p><Input value={reservationEventTypes.join("، ")} onChange={(event) => setReservationEventTypes(event.target.value.split(/[،,]/).map((value) => value.trim()).filter(Boolean).slice(0, 12))} className="mt-2 rounded-xl border-slate-200 bg-slate-50 text-sm" placeholder="حفل عيد ميلاد، فعالية، اجتماع" /></div>
        <Button type="button" onClick={save} disabled={update.isPending || name.trim().length < 2} className="rounded-xl bg-[#e76f3c] text-white hover:bg-[#d85f2e]"><Save className="me-2 h-4 w-4" />{update.isPending ? "جارٍ الحفظ..." : "حفظ الهوية"}</Button>
      </div>
      <div className={`min-h-56 rounded-2xl p-4 shadow-inner ${mode === "dark" ? "text-white" : "text-slate-900"}`} style={{ backgroundColor: mode === "dark" ? "#181522" : "#fffaf5" }}><div className="flex items-center justify-between"><span className="text-[10px] opacity-70">معاينة مباشرة</span><Eye className="h-4 w-4 opacity-70" /></div><div className="mt-8 overflow-hidden rounded-2xl bg-white/80 shadow-sm">{query.data.coverUrl && <img src={query.data.coverUrl} alt="معاينة الغلاف" className="h-20 w-full object-cover" /> }<div className="p-4"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl" style={{ backgroundColor: color }}>{query.data.brandLogoUrl ? <img src={query.data.brandLogoUrl} alt="" className="h-full w-full object-contain" /> : null}</span><div><p className="text-xs font-black">{name || "اسم المطعم"}</p><p className="text-[10px] opacity-60">Public Menu Preview</p></div></div><div className="mt-4 h-2 w-2/3 rounded-full" style={{ backgroundColor: color }} /><div className="mt-3 flex gap-2"><Badge className="rounded-lg text-[10px]" style={{ backgroundColor: color }}>عرض المنيو</Badge><span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] text-slate-500">السلة</span></div></div></div></div>
    </CardContent>
  </Card>;
}
