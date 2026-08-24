import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
  ar: { text: "نستخدم ملفات تعريف الارتباط لتحسين الأمان وتجربة الاستخدام.", privacy: "سياسة الخصوصية", accept: "موافق" },
  en: { text: "We use cookies to improve security and your experience.", privacy: "Privacy policy", accept: "Accept" },
  fr: { text: "Nous utilisons des cookies pour améliorer la sécurité et votre expérience.", privacy: "Confidentialité", accept: "Accepter" },
} as const;

export default function CookieBanner() {
  const { language } = useLanguage();
  const lang = language === "en" ? "en" : language === "fr" ? "fr" : "ar";
  const [visible, setVisible] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("nfood:cookies-accepted") !== "1");
  if (!visible) return null;
  const c = copy[lang];
  return <div dir={lang === "ar" ? "rtl" : "ltr"} role="dialog" aria-label={c.privacy} className="fixed inset-x-3 bottom-3 z-[70] flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-[#172235] p-4 text-xs text-white shadow-2xl shadow-slate-900/30 supports-[padding:max(0px)]:pb-[max(1rem,env(safe-area-inset-bottom))]">
    <p className="min-w-0 flex-1 leading-6">{c.text} <Link href="/privacy" className="font-bold text-orange-300 underline">{c.privacy}</Link></p>
    <button type="button" onClick={() => { window.localStorage.setItem("nfood:cookies-accepted", "1"); setVisible(false); }} className="shrink-0 touch-manipulation rounded-xl bg-[#e76f3c] px-4 py-2 font-black text-white transition active:scale-95">{c.accept}</button>
  </div>;
}
