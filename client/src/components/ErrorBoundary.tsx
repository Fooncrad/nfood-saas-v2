import { AlertTriangle, Copy, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null; requestId: string };

type ErrorLanguage = "ar" | "en" | "fr" | "ur";
const errorCopy: Record<ErrorLanguage, { dir: "rtl" | "ltr"; eyebrow: string; title: string; description: string; cause: string; retry: string; home: string; unknown: string; support: string }> = {
  ar: { dir: "rtl", eyebrow: "NFOOD · تنبيه النظام", title: "حدث عطل غير متوقع", description: "لم تكتمل هذه الصفحة. أعد المحاولة، وإذا استمرت المشكلة أرسل رقم الطلب إلى مسؤول الدعم.", cause: "سبب العطل التقني", retry: "إعادة المحاولة", home: "العودة للرئيسية", unknown: "خطأ غير معروف", support: "أرسل رقم الطلب إلى فريق الدعم عند استمرار المشكلة." },
  en: { dir: "ltr", eyebrow: "NFOOD · System notice", title: "An unexpected error occurred", description: "This page could not be completed. Try again, and contact support with the request ID if the problem continues.", cause: "Technical cause", retry: "Try again", home: "Back to home", unknown: "Unknown UI error", support: "Share the request ID with support if the problem continues." },
  fr: { dir: "ltr", eyebrow: "NFOOD · Alerte système", title: "Une erreur inattendue s’est produite", description: "Cette page n’a pas pu être chargée. Réessayez et contactez le support avec l’identifiant si le problème persiste.", cause: "Cause technique", retry: "Réessayer", home: "Retour à l’accueil", unknown: "Erreur d’interface inconnue", support: "Communiquez l’identifiant au support si le problème persiste." },
  ur: { dir: "rtl", eyebrow: "NFOOD · سسٹم اطلاع", title: "غیر متوقع خرابی پیش آئی", description: "یہ صفحہ مکمل نہیں ہو سکا۔ دوبارہ کوشش کریں، مسئلہ برقرار رہے تو Request ID کے ساتھ سپورٹ سے رابطہ کریں۔", cause: "تکنیکی وجہ", retry: "دوبارہ کوشش کریں", home: "ہوم پر واپس جائیں", unknown: "نامعلوم انٹرفیس خرابی", support: "مسئلہ برقرار رہے تو Request ID سپورٹ کے ساتھ شیئر کریں۔" },
};

function getErrorLanguage(): ErrorLanguage {
  if (typeof window === "undefined") return "ar";
  const stored = window.localStorage.getItem("nfood-dashboard-language");
  return stored === "en" || stored === "fr" || stored === "ur" ? stored : "ar";
}

export function recordUiError(error: Error, requestId: string) { if (typeof window === "undefined") return; try { const key = "nfood:ui-error-log"; const current = JSON.parse(window.localStorage.getItem(key) || "[]") as Array<Record<string, string>>; const next = [{ requestId, message: error.message, path: window.location.pathname, occurredAt: new Date().toISOString() }, ...current].slice(0, 50); window.localStorage.setItem(key, JSON.stringify(next)); } catch { /* storage is best-effort */ } }

function createRequestId() {
  try { return `ui-${crypto.randomUUID().slice(0, 8)}`; } catch { return `ui-${Date.now().toString(36)}`; }
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false, error: null, requestId: createRequestId() }; }
  static getDerivedStateFromError(error: Error): Partial<State> { const requestId = createRequestId(); recordUiError(error, requestId); return { hasError: true, error, requestId }; }
  copyRequestId = () => { void navigator.clipboard?.writeText(this.state.requestId); };
  render() {
    if (!this.state.hasError) return this.props.children;
    const copy = errorCopy[getErrorLanguage()];
    return (
      <main dir={copy.dir} className="flex min-h-screen items-center justify-center bg-[#f7f8fb] p-6 text-slate-900">
        <section className="w-full max-w-xl rounded-[2rem] border border-red-100 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,.10)] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600"><AlertTriangle className="h-8 w-8" /></div>
          <p className="mt-6 text-xs font-black uppercase tracking-[.2em] text-red-500">{copy.eyebrow}</p>
          <h1 className="mt-2 text-2xl font-black">{copy.title}</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">{copy.description}</p>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-start">
            <p className="text-xs font-bold text-slate-500">{copy.cause}</p>
            <p className="mt-2 break-words text-sm font-semibold text-slate-700" dir="ltr">{this.state.error?.message || copy.unknown}</p>
            <button type="button" onClick={this.copyRequestId} className="mt-3 inline-flex items-center gap-2 rounded-lg text-xs font-bold text-[#c2410c] hover:underline"><Copy className="h-3.5 w-3.5" />Request ID: {this.state.requestId}</button>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => window.location.reload()} className={cn("inline-flex items-center gap-2 rounded-xl bg-[#e76f3c] px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-100 hover:bg-[#d85f2e]")}><RotateCcw className="h-4 w-4" />{copy.retry}</button>
            <button type="button" onClick={() => window.location.assign("/")} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">{copy.home}</button>
          </div>
          <p className="mt-5 text-xs text-slate-400">{copy.support}</p>
        </section>
      </main>
    );
  }
}
export default ErrorBoundary;
