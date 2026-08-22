import { Globe2 } from "lucide-react";
import { languageMeta, useLanguage, type Language } from "@/contexts/LanguageContext";

export default function LanguageSwitcher({ compact = false, allowedLanguages }: { compact?: boolean; allowedLanguages?: Language[] }) {
  const { language, setLanguage, t } = useLanguage();
  return (
    <label className={`inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-orange-200 hover:shadow-md ${compact ? "h-9" : "h-10"}`}>
      <Globe2 className="h-4 w-4 text-[#e76f3c]" aria-hidden="true" />
      <span className="hidden font-black text-slate-600 sm:inline">{t("language")}</span>
      <select aria-label={t("chooseLanguage")} title={t("chooseLanguage")} value={language} onChange={(event) => setLanguage(event.target.value as Language)} className="cursor-pointer appearance-none bg-transparent outline-none">
        {(allowedLanguages ?? (Object.keys(languageMeta) as Language[])).map((item) => <option key={item} value={item}>{languageMeta[item].nativeLabel}</option>)}
      </select>
    </label>
  );
}
