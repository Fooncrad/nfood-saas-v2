import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const SUPPORT_WHATSAPP_URL = "https://wa.me/966569867000?text=Hello%20NFOOD%20Support";
export const SUPPORT_ROUTE = "/support";

export default function FloatingSupportActions() {
  const { language } = useLanguage();
  const labels = language === "fr" ? { instagram: "Instagram", facebook: "Facebook", twitter: "X", linkedin: "LinkedIn", youtube: "YouTube" } : language === "en" ? { instagram: "Instagram", facebook: "Facebook", twitter: "X", linkedin: "LinkedIn", youtube: "YouTube" } : { instagram: "Instagram", facebook: "فيسبوك", twitter: "X", linkedin: "LinkedIn", youtube: "يوتيوب" };
  const links = [{ label: labels.instagram, href: "https://instagram.com/nfood", icon: Instagram, tone: "hover:bg-pink-500" }, { label: labels.facebook, href: "https://facebook.com/nfood", icon: Facebook, tone: "hover:bg-blue-600" }, { label: labels.twitter, href: "https://x.com/nfood", icon: Twitter, tone: "hover:bg-slate-900" }, { label: labels.linkedin, href: "https://linkedin.com/company/nfood", icon: Linkedin, tone: "hover:bg-sky-600" }, { label: labels.youtube, href: "https://youtube.com/@nfood", icon: Youtube, tone: "hover:bg-red-600" }];
  return <div className="fixed left-4 top-1/2 z-[64] hidden -translate-y-1/2 flex-col gap-2 rounded-2xl border border-white/70 bg-white/85 p-1.5 shadow-xl backdrop-blur-xl sm:flex dark:border-slate-700 dark:bg-slate-900/85" dir="ltr">{links.map(({ label, href, icon: Icon, tone }) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} className={`group relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition duration-200 hover:translate-x-1 hover:text-white active:scale-90 motion-safe:animate-[nfood-social-float_3.2s_ease-in-out_infinite] dark:bg-slate-800 dark:text-slate-200 ${tone}`}><span className="pointer-events-none absolute inset-0 rounded-xl border border-current opacity-0 transition duration-200 group-hover:scale-125 group-hover:opacity-40" aria-hidden="true" /><Icon className="relative h-4 w-4 transition-transform duration-200 group-hover:scale-110" /></a>)}</div>;
}
