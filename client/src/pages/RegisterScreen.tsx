import { ArrowLeft, ArrowRight, Check, Lock, Mail, MapPin, Phone, ShieldCheck, Store, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { COUNTRIES, CURRENCIES, getCurrency } from "@shared/currencies";
import { UI_LANGUAGES, languageMeta, useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import "./auth-scroll.css";

const languageOptions = UI_LANGUAGES.map((code) => ({ code, label: languageMeta[code].nativeLabel }));

const registerCopy = {
  ar: {
    gateway: "بوابة المنشآت التجارية",
    heroStart: "ابدأ عملك",
    heroBetter: "بشكل أذكى.",
    heroDesc: "أنشئ مساحة عمل مهيأة لنشاطك، واختر اللغة والعملة والمعلومات الأساسية قبل إطلاق عملياتك.",
    backToLogin: "العودة للدخول",
    signInNow: "تسجيل الدخول الآن",
    backHome: "العودة للرئيسية",
    accountCreated: "تم إنشاء حساب منشأتك",
    accountCreatedDesc: "سجّل الدخول الآن بكلمة المرور المؤقتة التالية وسيُطلب منك تأكيد البريد الإلكتروني عند أول دخول.",
    verifyBefore: "رابط تأكيد البريد سُجّل لهذا الحساب (البريد:",
    verifyAfter: ") — أكمله لتأمين الحساب بالكامل.",
    quickSetup: "إعداد سريع حسب قطاعك",
    worldCurrency: "كل دول العالم · عملة تُستنتج تلقائيًا",
    languageSaved: "لغة الحساب تُحفظ من أول مرة",
    stepsCount: "3 خطوات",
    setUpWorkspace: "تأسيس مساحة جديدة",
    createAccountTitle: "أنشئ حساب منشأتك",
    stepDescriptions: [
      "ابدأ بتهيئة لغة التشغيل وقطاع نشاطك.",
      "حدد الدولة والعملة ومعلومات التواصل — تُستنتج العملة تلقائيًا من الدولة ويمكن تغييرها.",
      "راجع ملخص منشأتك وأكمل اختبار التحقق الأمني لإنشاء الحساب.",
    ],
    accountLanguage: "لغة الحساب",
    accountLanguageDesc: "تُحفظ كلغة الحساب الافتراضية وتبدأ بها المنشأة، ويمكن تغييرها لاحقًا.",
    chooseSector: "اختر قطاع نشاطك",
    sectors: "قطاعات",
    continue: "متابعة",
    sectorTitle: "قطاع النشاط",
    businessName: "اسم المنشأة",
    businessPlaceholder: "مثال: مقهى ناصر",
    country: "الدولة",
    currency: "العملة",
    autoCurrency: "تُستنتج تلقائيًا من الدولة",
    city: "المدينة",
    cityPlaceholder: "مثال: الرياض",
    email: "البريد الإلكتروني",
    phone: "رقم الجوال",
    back: "السابق",
    edit: "تعديل",
    countryCurrency: "دولة · عملة",
    accountLanguageLabel: "لغة الحساب",
    signInHandle: "نداء الدخول",
    plan: "الباقة",
    freePlan: "Free · فرع تشغيلي واحد",
    securityCheck: "اختبار التحقق الأمني",
    newQuestion: "سؤال جديد",
    answerPlaceholder: "الإجابة",
    answerLabel: "إجابة اختبار التحقق",
    creating: "جارٍ إنشاء الحساب…",
    create: "إنشاء الحساب",
    toastCreated: "تم إنشاء حساب منشأتك. احفظ كلمة المرور المؤقتة وأكمل تأكيد البريد لاحقًا.",
    toastError: "تعذر إنشاء الحساب",
    toastValidation: "أكمل البيانات المطلوبة بصيغة صحيحة",
    toastCaptcha: "أكمل اختبار التحقق أولًا",
    sectorNames: { restaurant: "مطاعم ومأكولات", vegetables: "خضار وفواكه", grocery: "بقالات وتموينات", laundry: "مغاسل", automotive: "سيارات وخدماتها", beauty_salon: "صالونات وتجميل", public_works: "صيانة وأشغال عامة", fashion: "أزياء وموضة", sweets: "حلويات ومخبوزات" },
  },
  en: {
    gateway: "Commercial businesses gateway",
    heroStart: "Start your business",
    heroBetter: "smarter.",
    heroDesc: "Create a workspace shaped for your business, and pick the language, currency, and key details before you launch.",
    backToLogin: "Back to sign in",
    signInNow: "Sign in now",
    backHome: "Back to home",
    accountCreated: "Your business account was created",
    accountCreatedDesc: "Sign in now with the temporary password below. You will be asked to confirm your email on first sign-in.",
    verifyBefore: "A verification link was recorded for this account (email:",
    verifyAfter: ") — complete it to fully secure the account.",
    quickSetup: "Fast setup for your sector",
    worldCurrency: "Every country in the world · auto-inferred currency",
    languageSaved: "Account language saved from the start",
    stepsCount: "3 steps",
    setUpWorkspace: "Set up a new workspace",
    createAccountTitle: "Create your business account",
    stepDescriptions: [
      "Start by setting your operating language and business sector.",
      "Choose the country, the currency, and your contact details — the currency is inferred automatically and can be changed.",
      "Review your business summary and complete the security check to create your account.",
    ],
    accountLanguage: "Account language",
    accountLanguageDesc: "Saved as your business's default language. You can change it later.",
    chooseSector: "Choose your business sector",
    sectors: "sectors",
    continue: "Continue",
    sectorTitle: "Business sector",
    businessName: "Business name",
    businessPlaceholder: "Example: Nasser Café",
    country: "Country",
    currency: "Currency",
    autoCurrency: "Inferred automatically from country",
    city: "City",
    cityPlaceholder: "Example: Riyadh",
    email: "Email",
    phone: "Phone number",
    back: "Back",
    edit: "Edit",
    countryCurrency: "Country · Currency",
    accountLanguageLabel: "Account language",
    signInHandle: "Sign-in handle",
    plan: "Plan",
    freePlan: "Free · one operational branch",
    securityCheck: "Security check",
    newQuestion: "New question",
    answerPlaceholder: "Answer",
    answerLabel: "Security check answer",
    creating: "Creating account...",
    create: "Create account",
    toastCreated: "Your business account was created. Save the temporary password and confirm your email later.",
    toastError: "Could not create the account",
    toastValidation: "Complete the required fields with valid values.",
    toastCaptcha: "Complete the security check first.",
    sectorNames: { restaurant: "Restaurants & food", vegetables: "Fruit & vegetables", grocery: "Groceries & supplies", laundry: "Laundry", automotive: "Automotive services", beauty_salon: "Salons & beauty", public_works: "Maintenance & general works", fashion: "Fashion & clothing", sweets: "Sweets & bakery" },
  },
  fr: {
    gateway: "Portail des établissements commerciaux",
    heroStart: "Lancez votre activité",
    heroBetter: "plus intelligemment.",
    heroDesc: "Créez un espace adapté à votre activité, puis choisissez la langue, la devise et les informations clés avant de lancer.",
    backToLogin: "Retour à la connexion",
    signInNow: "Se connecter maintenant",
    backHome: "Retour à l’accueil",
    accountCreated: "Votre compte d’entreprise a été créé",
    accountCreatedDesc: "Connectez-vous avec le mot de passe temporaire ci-dessous. Vous devrez confirmer votre e-mail à la première connexion.",
    verifyBefore: "Un lien de vérification a été enregistré pour ce compte (e-mail :",
    verifyAfter: ") — complétez-le pour sécuriser pleinement le compte.",
    quickSetup: "Configuration rapide selon votre secteur",
    worldCurrency: "Tous les pays du monde · devise déduite automatiquement",
    languageSaved: "Langue du compte enregistrée dès le début",
    stepsCount: "3 étapes",
    setUpWorkspace: "Créer un nouvel espace",
    createAccountTitle: "Créez votre compte d’entreprise",
    stepDescriptions: [
      "Commencez par définir la langue d’exploitation et le secteur d’activité.",
      "Choisissez le pays, la devise et vos coordonnées — la devise est déduite automatiquement et peut être modifiée.",
      "Vérifiez le résumé de votre établissement et complétez le contrôle de sécurité pour créer le compte.",
    ],
    accountLanguage: "Langue du compte",
    accountLanguageDesc: "Enregistrée comme langue par défaut de votre établissement. Vous pourrez la modifier plus tard.",
    chooseSector: "Choisissez votre secteur d’activité",
    sectors: "secteurs",
    continue: "Continuer",
    sectorTitle: "Secteur d’activité",
    businessName: "Nom de l’établissement",
    businessPlaceholder: "Exemple : Café Nasser",
    country: "Pays",
    currency: "Devise",
    autoCurrency: "Déduite automatiquement du pays",
    city: "Ville",
    cityPlaceholder: "Exemple : Riyad",
    email: "E-mail",
    phone: "Numéro de téléphone",
    back: "Retour",
    edit: "Modifier",
    countryCurrency: "Pays · Devise",
    accountLanguageLabel: "Langue du compte",
    signInHandle: "Identifiant de connexion",
    plan: "Forfait",
    freePlan: "Gratuit · une succursale opérationnelle",
    securityCheck: "Contrôle de sécurité",
    newQuestion: "Nouvelle question",
    answerPlaceholder: "Réponse",
    answerLabel: "Réponse du contrôle de sécurité",
    creating: "Création du compte...",
    create: "Créer le compte",
    toastCreated: "Votre compte d’entreprise a été créé. Enregistrez le mot de passe temporaire et confirmez votre e-mail plus tard.",
    toastError: "Impossible de créer le compte",
    toastValidation: "Complétez les champs obligatoires avec des valeurs valides.",
    toastCaptcha: "Complétez d’abord le contrôle de sécurité.",
    sectorNames: { restaurant: "Restaurants et cuisine", vegetables: "Fruits et légumes", grocery: "Épiceries", laundry: "Blanchisserie", automotive: "Services automobiles", beauty_salon: "Salons et beauté", public_works: "Maintenance et travaux", fashion: "Mode et vêtements", sweets: "Pâtisserie et boulangerie" },
  },
} as const;

export default function RegisterScreen() {
  const { language, direction } = useLanguage();
  const copy = language === "fr" ? registerCopy.fr : language === "en" ? registerCopy.en : registerCopy.ar;
  const sectorNames = copy.sectorNames;
  const liveSectors = trpc.marketplace.publicSectors.useQuery(undefined, { retry: 2 });
  const fallbackSectors = useMemo(() => Object.entries(sectorNames).map(([id, label]) => ({ id, label })), [sectorNames]);
  const sectors = useMemo(() => {
    const live = (liveSectors.data ?? []).map((item) => ({ id: item.slug, label: language === "ar" ? item.labelAr : language === "fr" ? item.labelFr : item.labelEn }));
    return live.length ? live : fallbackSectors;
  }, [liveSectors.data, language, fallbackSectors]);
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [sector, setSector] = useState("restaurant");
  const [languageCode] = useState(() => language);
  const [form, setForm] = useState({ business: "", email: "", phone: "", city: "" });
  const [countryCode, setCountryCode] = useState("SA");
  const [currencyCode, setCurrencyCode] = useState("SAR");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const registrationCaptcha = trpc.auth.registrationCaptcha.useQuery();
  const register = trpc.auth.registerRestaurant.useMutation({
    onSuccess: () => { setDone(true); toast.success(copy.toastCreated); },
    onError: (error) => toast.error(error.message || copy.toastError),
  });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const arrow = direction === "rtl" ? "h-4 w-4" : "h-4 w-4 rotate-180";
  const country = useMemo(() => COUNTRIES.find((item) => item.code === countryCode) ?? COUNTRIES[0], [countryCode]);
  const selectedCurrency = getCurrency(currencyCode);
  const languageLabel = languageOptions.find((item) => item.code === languageCode)?.label ?? languageOptions[0].label;
  const countryName = (item: { code: string; nameAr: string; name: string }) => language === "ar" ? item.nameAr : item.name;
  const currencyName = (item: { code: string; nameAr: string; name: string; symbol: string }) => language === "ar" ? item.nameAr : item.name;
  const sectorLabel = (id: string) => sectors.find((item) => item.id === id)?.label ?? sectorNames[id as keyof typeof sectorNames] ?? id;
  const validContact = form.business.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(form.email.trim()) && form.phone.trim().length >= 7 && form.city.trim().length >= 2;
  const next = () => {
    if (step === 2 && !validContact) { toast.error(copy.toastValidation); return; }
    setStep((current) => Math.min(3, current + 1));
  };
  const submit = () => {
    if (!acceptedLegal) { toast.error(language === "ar" ? "يجب الموافقة على الشروط وسياسة الخصوصية" : language === "fr" ? "Vous devez accepter les conditions et la politique de confidentialité." : "You must accept the Terms and Privacy Policy."); return; }
    if (!registrationCaptcha.data?.challenge || !/^\d{1,2}$/.test(captchaAnswer.trim())) { toast.error(copy.toastCaptcha); return; }
    register.mutate({ restaurantName: form.business.trim(), sector, countryCode, currencyCode, primaryLanguage: languageCode as "ar" | "en" | "fr" | "ur" | "es" | "de" | "tr", country: country.nameAr, city: form.city.trim(), email: form.email.trim(), phone: form.phone.trim(), plan: "Free", captchaChallenge: registrationCaptcha.data.challenge, captchaAnswer: captchaAnswer.trim() });
  };

  if (done && register.data) return (
    <div dir={direction} className="min-h-screen bg-[#071525] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[.75fr_1.25fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
          <div className="relative">
            <button onClick={() => setLocation("/")} className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black text-orange-600">N</span>
              <span><strong className="block tracking-[.16em]">NFOOD</strong><small className="text-[9px] tracking-[.16em] text-orange-100">RESTAURANT OPERATING SYSTEM</small></span>
            </button>
            <div className="mt-24 max-w-sm">
              <p className="text-sm font-bold text-orange-100">{copy.gateway}</p>
              <h1 className="mt-4 text-5xl font-black leading-tight">{copy.heroStart}<br />{copy.heroBetter}</h1>
              <p className="mt-6 text-sm leading-8 text-orange-50">{copy.heroDesc}</p>
            </div>
          </div>
        </aside>
        <main className="flex items-center bg-[#f8fafc] px-5 py-8 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-lg">
            <div className="mb-8 flex items-center justify-between">
              <button onClick={() => setLocation("/login")} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-500"><ArrowRight className={arrow} /> {copy.backToLogin}</button>
            </div>
            <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600"><Check className="h-8 w-8" /></div>
              <p className="mt-6 text-center text-2xl font-black">{copy.accountCreated}</p>
              <p className="mx-auto mt-2 max-w-md text-center text-sm leading-7 text-slate-500">{copy.accountCreatedDesc}</p>
              <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-4">
                <KeyRoundIcon /><code dir="ltr" className="text-2xl font-black tracking-wider text-orange-900">{register.data.temporaryPassword}</code>
              </div>
              <p className="mx-auto mt-4 max-w-md rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-center text-[11px] leading-5 text-sky-800">{copy.verifyBefore} <span dir="ltr">{form.email}</span>{copy.verifyAfter}</p>
              <div className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
                <button onClick={() => setLocation("/login")} className="h-12 flex-1 rounded-2xl bg-[#e76f3c] text-base font-bold text-white hover:bg-[#d85f2e]">{copy.signInNow}</button>
                <button onClick={() => setLocation("/")} className="h-12 flex-1 rounded-2xl border border-slate-200 text-sm font-bold text-slate-500 hover:border-orange-200">{copy.backHome}</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <div dir={direction} className="min-h-screen bg-[#071525] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[.75fr_1.25fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
          <div className="relative">
            <button onClick={() => setLocation("/")} className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black text-orange-600">N</span>
              <span><strong className="block tracking-[.16em]">NFOOD</strong><small className="text-[9px] tracking-[.16em] text-orange-100">RESTAURANT OPERATING SYSTEM</small></span>
            </button>
            <div className="mt-24 max-w-sm">
              <p className="text-sm font-bold text-orange-100">{copy.gateway}</p>
              <h1 className="mt-4 text-5xl font-black leading-tight">{copy.heroStart}<br />{copy.heroBetter}</h1>
              <p className="mt-6 text-sm leading-8 text-orange-50">{copy.heroDesc}</p>
            </div>
          </div>
          <div className="relative space-y-3 text-sm text-orange-50">
            <p className="flex items-center gap-3"><Check className="h-4 w-4" /> {copy.quickSetup}</p>
            <p className="flex items-center gap-3"><Check className="h-4 w-4" /> {copy.worldCurrency}</p>
            <p className="flex items-center gap-3"><Check className="h-4 w-4" /> {copy.languageSaved}</p>
          </div>
        </aside>
        <main className="nfood-auth-scroll min-h-dvh overflow-y-auto bg-[#f8fafc] px-4 py-5 sm:px-10 sm:py-8 lg:px-16">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 flex items-center justify-between">
              <button onClick={() => setLocation("/login")} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-500"><ArrowRight className={arrow} /> {copy.backToLogin}</button>
              <div className="flex min-w-0 items-center gap-2"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 font-black text-white">N</span><strong className="hidden tracking-[.16em] sm:block">NFOOD</strong><LanguageSwitcher compact /></div>
            </div>
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-1 text-xs font-bold text-orange-600">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${step >= 1 ? "bg-orange-500 text-white" : "bg-slate-200"}`}>1</span>
                <span className="h-px w-10 bg-slate-200" />
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${step >= 2 ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-400"}`}>2</span>
                <span className="h-px w-10 bg-slate-200" />
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${step >= 3 ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-400"}`}>3</span>
                <span className="text-slate-400">{copy.stepsCount}</span>
              </div>
              <p className="text-sm font-bold text-orange-600">{copy.setUpWorkspace}</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{copy.createAccountTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{copy.stepDescriptions[step - 1]}</p>
            </div>
            {step === 1 ? (
              <section className="space-y-7">
                <div>
                  <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><Store className="h-4 w-4 text-orange-500" /><h3 className="font-black">{copy.chooseSector}</h3></div><span className="text-[11px] font-bold text-slate-400">{sectors.length} {copy.sectors}</span></div>
                  {liveSectors.isLoading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{Array.from({length:6}).map((_,i)=><div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200/70" />)}</div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{sectors.map(({ id }) => { const selected=sector===id; return <button type="button" key={id} onClick={()=>setSector(id)} className={`min-h-20 rounded-2xl border px-3 py-3 text-start text-sm font-black transition ${selected ? "border-orange-500 bg-orange-50 text-orange-900 ring-2 ring-orange-100" : "border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50/40"}`}><span className="flex items-center gap-2"><Store className={`h-4 w-4 ${selected ? "text-orange-500" : "text-slate-400"}`} />{sectorLabel(id)}</span>{selected && <span className="mt-2 flex items-center gap-1 text-[10px] text-orange-600"><Check className="h-3 w-3" />{language==="ar"?"تم الاختيار":language==="fr"?"Sélectionné":"Selected"}</span>}</button>})}</div>}
                  {liveSectors.isError && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800">{language==="ar"?"تعذر تحديث القطاعات الآن؛ يمكنك المتابعة بالقطاعات الأساسية ثم تعديل النشاط لاحقًا.":language==="fr"?"Impossible d’actualiser les secteurs. Vous pouvez continuer avec les secteurs de base.":"Could not refresh sectors. You can continue with the core sectors."}</p>}
                  <p className="mt-2 text-[11px] leading-5 text-slate-400">{copy.accountLanguageLabel}: <strong>{languageLabel}</strong> · {copy.accountLanguageDesc}</p>
                </div>
                <button onClick={next} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#e76f3c] text-base font-bold text-white hover:bg-[#d85f2e]">{copy.continue} <ArrowLeft className={arrow} /></button>
              </section>
            ) : step === 2 ? (
              <section className="space-y-5">
                <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-orange-800">
                  <p className="font-black">{copy.sectorTitle}</p>
                  <p className="mt-1 font-bold text-orange-950">{sectorLabel(sector)}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-xs font-bold text-slate-700">{copy.businessName}</span>
                    <input required value={form.business} onChange={(event) => update("business", event.target.value)} placeholder={copy.businessPlaceholder} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700"><MapPin className="h-4 w-4 text-orange-500" /> {copy.country}</span>
                    <select value={countryCode} onChange={(event) => { setCountryCode(event.target.value); setCurrencyCode(COUNTRIES.find((item) => item.code === event.target.value)?.currencyCode ?? "SAR"); }} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-orange-400">
                      {COUNTRIES.map((item) => <option key={item.code} value={item.code}>{countryName(item)}</option>)}
                    </select>
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700"><WalletCards className="h-4 w-4 text-orange-500" /> {copy.currency}</span>
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <p className="text-[11px] font-bold text-emerald-700">{copy.autoCurrency}</p>
                      <p className="mt-1 text-sm font-black text-emerald-900">{currencyName(selectedCurrency)} · {selectedCurrency.code} ({selectedCurrency.symbol})</p>
                    </div>
                    <select value={currencyCode} onChange={(event) => setCurrencyCode(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-orange-400">
                      {CURRENCIES.map((item) => <option key={item.code} value={item.code}>{currencyName(item)} · {item.code} ({item.symbol})</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700"><MapPin className="h-4 w-4 text-orange-500" /> {copy.city}</span>
                    <input value={form.city} onChange={(event) => update("city", event.target.value)} placeholder={copy.cityPlaceholder} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
                  </label>
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700"><Mail className="h-4 w-4 text-orange-500" /> {copy.email}</span>
                    <input dir="ltr" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="name@business.com" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700"><Phone className="h-4 w-4 text-orange-500" /> {copy.phone}</span>
                    <input dir="ltr" type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+966 5X XXX XXXX" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-500 hover:border-orange-200"><ArrowRight className={arrow} /> {copy.back}</button>
                  <button onClick={next} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#e76f3c] text-base font-bold text-white hover:bg-[#d85f2e]">{copy.continue} <ArrowLeft className={arrow} /></button>
                </div>
              </section>
            ) : (
              <section className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div><p className="text-xs text-orange-700">{copy.businessName}</p><p className="mt-0.5 font-black">{form.business || "—"}</p></div>
                    <button type="button" onClick={() => setStep(2)} className="text-xs font-bold text-orange-600">{copy.edit}</button>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs"><span className="block text-slate-400">{copy.countryCurrency}</span><span className="mt-0.5 block font-bold">{countryName(country)} · {selectedCurrency.code}</span></p>
                    <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs"><span className="block text-slate-400">{copy.sectorTitle}</span><span className="mt-0.5 block font-bold">{sectorLabel(sector)}</span></p>
                    <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs"><span className="block text-slate-400">{copy.accountLanguageLabel}</span><span className="mt-0.5 block font-bold">{languageLabel}</span></p>
                    <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs"><span className="block text-slate-400">{copy.signInHandle}</span><span dir="ltr" className="mt-0.5 block font-bold">{form.email}</span></p>
                    <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs sm:col-span-2"><span className="block text-slate-400">{copy.plan}</span><span className="mt-0.5 block font-bold">{copy.freePlan}</span></p>
                  </div>
                </div>
                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-black text-orange-900"><ShieldCheck className="h-3.5 w-3.5" /> {copy.securityCheck}</p>
                      <p dir="ltr" className="mt-1 text-sm font-black text-orange-950">{registrationCaptcha.data?.prompt ?? "… + … = ؟"}</p>
                    </div>
                    <button type="button" onClick={() => { setCaptchaAnswer(""); void registrationCaptcha.refetch(); }} className="rounded-lg border border-orange-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-orange-800">{copy.newQuestion}</button>
                  </div>
                  <input value={captchaAnswer} onChange={(event) => setCaptchaAnswer(event.target.value.replace(/\D/g, "").slice(0, 2))} inputMode="numeric" autoComplete="off" required placeholder={copy.answerPlaceholder} aria-label={copy.answerLabel} className="mt-3 h-12 w-full rounded-xl border border-orange-200 bg-white px-4 text-sm outline-none focus:border-orange-400" />
                </div>
                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-6 text-slate-600">
                  <input type="checkbox" checked={acceptedLegal} onChange={(event) => setAcceptedLegal(event.target.checked)} className="mt-1 accent-orange-500" />
                  <span>{language === "ar" ? <>بإنشاء الحساب أوافق على <a href="/terms" target="_blank" className="font-bold text-orange-600">الشروط والأحكام</a> و<a href="/privacy" target="_blank" className="font-bold text-orange-600">سياسة الخصوصية</a>.</> : language === "fr" ? <>En créant le compte, j’accepte les <a href="/terms" target="_blank" className="font-bold text-orange-600">Conditions</a> et la <a href="/privacy" target="_blank" className="font-bold text-orange-600">Politique de confidentialité</a>.</> : <>By creating the account, I agree to the <a href="/terms" target="_blank" className="font-bold text-orange-600">Terms</a> and <a href="/privacy" target="_blank" className="font-bold text-orange-600">Privacy Policy</a>.</>}</span>
                </label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setStep(2)} disabled={register.isPending} className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-500 hover:border-orange-200"><ArrowRight className={arrow} /> {copy.back}</button>
                  <button type="button" onClick={submit} disabled={register.isPending} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#e76f3c] text-base font-bold text-white hover:bg-[#d85f2e] disabled:opacity-60"><Lock className="h-4 w-4" /> {register.isPending ? copy.creating : copy.create}</button>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function KeyRoundIcon() {
  return <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700"><Lock className="h-5 w-5" /></span>;
}