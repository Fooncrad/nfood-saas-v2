import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Check, Copy, Gift, LayoutDashboard, Loader2, LockKeyhole, Megaphone, Package, Plus, Settings, Sparkles, Tag, Trash2, TrendingUp, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

const CAMPAIGN_TYPES = ["general", "seasonal", "referral_boost", "loyalty_boost", "flash_sale"] as const;

export default function StoreMarketing() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"products" | "coupons" | "campaigns" | "loyalty" | "referrals">("products");

  const provider = trpc.marketplace.providerStore.useQuery(undefined, { retry: false, enabled: Boolean(user) });
  const publicSectors = trpc.marketplace.publicSectors.useQuery(undefined, { retry: false });

  const createListing = trpc.marketplace.createListing.useMutation({ onSuccess: () => { toast.success("تم إضافة المنتج"); void provider.refetch(); } , onError: (e) => toast.error(e.message) });
  const setListingStatus = trpc.marketplace.setListingStatus.useMutation({ onSuccess: () => { void provider.refetch(); }, onError: (e) => toast.error(e.message) });
  const updateLoyaltySettings = trpc.marketplace.updateLoyaltySettings.useMutation({ onSuccess: () => { toast.success("تم حفظ إعدادات الولاء"); void provider.refetch(); }, onError: (e) => toast.error(e.message) });
  const createCoupon = trpc.marketplace.createCoupon.useMutation({ onSuccess: () => { toast.success("تم إنشاء الكوبون"); void provider.refetch(); setNewCoupon({ code: "", description: "", discountType: "percent", discountValue: "", minOrderAmount: "0", maxDiscountAmount: "", usageLimit: "", perUserLimit: "1" }); }, onError: (e) => toast.error(e.message) });
  const toggleCoupon = trpc.marketplace.toggleCoupon.useMutation({ onSuccess: () => { void provider.refetch(); }, onError: (e) => toast.error(e.message) });
  const deleteCoupon = trpc.marketplace.toggleCoupon.useMutation({ onSuccess: () => { toast.success("تم حذف الكوبون"); void provider.refetch(); }, onError: (e) => toast.error(e.message) });
  const createCampaign = trpc.marketplace.createCampaign.useMutation({ onSuccess: () => { toast.success("تم إنشاء الحملة"); void provider.refetch(); setNewCampaign({ name: "", description: "", type: "general", bonusPoints: "", bonusPercent: "" }); }, onError: (e) => toast.error(e.message) });
  const endCampaign = trpc.marketplace.endCampaign.useMutation({ onSuccess: () => { toast.success("تم إنهاء الحملة"); void provider.refetch(); }, onError: (e) => toast.error(e.message) });
  const createReferralLink = trpc.marketplace.createReferralLink.useMutation({ onSuccess: (data) => { toast.success("تم إنشاء رابط الإحالة"); void provider.refetch(); setLastReferralCode(data.code); setNewReferral({ maxUses: "", expiresAt: "" }); }, onError: (e) => toast.error(e.message) });
  const toggleReferralLink = trpc.marketplace.toggleReferralLink.useMutation({ onSuccess: () => { void provider.refetch(); }, onError: (e) => toast.error(e.message) });

  const [newCoupon, setNewCoupon] = useState({ code: "", description: "", discountType: "percent" as "percent" | "fixed", discountValue: "", minOrderAmount: "0", maxDiscountAmount: "", usageLimit: "", perUserLimit: "1" });
  const [newCampaign, setNewCampaign] = useState({ name: "", description: "", type: "general" as typeof CAMPAIGN_TYPES[number], bonusPoints: "", bonusPercent: "" });
  const [newReferral, setNewReferral] = useState({ maxUses: "", expiresAt: "" });
  const [lastReferralCode, setLastReferralCode] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ sectorId: 0, title: "", titleEn: "", description: "", descriptionEn: "", imageUrl: "", price: "", compareAtPrice: "", unit: "piece", stockQuantity: "" });
  const [newLoyalty, setNewLoyalty] = useState({ pointsPerCurrency: "1", redeemRate: "0.01", minPointsToRedeem: "100", welcomeBonusPoints: "0", isActive: true });

  useEffect(() => { if (!loading && user && !provider.isLoading && !provider.data?.entity) navigate("/"); }, [loading, user, provider.isLoading, provider.data?.entity, navigate]);

  const entity = provider.data?.entity;
  const listings = provider.data?.listings ?? [];
  const coupons = provider.data?.coupons ?? [];
  const campaigns = provider.data?.campaigns ?? [];
  const referralLinks = provider.data?.referralLinks ?? [];
  const loyaltySettings = provider.data?.loyaltySettings;

  if (loading) return <main dir="rtl" className="min-h-screen bg-[#0b0f17] text-white" />;
  if (!user) { navigate("/login?next=%2Fstore-marketing", { replace: true }); return null; }
  if (provider.isLoading) return <main dir="rtl" className="min-h-screen bg-[#0b0f17] text-white"><div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-orange-400" /></div></main>;
  if (!entity) return null;

  const handleCreateListing = () => {
    if (!newProduct.sectorId) return toast.error("اختر القطاع أولاً");
    if (!newProduct.title.trim()) return toast.error("أدخل اسم المنتج");
    if (!newProduct.price || Number(newProduct.price) <= 0) return toast.error("أدخل سعر صحيح");
    createListing.mutate({ entityId: entity!.id, sectorId: newProduct.sectorId, title: newProduct.title.trim(), titleEn: newProduct.titleEn.trim() || undefined, description: newProduct.description.trim() || undefined, descriptionEn: newProduct.descriptionEn.trim() || undefined, imageUrl: newProduct.imageUrl.trim() || undefined, price: Number(newProduct.price).toFixed(2), compareAtPrice: newProduct.compareAtPrice ? Number(newProduct.compareAtPrice).toFixed(2) : undefined, unit: newProduct.unit.trim() || "piece", stockQuantity: newProduct.stockQuantity ? parseInt(newProduct.stockQuantity) : undefined });
    setNewProduct({ sectorId: 0, title: "", titleEn: "", description: "", descriptionEn: "", imageUrl: "", price: "", compareAtPrice: "", unit: "piece", stockQuantity: "" });
  };

  const handleCreateCoupon = () => {
    if (!newCoupon.code.trim()) return toast.error("أدخل كود الكوبون");
    if (!newCoupon.discountValue || Number(newCoupon.discountValue) <= 0) return toast.error("أدخل قيمة الخصم");
    createCoupon.mutate({ entityId: entity!.id, code: newCoupon.code.trim(), description: newCoupon.description.trim() || undefined, discountType: newCoupon.discountType, discountValue: Number(newCoupon.discountValue).toFixed(2), minOrderAmount: Number(newCoupon.minOrderAmount || "0").toFixed(2), maxDiscountAmount: newCoupon.maxDiscountAmount ? Number(newCoupon.maxDiscountAmount).toFixed(2) : undefined, usageLimit: newCoupon.usageLimit ? parseInt(newCoupon.usageLimit) : undefined, perUserLimit: parseInt(newCoupon.perUserLimit || "1") || 1 });
  };

  const handleCreateCampaign = () => {
    if (!newCampaign.name.trim()) return toast.error("أدخل اسم الحملة");
    createCampaign.mutate({ entityId: entity!.id, name: newCampaign.name.trim(), description: newCampaign.description.trim() || undefined, type: newCampaign.type, bonusPoints: newCampaign.bonusPoints ? parseInt(newCampaign.bonusPoints) : undefined, bonusPercent: newCampaign.bonusPercent || undefined });
  };

  const handleSaveLoyalty = () => {
    if (Number(newLoyalty.pointsPerCurrency) <= 0) return toast.error("نقاط لكل وحدة يجب أن تكون أكبر من صفر");
    if (Number(newLoyalty.redeemRate) <= 0) return toast.error("سعر الاستبدال يجب أن يكون أكبر من صفر");
    updateLoyaltySettings.mutate({ entityId: entity!.id, pointsPerCurrency: Number(newLoyalty.pointsPerCurrency).toFixed(2), redeemRate: Number(newLoyalty.redeemRate).toFixed(4), minPointsToRedeem: parseInt(newLoyalty.minPointsToRedeem) || 0, welcomeBonusPoints: parseInt(newLoyalty.welcomeBonusPoints) || 0, isActive: newLoyalty.isActive });
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text).then(() => toast.success("تم النسخ")).catch(() => toast.error("تعذر النسخ")); };

  const TABS = [
    { key: "products" as const, label: "المنتجات", icon: Package },
    { key: "coupons" as const, label: "الكوبونات", icon: Tag },
    { key: "campaigns" as const, label: "الحملات", icon: Megaphone },
    { key: "loyalty" as const, label: "الولاء", icon: Sparkles },
    { key: "referrals" as const, label: "الإحالات", icon: WalletCards },
  ];

  return (
    <main dir="rtl" className="min-h-screen bg-[#0b0f17] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0f17]/90 px-5 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <Link href="/marketplace"><Button type="button" variant="ghost" className="rounded-xl text-slate-300 hover:bg-white/10 hover:text-white"><ArrowRight className="ml-2 h-4 w-4" />العودة للسوق</Button></Link>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E76F3C] text-lg font-black text-white">N</span>
          <div className="flex items-center gap-2">
            <strong className="text-sm tracking-[.12em]">NFOOD · لوحة التاجر</strong>
            <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-300">{entity.customerName}</Badge>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href={`/store/${entity.id}`}><Button type="button" variant="ghost" className="rounded-xl text-slate-300 hover:bg-white/10 hover:text-white"><LayoutDashboard className="ml-2 h-4 w-4" />عرض المتجر العام</Button></Link>
            <Link href="/"><Button type="button" variant="outline" className="rounded-xl border-white/15 text-white hover:bg-white/10">الرئيسية</Button></Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-8 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} type="button" onClick={() => setActiveTab(key)} className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${activeTab === key ? "bg-[#E76F3C] text-white" : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>

        {/* ── Products Tab ─────────────────────────────────────────────────── */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <Card className="rounded-3xl border-white/10 bg-white/5">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Plus className="h-5 w-5 text-[#E76F3C]" />إضافة منتج جديد</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">القطاع *</label>
                    <select value={newProduct.sectorId || ""} onChange={(e) => setNewProduct({ ...newProduct, sectorId: parseInt(e.target.value) || 0 })} className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white">
                      <option value="">اختر القطاع...</option>
                      {(publicSectors.data ?? []).filter((s) => s.isActive).map((sector) => (<option key={sector.id} value={sector.id}>{sector.labelAr}</option>))}
                    </select>
                  </div>
                  <div><label className="mb-1 block text-xs text-slate-400">اسم المنتج (عربي) *</label><Input value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="اسم المنتج" /></div>
                  <div><label className="mb-1 block text-xs text-slate-400">اسم المنتج (إنجليزي)</label><Input value={newProduct.titleEn} onChange={(e) => setNewProduct({ ...newProduct, titleEn: e.target.value })} className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="Product name" /></div>
                  <div><label className="mb-1 block text-xs text-slate-400">السعر (ر.س) *</label><Input value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} type="number" min="0" step="0.01" className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="0.00" /></div>
                  <div><label className="mb-1 block text-xs text-slate-400">سعر المقارنة (ر.س)</label><Input value={newProduct.compareAtPrice} onChange={(e) => setNewProduct({ ...newProduct, compareAtPrice: e.target.value })} type="number" min="0" step="0.01" className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="اختياري" /></div>
                  <div><label className="mb-1 block text-xs text-slate-400">الوحدة</label><Input value={newProduct.unit} onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })} className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="piece" /></div>
                  <div><label className="mb-1 block text-xs text-slate-400">المخزون</label><Input value={newProduct.stockQuantity} onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })} type="number" min="0" className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="اختياري" /></div>
                  <div><label className="mb-1 block text-xs text-slate-400">رابط الصورة</label><Input value={newProduct.imageUrl} onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="https://..." /></div>
                </div>
                <div><label className="mb-1 block text-xs text-slate-400">الوصف (عربي)</label><Textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} rows={2} className="rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="وصف المنتج..." /></div>
                <div><label className="mb-1 block text-xs text-slate-400">الوصف (إنجليزي)</label><Textarea value={newProduct.descriptionEn} onChange={(e) => setNewProduct({ ...newProduct, descriptionEn: e.target.value })} rows={2} className="rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="Product description..." /></div>
                <Button type="button" onClick={handleCreateListing} disabled={createListing.isPending || !newProduct.sectorId} className="rounded-xl bg-[#E76F3C] px-6 font-black hover:bg-orange-400">{createListing.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="ml-1 h-4 w-4" />إضافة المنتج</>}</Button>
              </CardContent>
            </Card>

            <section>
              <h2 className="mb-4 text-lg font-black">المنتجات الحالية ({listings.length})</h2>
              {listings.length === 0 ? <div className="rounded-3xl border border-dashed border-white/15 p-14 text-center text-sm text-slate-400">لا توجد منتجات بعد — أضف أول منتج أعلاه.</div> : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {listings.map((listing) => {
                    const isActive = listing.status === "active";
                    return (
                      <Card key={listing.id} className="overflow-hidden rounded-3xl border-white/10 bg-white/5">
                        {listing.imageUrl && <div className="relative aspect-[16/9] overflow-hidden bg-slate-900"><img src={listing.imageUrl} alt={listing.title} loading="lazy" className="h-full w-full object-cover opacity-80" />{listing.isFeatured ? <Badge className="absolute right-2 top-2 border-amber-400/30 bg-amber-400/20 text-amber-200"><TrendingUp className="ml-1 h-3 w-3" />مميز</Badge> : null}</div>}
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="line-clamp-1 font-black">{listing.title}</h3>
                              {listing.titleEn ? <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{listing.titleEn}</p> : null}
                            </div>
                            <Badge className={`shrink-0 ${isActive ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-amber-400/20 bg-amber-400/10 text-amber-300"}`}>{listing.status === "active" ? "نشط" : listing.status === "draft" ? "مسودة" : listing.status === "paused" ? "متوقف" : "نفد"}</Badge>
                          </div>
                          <div className="flex items-baseline gap-2"><span className="font-black text-orange-300">{Number(listing.price).toLocaleString("en-US")} {listing.currencyCode}</span>{listing.compareAtPrice ? <span className="text-xs text-slate-500 line-through">{Number(listing.compareAtPrice).toLocaleString("en-US")}</span> : null}</div>
                          {listing.stockQuantity != null ? <p className="text-[11px] text-slate-500">{listing.stockQuantity > 0 ? `متوفر: ${listing.stockQuantity}` : "نفد المخزون"}</p> : null}
                          <div className="flex gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => setListingStatus.mutate({ id: listing.id, status: isActive ? "draft" : "active" })} disabled={setListingStatus.isPending} className="flex-1 rounded-xl border-white/15 text-xs">{isActive ? "إخفاء" : "نشر"}</Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => { setNewProduct({ ...newProduct, sectorId: listing.sectorId, title: listing.title, titleEn: listing.titleEn ?? "", description: listing.description ?? "", descriptionEn: listing.descriptionEn ?? "", imageUrl: listing.imageUrl ?? "", price: String(listing.price), compareAtPrice: listing.compareAtPrice ? String(listing.compareAtPrice) : "", unit: listing.unit, stockQuantity: listing.stockQuantity != null ? String(listing.stockQuantity) : "" }); setActiveTab("products"); toast.info("تم تحميل بيانات المنتج — عدّلها ثم اضغط حفظ."); }} className="flex-1 rounded-xl border-white/15 text-xs"><Settings className="ml-1 h-3 w-3" />تعديل</Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── Coupons Tab ─────────────────────────────────────────────────── */}
        {activeTab === "coupons" && (
          <div className="space-y-6">
            <Card className="rounded-3xl border-white/10 bg-white/5">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Plus className="h-5 w-5 text-[#E76F3C]" />إنشاء كوبون خصم جديد</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div><label className="mb-1 block text-xs text-slate-400">الكود *</label><Input value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} className="h-11 rounded-xl border-white/10 bg-white/5 font-mono uppercase text-white placeholder:text-slate-500" placeholder="SAVE10" /></div>
                  <div><label className="mb-1 block text-xs text-slate-400">نوع الخصم</label><select value={newCoupon.discountType} onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as "percent" | "fixed" })} className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"><option value="percent">نسبة مئوية (%)</option><option value="fixed">مبلغ ثابت (ر.س)</option></select></div>
                  <div><label className="mb-1 block text-xs text-slate-400">قيمة الخصم *</label><Input value={newCoupon.discountValue} onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })} type="number" min="0" step="0.01" className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="10" /></div>
                  <div><label className="mb-1 block text-xs text-slate-400">الحد الأدنى للطلب (ر.س)</label><Input value={newCoupon.minOrderAmount} onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: e.target.value })} type="number" min="0" className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="0" /></div>
                  <div><label className="mb-1 block text-xs text-slate-400">الخصم الأقصى (ر.س)</label><Input value={newCoupon.maxDiscountAmount} onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscountAmount: e.target.value })} type="number" min="0" className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="اختياري" /></div>
                  <div><label className="mb-1 block text-xs text-slate-400">حد الاستخدام الكلي</label><Input value={newCoupon.usageLimit} onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })} type="number" min="1" className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="بدون حد" /></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1 block text-xs text-slate-400">الحد لكل مستخدم</label><Input value={newCoupon.perUserLimit} onChange={(e) => setNewCoupon({ ...newCoupon, perUserLimit: e.target.value })} type="number" min="1" className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" /></div><div><label className="mb-1 block text-xs text-slate-400">الوصف</label><Input value={newCoupon.description} onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })} className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="اختياري" /></div></div>
                <Button type="button" onClick={handleCreateCoupon} disabled={createCoupon.isPending} className="rounded-xl bg-[#E76F3C] px-6 font-black hover:bg-orange-400">{createCoupon.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="ml-1 h-4 w-4" />إنشاء الكوبون</>}</Button>
              </CardContent>
            </Card>

            <section>
              <h2 className="mb-4 text-lg font-black">الكوبونات الحالية ({coupons.length})</h2>
              {coupons.length === 0 ? <div className="rounded-3xl border border-dashed border-white/15 p-14 text-center text-sm text-slate-400">لا توجد كوبونات بعد.</div> : (
                <div className="space-y-3">
                  {coupons.map((coupon) => (
                    <Card key={coupon.id} className="rounded-3xl border-white/10 bg-white/5">
                      <CardContent className="flex flex-wrap items-center gap-4 p-4">
                        <div className="flex items-center gap-2"><Tag className="h-4 w-4 text-orange-300" /><span className="font-mono text-sm font-black tracking-widest">{coupon.code}</span></div>
                        <Badge className={coupon.isActive ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-slate-400/20 bg-slate-400/10 text-slate-400"}>{coupon.isActive ? "نشط" : "معطّل"}</Badge>
                        <span className="text-sm text-white">{coupon.discountType === "percent" ? `${coupon.discountValue}%` : `${coupon.discountValue} ر.س`}</span>
                        <span className="text-xs text-slate-500">حد لكل مستخدم: {coupon.perUserLimit} · استخدامات: {coupon.useCount}/{coupon.usageLimit ?? "∞"}</span>
                        {coupon.description ? <span className="text-xs text-slate-400">{coupon.description}</span> : null}
                        <div className="mr-auto flex gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => toggleCoupon.mutate({ id: coupon.id, isActive: !coupon.isActive })} disabled={toggleCoupon.isPending} className="rounded-xl border-white/15 text-xs">{coupon.isActive ? "تعطيل" : "تفعيل"}</Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => { if (confirm(`هل تريد حذف الكوبون ${coupon.code}؟`)) deleteCoupon.mutate({ id: coupon.id, isActive: false }); }} className="rounded-xl border-rose-400/30 text-xs text-rose-300 hover:bg-rose-400/10"><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── Campaigns Tab ────────────────────────────────────────────────── */}
        {activeTab === "campaigns" && (
          <div className="space-y-6">
            <Card className="rounded-3xl border-white/10 bg-white/5">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Plus className="h-5 w-5 text-[#E76F3C]" />إنشاء حملة جديدة</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="mb-1 block text-xs text-slate-400">اسم الحملة *</label><Input value={newCampaign.name} onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })} className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="حملة الصيف" /></div>
                  <div><label className="mb-1 block text-xs text-slate-400">النوع</label><select value={newCampaign.type} onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as typeof CAMPAIGN_TYPES[number] })} className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white">{CAMPAIGN_TYPES.map((t) => <option key={t} value={t}>{t === "general" ? "عامة" : t === "seasonal" ? "موسمية" : t === "referral_boost" ? "تعزيز إحالة" : t === "loyalty_boost" ? "تعزيز ولاء" : "عرض سريع"}</option>)}</select></div>
                </div>
                <div><label className="mb-1 block text-xs text-slate-400">الوصف</label><Textarea value={newCampaign.description} onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })} rows={2} className="rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="وصف الحملة..." /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="mb-1 block text-xs text-slate-400">نقاط إضافية</label><Input value={newCampaign.bonusPoints} onChange={(e) => setNewCampaign({ ...newCampaign, bonusPoints: e.target.value })} type="number" min="0" className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="0" /></div>
                  <div><label className="mb-1 block text-xs text-slate-400">نسبة إضافية (%)</label><Input value={newCampaign.bonusPercent} onChange={(e) => setNewCampaign({ ...newCampaign, bonusPercent: e.target.value })} type="number" min="0" step="0.01" className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="0" /></div>
                </div>
                <Button type="button" onClick={handleCreateCampaign} disabled={createCampaign.isPending} className="rounded-xl bg-[#E76F3C] px-6 font-black hover:bg-orange-400">{createCampaign.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="ml-1 h-4 w-4" />إنشاء الحملة</>}</Button>
              </CardContent>
            </Card>

            <section>
              <h2 className="mb-4 text-lg font-black">الحملات الحالية ({campaigns.length})</h2>
              {campaigns.length === 0 ? <div className="rounded-3xl border border-dashed border-white/15 p-14 text-center text-sm text-slate-400">لا توجد حملات بعد.</div> : (
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="rounded-3xl border-white/10 bg-white/5">
                      <CardContent className="flex flex-wrap items-center gap-4 p-4">
                        <Megaphone className="h-5 w-5 text-orange-300" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2"><h3 className="font-black">{campaign.name}</h3><Badge className="border-white/10 bg-white/5 text-[10px]">{campaign.type}</Badge></div>
                          {campaign.description ? <p className="mt-1 line-clamp-1 text-xs text-slate-400">{campaign.description}</p> : null}
                          <p className="mt-1 text-[11px] text-slate-500">{campaign.bonusPoints ? `+${campaign.bonusPoints} نقاط` : ""}{campaign.bonusPoints && campaign.bonusPercent !== "0" ? " · " : ""}{campaign.bonusPercent !== "0" ? `+${campaign.bonusPercent}%` : ""}</p>
                        </div>
                        <Badge className={campaign.status === "active" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : campaign.status === "ended" ? "border-slate-400/20 bg-slate-400/10 text-slate-400" : "border-amber-400/20 bg-amber-400/10 text-amber-300"}>{campaign.status === "active" ? "نشطة" : campaign.status === "ended" ? "منتهية" : campaign.status}</Badge>
                        {campaign.status === "active" ? <Button type="button" size="sm" variant="outline" onClick={() => { if (confirm("هل تريد إنهاء الحملة؟")) endCampaign.mutate({ id: campaign.id }); }} disabled={endCampaign.isPending} className="rounded-xl border-rose-400/30 text-xs text-rose-300 hover:bg-rose-400/10">إنهاء</Button> : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── Loyalty Tab ──────────────────────────────────────────────────── */}
        {activeTab === "loyalty" && (
          <div className="space-y-6">
            <Card className="rounded-3xl border-white/10 bg-white/5">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-5 w-5 text-[#E76F3C]" />إعدادات برنامج الولاء</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="mb-1 block text-xs text-slate-400">نقاط لكل وحدة عملة (ر.س)</label><Input value={newLoyalty.pointsPerCurrency} onChange={(e) => setNewLoyalty({ ...newLoyalty, pointsPerCurrency: e.target.value })} type="number" min="0.01" step="0.01" className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="1.00" /></div>
                  <div><label className="mb-1 block text-xs text-slate-400">سعر الاستبدال (ر.س لكل نقطة)</label><Input value={newLoyalty.redeemRate} onChange={(e) => setNewLoyalty({ ...newLoyalty, redeemRate: e.target.value })} type="number" min="0.0001" step="0.0001" className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="0.01" /></div>
                  <div><label className="mb-1 block text-xs text-slate-400">الحد الأدنى للاستبدال (نقطة)</label><Input value={newLoyalty.minPointsToRedeem} onChange={(e) => setNewLoyalty({ ...newLoyalty, minPointsToRedeem: e.target.value })} type="number" min="0" className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="100" /></div>
                  <div><label className="mb-1 block text-xs text-slate-400">نقاط الترحيب</label><Input value={newLoyalty.welcomeBonusPoints} onChange={(e) => setNewLoyalty({ ...newLoyalty, welcomeBonusPoints: e.target.value })} type="number" min="0" className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="0" /></div>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setNewLoyalty({ ...newLoyalty, isActive: !newLoyalty.isActive })} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${newLoyalty.isActive ? "bg-[#E76F3C]" : "bg-white/20"}`}><span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${newLoyalty.isActive ? "translate-x-1" : "translate-x-6"}`} /></button>
                  <span className="text-sm text-white">{newLoyalty.isActive ? "برنامج الولاء مفعّل" : "برنامج الولاء معطّل"}</span>
                </div>
                <Button type="button" onClick={handleSaveLoyalty} disabled={updateLoyaltySettings.isPending} className="rounded-xl bg-[#E76F3C] px-6 font-black hover:bg-orange-400">{updateLoyaltySettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="ml-1 h-4 w-4" />حفظ الإعدادات</>}</Button>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-white/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-3"><Sparkles className="h-6 w-6 text-orange-300" /><div><h3 className="font-black">ملخص برنامج الولاء</h3><p className="mt-1 text-xs text-slate-400">{loyaltySettings?.isActive ? `مفعّل — ${loyaltySettings.pointsPerCurrency} نقطة لكل 1 ر.س، الحد الأدنى ${loyaltySettings.minPointsToRedeem} نقطة، سعر الاستبدال ${loyaltySettings.redeemRate} ر.س/نقطة` : "معطّل حاليًا."}</p></div></div>
                <div className="mt-4 flex gap-4 text-xs"><Badge className="border-white/10 bg-white/5 text-orange-200">{provider.data?.rewardTransactionCount ?? 0} معاملة مكافآت</Badge><Badge className="border-white/10 bg-white/5 text-emerald-300">{coupons.length} كوبون نشط</Badge><Badge className="border-white/10 bg-white/5 text-sky-300">{campaigns.length} حملة</Badge></div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Referrals Tab ─────────────────────────────────────────────────── */}
        {activeTab === "referrals" && (
          <div className="space-y-6">
            <Card className="rounded-3xl border-white/10 bg-white/5">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Plus className="h-5 w-5 text-[#E76F3C]" />إنشاء رابط إحالة جديد</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs leading-6 text-emerald-200">روابط الإحالة تُستخدم لتسجيل الزوار عبر كود خاص. عند فتح المتجر عبر الرابط، يتم تسجيل الزائر تلقائيًا.</div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="mb-1 block text-xs text-slate-400">الحد الأقصى للاستخدامات</label><Input value={newReferral.maxUses} onChange={(e) => setNewReferral({ ...newReferral, maxUses: e.target.value })} type="number" min="1" className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="بدون حد" /></div>
                  <div><label className="mb-1 block text-xs text-slate-400">تاريخ الانتهاء</label><Input value={newReferral.expiresAt} onChange={(e) => setNewReferral({ ...newReferral, expiresAt: e.target.value })} type="datetime-local" className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" /></div>
                </div>
                <Button type="button" onClick={() => { createReferralLink.mutate({ entityId: entity!.id, maxUses: newReferral.maxUses ? parseInt(newReferral.maxUses) : undefined, expiresAt: newReferral.expiresAt ? new Date(newReferral.expiresAt).toISOString() : undefined }); }} disabled={createReferralLink.isPending} className="rounded-xl bg-[#E76F3C] px-6 font-black hover:bg-orange-400">{createReferralLink.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="ml-1 h-4 w-4" />إنشاء الرابط</>}</Button>
                {lastReferralCode && <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3"><span className="font-mono text-sm font-black tracking-wider text-emerald-200">{lastReferralCode}</span><Button type="button" size="sm" variant="outline" onClick={() => copyToClipboard(`${window.location.origin}/store/${entity!.id}?rf=${lastReferralCode}`)} className="rounded-lg border-emerald-400/30 text-xs"><Copy className="ml-1 h-3.5 w-3.5" />نسخ الرابط</Button></div>}
              </CardContent>
            </Card>

            <section>
              <h2 className="mb-4 text-lg font-black">روابط الإحالة ({referralLinks.length})</h2>
              {referralLinks.length === 0 ? <div className="rounded-3xl border border-dashed border-white/15 p-14 text-center text-sm text-slate-400">لا توجد روابط إحالة بعد.</div> : (
                <div className="space-y-3">
                  {referralLinks.map((link) => (
                    <Card key={link.id} className="rounded-3xl border-white/10 bg-white/5">
                      <CardContent className="flex flex-wrap items-center gap-4 p-4">
                        <div className="flex items-center gap-2"><WalletCards className="h-4 w-4 text-orange-300" /><span className="font-mono text-sm font-black tracking-wider">{link.code}</span></div>
                        <Badge className={link.isActive ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-slate-400/20 bg-slate-400/10 text-slate-400"}>{link.isActive ? "نشط" : "معطّل"}</Badge>
                        <span className="text-xs text-slate-500">استخدامات: {link.useCount}/{link.maxUses ?? "∞"}</span>
                        {link.expiresAt ? <span className="text-[11px] text-slate-500">ينتهي: {new Date(link.expiresAt).toLocaleDateString("ar-SA")}</span> : null}
                        <div className="mr-auto flex gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => copyToClipboard(`${window.location.origin}/store/${entity!.id}?rf=${link.code}`)} className="rounded-xl border-white/15 text-xs"><Copy className="ml-1 h-3 w-3" />نسخ</Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => toggleReferralLink.mutate({ id: link.id, isActive: !link.isActive })} disabled={toggleReferralLink.isPending} className="rounded-xl border-white/15 text-xs">{link.isActive ? "تعطيل" : "تفعيل"}</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <footer className="mx-auto max-w-7xl px-5 pb-14 md:px-8"><div className="rounded-3xl border border-orange-400/20 bg-orange-400/5 p-8 text-center"><p className="text-xs text-slate-300">لوحة التاجر — إدارة المنتجات، الكوبونات، الحملات، الولاء، وروابط الإحالة.</p></div></footer>
    </main>
  );
}
