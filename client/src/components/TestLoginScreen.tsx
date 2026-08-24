import { ArrowLeft, Check, Copy, Eye, EyeOff, LoaderCircle, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const quickRoles = [
    { label: language === "fr" ? "Administration" : language === "en" ? "Admin" : "الإدارة", value: "fooncards@gmail.com" },
    { label: t("restaurant"), value: "nfood@ret.com" },
    { label: t("waiter"), value: "nfood.waiter@ret.com" },
    { label: t("kitchen"), value: "nfood.kitchen@ret.com" },
    { label: t("cashier"), value: "nfood.cashier@ret.com" },
    { label: t("customer"), value: "nfood.client@ret.com" },
    { label: t("driver"), value: "nfood.driver@ret.com" },
  ];
  const demoAccounts = [
    { role: "admin", email: "fooncards@gmail.com", label: language === "fr" ? "Administration" : language === "en" ? "Admin" : "الإدارة", description: language === "fr" ? "Plateforme, restaurants et permissions" : language === "en" ? "Platform, restaurants and permissions" : "المنصة والمطاعم والصلاحيات" },
    { role: "restaurant", email: "nfood@ret.com", label: language === "fr" ? "Restaurant" : language === "en" ? "Restaurant" : "المطعم", description: language === "fr" ? "Menu, commandes et opérations" : language === "en" ? "Menu, orders and operations" : "المنيو والطلبات والتشغيل" },
    { role: "customer", email: "nfood.client@ret.com", label: language === "fr" ? "Client" : language === "en" ? "Customer" : "العميل", description: language === "fr" ? "Portail client, commandes et fidélité" : language === "en" ? "Customer portal, orders and loyalty" : "بوابة العميل والطلبات والولاء" },
    { role: "driver", email: "nfood.driver@ret.com", label: language === "fr" ? "Livreur" : language === "en" ? "Driver" : "السائق", description: language === "fr" ? "Livraisons et statuts" : language === "en" ? "Deliveries and status updates" : "التوصيل وتحديث الحالات" },
    { role: "kitchen", email: "nfood.kitchen@ret.com", label: language === "fr" ? "Cuisine" : language === "en" ? "Kitchen" : "المطبخ", description: language === "fr" ? "Écran cuisine et tickets" : language === "en" ? "Kitchen display and tickets" : "شاشة المطبخ والتذاكر" },
  ];
  const copyField = async (account: (typeof demoAccounts)[number], field: "email" | "password") => { const value = field === "email" ? account.email : "123456"; try { await navigator.clipboard.writeText(value); setCopiedField(`${account.role}:${field}`); window.setTimeout(() => setCopiedField((current) => current === `${account.role}:${field}` ? null : current), 1800); toast.success(language === "fr" ? `${field === "email" ? "E-mail" : "Mot de passe"} copié` : language === "en" ? `${field === "email" ? "Email" : "Password"} copied` : `تم نسخ ${field === "email" ? "البريد الإلكتروني" : "كلمة المرور"}`); } catch { toast.error(language === "fr" ? "Copie indisponible" : language === "en" ? "Copy is unavailable" : "تعذر النسخ تلقائيًا"); } };

  const handleSubmitKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key !== "Enter") return; if (!email.trim() || !password) { toast.error(language === "en" ? "Enter your email and password first." : language === "fr" ? "Saisissez d’abord votre e-mail et votre mot de passe." : "أدخل البريد الإلكتروني وكلمة المرور أولًا."); return; } onSubmit(); };

  return (
    <div dir={direction} className="h-dvh overflow-hidden bg-[#f7f8fb] text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white motion-safe:animate-[nfood-auth-slide-in_360ms_cubic-bezier(0.23,1,0.32,1)]">
      <div className="mx-auto grid h-full min-h-0 max-w-6xl lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="relative hidden overflow-hidden bg-[#101d31] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e76f3c]"><Utensils className="h-6 w-6" /></div>
              <div><p className="text-lg font-black">NFOOD</p><p className="text-[10px] tracking-[0.18em] text-slate-400">RESTAURANT OPERATING SYSTEM</p></div>
            </div>
            <div className="mt-24 max-w-sm"><p className="text-sm font-bold text-orange-200">{t("workspaceTagline")}</p><h1 className="mt-4 text-4xl font-black leading-[1.25]">{t("overviewDescription")}</h1><p className="mt-5 text-sm leading-7 text-slate-300">{t("loginDescription")}</p></div>
          </div>
          <div className="relative rounded-3xl border border-white/10 bg-white/5 p-5"><p className="text-xs font-bold text-orange-200">{t("unifiedSignIn")}</p><p className="mt-2 text-sm leading-6 text-slate-300">{t("chooseAccount")}</p></div>
        </aside>
        <main className="min-h-0 overflow-hidden flex items-center justify-center p-3 sm:p-5">
          <div className="fixed right-5 top-5 z-20"><LanguageSwitcher compact /></div>
          <Card className="h-full max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition-colors duration-300 dark:border-white/10 dark:bg-slate-900/60">
            <CardContent className="h-full overflow-hidden p-3 sm:p-5 lg:[zoom:0.72]">
              <div className="mb-8 flex items-center justify-between"><div><p className="text-xs font-bold text-[#e76f3c]">{t("welcomeBack")}</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t("signIn")} NFOOD</h1><p className="mt-2 text-sm leading-6 text-slate-500">{t("loginDescription")}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#e76f3c]"><Utensils className="h-6 w-6" /></div></div>
              <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3"><p className="mb-3 text-xs font-bold text-slate-500">{t("signIn")} · {t("allRoles")}</p><div className="flex flex-wrap gap-2">{quickRoles.map((role) => <button key={role.value} type="button" onClick={() => { setEmail(role.value); setPassword("123456"); }} className={email === role.value ? "rounded-full border border-[#e76f3c] bg-orange-100 px-3 py-2 text-[11px] font-bold text-[#c75325]" : "rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 hover:border-orange-200"}>{role.label}</button>)}</div></div>
              <div className="mb-3 rounded-2xl border border-orange-200 bg-gradient-to-l from-orange-50 to-white p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black text-slate-900">{t("demoRestaurant")}</p><p className="mt-1 text-xs leading-5 text-slate-500">{t("demoRestaurantDescription")}</p></div><span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-black text-orange-800">DEMO</span></div><Button type="button" variant="outline" onClick={() => { setEmail("restaurant-60001@nfood.local"); setPassword("123456"); }} className="mt-3 h-10 w-full rounded-xl border-orange-300 text-xs font-black text-orange-800 hover:bg-orange-100">{t("useDemoRestaurant")}</Button></div>
              <div className="mb-3 hidden rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-slate-50 p-3 shadow-sm lg:hidden"><div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-sm font-black text-slate-900">{language === "fr" ? "Comptes de démonstration" : language === "en" ? "Demo accounts" : "الحسابات التجريبية"}</p><p className="mt-1 text-[10px] leading-4 text-slate-500">{language === "fr" ? "Sélectionnez un rôle pour remplir le formulaire." : language === "en" ? "Select a role to fill the form." : "اختر دورًا لتعبئة النموذج تلقائيًا."}</p></div><span className="rounded-full bg-[#172235] px-2.5 py-1 text-[10px] font-black text-white">123456</span></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{demoAccounts.map((account) => <div key={account.role} className={`rounded-xl border p-2 transition ${email === account.email ? "border-[#e76f3c] bg-orange-50 shadow-sm" : "border-slate-200 bg-white hover:border-orange-200"}`}><button type="button" onClick={() => { setEmail(account.email); setPassword("123456"); }} className="block w-full text-right"><span className="block text-xs font-black text-slate-900">{account.label}</span><span className="mt-1 block truncate text-[10px] text-slate-500">{account.email}</span><span className="mt-1 block text-[10px] leading-4 text-slate-400">{account.description}</span></button><div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={() => copyField(account, "email")} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-[#c75325] hover:bg-orange-50">{copiedField === `${account.role}:email` ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}{copiedField === `${account.role}:email` ? (language === "en" ? "Copied" : language === "fr" ? "Copié" : "تم النسخ") : (language === "en" ? "Copy email" : language === "fr" ? "Copier l’e-mail" : "نسخ البريد")}</button><button type="button" onClick={() => copyField(account, "password")} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-[#c75325] hover:bg-orange-50">{copiedField === `${account.role}:password` ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}{copiedField === `${account.role}:password` ? (language === "en" ? "Copied" : language === "fr" ? "Copié" : "تم النسخ") : (language === "en" ? "Copy password" : language === "fr" ? "Copier le mot de passe" : "نسخ كلمة المرور")}</button></div></div>)}</div><p className="mt-3 text-center text-[10px] leading-4 text-slate-500">{language === "fr" ? "Comptes de test uniquement, mot de passe: 123456." : language === "en" ? "Demo accounts only. Password: 123456." : "حسابات للتجربة فقط. كلمة المرور: 123456."}</p></div>
              <div className="space-y-5"><label className="block text-xs font-bold">{t("email")}<div className="relative mt-2"><Input data-testid="login-email" type="text" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={language === "en" ? "admin or name@example.com" : language === "fr" ? "admin ou nom@exemple.com" : "admin أو name@example.com"} className="h-13 rounded-2xl border-slate-200 bg-slate-50/70 px-4" /></div>{email.length > 0 && !email.includes("@") && <p role="alert" className="mt-1.5 text-xs font-semibold text-red-600">{language === "en" ? "Enter a valid email address." : language === "fr" ? "Saisissez une adresse e-mail valide." : "أدخل بريدًا إلكترونيًا صحيحًا."}</p>}</label><label className="block text-xs font-bold">{t("password")}<div className="relative mt-2"><Input data-testid="login-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={handleSubmitKeyDown} placeholder={t("passwordPlaceholder")} className="h-13 rounded-2xl border-slate-200 bg-slate-50/70 px-4 pl-12" /><button type="button" aria-label={showPassword ? (language === "en" ? "Hide password" : language === "fr" ? "Masquer le mot de passe" : "إخفاء كلمة المرور") : (language === "en" ? "Show password" : language === "fr" ? "Afficher le mot de passe" : "إظهار كلمة المرور")} title={showPassword ? (language === "en" ? "Hide password" : language === "fr" ? "Masquer le mot de passe" : "إخفاء كلمة المرور") : (language === "en" ? "Show password" : language === "fr" ? "Afficher le mot de passe" : "إظهار كلمة المرور")} onClick={() => setShowPassword((current) => !current)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-orange-50 hover:text-[#c75325] active:scale-95">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label><label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 accent-[#e76f3c]" />{language === "en" ? "Remember me" : language === "fr" ? "Se souvenir de moi" : "تذكرني"}</label>{!password && email.length > 0 && <p role="alert" className="-mt-3 text-xs font-semibold text-red-600">{language === "en" ? "Password is required." : language === "fr" ? "Le mot de passe est requis." : "كلمة المرور مطلوبة."}</p>}{loginError && <p role="alert" className="-mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold leading-5 text-red-700">{loginError}</p>}<Button data-testid="login-submit" type="button" onClick={() => { if (!email.trim() || !password) { toast.error(language === "en" ? "Enter your email and password first." : language === "fr" ? "Saisissez d’abord votre e-mail et votre mot de passe." : "أدخل البريد الإلكتروني وكلمة المرور أولًا."); return; } onSubmit(); }} disabled={pending} className="h-13 w-full rounded-2xl bg-[#e76f3c] text-base font-bold shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#d85f2e] active:scale-[0.98]">{pending ? <><LoaderCircle className="mr-2 h-5 w-5 animate-spin" />{t("signingIn")}</> : t("secureSignIn")}</Button><button type="button" onClick={() => setForgotOpen((current) => !current)} className="w-full text-center text-xs font-bold text-[#c75325] hover:underline">{forgotOpen ? (language === "en" ? "Hide password recovery" : language === "fr" ? "Masquer la récupération" : "إخفاء استعادة كلمة المرور") : (language === "en" ? "Forgot password?" : language === "fr" ? "Mot de passe oublié ?" : "نسيت كلمة المرور؟")}</button>{forgotOpen && <div className="motion-safe:animate-[nfood-auth-slide-in_240ms_cubic-bezier(0.23,1,0.32,1)] rounded-2xl border border-orange-200 bg-orange-50/70 p-4"><p className="text-xs leading-5 text-orange-900">{language === "en" ? "Enter the account email above and request a recovery link. We will not reveal whether the email is registered." : language === "fr" ? "Saisissez l’e-mail du compte et demandez un lien de récupération. Nous ne révélerons pas si l’adresse est enregistrée." : "أدخل بريد الحساب في الحقل أعلاه ثم اضغط إرسال رابط الاستعادة. لن نكشف ما إذا كان البريد مسجلًا."}</p><Button type="button" onClick={onForgotPassword} disabled={forgotPending || !email.includes("@")} className="mt-3 h-10 w-full rounded-xl bg-[#c75325] text-xs font-bold hover:bg-[#a84420]">{forgotPending ? (language === "en" ? "Sending link..." : language === "fr" ? "Envoi du lien..." : "جارٍ إرسال الرابط...") : (language === "en" ? "Send recovery link" : language === "fr" ? "Envoyer le lien" : "إرسال رابط الاستعادة")}</Button>{forgotMessage && <p role="status" className="motion-safe:animate-[nfood-auth-slide-in_260ms_cubic-bezier(0.23,1,0.32,1)] mt-3 rounded-xl bg-emerald-100 px-3 py-2 text-center text-xs font-bold text-emerald-800">{forgotMessage}</p>}</div>}<div className="relative py-1 text-center"><span className="relative z-10 bg-white px-3 text-[11px] text-slate-400">{t("or")}</span><div className="absolute inset-x-0 top-1/2 h-px bg-slate-100" /></div><Button type="button" variant="outline" onClick={onOAuth} className="h-12 w-full rounded-2xl border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:shadow-md active:scale-[0.98]">{t("continueWithGoogle")}</Button><div className="grid grid-cols-2 gap-2 lg:hidden"><Button type="button" disabled className="h-11 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-500">OTP · Demo</Button><Button type="button" disabled className="h-11 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-500">Passkey · Demo</Button></div><p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-[11px] leading-5 text-amber-800 lg:hidden">{t("demoIntegrations")} {t("demoIntegrationsNote")}</p><Button type="button" variant="ghost" onClick={onRegister} className="h-11 w-full rounded-2xl text-[#e76f3c]">{t("joinRestaurant")} <ArrowLeft className="mr-1 h-4 w-4" /></Button></div>
              <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">{t("loginFooter")}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
