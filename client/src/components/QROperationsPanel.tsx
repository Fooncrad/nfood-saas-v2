import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Hash, Link2, QrCode, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildStableQrMenuUrl } from "@/lib/qrUrl";

type QrVisualConfig = { fgColor: string; bgColor: string; padding: number; size: number };
type QrCodeRow = { token: string; purpose: string; tableId: number | null; targetUrl: string | null };
type QrLocale = "ar" | "en" | "fr";

const qrCopy: Record<QrLocale, {
  chooseBranch: string;
  title: string;
  subtitle: string;
  branch: string;
  identifier: string;
  identifierHelp: string;
  automaticMenu: string;
  automaticBadge: string;
  automaticHelp: string;
  copyLink: string;
  copied: string;
  appearance: string;
  appearanceHelp: string;
  foreground: string;
  background: string;
  size: string;
}> = {
  ar: {
    chooseBranch: "اختر فرعًا من مساحة العمل أولًا.",
    title: "تخصيص الرموز",
    subtitle: "إدارة رمز المنيو التلقائي وتخصيص مظهره فقط. لا توجد هنا مولدات مستقلة للطاولات أو النادل أو الطلبات.",
    branch: "الفرع",
    identifier: "المعرّف الثابت للمتجر",
    identifierHelp: "يبقى المعرّف ثابتًا عند تغيير اسم المتجر أو النطاق أو رابط الموقع.",
    automaticMenu: "QR المنيو التلقائي",
    automaticBadge: "يُنشأ عند إنشاء المتجر",
    automaticHelp: "رمز ثابت يفتح المنيو العام للفرع، ولا يتغير عند تغيير الاسم أو النطاق أو الرابط.",
    copyLink: "نسخ الرابط",
    copied: "تم نسخ رابط المنيو",
    appearance: "تخصيص مظهر الرمز",
    appearanceHelp: "غيّر لون الرمز والخلفية والحجم قبل اعتماد التصميم.",
    foreground: "لون الرمز",
    background: "لون الخلفية",
    size: "الحجم",
  },
  en: {
    chooseBranch: "Choose a branch from the workspace first.",
    title: "QR customization",
    subtitle: "Manage the automatic menu QR and its appearance. Table, waiter, and order codes are managed in their own workflows.",
    branch: "Branch",
    identifier: "Stable store identifier",
    identifierHelp: "The identifier remains stable when the store name, domain, or website URL changes.",
    automaticMenu: "Automatic menu QR",
    automaticBadge: "Created with the store",
    automaticHelp: "A stable code that opens the branch menu and does not change with its name, domain, or URL.",
    copyLink: "Copy link",
    copied: "Menu link copied",
    appearance: "QR appearance",
    appearanceHelp: "Adjust the code color, background, and size before adopting the design.",
    foreground: "Code color",
    background: "Background color",
    size: "Size",
  },
  fr: {
    chooseBranch: "Choisissez d’abord une succursale dans l’espace de travail.",
    title: "Personnalisation du QR",
    subtitle: "Gérez le QR automatique du menu et son apparence. Les codes de table, de serveur et de commande suivent leurs propres parcours.",
    branch: "Succursale",
    identifier: "Identifiant stable de l’établissement",
    identifierHelp: "L’identifiant reste stable lorsque le nom, le domaine ou l’adresse du site change.",
    automaticMenu: "QR automatique du menu",
    automaticBadge: "Créé avec l’établissement",
    automaticHelp: "Un code stable qui ouvre le menu de la succursale sans changer avec son nom, son domaine ou son adresse.",
    copyLink: "Copier le lien",
    copied: "Lien du menu copié",
    appearance: "Apparence du QR",
    appearanceHelp: "Ajustez la couleur du code, l’arrière-plan et la taille avant de valider le design.",
    foreground: "Couleur du code",
    background: "Couleur de fond",
    size: "Taille",
  },
};

export function QROperationsPanel({ restaurantId, branchId }: { restaurantId: number; branchId?: number }) {
  const { language } = useLanguage();
  const locale: QrLocale = language === "fr" ? "fr" : language === "en" ? "en" : "ar";
  const copy = qrCopy[locale];
  const effectiveBranchId = branchId ?? 0;
  const query = trpc.platform.qrCodes.useQuery({ restaurantId, branchId: effectiveBranchId }, { enabled: Boolean(restaurantId && effectiveBranchId), retry: false });
  const [config, setConfig] = useState<QrVisualConfig>({ fgColor: "#2B2B2B", bgColor: "#FFFFFF", padding: 1, size: 240 });
  const row = (query.data?.codes ?? []).find((code) => code.token === query.data?.menuQr?.token) as QrCodeRow | undefined;
  const stableIdentifier = query.data?.fixedIdentifier?.trim() || String(restaurantId);
  const origin = typeof window === "undefined" ? "https://fooncard.com" : window.location.origin;
  const value = row?.targetUrl?.trim() || (row
    ? buildStableQrMenuUrl(origin, stableIdentifier, row.token)
    : `${origin}/menu/${encodeURIComponent(stableIdentifier)}`);
  const copyLink = () => { void navigator.clipboard?.writeText(value); toast.success(copy.copied); };

  if (!effectiveBranchId) return <Card className="rounded-3xl border-slate-700 bg-[#111c2e] text-white"><CardContent className="p-8 text-center text-sm text-slate-300">{copy.chooseBranch}</CardContent></Card>;

  return <div className="space-y-4" data-testid="qr-operations-panel" dir={locale === "ar" ? "rtl" : "ltr"}>
    <Card className="overflow-hidden rounded-3xl border-slate-700 bg-[#111c2e] text-white shadow-xl shadow-slate-950/20">
      <CardHeader className="border-b border-white/10 bg-gradient-to-l from-orange-500/15 via-transparent to-transparent p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><CardTitle className="flex items-center gap-2 text-xl font-black"><QrCode className="h-5 w-5 text-orange-300" />{copy.title}</CardTitle><p className="mt-2 max-w-2xl text-xs leading-6 text-slate-300">{copy.subtitle}</p></div><Badge className="gap-1 bg-emerald-400/10 text-emerald-300"><ShieldCheck className="h-3.5 w-3.5" />{copy.branch}: {query.data?.branch.name ?? "—"}</Badge></div></CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="rounded-2xl border border-orange-400/25 bg-orange-500/10 p-4"><p className="flex items-center gap-2 text-xs font-black text-orange-200"><Hash className="h-4 w-4" />{copy.identifier}</p><p className="mt-2 break-all font-mono text-lg font-black tracking-wider text-white">{stableIdentifier}</p><p className="mt-2 text-[11px] leading-5 text-orange-100/70">{copy.identifierHelp}</p></div>
        <section data-testid="menu-qr-auto-card" className="rounded-2xl border border-emerald-400/25 bg-gradient-to-l from-emerald-500/10 via-slate-950/35 to-cyan-500/10 p-4"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="flex items-center gap-2 text-sm font-black text-emerald-100"><QrCode className="h-4 w-4" />{copy.automaticMenu}</h3><Badge className="bg-emerald-400/15 text-emerald-200">{copy.automaticBadge}</Badge></div><p className="mt-2 max-w-2xl text-[11px] leading-5 text-slate-300">{copy.automaticHelp}</p><p className="mt-2 truncate font-mono text-[10px] text-emerald-200/80" title={value}>{value}</p></div><div className="flex shrink-0 items-center gap-3"><div className="rounded-2xl bg-white p-2"><QRCodeSVG value={value} size={128} level="H" /></div><Button type="button" size="sm" onClick={copyLink} className="h-8 gap-1 rounded-lg bg-emerald-500 px-3 text-[10px] font-black text-slate-950 hover:bg-emerald-400"><Link2 className="h-3.5 w-3.5" />{copy.copyLink}</Button></div></div></section>
        <section data-testid="qr-visual-customization" className="rounded-2xl border border-white/10 bg-slate-950/45 p-4"><h3 className="text-sm font-black text-white">{copy.appearance}</h3><p className="mt-1 text-[11px] leading-5 text-slate-400">{copy.appearanceHelp}</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><label className="space-y-1 text-[11px] text-slate-300">{copy.foreground}<input type="color" value={config.fgColor} onChange={(event) => setConfig((current) => ({ ...current, fgColor: event.target.value }))} className="h-10 w-full cursor-pointer rounded-lg bg-white p-1" /></label><label className="space-y-1 text-[11px] text-slate-300">{copy.background}<input type="color" value={config.bgColor} onChange={(event) => setConfig((current) => ({ ...current, bgColor: event.target.value }))} className="h-10 w-full cursor-pointer rounded-lg bg-white p-1" /></label><label className="space-y-1 text-[11px] text-slate-300">{copy.size}: {config.size}px<input type="range" min="120" max="420" step="10" value={config.size} onChange={(event) => setConfig((current) => ({ ...current, size: Number(event.target.value) }))} className="w-full accent-orange-400" /></label></div><div className="mt-4 grid place-items-center rounded-xl p-4" style={{ backgroundColor: config.bgColor, padding: `${Math.max(0, config.padding) * 4 + 12}px` }}><QRCodeSVG value={value} size={Math.min(180, config.size)} level="H" fgColor={config.fgColor} bgColor={config.bgColor} /></div></section>
      </CardContent>
    </Card>
  </div>;
}
