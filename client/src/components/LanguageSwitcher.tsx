import { Globe2, Check, ChevronDown } from "lucide-react";
import { languageMeta, useLanguage, type Language } from "@/contexts/LanguageContext";

export default function LanguageSwitcher({ compact = false, allowedLanguages }: { compact?: boolean; allowedLanguages?: Language[] }) {
  const { language, setLanguage, t } = useLanguage();
  const languages = allowedLanguages?.length ? allowedLanguages : (Object.keys(languageMeta) as Language[]);
  const closeMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setLanguage(event.currentTarget.dataset.language as Language);
    event.currentTarget.closest("details")?.removeAttribute("open");
  };

  return (
    <details className="nfood-language-switcher relative z-50">
      <summary className={`flex cursor-pointer list-none items-center gap-2 rounded-xl border border-slate-200/80 bg-white/95 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur transition hover:border-orange-200 hover:shadow-md [&::-webkit-details-marker]:hidden ${compact ? "min-h-9" : "min-h-10"}`} aria-label={t("chooseLanguage")}>
        <Globe2 className="h-4 w-4 shrink-0 text-[#e76f3c]" aria-hidden="true" />
        <span className="hidden text-slate-600 sm:inline">{t("language")}</span>
        <span className="whitespace-nowrap">{languageMeta[language].nativeLabel}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
      </summary>
      <div className="nfood-language-menu absolute end-0 top-[calc(100%+0.5rem)] min-w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-slate-800 shadow-xl ring-1 ring-black/5" role="menu" aria-label={t("chooseLanguage")}>
        {languages.map((item) => (
          <button key={item} type="button" data-language={item} onClick={closeMenu} className="flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-start text-sm font-semibold transition hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400" role="menuitem">
            <span className="whitespace-nowrap">{languageMeta[item].nativeLabel}</span>
            <span className="text-xs text-slate-400">{languageMeta[item].label}</span>
            {language === item && <Check className="h-4 w-4 shrink-0 text-orange-600" aria-label={t("active")} />}
          </button>
        ))}
      </div>
    </details>
  );
}
