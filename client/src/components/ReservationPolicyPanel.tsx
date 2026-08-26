import { useEffect, useState } from "react";
import { Info, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

type Props = { restaurantId: number };

export function ReservationPolicyPanel({ restaurantId }: Props) {
  const utils = trpc.useUtils();
  const branding = trpc.platform.branding.useQuery({ restaurantId }, { enabled: Boolean(restaurantId), retry: false });
  const [draft, setDraft] = useState({ reservationEnabled: true, tipsEnabled: false, tipPercent: 0, serviceFeeEnabled: false, serviceFeePercent: 0, reservationNoShowGraceMinutes: 10 });
  useEffect(() => {
    if (!branding.data) return;
    setDraft({
      reservationEnabled: branding.data.reservationEnabled !== false,
      tipsEnabled: Boolean(branding.data.tipsEnabled),
      tipPercent: Number(branding.data.tipPercent ?? 0),
      serviceFeeEnabled: Boolean(branding.data.serviceFeeEnabled),
      serviceFeePercent: Number(branding.data.serviceFeePercent ?? 0),
      reservationNoShowGraceMinutes: Number(branding.data.reservationNoShowGraceMinutes ?? 10),
    });
  }, [branding.data]);
  const update = trpc.platform.updateBranding.useMutation({
    onSuccess: async () => { await utils.platform.branding.invalidate({ restaurantId }); toast.success("تم حفظ إعدادات الحجوزات والرسوم"); },
    onError: (error) => toast.error(`تعذر حفظ إعدادات الحجوزات: ${error.message}`),
  });
  const save = () => {
    if (!branding.data) return;
    const payload = { ...branding.data, ...draft, restaurantId, menuDisplaySettingsJson: branding.data.menuDisplaySettingsJson ?? undefined, brandLogoUrl: branding.data.brandLogoUrl ?? "", pwaInstallMessage: branding.data.pwaInstallMessage ?? "ثبّت منيو مطعمنا للوصول الأسرع", pwaInstallIconUrl: branding.data.pwaInstallIconUrl ?? "", brandDescription: branding.data.brandDescription ?? "", homepageContent: branding.data.homepageContent ?? "", termsOfService: branding.data.termsOfService ?? "", privacyPolicy: branding.data.privacyPolicy ?? "", refundPolicy: branding.data.refundPolicy ?? "", phone: branding.data.phone ?? "", whatsapp: branding.data.whatsapp ?? "", address: branding.data.address ?? "", tipPercent: Math.max(0, Math.min(100, draft.tipPercent)), serviceFeePercent: Math.max(0, Math.min(100, draft.serviceFeePercent)), reservationNoShowGraceMinutes: Math.max(1, Math.min(120, draft.reservationNoShowGraceMinutes)) };
    update.mutate(payload);
  };
  const Help = ({ children }: { children: string }) => <span className="mt-1 flex items-start gap-1 text-[11px] font-normal leading-5 text-slate-500"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />{children}</span>;
  return <Card dir="rtl" className="rounded-3xl border-indigo-100 bg-indigo-50/30 shadow-sm" data-reservation-policy-panel>
    <CardHeader><CardTitle className="text-base">استقبال الحجوزات والرسوم</CardTitle><p className="text-xs leading-5 text-slate-500">تُدار هذه الخيارات هنا لأنها تؤثر مباشرة في الحجز والفاتورة. إعدادات السائقين التشغيلية تبقى في قسم السائقين.</p></CardHeader>
    <CardContent className="space-y-4">
      {branding.isLoading ? <div className="rounded-2xl bg-white p-4 text-sm text-slate-500">جارٍ تحميل إعدادات الحجوزات...</div> : branding.isError ? <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">تعذر تحميل إعدادات الحجوزات. حاول تحديث الصفحة.</div> : <>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold"><span className="flex items-center gap-3"><input type="checkbox" checked={draft.reservationEnabled} onChange={(e) => setDraft({ ...draft, reservationEnabled: e.target.checked })} className="h-4 w-4 accent-indigo-600" /> استقبال الحجوزات العامة</span><Help>فعّلها ليتمكن العملاء من إرسال حجز من المنيو العام. أوقفها مؤقتًا إذا لم يكن المطعم يستقبل حجوزات.</Help></label>
          <label className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold"><span className="flex items-center gap-3"><input type="checkbox" checked={draft.tipsEnabled} onChange={(e) => setDraft({ ...draft, tipsEnabled: e.target.checked })} className="h-4 w-4 accent-indigo-600" /> تفعيل الإكرامية</span><Help>عند التفعيل يظهر خيار الإكرامية للعميل أثناء إتمام الطلب، وتُحسب على الإجمالي وفق النسبة أدناه.</Help></label>
          <label className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold">نسبة الإكرامية (%)<Input type="number" min="0" max="100" step="1" value={draft.tipPercent} onChange={(e) => setDraft({ ...draft, tipPercent: Number(e.target.value) })} className="mt-2 bg-white" dir="ltr" /><Help>أدخل نسبة صحيحة من 0 إلى 100. مثال: 10 تعني 10% من قيمة الطلب.</Help></label>
          <label className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold"><span className="flex items-center gap-3"><input type="checkbox" checked={draft.serviceFeeEnabled} onChange={(e) => setDraft({ ...draft, serviceFeeEnabled: e.target.checked })} className="h-4 w-4 accent-indigo-600" /> تفعيل رسوم الخدمة</span><Help>عند التفعيل تُضاف رسوم الخدمة إلى فاتورة الطلب حسب النسبة المحددة، ويمكن إيقافها دون حذف النسبة.</Help></label>
          <label className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold">نسبة رسوم الخدمة (%)<Input type="number" min="0" max="100" step="1" value={draft.serviceFeePercent} onChange={(e) => setDraft({ ...draft, serviceFeePercent: Number(e.target.value) })} className="mt-2 bg-white" dir="ltr" /><Help>أدخل نسبة صحيحة من 0 إلى 100. راجع سياسة المطعم قبل اعتماد النسبة.</Help></label>
          <label className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold">مهلة عدم الحضور (بالدقائق)<Input type="number" min="1" max="120" step="1" value={draft.reservationNoShowGraceMinutes} onChange={(e) => setDraft({ ...draft, reservationNoShowGraceMinutes: Number(e.target.value) })} className="mt-2 bg-white" dir="ltr" /><Help>المدة التي ينتظرها المطعم بعد وقت الحجز قبل تسجيل العميل كعدم حضور وإلغاء الحجز تلقائيًا.</Help></label>
        </div>
        <Button type="button" onClick={save} disabled={update.isPending} className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"><Save className="ml-2 h-4 w-4" />{update.isPending ? "جارٍ الحفظ..." : "حفظ إعدادات الحجوزات"}</Button>
      </>}
    </CardContent>
  </Card>;
}
