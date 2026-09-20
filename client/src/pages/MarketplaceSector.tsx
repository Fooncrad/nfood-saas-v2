import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Loader2, Search, ShoppingBag, Store, Utensils, Home, ChevronLeft, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";

const SECTOR_ICONS: Record<string, LucideIcon> = {
  store: Store,
  utensils: Utensils,
  shopping: ShoppingBag,
  shoppingBag: ShoppingBag,
};

export default function MarketplaceSector() {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState("");
  const sectors = trpc.marketplace.publicSectors.useQuery(undefined, { retry: false });
  const sector = (sectors.data ?? []).find((s) => s.slug === slug);
  const country = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("country") || localStorage.getItem("nfood-market-country") || "SA") : "SA";
  const stores = trpc.marketplace.publicStores.useQuery({ countryCode: country, sectorSlug: slug, search: search.trim() || undefined }, { retry: false, enabled: Boolean(slug) });
  const featuredListings = trpc.marketplace.publicListings.useQuery({ sectorId: sector?.id, featuredOnly: true }, { retry: false, enabled: Boolean(sector?.id) });
  const Icon = SECTOR_ICONS[sector?.icon ?? ""] ?? Store;

  if (sectors.isLoading || (!sector && sectors.isSuccess)) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#0b0f17] text-white">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0f17]/90 px-5 py-4 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <Link href={`/marketplace?country=${country}`}><Button type="button" variant="ghost" className="rounded-xl text-slate-300 hover:bg-white/10 hover:text-white"><Home className="ml-2 h-4 w-4" />السوق</Button></Link>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E76F3C] text-lg font-black text-white">N</span>
            <strong className="text-sm tracking-[.12em]">NFOOD MARKETPLACE</strong>
          </div>
        </header>
        <div className="mx-auto flex max-w-7xl items-center justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-orange-400" /></div>
      </main>
    );
  }

  if (!sector) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#0b0f17] text-white">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0f17]/90 px-5 py-4 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <Link href={`/marketplace?country=${country}`}><Button type="button" variant="ghost" className="rounded-xl text-slate-300 hover:bg-white/10 hover:text-white"><Home className="ml-2 h-4 w-4" />السوق</Button></Link>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E76F3C] text-lg font-black text-white">N</span>
            <strong className="text-sm tracking-[.12em]">NFOOD MARKETPLACE</strong>
          </div>
        </header>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center py-32 text-center"><Store className="mb-4 h-12 w-12 text-slate-500" /><h1 className="text-2xl font-black">هذا القطاع غير موجود</h1><Link href="/marketplace"><Button type="button" className="mt-6 rounded-xl bg-[#E76F3C]">العودة للسوق</Button></Link></div>
      </main>
    );
  }

  const storeRows = stores.data ?? [];
  const listings = featuredListings.data ?? [];

  return (
    <main dir="rtl" className="min-h-screen bg-[#0b0f17] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0f17]/90 px-5 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Link href={`/marketplace?country=${country}`}><Button type="button" variant="ghost" className="rounded-xl text-slate-300 hover:bg-white/10 hover:text-white"><Home className="ml-2 h-4 w-4" />السوق</Button></Link>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E76F3C] text-lg font-black text-white">N</span>
          <strong className="text-sm tracking-[.12em]">NFOOD MARKETPLACE</strong>
        </div>
      </header>

      <section className="relative isolate overflow-hidden px-5 pb-10 pt-12 md:px-8 md:pt-16">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl" style={{ backgroundColor: `${sector.color}22`, color: sector.color }}><Icon className="h-8 w-8" /></div>
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">{sector.labelAr}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">{sector.descriptionAr || `تصفح جميع المتاجر والمنتجات المتاحة في قطاع ${sector.labelAr}.`}</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-slate-400"><Badge className="border-white/10 bg-white/5 text-orange-200">{sector.listingCount} منتجًا</Badge><Badge className="border-white/10 bg-white/5 text-emerald-300">{storeRows.length} متجرًا</Badge></div>
          <div className="mt-5 flex items-center gap-2">
            <div className="relative w-full max-w-md"><Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث في المتاجر..." className="h-9 rounded-xl border-white/10 bg-white/5 pr-9 text-white placeholder:text-slate-500" /></div>
          </div>
        </div>
      </section>

      {listings.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-10 md:px-8">
          <h2 className="mb-4 text-lg font-black">منتجات مميزة</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{listings.slice(0, 8).map((listing) => <Card key={listing.id} className="overflow-hidden rounded-3xl border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-orange-400/40"><div className="relative aspect-[4/3] overflow-hidden bg-slate-900">{listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover opacity-80" /> : <div className="grid h-full place-items-center text-sm text-slate-600"><ShoppingBag className="h-8 w-8" /></div>}{listing.isFeatured ? <Badge className="absolute right-2 top-2 border-amber-400/30 bg-amber-400/20 text-amber-200">مميز</Badge> : null}</div><CardContent className="p-4"><h3 className="line-clamp-1 font-black">{listing.title}</h3><div className="mt-2 flex items-center justify-between"><span className="font-black text-orange-300">{Number(listing.price).toLocaleString("en-US")} {listing.currencyCode}</span>{listing.compareAtPrice ? <span className="text-xs text-slate-500 line-through">{Number(listing.compareAtPrice).toLocaleString("en-US")} {listing.currencyCode}</span> : null}</div></CardContent></Card>)}</div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <h2 className="mb-5 text-lg font-black">المتاجر في قطاع {sector.labelAr}</h2>
        {stores.isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/5" />)}</div> : storeRows.length === 0 ? <div className="rounded-3xl border border-dashed border-white/15 p-14 text-center text-sm text-slate-400">لا توجد متاجر نشطة في هذا القطاع بعد.</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{storeRows.map((store) => <Link key={store.entityId} href={`/store/${store.entityId}?country=${country}&sector=${slug}`} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-orange-400/40"><div className="relative flex h-24 items-end justify-between gap-2 p-4" style={{ background: `linear-gradient(135deg, ${store.restaurant?.brandColor ?? "#111927"}, ${store.restaurant?.brandAccentColor ?? store.restaurant?.brandColor ?? "#0b1d35"})` }}>{store.restaurant?.brandLogoUrl ? <img src={store.restaurant.brandLogoUrl} alt="" className="h-14 w-14 rounded-2xl bg-white/95 object-cover p-1 shadow-lg" /> : <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-xl font-black text-white">{store.customerName.trim().charAt(0)}</span>}<Badge className="border-white/20 bg-black/40 text-orange-200">{store.sector}</Badge></div><CardContent className="p-4"><div className="flex items-center justify-between gap-2"><h3 className="line-clamp-1 font-black">{store.customerName}</h3></div><p className="mt-1 line-clamp-1 text-xs text-slate-400">{store.restaurant?.city ?? store.email}</p><div className="mt-3 flex items-center justify-between text-xs"><span className="font-bold text-emerald-300">{store.listingCount} منتجًا</span><span className="font-black text-white">{Number(store.minPrice) > 0 ? `من ${store.minPrice.toLocaleString("en-US")} ر.س` : "مجاني"}</span></div></CardContent></Link>)}</div>}
      </section>
    </main>
  );
}