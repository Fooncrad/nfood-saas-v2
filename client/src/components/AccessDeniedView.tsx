import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

type AccessDeniedViewProps = { feature: string };

export function AccessDeniedView({ feature }: AccessDeniedViewProps) {
  const { language, t } = useLanguage();
  return <Card dir={language === "ar" ? "rtl" : "ltr"} className="rounded-2xl border-amber-200 bg-amber-50 shadow-sm"><CardContent className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center"><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-amber-600 shadow-sm"><ShieldCheck className="h-8 w-8" /></div><h2 className="text-xl font-bold text-slate-900">403 · {t("forbidden")}</h2><p className="mt-3 max-w-md text-sm leading-7 text-slate-600">{t("forbidden")}</p><p className="mt-2 font-mono text-[11px] text-slate-400">{language === "ar" ? "رمز الوحدة" : language === "fr" ? "Code du module" : "Module code"}: {t(feature)}</p></CardContent></Card>;
}
