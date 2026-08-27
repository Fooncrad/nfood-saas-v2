import { Globe2, Check, ChevronDown, LoaderCircle } from "lucide-react";
import { languageMeta, UI_LANGUAGES, useLanguage, type Language } from "@/contexts/LanguageContext";

export default function LanguageSwitcher({ compact = false, allowedLanguages, minimal = false }: { compact?: boolean; allowedLanguages?: Language[]; minimal?: boolean }) {
  const { language, setLanguage, t, isLanguageChanging } = useLanguage();
  const languages = allowedLanguages?.filter((item) => UI_LANGUAGES.includes(item as (typeof UI_LANGUAGES)[number])).length ? allowedLanguages.filter((item) => UI_LANGUAGES.includes(item as (typeof UI_LANGUAGES)[number])) : [...UI_LANGUAGES];
  const closeMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setLanguage(event.currentTarget.dataset.language as Language);
    event.currentTarget.closest("details")?.removeAttribute("open");
  };

  return (
    <div className="flex items-center gap-1.5" aria-busy={isLanguageChanging}>
      <details className="nfood-language-switcher relative z-50">
      <summary className={`flex cursor-pointer list-none items-center gap-1.5 text-xs font-bold text-slate-700 transition [&::-webkit-details-marker]:hidden ${minimal ? "h-10 w-10 justify-center rounded-full border-0 bg-transparent p-0 shadow-none hover:bg-slate-100" : `rounded-xl border border-slate-200/80 bg-white/95 px-2 py-2 shadow-sm backdrop-blur hover:border-orange-200 hover:shadow-md ${compact ? "min-h-9 max-w-[7.5rem] sm:max-w-none sm:px-3" : "min-h-10 px-3"}`}`} aria-label={t("navigation.chooseLanguage")}>
        <Globe2 className={`h-4 w-4 shrink-0 ${minimal ? "text-slate-500" : "text-[#e76f3c]"}`} aria-hidden="true" />
        <span className={minimal ? "sr-only" : "hidden text-slate-600 sm:inline"}>{t("common.language")}</span>
        <span className={minimal ? "sr-only" : "whitespace-nowrap"}>{languageMeta[language].nativeLabel}</span>
        <ChevronDown className={minimal ? "hidden" : "h-3.5 w-3.5 shrink-0 text-slate-400"} aria-hidden="true" />
      </summary>
      <div className="nfood-language-menu absolute end-0 top-[calc(100%+0.5rem)] min-w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-slate-800 shadow-xl ring-1 ring-black/5" role="menu" aria-label={t("navigation.chooseLanguage")}>
        {languages.map((item) => (
          <button key={item} type="button" data-language={item} onClick={closeMenu} className="flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-start text-sm font-semibold transition hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400" role="menuitem">
            <span className="whitespace-nowrap">{languageMeta[item].nativeLabel}</span>
            <span className="text-xs text-slate-400">{languageMeta[item].label}</span>
            {language === item && <Check className="h-4 w-4 shrink-0 text-orange-600" aria-label={t("common.available")} />}
          </button>
        ))}
      </div>
      </details>
      {isLanguageChanging && <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-orange-700" role="status" aria-live="polite" aria-label={t("common.loading")}><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /></span>}
    </div>
  );
}
