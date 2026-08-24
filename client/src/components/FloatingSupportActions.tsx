import { LifeBuoy, MessageCircle, Moon, Sun } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

export const SUPPORT_WHATSAPP_URL = "https://wa.me/966569867000?text=Hello%20NFOOD%20Support";
export const SUPPORT_ROUTE = "/support";

export default function FloatingSupportActions() {
  const { language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const copy = language === "fr" ? { chat: "Discuter avec l’administration", support: "Support technique" } : language === "en" ? { chat: "Chat with admin", support: "Technical support" } : { chat: "الدردشة مع الإدارة", support: "الدعم الفني" };
  return <div className="fixed bottom-5 left-5 z-[65] flex flex-col gap-2" dir="ltr">{toggleTheme && <button type="button" onClick={toggleTheme} aria-label={theme === "dark" ? (language === "fr" ? "Mode clair" : language === "en" ? "Light mode" : "الوضع النهاري") : (language === "fr" ? "Mode sombre" : language === "en" ? "Dark mode" : "الوضع الليلي")} title={theme === "dark" ? "Light mode" : "Dark mode"} className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg ring-1 ring-slate-200 transition hover:scale-105 active:scale-95 dark:bg-slate-800 dark:text-white dark:ring-slate-700">{theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>}<a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label={copy.chat} title={copy.chat} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 active:scale-95"><MessageCircle className="h-6 w-6" /></a><Link href={SUPPORT_ROUTE} aria-label={copy.support} title={copy.support} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#172235] text-white shadow-lg transition hover:scale-105 active:scale-95"><LifeBuoy className="h-5 w-5" /></Link></div>;
}
