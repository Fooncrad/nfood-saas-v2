import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type SettingKey = "supportEmail" | "supportPhone" | "defaultCurrency" | "defaultTimezone" | "baseDomain" | "maintenanceMode" | "allowGuestCheckout";
type Settings = Record<SettingKey, string>;

const fields: Array<{ key: SettingKey; label: string; placeholder: string }> = [
  { key: "supportEmail", label: "بريد دعم المنصة", placeholder: "support@example.com" },
  { key: "supportPhone", label: "هاتف دعم المنصة", placeholder: "+966..." },
  { key: "defaultCurrency", label: "العملة الافتراضية", placeholder: "SAR" },
  { key: "defaultTimezone", label: "المنطقة الزمنية", placeholder: "Asia/Riyadh" },
  { key: "baseDomain", label: "النطاق الأساسي للمنصة", placeholder: "https://nfood.io" },
];

export function PlatformSettingsPanel() {
  const settingsQuery = trpc.platform.platformSettings.useQuery(undefined, { retry: false });
  const updateSetting = trpc.platform.updatePlatformSetting.useMutation({
    onSuccess: async () => { await settingsQuery.refetch(); toast.success("تم حفظ إعداد المنصة"); },
    onError: (error) => toast.error(`تعذر حفظ الإعداد: ${error.message}`),
  });
  const [draft, setDraft] = useState<Settings>({ supportEmail: "", supportPhone: "", defaultCurrency: "SAR", defaultTimezone: "Asia/Riyadh", baseDomain: "", maintenanceMode: "false", allowGuestCheckout: "true" });
  useEffect(() => { if (settingsQuery.data) setDraft(settingsQuery.data); }, [settingsQuery.data]);
  const save = (key: SettingKey) => {
    const value = key === "baseDomain" ? draft[key].trim().replace(/\/+$/, "") : draft[key];
    if (key === "baseDomain" && value && !/^https?:\/\/[^\s/]+(?::\d+)?(?:\/[^\s]*)?$/.test(value)) { toast.error("اكتب النطاق بصيغة https://nfood.io"); return; }
    updateSetting.mutate({ key, value });
  };
  return <Card className="mt-5 rounded-2xl border-orange-100 bg-white shadow-sm" dir="rtl">
    <CardHeader><CardTitle className="text-base">إعدادات المنصة المركزية</CardTitle><p className="text-xs text-slate-500">تُدار من Super Admin وتؤثر على الإعدادات الافتراضية دون كشف أسرار المزودات. عند ضبط النطاق ستُبنى روابط المطاعم العامة عليه.</p></CardHeader>
    <CardContent className="space-y-5">
      {settingsQuery.isError ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">تعذر تحميل إعدادات المنصة. Request ID: platform-settings <button className="mr-2 font-bold underline" onClick={() => void settingsQuery.refetch()}>إعادة المحاولة</button></div> : null}
      <div className="grid gap-3 md:grid-cols-2">{fields.map((field) => <div key={field.key} className="flex items-end gap-2"><label className="flex-1 text-xs font-semibold text-slate-600">{field.label}<Input value={draft[field.key]} onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={field.placeholder} className="mt-2 rounded-xl" /></label><Button type="button" onClick={() => save(field.key)} disabled={updateSetting.isPending} className="rounded-xl bg-[#e76f3c] text-xs hover:bg-[#d85f2e]">حفظ</Button></div>)}</div>
      <div className="grid gap-3 md:grid-cols-2"><div className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><div><p className="text-sm font-bold">وضع الصيانة</p><p className="mt-1 text-xs text-slate-500">يُحفظ كإعداد مركزي ويحتاج ربط middleware قبل تفعيله إنتاجيًا.</p></div><Button type="button" variant="outline" onClick={() => { const value = draft.maintenanceMode === "true" ? "false" : "true"; setDraft((current) => ({ ...current, maintenanceMode: value })); updateSetting.mutate({ key: "maintenanceMode", value }); }} className="rounded-xl text-xs">{draft.maintenanceMode === "true" ? "مفعل" : "متوقف"}</Button></div><div className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><div><p className="text-sm font-bold">الحجز العام</p><p className="mt-1 text-xs text-slate-500">إعداد افتراضي للمنصة؛ تحكم المطعم النهائي من ملف المطعم.</p></div><Button type="button" variant="outline" onClick={() => { const value = draft.allowGuestCheckout === "true" ? "false" : "true"; setDraft((current) => ({ ...current, allowGuestCheckout: value })); updateSetting.mutate({ key: "allowGuestCheckout", value }); }} className="rounded-xl text-xs">{draft.allowGuestCheckout === "true" ? "مسموح" : "موقوف"}</Button></div></div>
    </CardContent>
  </Card>;
}
