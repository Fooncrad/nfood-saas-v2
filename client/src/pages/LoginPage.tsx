import { Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const loginCopy = {
  ar: {
    checking: "جارٍ التحقق من الحساب...",
    toastSignedIn: "تم تسجيل الدخول بنجاح",
    toastInvalid: "بيانات الدخول غير صحيحة",
    eyebrow: "مساحتك التشغيلية تبدأ من هنا",
    heroTitle: "أدر نشاطك",
    heroTitleAccent: "بثقة أكبر.",
    heroDesc: "وصول آمن إلى متجرك أو مطعمك أو نشاطك، مع الإدارة والطلبات والعملاء والفروع والتقارير في مساحة واحدة.",
    feat1: "مساحة عمل موحدة لكل أنواع الأنشطة والفرق",
    feat2: "بياناتك محمية بصلاحيات واضحة",
    feat3: "متابعة مباشرة من أي جهاز",
    badge: "محمي بواسطة NFOOD 2026",
    backHome: "العودة إلى الصفحة الرئيسية",
    welcomeBack: "مرحبًا بعودتك",
    signIn: "تسجيل الدخول",
    signInDesc: "سجل الدخول للوصول إلى مساحة عملك المتكاملة.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    passwordPlaceholder: "اكتب كلمة المرور",
    showPassword: "إظهار كلمة المرور",
    remember: "تذكرني",
    forgot: "نسيت كلمة المرور؟",
    forgotToast: "أدخل بريدك وسنرسل لك رابط الاستعادة.", resetSent: "إذا كان البريد مسجلًا فسيصلك رابط الاستعادة.", resetTitle: "استعادة كلمة المرور", resetPassword: "كلمة المرور الجديدة", resetConfirm: "تأكيد كلمة المرور", resetAction: "تحديث كلمة المرور", resetDone: "تم تحديث كلمة المرور. يمكنك تسجيل الدخول الآن.",
    signingIn: "جارٍ تسجيل الدخول...",
    or: "أو",
    oauth: "المتابعة باستخدام Google",
    createAccount: "إنشاء حساب جديد",
    legal: "من خلال تسجيلك أنت توافق على شروط استخدام NFOOD وسياسة الخصوصية.",
  },
  en: {
    checking: "Checking your account...",
    toastSignedIn: "Signed in successfully",
    toastInvalid: "Invalid sign-in credentials",
    eyebrow: "Your operations workspace starts here",
    heroTitle: "Run your business",
    heroTitleAccent: "with more confidence.",
    heroDesc: "Secure access to your store, restaurant, or business with operations, orders, customers, branches, and reports in one workspace.",
    feat1: "One workspace for every business type and team",
    feat2: "Your data protected by clear permissions",
    feat3: "Live follow-up from any device",
    badge: "Protected by NFOOD 2026",
    backHome: "Back to home",
    welcomeBack: "Welcome back",
    signIn: "Sign in",
    signInDesc: "Sign in to access your complete business workspace.",
    email: "Email",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    showPassword: "Show password",
    remember: "Remember me",
    forgot: "Forgot password?",
    forgotToast: "Enter your email and we will send a recovery link.", resetSent: "If the email is registered, a recovery link will be sent.", resetTitle: "Reset password", resetPassword: "New password", resetConfirm: "Confirm password", resetAction: "Update password", resetDone: "Password updated. You can sign in now.",
    signingIn: "Signing in...",
    or: "or",
    oauth: "Sign in with Google",
    createAccount: "Create a new account",
    legal: "By signing in you agree to NFOOD's Terms of Use and Privacy Policy.",
  },
  fr: {
    checking: "Vérification de votre compte...",
    toastSignedIn: "Connexion réussie",
    toastInvalid: "Identifiants de connexion invalides",
    eyebrow: "Votre espace de travail commence ici",
    heroTitle: "Gérez votre activité",
    heroTitleAccent: "avec plus de confiance.",
    heroDesc: "Accès sécurisé à votre boutique, restaurant ou activité avec opérations, commandes, clients, sites et rapports dans un seul espace.",
    feat1: "Un espace unifié pour tous les types d’activité et équipes",
    feat2: "Vos données protégées par des permissions claires",
    feat3: "Suivi en direct depuis n'importe quel appareil",
    badge: "Protégé par NFOOD 2026",
    backHome: "Retour à l'accueil",
    welcomeBack: "Bon retour",
    signIn: "Se connecter",
    signInDesc: "Connectez-vous pour accéder à votre espace de travail complet.",
    email: "E-mail",
    password: "Mot de passe",
    passwordPlaceholder: "Saisissez votre mot de passe",
    showPassword: "Afficher le mot de passe",
    remember: "Se souvenir de moi",
    forgot: "Mot de passe oublié ?",
    forgotToast: "Saisissez votre e-mail et nous enverrons un lien de récupération.", resetSent: "Si l’e-mail est enregistré, un lien de récupération sera envoyé.", resetTitle: "Réinitialiser le mot de passe", resetPassword: "Nouveau mot de passe", resetConfirm: "Confirmer le mot de passe", resetAction: "Mettre à jour", resetDone: "Mot de passe mis à jour. Vous pouvez vous connecter.",
    signingIn: "Connexion en cours...",
    or: "ou",
    oauth: "Se connecter avec Google",
    createAccount: "Créer un compte",
    legal: "En vous connectant, vous acceptez les Conditions d'utilisation et la Politique de confidentialité de NFOOD.",
  },
} as const;

export default function LoginPage() {
  const { language, direction } = useLanguage();
  const copy = language === "fr" ? loginCopy.fr : language === "en" ? loginCopy.en : loginCopy.ar;
  const { user, loading, refresh } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(() => new URLSearchParams(window.location.search).has("reset"));
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const requestReset = trpc.auth.requestPasswordReset.useMutation({ onSuccess: () => toast.success(copy.resetSent), onError: (error) => toast.error(error.message) });
  const completeReset = trpc.auth.resetPassword.useMutation({ onSuccess: () => { toast.success(copy.resetDone); setResetMode(false); window.history.replaceState({}, "", "/login"); }, onError: (error) => toast.error(error.message) });
  const login = trpc.auth.testLogin.useMutation({ onSuccess: async (result) => {
    toast.success(copy.toastSignedIn);
    // The login mutation sets the session cookie on the response, but auth.me may
    // still contain the pre-login anonymous cache. Refresh it before leaving the
    // login route, then use a document navigation so every route guard starts from
    // the newly authenticated server session.
    await refresh();
    const next = new URLSearchParams(window.location.search).get("next");
    const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : result.next ?? (result.role === "admin" ? "/admin" : "/dashboard");
    window.location.assign(safeNext);
  }, onError: (error) => { if (error.message === "VERIFY_EMAIL_REQUIRED") { toast.error(language === "ar" ? "تحقق من بريدك الإلكتروني أولًا ثم ارجع لتسجيل الدخول." : language === "fr" ? "Vérifiez d’abord votre e-mail, puis reconnectez-vous." : "Verify your email first, then return to sign in."); return; } toast.error(error.message || copy.toastInvalid); } });
  const features = [copy.feat1, copy.feat2, copy.feat3];
  useEffect(() => {
    if (loading || !user) return;
    const next = new URLSearchParams(window.location.search).get("next");
    if (next?.startsWith("/") && !next.startsWith("//")) { setLocation(next); return; }
    if (user.role === "admin" || user.accountRole === "admin") { setLocation("/admin"); return; }
    if (user.accountRole === "restaurant_admin") { setLocation("/restaurant/dashboard"); return; }
    setLocation("/customer-portal");
  }, [loading, user, setLocation]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#071525] text-white">{copy.checking}</div>;
  if (user) return <div className="flex min-h-screen items-center justify-center bg-[#071525] text-white">{copy.checking}</div>;

  return (
    <div dir={direction} className="min-h-[100svh] overflow-x-hidden bg-[#071525] text-white">
      <div className="grid min-h-[100svh] lg:min-h-screen lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between bg-[#0b1d35] p-12 xl:p-16">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-500/15 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-teal-500/10 blur-3xl" />
          <div className="relative">
            <button onClick={() => setLocation("/")} className="flex items-center gap-3 text-right">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-xl font-black shadow-lg shadow-orange-950/30">N</span>
              <span><strong className="block text-lg tracking-[.15em]">NFOOD</strong><small className="block text-[9px] font-bold tracking-[.2em] text-slate-400">RESTAURANT OPERATING SYSTEM</small></span>
            </button>
            <div className="mt-28 max-w-lg">
              <p className="text-sm font-bold text-orange-300">{copy.eyebrow}</p>
              <h1 className="mt-4 text-5xl font-black leading-[1.25]">{copy.heroTitle}<br /><span className="text-orange-400">{copy.heroTitleAccent}</span></h1>
              <p className="mt-6 text-base leading-8 text-slate-300">{copy.heroDesc}</p>
              <div className="mt-10 space-y-4 text-sm text-slate-300">
                {features.map((item) => (
                  <p key={item} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-400/15 text-teal-300"><Check className="h-4 w-4" /></span>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="relative flex items-center gap-3 text-xs text-slate-500"><ShieldCheck className="h-4 w-4 text-teal-400" /> {copy.badge}</div>
        </section>
        <section className="flex min-h-[100svh] items-start justify-center overflow-x-hidden bg-[#f8fafc] px-4 py-5 text-slate-900 sm:items-center sm:px-8 sm:py-8 lg:min-h-screen lg:overflow-y-auto lg:py-10">
          <div className="w-full max-w-md [overflow-anchor:none]">
            <div className="mb-8 flex items-center justify-between">
              <button type="button" onClick={() => setLocation("/")} className="text-xs font-bold text-slate-500 hover:text-orange-600">{copy.backHome}</button>
              <div className="ms-auto"><LanguageSwitcher compact /></div>
            </div>
            <div className="mb-5 lg:hidden">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-xl font-black text-white">N</span>
                <strong className="text-lg tracking-[.15em]">NFOOD</strong>
              </div>
            </div>
            <div className="mb-8">
              <p className="text-sm font-bold text-orange-500">{copy.welcomeBack}</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{copy.signIn}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">{copy.signInDesc}</p>
            </div>
            {resetMode ? <form onSubmit={(event) => { event.preventDefault(); const token = new URLSearchParams(window.location.search).get("reset"); if (!token) return; if (resetPassword !== resetConfirm) { toast.error(language === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords do not match"); return; } completeReset.mutate({ token, password: resetPassword }); }} className="space-y-5">
              <h3 className="text-lg font-black">{copy.resetTitle}</h3>
              <input type="password" minLength={8} required value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} placeholder={copy.resetPassword} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" dir="ltr" />
              <input type="password" minLength={8} required value={resetConfirm} onChange={(event) => setResetConfirm(event.target.value)} placeholder={copy.resetConfirm} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" dir="ltr" />
              <button type="submit" disabled={completeReset.isPending} className="flex h-12 w-full items-center justify-center rounded-xl bg-orange-500 text-sm font-black text-white disabled:opacity-60">{copy.resetAction}</button>
            </form> : <form onSubmit={(event) => { event.preventDefault(); if (email && password) login.mutate({ email, password }); }} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-slate-700">{copy.email}</span>
                <div className="relative">
                  <Mail className="absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-10 pl-4 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" placeholder="name@restaurant.com" dir="ltr" />
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-slate-700">{copy.password}</span>
                <div className="relative">
                  <LockKeyhole className="absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-10 pl-11 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" placeholder={copy.passwordPlaceholder} dir="ltr" />
                  <button type="button" aria-label={copy.showPassword} onClick={() => setShowPassword((show) => !show)} className="absolute left-3 top-3.5 text-slate-400 hover:text-orange-500">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
              </label>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-500"><input type="checkbox" className="accent-orange-500" /> {copy.remember}</label>
                <button type="button" onClick={() => { if (!email) { toast.info(copy.forgotToast); return; } requestReset.mutate({ email }); }} className="font-bold text-orange-600">{copy.forgot}</button>
              </div>
              <button type="submit" disabled={login.isPending} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60">{login.isPending ? copy.signingIn : copy.signIn}</button>
            </form>}
            <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-slate-200" /><span className="text-[11px] text-slate-400">{copy.or}</span><span className="h-px flex-1 bg-slate-200" /></div>
            <button onClick={() => { const params = new URLSearchParams(window.location.search); const next = params.get("next"); const returnTo = next?.startsWith("/") && !next.startsWith("//") ? next : `${window.location.pathname}${window.location.search}${window.location.hash}`; window.location.href = `/api/oauth/google/start?returnTo=${encodeURIComponent(returnTo)}`; }} className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-bold transition hover:border-blue-300 hover:shadow-md"><span className="grid h-6 w-6 place-items-center rounded-full border border-slate-200 font-black text-blue-600">G</span>{copy.oauth}</button>
            <button type="button" onClick={() => setLocation("/register")} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 text-sm font-black text-orange-700 transition hover:bg-orange-100">{copy.createAccount}</button>
            <p className="mt-6 text-center text-[11px] leading-6 text-slate-400">{copy.legal}</p>
          </div>
        </section>
      </div>
    </div>
  );
}