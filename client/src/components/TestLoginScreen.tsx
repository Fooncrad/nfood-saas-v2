import { ArrowLeft, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

type TestLoginScreenProps = {
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onSubmit: () => void;
  pending: boolean;
  onOAuth: () => void;
  onRegister: () => void;
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
}: TestLoginScreenProps) {
  const { t, direction } = useLanguage();
  const quickRoles = [
    { label: "Super Admin", value: "admin" },
    { label: t("restaurant"), value: "restaurant" },
    { label: t("waiter"), value: "waiter" },
    { label: t("kitchen"), value: "kitchen" },
    { label: t("cashier"), value: "cashier" },
    { label: t("customer"), value: "customer" },
    { label: t("driver"), value: "driver" },
  ];

  return (
    <div dir={direction} className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[0.85fr_1.15fr]">
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
        <main className="flex items-center justify-center p-5 sm:p-8">
          <div className="fixed right-5 top-5 z-20"><LanguageSwitcher compact /></div>
          <Card className="w-full max-w-xl rounded-[2rem] border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
            <CardContent className="p-6 sm:p-10">
              <div className="mb-8 flex items-center justify-between"><div><p className="text-xs font-bold text-[#e76f3c]">{t("welcomeBack")}</p><h1 className="mt-2 text-3xl font-black tracking-tight">{t("signIn")} NFOOD</h1><p className="mt-2 text-sm leading-6 text-slate-500">{t("loginDescription")}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#e76f3c]"><Utensils className="h-6 w-6" /></div></div>
              <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4"><p className="mb-3 text-xs font-bold text-slate-500">{t("signIn")} · {t("allRoles")}</p><div className="flex flex-wrap gap-2">{quickRoles.map((role) => <button key={role.value} type="button" onClick={() => setEmail(role.value)} className={email === role.value ? "rounded-full border border-[#e76f3c] bg-orange-100 px-3 py-2 text-[11px] font-bold text-[#c75325]" : "rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 hover:border-orange-200"}>{role.label}</button>)}</div></div>
              <div className="space-y-5"><label className="block text-xs font-bold">{t("email")}<div className="relative mt-2"><Input data-testid="login-email" type="text" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin أو name@example.com" className="h-13 rounded-2xl border-slate-200 bg-slate-50/70 px-4" /></div></label><label className="block text-xs font-bold">{t("password")}<Input data-testid="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && onSubmit()} placeholder={t("passwordPlaceholder")} className="mt-2 h-13 rounded-2xl border-slate-200 bg-slate-50/70 px-4" /></label><Button data-testid="login-submit" type="button" onClick={onSubmit} disabled={pending || !email || !password} className="h-13 w-full rounded-2xl bg-[#e76f3c] text-base font-bold shadow-lg shadow-orange-200 hover:bg-[#d85f2e]">{pending ? t("signingIn") : t("secureSignIn")}</Button><div className="relative py-1 text-center"><span className="relative z-10 bg-white px-3 text-[11px] text-slate-400">{t("or")}</span><div className="absolute inset-x-0 top-1/2 h-px bg-slate-100" /></div><Button type="button" variant="outline" onClick={onOAuth} className="h-12 w-full rounded-2xl border-slate-200">{t("continueWithGoogle")}</Button><div className="grid grid-cols-2 gap-2"><Button type="button" disabled className="h-11 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-500">OTP · Demo</Button><Button type="button" disabled className="h-11 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-500">Passkey · Demo</Button></div><p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-[11px] leading-5 text-amber-800">{t("demoIntegrations")} {t("demoIntegrationsNote")}</p><Button type="button" variant="ghost" onClick={onRegister} className="h-11 w-full rounded-2xl text-[#e76f3c]">{t("joinRestaurant")} <ArrowLeft className="mr-1 h-4 w-4" /></Button></div>
              <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">{t("loginFooter")}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
