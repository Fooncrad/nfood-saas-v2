import { Link } from "wouter";
import { ArrowLeft, Languages } from "lucide-react";
import { UiTranslationAdminPanel } from "@/components/UiTranslationAdminPanel";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TranslationEditorPage() {
  const { language, direction } = useLanguage();
  const isArabic = language === "ar";
  return <main dir={direction} className="min-h-screen bg-[#f7f8fb] px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-10"><div className="mx-auto max-w-7xl"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#e76f3c]"><Languages className="h-4 w-4" />{isArabic ? "مساحة عمل الترجمة" : language === "fr" ? "Espace de traduction" : "Translation workspace"}</p><h1 className="mt-2 text-2xl font-black">{isArabic ? "محرر ترجمة مستقل" : language === "fr" ? "Éditeur de traduction indépendant" : "Independent translation editor"}</h1><p className="mt-1 text-sm text-slate-500">{isArabic ? "صلاحية محدودة لقاموس الترجمة دون صلاحيات الإدارة العامة." : language === "fr" ? "Accès limité au dictionnaire, sans droits d’administration générale." : "Limited dictionary access without full platform administration."}</p></div><Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold shadow-sm dark:border-slate-800 dark:bg-slate-900"><ArrowLeft className="h-4 w-4" />{isArabic ? "العودة" : language === "fr" ? "Retour" : "Back"}</Link></div><UiTranslationAdminPanel /></div></main>;
}
