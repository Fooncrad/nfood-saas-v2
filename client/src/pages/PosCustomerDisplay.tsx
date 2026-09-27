import { useEffect, useState } from "react";
import { ShoppingBag, Wifi, WifiOff } from "lucide-react";
import { readCustomerFacingState, subscribeCustomerFacingState, type CustomerFacingState } from "@/lib/customerFacingDisplay";

const empty: CustomerFacingState = {
  restaurantId: 0,
  updatedAt: new Date(0).toISOString(),
  status: "idle",
  lines: [],
  subtotal: 0,
  discount: 0,
  tax: 0,
  total: 0,
  currencyCode: "SAR",
};

function amount(value: number, currencyCode: string) {
  return new Intl.NumberFormat("ar-SA", { style: "currency", currency: currencyCode, maximumFractionDigits: 2 }).format(value);
}

export default function PosCustomerDisplay() {
  const sessionId = new URLSearchParams(window.location.search).get("session") ?? "";
  const [state, setState] = useState<CustomerFacingState>(() => readCustomerFacingState(sessionId) ?? empty);
  const [online, setOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);

  useEffect(() => subscribeCustomerFacingState(sessionId, setState), [sessionId]);
  useEffect(() => {
    const refresh = () => setOnline(navigator.onLine);
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    return () => { window.removeEventListener("online", refresh); window.removeEventListener("offline", refresh); };
  }, []);

  if (!sessionId) return <main className="flex min-h-screen items-center justify-center bg-[#07111f] p-6 text-center text-white"><div><p className="text-xl font-black">شاشة العميل غير مرتبطة</p><p className="mt-2 text-sm text-slate-400">افتح الشاشة من نقطة البيع لبدء جلسة آمنة.</p></div></main>;

  return <main dir={document.documentElement.dir === "ltr" ? "ltr" : "rtl"} className="min-h-screen bg-[#07111f] p-4 text-white md:p-8">
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 border-b border-white/10 pb-5">
      <div><p className="text-xs font-black tracking-[0.22em] text-orange-400">NFOOD CUSTOMER DISPLAY</p><h1 className="mt-2 text-2xl font-black md:text-4xl">مشترياتك</h1></div>
      <div className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${online ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>{online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}{online ? "متصل" : "يعمل دون اتصال"}</div>
    </header>
    <section className="mx-auto mt-6 grid max-w-7xl gap-6 lg:grid-cols-[1.5fr_.75fr]">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.04]">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-white/10 px-5 py-4 text-xs font-bold text-slate-400"><span>الصنف</span><span>الكمية</span><span>الإجمالي</span></div>
        <div className="max-h-[65vh] overflow-y-auto p-3">
          {state.lines.length ? state.lines.map((line) => <div key={line.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-2xl px-3 py-4 odd:bg-white/[.035]"><div><p className="text-base font-black">{line.name}</p><p className="mt-1 text-xs text-slate-400">{amount(line.unitPrice, state.currencyCode)}</p></div><span className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black">{line.quantity}</span><strong className="min-w-28 text-left text-lg">{amount(line.quantity * line.unitPrice, state.currencyCode)}</strong></div>) : <div className="flex min-h-[45vh] flex-col items-center justify-center text-center text-slate-400"><ShoppingBag className="h-12 w-12 text-orange-400" /><p className="mt-4 text-xl font-black text-white">مرحبًا بك</p><p className="mt-2 text-sm">ستظهر المنتجات هنا فور مسحها عند الكاشير.</p></div>}
        </div>
      </div>
      <aside className="flex flex-col justify-between rounded-3xl bg-gradient-to-b from-[#12243d] to-[#0d192b] p-6 shadow-2xl">
        <div><p className="text-xs font-bold text-slate-400">ملخص الفاتورة</p><div className="mt-6 space-y-4 text-sm"><div className="flex justify-between"><span className="text-slate-400">المجموع</span><span>{amount(state.subtotal, state.currencyCode)}</span></div>{state.discount > 0 && <div className="flex justify-between text-emerald-300"><span>الخصم</span><span>-{amount(state.discount, state.currencyCode)}</span></div>}<div className="flex justify-between"><span className="text-slate-400">الضريبة</span><span>{amount(state.tax, state.currencyCode)}</span></div></div></div>
        <div className="mt-8 border-t border-white/10 pt-6"><p className="text-sm font-bold text-slate-400">الإجمالي المستحق</p><p className="mt-2 text-4xl font-black text-orange-400 md:text-5xl">{amount(state.total, state.currencyCode)}</p><p className="mt-5 text-xs text-slate-500">يتم تحديث الشاشة مباشرة من نقطة البيع.</p></div>
      </aside>
    </section>
  </main>;
}
