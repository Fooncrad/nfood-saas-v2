import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Clock3, Copy, Megaphone, MonitorPlay, Plus, Save, Sparkles, Trash2 } from "lucide-react";

type Props = { restaurantId: number; branchId?: number };

export function RestaurantDisplayMarketingPanel({ restaurantId, branchId }: Props) {
  const screens = trpc.restaurantContent.screens.useQuery({ restaurantId }, { retry: 1 });
  const menu = trpc.platform.menuItems.useQuery({ restaurantId }, { retry: 1 });
  const media = trpc.media.list.useQuery({ scope: "restaurant", restaurantId, category: "image" }, { retry: 1 });
  const campaigns = trpc.platform.campaigns.useQuery({ restaurantId }, { retry: 1 });
  const [screenName, setScreenName] = useState("");
  const [selectedScreenId, setSelectedScreenId] = useState<number>();
  const [slideItemId, setSlideItemId] = useState("");
  const [slideMediaId, setSlideMediaId] = useState("");
  const [slideTitle, setSlideTitle] = useState("");
  const [slideSubtitle, setSlideSubtitle] = useState("");
  const [slideStartsAt, setSlideStartsAt] = useState("");
  const [slideEndsAt, setSlideEndsAt] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [locale, setLocale] = useState("ar");
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const utils = trpc.useUtils();
  const activeScreen = (screens.data ?? []).find((screen) => screen.id === selectedScreenId) ?? screens.data?.[0];
  const refresh = () => void utils.restaurantContent.screens.invalidate();
  const createScreen = trpc.restaurantContent.createScreen.useMutation({ onSuccess: () => { refresh(); setScreenName(""); toast.success("تم حفظ شاشة العرض"); }, onError: (e) => toast.error(`تعذر حفظ الشاشة: ${e.message}`) });
  const updateScreen = trpc.restaurantContent.updateScreen.useMutation({ onSuccess: refresh, onError: (e) => toast.error(`تعذر تحديث الشاشة: ${e.message}`) });
  const deleteScreen = trpc.restaurantContent.deleteScreen.useMutation({ onSuccess: () => { refresh(); setSelectedScreenId(undefined); toast.success("تم حذف الشاشة"); }, onError: (e) => toast.error(`تعذر حذف الشاشة: ${e.message}`) });
  const saveSlide = trpc.restaurantContent.saveSlide.useMutation({ onSuccess: () => { refresh(); setSlideTitle(""); setSlideSubtitle(""); toast.success("تم حفظ الطبق في الشاشة"); }, onError: (e) => toast.error(`تعذر حفظ الطبق: ${e.message}`) });
  const deleteSlide = trpc.restaurantContent.deleteSlide.useMutation({ onSuccess: refresh, onError: (e) => toast.error(`تعذر حذف الطبق: ${e.message}`) });
  const saveContent = trpc.restaurantContent.saveCampaignContent.useMutation({ onSuccess: () => { setHeadline(""); setBody(""); setCallToAction(""); toast.success("تم حفظ النص كمسودة للمراجعة"); }, onError: (e) => toast.error(`تعذر حفظ النص: ${e.message}`) });
  const generateDraft = trpc.restaurantContent.generateCampaignDraft.useMutation({ onSuccess: ({ draft }) => { setHeadline(draft.headline); setBody(draft.body); setCallToAction(draft.callToAction); toast.success("تم توليد مسودة قابلة للمراجعة"); }, onError: (e) => toast.error(`تعذر توليد النص: ${e.message}`) });
  const copyDisplayLink = async (token: string) => { const url = `${window.location.origin}/display/${token}`; await navigator.clipboard?.writeText(url); toast.success("تم نسخ رابط التشغيل العام"); };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e76f3c]">Restaurant Screens & Marketing</p>
        <h2 className="mt-2 text-2xl font-black text-slate-900">شاشات المطعم والحملات</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">اربط الشاشات بالأطباق والصور الموجودة في مكتبة المطعم، وأنشئ نصوصًا تسويقية متعددة اللغات.</p>
      </div>

      <Card className="rounded-3xl border-slate-200 shadow-sm">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <div><CardTitle className="flex items-center gap-2 text-base"><MonitorPlay className="h-5 w-5 text-[#e76f3c]" /> شاشات عرض الأطباق</CardTitle><p className="mt-1 text-xs text-slate-500">قائمة شرائح مستقلة لكل شاشة، مع اختيار الصور من المكتبة.</p></div>
          <div className="flex gap-2"><Input value={screenName} onChange={(e) => setScreenName(e.target.value)} placeholder="اسم الشاشة" className="h-9 w-36 rounded-xl" /><Button onClick={() => createScreen.mutate({ restaurantId, branchId: branchId ?? null, name: screenName.trim(), status: "active", refreshSeconds: 30 })} disabled={screenName.trim().length < 2 || createScreen.isPending} className="h-9 gap-1 rounded-xl bg-[#e76f3c] text-xs"><Plus className="h-3.5 w-3.5" /> شاشة</Button></div>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-[230px_1fr]">
          <div className="space-y-2">
            {screens.isLoading && <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />}
            {screens.isError && <p className="rounded-xl bg-red-50 p-3 text-xs text-red-700">تعذر تحميل الشاشات. Request ID: screens-{restaurantId}</p>}
            {!screens.isLoading && !screens.isError && (screens.data ?? []).length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">لم تُنشأ شاشة بعد.</p>}
            {(screens.data ?? []).map((screen) => <div key={screen.id} className={`flex items-center justify-between rounded-2xl border p-3 ${activeScreen?.id === screen.id ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-white"}`}><button type="button" onClick={() => setSelectedScreenId(screen.id)} className="min-w-0 text-right"><p className="truncate text-sm font-black">{screen.name}</p><p className="mt-1 text-[11px] text-slate-500">{screen.slides.length} شرائح · {screen.status === "active" ? "نشطة" : screen.status === "paused" ? "متوقفة" : "مسودة"}</p></button><div className="flex gap-1"><button type="button" onClick={() => updateScreen.mutate({ restaurantId, id: screen.id, status: screen.status === "active" ? "paused" : "active" })} className="text-[10px] font-bold text-sky-600">{screen.status === "active" ? "إيقاف" : "تشغيل"}</button><button type="button" onClick={() => deleteScreen.mutate({ restaurantId, id: screen.id })} className="p-1 text-red-500" aria-label="حذف الشاشة"><Trash2 className="h-3.5 w-3.5" /></button></div></div>)}
          </div>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
            {!activeScreen ? <div className="flex min-h-40 items-center justify-center text-center text-sm text-slate-500">اختر شاشة أو أنشئ شاشة لإضافة الأطباق والصور.</div> : <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-black">{activeScreen.name}</p><p className="mt-1 text-xs text-slate-500">أضف طبقًا من المنيو أو صورة من المكتبة.</p></div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white px-3 py-1 text-[10px] font-mono text-slate-500">{activeScreen.deviceKey}</span><Button type="button" variant="outline" onClick={() => copyDisplayLink(activeScreen.publicToken)} className="h-8 gap-1 rounded-xl bg-white px-3 text-[10px]"><Copy className="h-3.5 w-3.5" /> نسخ رابط الشاشة</Button></div></div>
              <div className="grid gap-3 sm:grid-cols-2">
                {activeScreen.slides.map((row) => <div key={row.slide.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="h-28 bg-slate-100">{row.mediaFile?.publicUrl ? <img src={row.mediaFile.publicUrl} alt={row.slide.title ?? row.menuItem?.name ?? "طبق"} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl">🍽</div>}</div><div className="flex items-start justify-between gap-2 p-3"><div><p className="text-sm font-bold">{row.slide.title ?? row.menuItem?.name ?? "طبق من المنيو"}</p><p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{row.slide.subtitle ?? row.menuItem?.description ?? ""}</p></div><button type="button" onClick={() => deleteSlide.mutate({ restaurantId, id: row.slide.id })} className="text-red-500" aria-label="حذف الطبق"><Trash2 className="h-4 w-4" /></button></div></div>)}
              </div>
              <div className="mt-4 grid gap-2 rounded-2xl border border-white bg-white p-3 sm:grid-cols-2"><select value={slideItemId} onChange={(e) => setSlideItemId(e.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-xs"><option value="">اختر طبقًا من المنيو</option>{(menu.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select value={slideMediaId} onChange={(e) => setSlideMediaId(e.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-xs"><option value="">اختر صورة من المكتبة</option>{(media.data ?? []).map((file) => <option key={file.id} value={file.id}>{file.originalName}</option>)}</select><Input value={slideTitle} onChange={(e) => setSlideTitle(e.target.value)} placeholder="عنوان العرض (اختياري)" className="rounded-xl" /><Input value={slideSubtitle} onChange={(e) => setSlideSubtitle(e.target.value)} placeholder="وصف قصير أو عرض" className="rounded-xl" /><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3"><Clock3 className="h-4 w-4 text-slate-400" /><input type="datetime-local" value={slideStartsAt} onChange={(e) => setSlideStartsAt(e.target.value)} className="h-10 min-w-0 flex-1 text-xs outline-none" aria-label="بداية العرض" /><span className="text-[10px] text-slate-400">إلى</span><input type="datetime-local" value={slideEndsAt} onChange={(e) => setSlideEndsAt(e.target.value)} className="h-10 min-w-0 flex-1 text-xs outline-none" aria-label="نهاية العرض" /></div><select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs"><option value="">بدون حملة</option>{(campaigns.data ?? []).map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select><Button onClick={() => saveSlide.mutate({ restaurantId, screenId: activeScreen.id, menuItemId: slideItemId ? Number(slideItemId) : null, mediaFileId: slideMediaId ? Number(slideMediaId) : null, campaignId: campaignId ? Number(campaignId) : null, title: slideTitle.trim() || null, subtitle: slideSubtitle.trim() || null, sortOrder: activeScreen.slides.length, durationSeconds: 8, startsAt: slideStartsAt ? new Date(slideStartsAt) : null, endsAt: slideEndsAt ? new Date(slideEndsAt) : null, isActive: true })} disabled={saveSlide.isPending || (!slideItemId && !slideMediaId)} className="gap-2 rounded-xl bg-[#111c2e] text-xs sm:col-span-2"><Save className="h-4 w-4" /> حفظ طبق في الشاشة</Button></div>
            </>}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Megaphone className="h-5 w-5 text-[#e76f3c]" /> نصوص الحملات التسويقية</CardTitle><p className="mt-1 text-xs text-slate-500">أضف العنوان والوصف وزر الإجراء بأي لغة، ثم راجع المحتوى قبل اعتماده.</p></CardHeader>
        <CardContent><div className="grid gap-3 rounded-2xl bg-orange-50/60 p-4 sm:grid-cols-2 lg:grid-cols-3"><select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="h-10 rounded-xl border border-orange-100 bg-white px-3 text-xs"><option value="">اختر الحملة</option>{(campaigns.data ?? []).map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select><select value={locale} onChange={(e) => setLocale(e.target.value)} className="h-10 rounded-xl border border-orange-100 bg-white px-3 text-xs"><option value="ar">العربية</option><option value="en">English</option><option value="fr">Français</option><option value="ur">اردو</option></select><Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="العنوان التسويقي" className="rounded-xl bg-white" /><textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="النص التسويقي والوصف" className="min-h-24 rounded-xl border border-orange-100 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-orange-200" /><Input value={callToAction} onChange={(e) => setCallToAction(e.target.value)} placeholder="زر الإجراء: اطلب الآن" className="rounded-xl bg-white" /><div className="flex gap-2 lg:col-span-3"><Button onClick={() => generateDraft.mutate({ restaurantId, campaignId: Number(campaignId), menuItemId: slideItemId ? Number(slideItemId) : null, locale: locale as "ar" | "en" | "fr" | "ur", tone: "friendly" })} disabled={generateDraft.isPending || !campaignId} className="gap-2 rounded-xl bg-emerald-600 text-xs"><Sparkles className="h-4 w-4" /> {generateDraft.isPending ? "جارٍ التوليد…" : "توليد بالذكاء الاصطناعي"}</Button><Button onClick={() => saveContent.mutate({ restaurantId, campaignId: Number(campaignId), locale: locale as "ar" | "en" | "fr" | "ur", headline: headline.trim(), body: body.trim() || null, callToAction: callToAction.trim() || null, menuItemId: slideItemId ? Number(slideItemId) : null, mediaFileId: slideMediaId ? Number(slideMediaId) : null, sortOrder: 0, isApproved: false })} disabled={saveContent.isPending || !campaignId || headline.trim().length < 2} className="gap-2 rounded-xl bg-[#e76f3c] text-xs"><Save className="h-4 w-4" /> حفظ النص للمراجعة</Button></div></div><p className="mt-3 text-[11px] leading-5 text-slate-500">النصوص الجديدة تُحفظ كمسودة مراجعة ولا تُنشر تلقائيًا قبل الاعتماد.</p></CardContent>
      </Card>
    </div>
  );
}
