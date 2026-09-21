import { Building2, Car, Gift, Scissors, Shirt, ShoppingBasket, Store, UtensilsCrossed, Waves } from "lucide-react";

const sectors = [
  ["restaurant", "المطاعم", UtensilsCrossed],
  ["vegetables", "الخضار والفواكه", ShoppingBasket],
  ["grocery", "البقالات", Store],
  ["laundry", "المغاسل", Waves],
  ["automotive", "السيارات", Car],
  ["beauty_salon", "صالونات التجميل", Scissors],
  ["public_works", "الخدمات والأعمال", Building2],
  ["fashion", "الأزياء", Shirt],
  ["sweets", "الحلويات والهدايا", Gift],
] as const;

export default function ActivitiesSectorsAdmin() {
  return (
    <section dir="rtl" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-orange-500">NFOOD PLATFORM</p>
          <h1 className="mt-1 text-2xl font-black text-slate-100">الأنشطة والقطاعات</h1>
          <p className="mt-1 text-sm text-slate-400">القطاعات الأساسية المعتمدة على مستوى المنصة. Trend Kitchen يُدار كوحدة مستقلة.</p>
        </div>
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-bold text-orange-300">9 قطاعات أساسية</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sectors.map(([key, label, Icon]) => (
          <article key={key} className="rounded-2xl border border-slate-700/60 bg-slate-900/45 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400"><Icon className="h-5 w-5" /></div>
              <div className="min-w-0"><h2 className="font-extrabold text-slate-100">{label}</h2><p className="mt-0.5 font-mono text-[11px] text-slate-500">{key}</p></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
