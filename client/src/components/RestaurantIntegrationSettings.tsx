import { useState } from "react";
import { CheckCircle2, KeyRound, LockKeyhole, Save, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function RestaurantIntegrationSettings({ restaurantId }: { restaurantId: number }) {
  const restaurant = trpc.platform.restaurantById.useQuery({ id: restaurantId }, { retry: false });
  const catalog = trpc.platform.restaurantIntegrationCatalog.useQuery({ restaurantId }, { retry: false });
  const settings = trpc.platform.integrationSettings.useQuery({ scope: "restaurant", restaurantId }, { retry: false });
  const [drafts, setDrafts] = useState<Record<string, { keyReference: string; secret: string }>>({});
  const update = trpc.platform.upsertIntegrationSetting.useMutation({
    onSuccess: async () => { toast.success("تم حفظ إعداد التكامل الخاص بالمطعم"); await settings.refetch(); },
    onError: (error) => toast.error(error.message),
  });
  const getDraft = (providerKey: string) => drafts[providerKey] ?? { keyReference: "", secret: "" };
  const setDraft = (providerKey: string, field: "keyReference" | "secret", value: string) => setDrafts((current) => ({ ...current, [providerKey]: { ...getDraft(providerKey), [field]: value } }));
  return <Card className="rounded-2xl border-violet-100 bg-gradient-to-br from-violet-50/60 via-white to-white shadow-sm" dir="rtl">
    <CardHeader className="border-b border-violet-100"><CardTitle className="flex items-center gap-2 text-base"><Settings2 className="h-5 w-5 text-violet-600" />تكاملات المطعم</CardTitle><p className="mt-1 text-xs leading-5 text-slate-500">تعمل تكاملات المنصة تلقائيًا عند اختيارها من إعدادات التسعير. استخدم هذا القسم فقط إذا اخترت «تكاملات المطعم — إعداداتي».</p></CardHeader>
    <CardContent className="space-y-3 p-5">
      {restaurant.data?.integrationMode !== "custom" && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><p className="font-black">تكاملات المنصة مفعّلة تلقائيًا</p><p className="mt-1 text-xs leading-5">لا تحتاج إلى إدخال مفاتيح هنا. إذا أردت استخدام حسابات المطعم الخاصة، غيّر مصدر التكامل إلى «إعداداتي الخاصة» من إعدادات المطعم.</p></div>}
      {restaurant.data?.integrationMode === "custom" && <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-xs leading-5 text-violet-800">المطعم يستخدم إعداداته الخاصة. لا تُدخل إلا مفاتيح مزود تملكه، وستُحفظ مشفرة على الخادم.</div>}
      {catalog.isLoading && <p className="text-sm text-slate-500">جارٍ التحقق من أهلية الباقة...</p>}
      {catalog.isError && <p className="rounded-xl bg-red-50 p-3 text-xs text-red-700">تعذر تحميل أهلية التكاملات. Request ID: restaurant-integrations-{restaurantId}</p>}
      {restaurant.data?.integrationMode === "custom" && catalog.data?.map((provider) => { const draft = getDraft(provider.providerKey); const configured = settings.data?.find((setting) => setting.providerKey === provider.providerKey)?.status === "configured"; return <div key={provider.providerKey} className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><p className="font-black text-slate-900">{provider.label}</p>{provider.paid && !provider.eligible && <LockKeyhole className="h-4 w-4 text-slate-400" aria-label="يتطلب ترقية الباقة" />}</div><p className="mt-1 text-xs text-slate-500">{provider.scopes}</p></div><div className="flex items-center gap-2">{provider.publicLogin && <Badge className="rounded-full bg-emerald-50 text-emerald-700">عام</Badge>}{provider.paid && <Badge variant="outline" className="rounded-full">{provider.eligible ? "متاح بالباقة" : "يتطلب ترقية"}</Badge>}{configured && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}</div></div>{provider.publicLogin ? <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">هذا الخيار مشترك على مستوى تسجيل الدخول ولا يحتاج مفاتيح خاصة بالمطعم.</p> : !provider.eligible ? <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">قم بترقية الباقة لتفعيل هذا التكامل، أو اترك مصدر التكامل على إعدادات المنصة.</p> : <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]"><Input value={draft.keyReference} onChange={(event) => setDraft(provider.providerKey, "keyReference", event.target.value)} placeholder="مرجع المفتاح أو اسم المتغير" aria-label={`مرجع ${provider.label}`} className="rounded-xl" /><Input value={draft.secret} onChange={(event) => setDraft(provider.providerKey, "secret", event.target.value)} placeholder="المفتاح السري — يُشفّر على الخادم" aria-label={`المفتاح السري ${provider.label}`} type="password" className="rounded-xl" /><Button type="button" disabled={update.isPending || (!draft.keyReference.trim() && !draft.secret.trim())} onClick={() => update.mutate({ scope: "restaurant", restaurantId, providerKey: provider.providerKey, category: provider.category, status: "configured", keyReference: draft.keyReference.trim() || undefined, secret: draft.secret.trim() || undefined })} className="rounded-xl bg-violet-600 hover:bg-violet-700"><Save className="me-2 h-4 w-4" />حفظ خاص</Button></div>}</div>; })}
      {!catalog.isLoading && !catalog.data?.length && <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500"><KeyRound className="mx-auto mb-2 h-5 w-5" />لا توجد تكاملات متاحة حاليًا.</div>}
    </CardContent>
  </Card>;
}

export default RestaurantIntegrationSettings;
