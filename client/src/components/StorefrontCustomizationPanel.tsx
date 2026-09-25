import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Check, Download, Eye, FileJson, LockKeyhole, Palette, QrCode, Save, Store, Upload, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MENU_DISPLAY_TOOL_KEYS, normalizeMenuDisplaySettings, serializeMenuDisplaySettings } from "@shared/menuDisplaySettings";
import type { MenuDisplaySettings } from "@shared/menuDisplaySettings";
import { StorefrontLivePreview, type StorefrontMenuTemplate, type StorefrontSettings } from "@/components/StorefrontLivePreview";

const colorPresets = [
  { key: "nfood-sunset", label: "Sunset", color: "#e76f3c" },
  { key: "plum-amber", label: "Plum & Amber", color: "#4a1d4a" },
  { key: "forest", label: "Forest", color: "#167a5a" },
  { key: "midnight", label: "Midnight", color: "#26344d" },
];

const menuTemplates: { key: StorefrontMenuTemplate; label: string; description: string; swatch: string }[] = [
  { key: "editorial", label: "Editorial", description: "فاخر وواضح", swatch: "linear-gradient(135deg, #fff8f2, #f4c7a1)" },
  { key: "bistro", label: "Bistro", description: "دافئ وحميم", swatch: "linear-gradient(135deg, #f3ebe2, #b86b45)" },
  { key: "glass", label: "NFOOD Glass", description: "داكن وزجاجي", swatch: "linear-gradient(135deg, #0b0f17, #f97316)" },
  { key: "market", label: "Market", description: "سريع وكثيف للمنيو الكبير", swatch: "linear-gradient(135deg, #f8fafc, #2563eb)" },
  { key: "signature", label: "Signature", description: "بريميوم فاخر للصور والأسعار", swatch: "linear-gradient(135deg, #111827, #d97706)" },
];

const visibleSections: { key: string; label: string; description: string; tools: (typeof MENU_DISPLAY_TOOL_KEYS)[number][] }[] = [
  { key: "products", label: "المنتجات والأصناف", description: "البحث والتصنيفات وقائمة الأصناف في الصفحة العامة.", tools: ["search", "categories"] },
  { key: "qr", label: "رمز QR المنيو", description: "إظهار رمز QR يفتح لنفس المنيو، مناسب للطباعة والمشاركة.", tools: ["qr"] },
  { key: "booking", label: "الحجز والأوقات", description: "ساعات العمل، اختيار الفرع، وزر الحجز للضيوف.", tools: ["workingHours", "branchPicker"] },
  { key: "addresses", label: "التواصل والعناوين", description: "تذييل التواصل مع بيانات المطعم والروابط الاجتماعية.", tools: ["contactFooter", "mediaShowcase"] },
];

const extraTools: { key: (typeof MENU_DISPLAY_TOOL_KEYS)[number]; label: string; description: string }[] = [
  { key: "pdf", label: "تحميل PDF", description: "زر تنزيل المنيو كملف PDF." },
  { key: "templatePicker", label: "مبدّل القوالب للزائر", description: "يسمح للزائر بتغيير قالب العرض مؤقتًا." },
];

function toStorefrontSettings(restaurantName: string, display: MenuDisplaySettings, overrides: Partial<StorefrontSettings>): StorefrontSettings {
  return {
    brandName: restaurantName,
    brandColor: overrides.brandColor ?? "#e76f3c",
    themePreset: overrides.themePreset ?? "nfood-sunset",
    menuTemplate: overrides.menuTemplate ?? "editorial",
    themeMode: overrides.themeMode ?? "light",
    tools: display.tools,
    reservationEnabled: overrides.reservationEnabled ?? true,
    showBranchesOnMenu: overrides.showBranchesOnMenu ?? true,
    verifiedStorefront: overrides.verifiedStorefront ?? true,
    coverUrl: overrides.coverUrl ?? "",
    brandLogoUrl: overrides.brandLogoUrl ?? "",
    qrValue: overrides.qrValue ?? "nfood-menu-restaurant-1-branch-1",
  };
}

export function StorefrontCustomizationPanel({ restaurantId = 1 }: { restaurantId?: number }) {
  const [restaurantName, setRestaurantName] = useState("مطعم واحة المذاق");
  const [displayJson, setDisplayJson] = useState<string | null>(null);
  const display = useMemo(() => normalizeMenuDisplaySettings(displayJson), [displayJson]);
  const [preset, setPreset] = useState("nfood-sunset");
  const [brandColor, setBrandColor] = useState("#e76f3c");
  const [menuTemplate, setMenuTemplate] = useState<StorefrontMenuTemplate>("editorial");
  const [mode, setMode] = useState<"light" | "dark" | "system">("light");
  const [verifiedStorefront, setVerifiedStorefront] = useState(true);
  const [reservationEnabled, setReservationEnabled] = useState(true);
  const [showBranchesOnMenu, setShowBranchesOnMenu] = useState(true);
  const [qrValue, setQrValue] = useState("nfood-menu-restaurant-1-branch-1");
  const [qrGeneratedAt, setQrGeneratedAt] = useState("بعد تفعيل المتجر مباشرة");
  const [dirty, setDirty] = useState(false);
  const [backupPayload, setBackupPayload] = useState<string>("");

  const settings: StorefrontSettings = toStorefrontSettings(restaurantName, display, { brandColor, themePreset: preset, menuTemplate, themeMode: mode, verifiedStorefront, reservationEnabled, showBranchesOnMenu, qrValue });

  const sectionTools = (key: string) => visibleSections.find((section) => section.key === key)?.tools ?? [];
  const isSectionOn = (key: string) => sectionTools(key).every((toolKey) => display.tools[toolKey]);
  const toggleSection = (key: string, enabled: boolean) => {
    const next = { ...display.tools, ...Object.fromEntries(sectionTools(key).map((toolKey) => [toolKey, enabled])) };
    setDisplayJson(serializeMenuDisplaySettings({ ...display, tools: next }));
    setDirty(true);
    toast.success(enabled ? `تم إظهار قسم ${visibleSections.find((section) => section.key === key)?.label}` : `تم إخفاء قسم ${visibleSections.find((section) => section.key === key)?.label}`);
  };
  const toggleTool = (toolKey: (typeof MENU_DISPLAY_TOOL_KEYS)[number], enabled: boolean) => {
    setDisplayJson(serializeMenuDisplaySettings({ ...display, tools: { ...display.tools, [toolKey]: enabled } }));
    setDirty(true);
  };
  const applyPreset = (nextPreset: string) => {
    const chosen = colorPresets.find((item) => item.key === nextPreset);
    setPreset(nextPreset);
    if (chosen) setBrandColor(chosen.color);
    setDirty(true);
  };
  const save = () => {
    setDirty(false);
    toast.success("تم حفظ تخصيص المتجر ونشر التغييرات على الصفحة العامة");
    window.dispatchEvent(new CustomEvent("nfood:storefront-saved", { detail: { restaurantId } }));
  };

  const buildBackupPayload = () => JSON.stringify({
    app: "nfood-restaurant-saas",
    version: 1,
    exportedAt: new Date().toISOString(),
    restaurant: {
      name: restaurantName,
      brandColor,
      themePreset: preset,
      menuTemplate,
      themeMode: mode,
      verifiedStorefront,
      reservationEnabled,
      showBranchesOnMenu,
      menuDisplaySettings: serializeMenuDisplaySettings(display),
    },
  }, null, 2);

  const exportBackup = () => {
    const blob = new Blob([buildBackupPayload()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nfood-storefront-${restaurantName.replace(/\s+/g, "-")}-backup.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setBackupPayload(buildBackupPayload());
    toast.success("تم تصدير نسخة احتياطية من إعدادات المتجر");
  };
  const importBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ""));
        const payload = parsed?.restaurant ?? parsed;
        if (parsed?.app !== "nfood-restaurant-saas") throw new Error("app");
        if (typeof payload.name === "string") setRestaurantName(payload.name);
        if (/^#[0-9a-f]{6}$/i.test(payload.brandColor ?? "")) { setBrandColor(payload.brandColor); }
        if (typeof payload.themePreset === "string") setPreset(payload.themePreset);
        if (menuTemplates.some((item) => item.key === payload.menuTemplate)) setMenuTemplate(payload.menuTemplate);
        if (["light", "dark", "system"].includes(payload.themeMode)) setMode(payload.themeMode);
        if (typeof payload.verifiedStorefront === "boolean") setVerifiedStorefront(payload.verifiedStorefront);
        if (typeof payload.reservationEnabled === "boolean") setReservationEnabled(payload.reservationEnabled);
        if (typeof payload.showBranchesOnMenu === "boolean") setShowBranchesOnMenu(payload.showBranchesOnMenu);
        if (typeof payload.menuDisplaySettings === "string") setDisplayJson(payload.menuDisplaySettings);
        setDirty(true);
        toast.success("تمت استعادة النسخة الاحتياطية بنجاح");
      } catch {
        toast.error("ملف النسخة الاحتياطية غير صالح أو مكرر");
      }
    };
    reader.readAsText(file);
  };

  const sectionIcons: Record<string, typeof Store> = {
    products: Store,
    qr: QrCode,
    booking: Wrench,
    addresses: Upload,
  };

  return (
    <div dir="rtl" className="space-y-6">
      <Card className="overflow-hidden rounded-3xl border-slate-200/80 bg-white shadow-sm">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#e76f3c]"><Store className="h-5 w-5" /></span>
            <div>
              <CardTitle className="text-base">تخصيص المتجر</CardTitle>
              <p className="mt-1 text-xs text-slate-500">تظهر كل التغييرات فورًا على صفحة المنشأة العامة ورمز QR المنيو.</p>
            </div>
          </div>
          <Badge className="gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" /> QR المنيو التلقائي {qrGeneratedAt}</Badge>
        </CardHeader>
        <CardContent className="grid gap-6 p-5 lg:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <section>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div><h3 className="text-xs font-black text-slate-700">اسم المتجر</h3><p className="mt-1 text-[10px] text-slate-400">يظهر في الصفحة العامة وعند فتح المنيو عبر QR.</p></div>
                <input value={restaurantName} onChange={(event) => { setRestaurantName(event.target.value); setDirty(true); }} className="h-10 w-56 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-300" />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between"><div><h3 className="text-xs font-black text-slate-700">قالب المنيو</h3><p className="mt-1 text-[10px] leading-5 text-slate-400">يُطبق تلقائيًا على زوار رابط المنيو. يمكن للزائر تبديله مؤقتًا في حال تفعيل المبدّل.</p></div></div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {menuTemplates.map((item) => (
                  <button key={item.key} type="button" onClick={() => { setMenuTemplate(item.key); setDirty(true); }} aria-pressed={menuTemplate === item.key} className={`group rounded-xl border p-2 text-right transition ${menuTemplate === item.key ? "border-orange-400 bg-orange-50 shadow-sm" : "border-slate-200 bg-slate-50 hover:border-orange-200"}`}>
                    <span className="mb-2 block h-9 rounded-lg shadow-inner" style={{ background: item.swatch }} />
                    <span className="block text-[11px] font-black text-slate-800">{item.label}</span>
                    <span className="mt-0.5 block text-[10px] text-slate-500">{item.description}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="mb-3 text-xs font-black text-slate-700">اللون والمظهر</h3>
              <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {colorPresets.map((item) => (
                  <button key={item.key} type="button" onClick={() => applyPreset(item.key)} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-right text-xs font-bold ${preset === item.key ? "border-amber-400 bg-white shadow-sm" : "border-slate-200 bg-white/70"}`}>
                    <span className="h-5 w-5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}{preset === item.key ? <Check className="ms-auto h-4 w-4 text-emerald-600" /> : null}
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold">
                  اللون الأساسي
                  <div className="mt-2 flex items-center gap-2"><input type="color" value={brandColor} onChange={(event) => { setBrandColor(event.target.value); setPreset("custom"); setDirty(true); }} className="h-8 w-10 cursor-pointer rounded" /><input value={brandColor} onChange={(event) => { if (/^#[0-9a-fA-F]{0,6}$/.test(event.target.value)) setBrandColor(event.target.value); }} dir="ltr" className="h-8 w-full rounded-lg border border-slate-200 px-2 font-mono text-xs outline-none" /></div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold">
                  الوضع
                  <div className="mt-2 grid grid-cols-3 gap-1">{(["light", "dark", "system"] as const).map((item) => <button key={item} type="button" onClick={() => { setMode(item); setDirty(true); }} className={`rounded-lg px-2 py-1.5 text-[10px] ${mode === item ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>{item === "light" ? "فاتح" : item === "dark" ? "داكن" : "النظام"}</button>)}</div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-xs font-black text-slate-700">الأقسام الظاهرة في الصفحة العامة</h3>
              <p className="mt-1 text-[10px] leading-5 text-slate-400">أظهر أو أخفِ أقسام المنيو والرموز والشريط السفلي بضغطة واحدة.</p>
              <div className="mt-3 space-y-2">
                {visibleSections.map((section) => {
                  const Icon = sectionIcons[section.key] ?? Store;
                  const on = isSectionOn(section.key);
                  return (
                    <div key={section.key} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Icon className="h-4 w-4" /></span>
                      <div className="min-w-0 flex-1"><p className="text-xs font-black text-slate-700">{section.label}</p><p className="mt-0.5 truncate text-[10px] text-slate-400">{section.description}</p></div>
                      <Switch checked={on} onCheckedChange={(checked) => toggleSection(section.key, checked)} />
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 space-y-2">
                {extraTools.map((tool) => (
                  <div key={tool.key} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <div className="min-w-0 flex-1"><p className="text-xs font-black text-slate-700">{tool.label}</p><p className="mt-0.5 text-[10px] text-slate-400">{tool.description}</p></div>
                    <Switch checked={display.tools[tool.key]} onCheckedChange={(checked) => toggleTool(tool.key, checked)} />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-black text-emerald-900"><QrCode className="h-4 w-4 text-emerald-600" /> رمز QR المنيو التلقائي</h3>
                  <p className="mt-1 max-w-md text-[10px] leading-5 text-emerald-800/80">يُنشأ تلقائيًا بمجرد تفعيل المتجر، ويربط كل فرع بمنيو العام. يمكنك نسخ الرابط أو تنزيل الرمز.</p>
                  <p className="mt-2 truncate font-mono text-[10px] text-emerald-700/80" dir="ltr">{qrValue}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-2xl bg-white p-1.5 shadow-sm"><svg width="42" height="42" viewBox="0 0 42 42" fill="none"><rect width="42" height="42" fill="white" /><path d="M6 6h10v10H6zM26 6h10v10H26zM6 26h10v10H6zM18 18h4v4h-4zM18 26h4v2h-4zM24 24h2v4h-2zM26 26h4v4h-4zM30 18h4v4h-4zM24 14h6v2h-6zM14 18h2v6h-2z" fill="#2B2B2B" /></svg></span>
                  <Button type="button" size="sm" variant="outline" className="gap-1 rounded-xl border-emerald-300 text-emerald-800 hover:bg-emerald-50" onClick={() => toast.success("تم نسخ رابط المنيو")}><Eye className="h-3.5 w-3.5" /> نسخ الرابط</Button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><BadgeCheck className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1"><h3 className="text-xs font-black text-violet-950">ختم المنشأة الموثقة</h3><p className="mt-1 text-[10px] leading-5 text-violet-800/80">يعرض "منشأة موثقة" في تذييل الصفحة العامة وبجانب اسم المتجر، ليزيد ثقة الزائر.</p></div>
                <Switch checked={verifiedStorefront} onCheckedChange={(checked) => { setVerifiedStorefront(checked); setDirty(true); toast.success(checked ? "تم تفعيل ختم التوثيق" : "تم إيقاف ختم التوثيق"); }} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <h3 className="flex items-center gap-2 text-xs font-black text-slate-700"><Download className="h-4 w-4 text-slate-500" /> النسخ الاحتياطي والاستعادة</h3>
              <p className="mt-1 text-[10px] leading-5 text-slate-400">صدّر كل إعدادات المتجر والمظهر والأقسام في ملف JSON واحد، ثم استرجعها في أي وقت.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm" className="gap-1.5 rounded-xl bg-[#111c2e] px-4 text-white hover:bg-[#1b2b43]" onClick={exportBackup}><Download className="h-3.5 w-3.5" /> تصدير نسخة احتياطية</Button>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100" htmlFor="storefront-backup-import"><Upload className="h-3.5 w-3.5" /> استعادة من ملف
                  <input id="storefront-backup-import" type="file" accept="application/json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) importBackup(file); event.currentTarget.value = ""; }} /></label>
              </div>
              {backupPayload ? <pre dir="ltr" className="mt-3 max-h-28 overflow-auto rounded-xl bg-slate-900 p-3 text-[9px] leading-4 text-emerald-300">{backupPayload}</pre> : null}
            </section>

            <div className="flex items-center gap-3">
              <Button type="button" onClick={save} disabled={!dirty} className="rounded-xl bg-[#e76f3c] text-white hover:bg-[#d85f2e]"><Save className="me-2 h-4 w-4" />{dirty ? "حفظ التغييرات" : "لا توجد تغييرات"}</Button>
              <span className="text-[10px] text-slate-400">{dirty ? "التغييرات لم تُنشر بعد" : "الإعدادات منشورة على الصفحة العامة"}</span>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between px-1"><p className="text-xs font-black text-slate-700">معاينة حية على الهاتف</p><span className="text-[10px] font-bold text-emerald-600">{menuTemplate === "glass" ? "NFOOD Glass" : menuTemplate === "bistro" ? "Bistro" : "Editorial"}</span></div>
              <StorefrontLivePreview settings={settings} />
              <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[10px] text-slate-500"><span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" /> تتحدث المعاينة فورًا قبل الحفظ</div>
            </div>
          </aside>
        </CardContent>
      </Card>
      <p className="flex items-center gap-2 text-[11px] text-slate-400"><LockKeyhole className="h-3.5 w-3.5" /> تظهر هذه اللوحة في تبويب «المتجر» بلوحة التحكم، ويُولّد رمز QR تلقائيًا عند تفعيل المتجر.</p>
    </div>
  );
}