import { ArrowLeft, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { toast } from "sonner";

type TestLoginScreenProps = {
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onSubmit: () => void;
  pending: boolean;
  onOAuth: () => void;
  onRegister: () => void;
  onForgotPassword: () => void;
  forgotPending: boolean;
  forgotMessage?: string | null;
  loginError?: string | null;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
};

export function TestLoginScreen({
  email,
  password,
  setEmail,
  setPassword,
  onSubmit,
  pending,
  onOAuth,
  onRegister,
  onForgotPassword,
  forgotPending,
  forgotMessage,
  loginError,
  rememberMe,
  setRememberMe,
}: TestLoginScreenProps) {
  const { t, direction, language } = useLanguage();
  const [forgotOpen, setForgotOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const demoAccounts = [
    { role: "admin", email: "fooncards@gmail.com", label: language === "en" ? "Admin" : "الإدارة", icon: "✦" },
    { role: "restaurant", email: "nfood@ret.com", label: language === "en" ? "Restaurant" : "المطعم", icon: "◈" },
    { role: "customer", email: "nfood.client@ret.com", label: language === "en" ? "Customer" : "العميل", icon: "♡" },
    { role: "driver", email: "nfood.driver@ret.com", label: language === "en" ? "Driver" : "السائق", icon: "↗" },
    { role: "kitchen", email: "nfood.kitchen@ret.com", label: language === "en" ? "Kitchen" : "المطبخ", icon: "♨" },
    { role: "cashier", email: "nfood.cashier@ret.com", label: language === "en" ? "Cashier" : "الكاشير", icon: "▣" },
  ];

  const submit = () => {
    if (!email.trim() || !password) {
      toast.error(language === "en" ? "Enter your email and password first." : "أدخل البريد الإلكتروني وكلمة المرور أولًا.");
      return;
    }
    onSubmit();
  };

  return (
    <div dir={direction} className="nfood-auth-shell min-h-screen bg-[#f5f1ea] text-[#24302b]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1500px] lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="relative hidden overflow-hidden bg-[#24302b] px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
          <div className="nfood-auth-orb absolute -left-24 top-16 h-80 w-80 rounded-full bg-[#d77a55]/20 blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c96b4a] shadow-lg shadow-black/20"><Utensils className="h-6 w-6" /></div>
              <div><p className="text-xl font-black tracking-tight">NFOOD</p><p className="text-[10px] font-semibold tracking-[0.18em] text-[#b8c5ba]">RESTAURANT OS</p></div>
            </div>
            <div className="mt-28 max-w-md">
              <p className="text-sm font-bold text-[#e6b08c]">{language === "en" ? "One calm workspace" : "مساحة تشغيل واحدة"}</p>
              <h1 className="mt-4 text-5xl font-black leading-[1.12] tracking-tight">{language === "en" ? "Run every shift with clarity." : "أدر كل وردية بوضوح."}</h1>
              <p className="mt-6 max-w-sm text-sm leading-7 text-[#c3cec5]">{language === "en" ? "Orders, teams, menus and branches in one focused restaurant workspace." : "الطلبات والفريق والمنيو والفروع في مساحة تشغيل واحدة مرتبة."}</p>
            </div>
          </div>
          <div className="relative z-10 grid grid-cols-3 gap-3">
            {[{ value: "24/7", label: language === "en" ? "Visibility" : "وضوح" }, { value: "01", label: language === "en" ? "Workspace" : "مساحة" }, { value: "∞", label: language === "en" ? "Possibility" : "إمكانيات" }].map((item) => <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-xl font-black text-[#f0c39e]">{item.value}</p><p className="mt-1 text-[11px] text-[#b8c5ba]">{item.label}</p></div>)}
          </div>
        </aside>

        <main className="relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-8 lg:px-14 xl:px-24">
          <div className="absolute right-5 top-5 z-20"><LanguageSwitcher compact /></div>
          <div className="w-full max-w-[560px]">
            <div className="mb-7 flex items-center gap-3 lg:hidden"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c96b4a] text-white"><Utensils className="h-5 w-5" /></div><div><p className="font-black tracking-tight">NFOOD</p><p className="text-[10px] font-semibold tracking-[0.16em] text-[#78827b]">RESTAURANT OS</p></div></div>
            <div className="nfood-auth-card rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(50,45,35,0.12)] backdrop-blur-xl sm:p-8">
              <div className="mb-7 flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#b85c3b]">{language === "en" ? "Welcome back" : "مرحبًا بعودتك"}</p><h2 className="mt-3 text-3xl font-black tracking-tight text-[#24302b]">{language === "en" ? "Sign in to NFOOD" : "تسجيل الدخول إلى NFOOD"}</h2><p className="mt-2 text-sm leading-6 text-[#78827b]">{language === "en" ? "Choose your workspace and continue your shift." : "اختر مساحة العمل وابدأ ورديتك."}</p></div><div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#f4e5db] text-[#b85c3b] sm:flex"><LockKeyhole className="h-5 w-5" /></div></div>
              <div className="mb-6 rounded-2xl border border-[#e8e1d7] bg-[#faf8f4] p-3"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-black text-[#526058]">{language === "en" ? "Quick access" : "دخول سريع"}</p><span className="rounded-full bg-[#e9f0e8] px-2 py-1 text-[10px] font-bold text-[#58705c]">{language === "en" ? "Demo" : "تجريبي"}</span></div><div className="grid grid-cols-3 gap-2">{demoAccounts.map((account) => { const active = email === account.email; return <button key={account.role} type="button" onClick={() => { setEmail(account.email); setPassword("123456"); }} className={`flex min-h-[70px] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-center transition ${active ? "border-[#c96b4a] bg-[#f4e5db] text-[#8e472f] shadow-sm" : "border-transparent bg-white text-[#69766e] hover:border-[#e2b49c] hover:bg-[#fffaf6]"}`}><span className="text-lg font-black">{account.icon}</span><span className="text-[11px] font-bold">{account.label}</span></button>; })}</div><p className="mt-3 text-center text-[10px] text-[#8a948d]">{language === "en" ? "Demo password: 123456" : "كلمة المرور التجريبية: 123456"}</p></div>
              <div className="space-y-5"><label className="block text-xs font-black text-[#526058]">{t("email")}<Input data-testid="login-email" type="text" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="mt-2 h-12 rounded-xl border-[#dedbd2] bg-white px-4 text-sm" /></label><label className="block text-xs font-black text-[#526058]">{t("password")}<div className="relative mt-2"><Input data-testid="login-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && submit()} placeholder={t("passwordPlaceholder")} className="h-12 rounded-xl border-[#dedbd2] bg-white px-4 pl-12 text-sm" /><button type="button" aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} onClick={() => setShowPassword((current) => !current)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#87928a] hover:bg-[#f4e5db] hover:text-[#a94e34]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label><div className="flex items-center justify-between gap-3"><label className="flex items-center gap-2 text-xs font-bold text-[#69766e]"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 accent-[#b85c3b]" />{language === "en" ? "Remember me" : "تذكرني"}</label><button type="button" onClick={() => setForgotOpen((current) => !current)} className="text-xs font-black text-[#a94e34] hover:underline">{forgotOpen ? (language === "en" ? "Close recovery" : "إغلاق الاستعادة") : (language === "en" ? "Forgot password?" : "نسيت كلمة المرور؟")}</button></div>{loginError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold leading-5 text-red-700">{loginError}</p>}{forgotOpen && <div className="rounded-xl border border-[#ead1c2] bg-[#fff8f3] p-3"><p className="text-xs leading-5 text-[#795548]">{language === "en" ? "Enter your email above to request a recovery link." : "أدخل بريد الحساب بالأعلى ثم اطلب رابط الاستعادة."}</p><Button type="button" onClick={onForgotPassword} disabled={forgotPending || !email.includes("@")} className="mt-3 h-10 w-full rounded-xl bg-[#b85c3b] text-xs font-black hover:bg-[#9f4c34]">{forgotPending ? <LoaderCircle className="mx-auto h-4 w-4 animate-spin" /> : language === "en" ? "Send recovery link" : "إرسال رابط الاستعادة"}</Button>{forgotMessage && <p role="status" className="mt-2 rounded-lg bg-[#e9f0e8] px-2 py-2 text-center text-[11px] font-bold text-[#58705c]">{forgotMessage}</p>}</div>}<Button data-testid="login-submit" type="button" onClick={submit} disabled={pending} className="h-12 w-full rounded-xl bg-[#b85c3b] text-sm font-black text-white shadow-[0_12px_24px_rgba(184,92,59,0.24)] hover:bg-[#9f4c34]">{pending ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />{t("signingIn")}</> : <><LockKeyhole className="mr-2 h-4 w-4" />{t("secureSignIn")}</>}</Button><div className="relative py-1 text-center"><span className="relative z-10 bg-white px-3 text-[10px] font-bold text-[#9aa39c]">{t("or")}</span><div className="absolute inset-x-0 top-1/2 h-px bg-[#ece7de]" /></div><Button type="button" variant="outline" onClick={onOAuth} className="h-12 w-full rounded-xl border-[#dedbd2] bg-white text-sm font-black text-[#526058] hover:border-[#d6a086] hover:bg-[#fffaf6]">{t("continueWithGoogle")}</Button><Button type="button" variant="ghost" onClick={onRegister} className="h-11 w-full rounded-xl text-sm font-black text-[#b85c3b] hover:bg-[#f8eee8]">{language === "en" ? "Create restaurant account" : "إنشاء حساب مطعم"}<ArrowLeft className="mr-1 h-4 w-4" /></Button></div>
              <div className="mt-7 flex items-center justify-center gap-2 text-[10px] font-semibold text-[#9aa39c]"><Check className="h-3.5 w-3.5 text-[#6c8065]" />{language === "en" ? "Secure workspace access" : "دخول آمن لمساحة العمل"}<span>•</span><span>NFOOD</span></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
