import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Copy, Gift, Loader2, MapPin, Package, Sparkles, Tag, TrendingUp, Home, ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Link, useParams } from "wouter";

export default function MarketplaceStore() {
  const { entityId } = useParams<{ entityId: string }>();
  const { user } = useAuth();
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const country = params.get("country") || (typeof window !== "undefined" ? localStorage.getItem("nfood-market-country") : null) || "SA";
  const sectorSlug = params.get("sector");
  const store = trpc.marketplace.publicStore.useQuery({ entityId: entityId!, countryCode: country }, { retry: false, enabled: Boolean(entityId) });
  const myRewards = trpc.marketplace.myRewards.useQuery(undefined, { retry: false, enabled: Boolean(user) });
  const recordAffiliateClick = trpc.marketplace.recordAffiliateClick.useMutation();
  const claimReferral = trpc.marketplace.claimReferral.useMutation();
  const firedRef = useRef(false);
  const [activeGalleryImage, setActiveGalleryImage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("الكل");

  useEffect(() => {
    if (firedRef.current || !entityId) return;
    firedRef.current = true;
    const trackingParams = new URLSearchParams(window.location.search);
    const ref = trackingParams.get("ref");
    const rf = trackingParams.get("rf");
    if (ref) recordAffiliateClick.mutate({ code: ref });
    if (rf) claimReferral.mutate({ code: rf, userId: user?.id ?? undefined });
  }, [entityId, user?.id, recordAffiliateClick, claimReferral]);

  const entity = store.data?.entity;
  const restaurant = store.data?.restaurant;
  const listings = store.data?.listings ?? [];
  const coupons = store.data?.coupons ?? [];
  const loyaltySettings = store.data?.loyaltySettings;
  const loyaltyAccount = (myRewards.data?.loyalty ?? []).find((row) => row.entityId === entityId);
  const listingCategory = (listing: (typeof listings)[number]) => {
    try {
      const meta = listing.metadataJson ? JSON.parse(listing.metadataJson) : null;
      if (meta?.category) return String(meta.category);
    } catch {}
    try {
      const tags = listing.tagsJson ? JSON.parse(listing.tagsJson) : [];
      if (Array.isArray(tags) && tags.length) return String(tags[0]);
    } catch {}
    return "أخرى";
  };
  const categories = useMemo(() => ["الكل", ...Array.from(new Set(listings.map(listingCategory)))], [listings]);
  const visibleListings = activeCategory === "الكل" ? listings : listings.filter((listing) => listingCategory(listing) === activeCategory);
  const activityLabel = entity?.sector === "restaurant" ? "مطعم" : entity?.sector === "fashion" ? "أزياء" : entity?.sector === "automotive" ? "سيارات" : entity?.sector === "real_estate" ? "عقار" : entity?.sector === "beauty_salon" ? "جمال وعناية" : "نشاط";
  const productImageRatio = entity?.sector === "restaurant" ? "aspect-square" : entity?.sector === "fashion" ? "aspect-[3/4]" : entity?.sector === "automotive" ? "aspect-[16/10]" : entity?.sector === "beauty_salon" || entity?.sector === "public_works" || entity?.sector === "laundry" ? "aspect-[4/3]" : "aspect-square";
  const productImageFit = entity?.sector === "fashion" ? "object-cover object-top" : "object-cover";
  const galleryImages = useMemo(() => {
    const images = [restaurant?.coverUrl, restaurant?.brandLogoUrl, ...listings.map((item) => item.imageUrl)].filter((value): value is string => Boolean(value));
    return Array.from(new Set(images)).slice(0, 4);
  }, [restaurant?.coverUrl, restaurant?.brandLogoUrl, listings]);

  const handleCopyCode = async (code: string) => {
    try { await navigator.clipboard.writeText(code); toast.success("تم نسخ الرمز"); } catch { toast.error("تعذر نسخ الرمز"); }
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[#0b0f17] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0f17]/90 px-5 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <Link href={sectorSlug ? `/marketplace/sector/${sectorSlug}?country=${country}` : `/marketplace?country=${country}`}><Button type="button" variant="ghost" className="rounded-xl text-slate-300 hover:bg-white/10 hover:text-white"><ArrowRight className="ml-2 h-4 w-4" />رجوع</Button></Link><Link href={`/marketplace?country=${country}`} className="hidden items-center gap-1 text-xs text-slate-500 hover:text-white sm:flex"><Home className="h-3.5 w-3.5"/>السوق</Link>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E76F3C] text-lg font-black text-white">N</span>
          <strong className="text-sm tracking-[.12em]">NFOOD MARKETPLACE</strong>
          {entity && <Badge className="border-white/20 bg-white/5 text-orange-200">{activityLabel}</Badge>}
        </div>
      </header>

      {store.isLoading && <div className="mx-auto flex max-w-7xl items-center justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-orange-400" /></div>}
      {store.isError && <div className="mx-auto max-w-7xl py-32 text-center"><h1 className="text-2xl font-black">المتجر غير موجود</h1><p className="mt-2 text-sm text-slate-400">قد يكون المعطول أو غير موجود.</p><Link href={`/marketplace?country=${country}`}><Button type="button" className="mt-6 rounded-xl bg-[#E76F3C]">العودة للسوق</Button></Link></div>}

      {entity && (
        <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 md:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5"><div className="absolute inset-x-0 top-0 h-32 bg-cover bg-center opacity-35" style={restaurant?.coverUrl ? { backgroundImage: `linear-gradient(to bottom,transparent,#0b0f17),url(${restaurant.coverUrl})` } : { background: `linear-gradient(135deg, ${restaurant?.brandColor ?? "#111927"}, ${restaurant?.brandAccentColor ?? "#0b1d35"})` }} /><div className="relative flex flex-col gap-6 p-6 pt-16 md:flex-row md:items-center md:gap-10">
            <div className="flex shrink-0 items-center gap-4">
              {restaurant?.brandLogoUrl ? <img src={restaurant.brandLogoUrl} alt="" className="h-20 w-20 rounded-3xl bg-white/95 object-cover p-1.5 shadow-lg" /> : <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 text-2xl font-black text-white">{entity.customerName.trim().charAt(0)}</span>}
              <div>
                <p className="mb-1 text-[11px] font-bold text-orange-300">{activityLabel} · صفحة مستقلة على NFOOD</p><h1 className="text-2xl font-black tracking-tight md:text-3xl">{entity.customerName}</h1>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-300">{restaurant?.city ? <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{restaurant.city}</span> : null}<span className="rounded-full bg-white/10 px-2 py-1">{entity.plan} Plan</span></p>
              </div>
            </div>
            {loyaltyAccount && <div className="mt-4 md:mt-0 md:mr-auto md:flex md:items-center md:gap-3"><div className="rounded-2xl border border-white/15 bg-black/20 px-5 py-3 text-center"><p className="text-[11px] font-bold text-orange-200/80">نقاطك</p><p className="mt-1 text-2xl font-black">{loyaltyAccount.pointsBalance.toLocaleString("en-US")}</p></div></div>}
            {user && <Link href={`/store/${entityId}/rewards`}><Button type="button" variant="outline" className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"><Gift className="ml-2 h-4 w-4" />مكافآتي</Button></Link>}
            {!user && <Button type="button" onClick={() => startLogin()} variant="outline" className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10">سجّل الدخول لتفعيل المكافآت</Button>}
          </div></div>

          {galleryImages.length > 0 && (
            <section aria-label="صور المتجر">
              <div className="mb-3 flex items-center justify-between"><div><h2 className="text-base font-black">صور المتجر</h2><p className="mt-0.5 text-[11px] text-slate-500">اضغط على الصورة لعرضها بحجم أكبر</p></div><span className="text-[10px] text-slate-600">{galleryImages.length}/4</span></div>
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:grid md:grid-cols-4 md:overflow-visible">
                {galleryImages.map((image,index)=><button key={image} type="button" onClick={()=>setActiveGalleryImage(image)} className="group relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 md:w-auto"><img src={image} alt={`صورة ${index+1} من المتجر`} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105"/><span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10"/></button>)}
              </div>
            </section>
          )}

          {loyaltySettings && loyaltySettings.isActive && (
            <Card className="rounded-3xl border-white/10 bg-white/5">
              <CardContent className="flex flex-wrap items-center gap-6 p-5">
                <Sparkles className="h-6 w-6 text-orange-300" />
                <div className="flex-1"><h3 className="font-black">برنامج ولاء المتجر</h3><p className="mt-1 text-xs text-slate-400">اجمع {loyaltySettings.pointsPerCurrency} نقطة لكل 1 ر.س مشتريات. الحد الأدنى للاستبدال {loyaltySettings.minPointsToRedeem} نقطة.</p></div>
                <div className="flex gap-2 text-xs"><Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-300">مفعّل</Badge><Badge className="border-white/10 bg-white/5">{loyaltySettings.redeemRate} ر.س / نقطة</Badge></div>
              </CardContent>
            </Card>
          )}

          {coupons.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-black">كوبونات خصم متاحة</h2>
              <div className="flex flex-wrap gap-2">{coupons.map((coupon) => <div key={coupon.id} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5"><Tag className="h-4 w-4 text-orange-300" /><span className="font-mono text-sm font-black tracking-widest text-white">{coupon.code}</span><span className="text-xs text-emerald-300">{coupon.discountType === "percent" ? `${coupon.discountValue}%` : `${coupon.discountValue} ر.س`}</span><button type="button" onClick={() => handleCopyCode(coupon.code)} className="rounded-full p-1 text-slate-400 hover:text-white"><Copy className="h-3.5 w-3.5" /></button></div>)}</div>
            </section>
          )}

          <section>
            <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-xl font-black">المنتجات والخدمات</h2><p className="mt-1 text-xs text-slate-400">{listings.length} منتجًا معروضًا.</p></div></div><div className="sticky top-[73px] z-30 -mx-5 mb-5 flex gap-2 overflow-x-auto border-y border-white/5 bg-[#0b0f17]/95 px-5 py-3 backdrop-blur-xl [scrollbar-width:none] md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0">{categories.map(category=><button key={category} type="button" onClick={()=>setActiveCategory(category)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${activeCategory===category?"border-orange-400 bg-orange-400 text-white":"border-white/10 bg-white/5 text-slate-300 hover:border-white/25"}`}>{category}</button>)}</div>
            {listings.length === 0 ? <div className="rounded-3xl border border-dashed border-white/15 p-14 text-center text-sm text-slate-400">لا توجد منتجات نشطة في هذا المتجر بعد.</div> : <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{visibleListings.map((listing) => <Card key={listing.id} className="group overflow-hidden rounded-2xl border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-orange-400/40"><div className={`relative ${productImageRatio} overflow-hidden bg-slate-900`}>{listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} loading="lazy" className={`h-full w-full ${productImageFit} opacity-90 transition duration-500 group-hover:scale-105`} /> : <div className="grid h-full place-items-center text-sm text-slate-600"><Package className="h-8 w-8" /></div>}{listing.isFeatured ? <Badge className="absolute right-2 top-2 border-amber-400/30 bg-amber-400/20 text-amber-200"><TrendingUp className="ml-1 h-3 w-3" />مميز</Badge> : null}</div><CardContent className="p-3 md:p-4"><h3 className="line-clamp-1 text-sm font-black md:text-base">{listing.title}</h3>{listing.description ? <p className="mt-1 line-clamp-2 text-xs leading-6 text-slate-400">{listing.description}</p> : null}<div className="mt-3 flex items-center justify-between gap-2"><div className="flex items-baseline gap-2"><span className="font-black text-orange-300">{Number(listing.price).toLocaleString("en-US")} {listing.currencyCode}</span>{listing.compareAtPrice ? <><span className="text-[11px] text-slate-500 line-through">{Number(listing.compareAtPrice).toLocaleString("en-US")} {listing.currencyCode}</span><Badge className="border-rose-400/20 bg-rose-500/15 text-[9px] text-rose-300">-{Math.max(0,Math.round((1-Number(listing.price)/Number(listing.compareAtPrice))*100))}%</Badge></> : null}</div>{listing.unit ? <Badge variant="outline" className="border-white/10 text-[10px] text-slate-400">{listing.unit}</Badge> : null}</div>{listing.stockQuantity != null ? <p className="mt-2 text-[11px] text-slate-500">{listing.stockQuantity > 0 ? `متوفر: ${listing.stockQuantity}` : "نفد المخزون"}</p> : null}</CardContent></Card>)}</div>}
          </section>

          <section className="rounded-3xl border border-orange-400/20 bg-orange-400/5 p-6 text-center"><h2 className="text-lg font-black">هل أنت مالك هذا المتجر؟</h2><p className="mt-2 text-sm text-slate-300">ادخل لوحة التاجر لإدارة المنتجات، الكوبونات، الحملات، وبرنامج الولاء.</p><Link href="/store-marketing"><Button type="button" className="mt-4 rounded-xl bg-[#E76F3C] px-6 font-black hover:bg-orange-400">لوحة التاجر</Button></Link></section>
        </div>
      )}
      {activeGalleryImage && <div role="dialog" aria-modal="true" aria-label="عرض صورة المتجر" onClick={()=>setActiveGalleryImage(null)} className="fixed inset-0 z-[80] grid place-items-center bg-black/90 p-4 backdrop-blur-sm"><button type="button" onClick={()=>setActiveGalleryImage(null)} className="absolute end-4 top-4 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">إغلاق</button><img src={activeGalleryImage} alt="صورة المتجر" onClick={e=>e.stopPropagation()} className="max-h-[86vh] max-w-[94vw] rounded-2xl object-contain shadow-2xl"/></div>}
    </main>
  );
}