import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { validateRestaurantDraft } from "@/lib/restaurantValidation";
import { COUNTRIES, getCurrency } from "@shared/currencies";

export type CreateRestaurantInput = {
  name: string;
  slug: string;
  plan: string;
  email: string;
  phone: string;
  password: string;
  countryCode: string;
  currencyCode: string;
  primaryLanguage: "ar" | "en" | "fr" | "ur";
  timezone: string;
};

const orderTypes = ["داخل المطعم", "استلام", "توصيل", "حجز", "طلب واتساب", "طلب مسبق"];
const pages = ["الصفحة الترحيبية", "المنيو", "الباقات", "التخصصات", "QR Code", "جهات الاتصال"];
const languages = [
  { code: "ar" as const, label: "العربية", note: "RTL" },
  { code: "en" as const, label: "English", note: "LTR" },
  { code: "fr" as const, label: "Français", note: "LTR" },
  { code: "ur" as const, label: "اردو", note: "RTL" },
];
const timezoneOptions = [
  ["Asia/Riyadh", "الرياض (UTC+03:00)"],
  ["Asia/Dubai", "دبي (UTC+04:00)"],
  ["Asia/Kuwait", "الكويت (UTC+03:00)"],
  ["Asia/Qatar", "الدوحة (UTC+03:00)"],
  ["Asia/Bahrain", "المنامة (UTC+03:00)"],
  ["Asia/Muscat", "مسقط (UTC+04:00)"],
  ["Asia/Amman", "عمّان (UTC+03:00)"],
  ["Africa/Cairo", "القاهرة (UTC+02:00)"],
  ["Africa/Casablanca", "الدار البيضاء (UTC+01:00)"],
  ["Europe/Istanbul", "إسطنبول (UTC+03:00)"],
  ["Europe/Paris", "باريس (UTC+01:00)"],
  ["Europe/London", "لندن (UTC+00:00)"],
  ["America/New_York", "نيويورك (UTC-05:00)"],
  ["Asia/Kolkata", "الهند (UTC+05:30)"],
  ["Asia/Karachi", "كراتشي (UTC+05:00)"],
  ["UTC", "UTC"],
] as const;
const countryTimezone: Record<string, string> = { SA: "Asia/Riyadh", AE: "Asia/Dubai", KW: "Asia/Kuwait", QA: "Asia/Qatar", BH: "Asia/Bahrain", OM: "Asia/Muscat", JO: "Asia/Amman", EG: "Africa/Cairo", MA: "Africa/Casablanca", TR: "Europe/Istanbul", FR: "Europe/Paris", DE: "Europe/Paris", GB: "Europe/London", US: "America/New_York", IN: "Asia/Kolkata", PK: "Asia/Karachi" };

type CreateRestaurantDialogProps = {
  open: boolean;
  pending?: boolean;
  onClose: () => void;
  onSubmit: (input: CreateRestaurantInput) => void;
};

const emptyDraft: CreateRestaurantInput = { name: "", slug: "", plan: "Growth", email: "", phone: "", password: "", countryCode: "SA", currencyCode: "SAR", primaryLanguage: "ar", timezone: "Asia/Riyadh" };

export function CreateRestaurantDialog({ open, pending = false, onClose, onSubmit }: CreateRestaurantDialogProps) {
  const [draft, setDraft] = useState<CreateRestaurantInput>(emptyDraft);
  const [selectedOrderTypes, setSelectedOrderTypes] = useState<string[]>(["داخل المطعم", "استلام"]);
  const [selectedPages, setSelectedPages] = useState<string[]>(["الصفحة الترحيبية", "المنيو", "QR Code"]);

  useEffect(() => {
    if (!open) {
      setDraft({ ...emptyDraft });
      setSelectedOrderTypes(["داخل المطعم", "استلام"]);
      setSelectedPages(["الصفحة الترحيبية", "المنيو", "QR Code"]);
    }
  }, [open]);

  const country = useMemo(() => COUNTRIES.find((item) => item.code === draft.countryCode) ?? COUNTRIES[0], [draft.countryCode]);
  const currency = getCurrency(draft.currencyCode);
  const validationMessage = validateRestaurantDraft(draft);
  const canSubmit = !validationMessage && draft.email.trim().length > 0 && draft.phone.trim().length >= 7 && draft.password.trim().length >= 6 && Boolean(draft.primaryLanguage) && Boolean(draft.timezone) && !pending;

  const updateCountry = (countryCode: string) => {
    const nextCountry = COUNTRIES.find((item) => item.code === countryCode) ?? COUNTRIES[0];
    setDraft((current) => ({ ...current, countryCode: nextCountry.code, currencyCode: nextCountry.currencyCode, timezone: countryTimezone[nextCountry.code] ?? current.timezone }));
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent dir="rtl" className="max-h-[92vh] overflow-y-auto rounded-3xl border-slate-200 bg-white p-5 shadow-2xl sm:max-w-2xl sm:p-7">
        <DialogHeader className="text-right">
          <p className="text-xs font-bold text-[#e76f3c]">إضافة نشاط جديد</p>
          <DialogTitle className="mt-1 text-xl font-black text-slate-900">أضف مطعمًا إلى المنصة</DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-6 text-slate-500">تُنشأ هوية المطعم وQR المنيو تلقائيًا، ثم يستطيع مدير المطعم تخصيص الشعار والواجهة والرموز المسموح بها.</DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-700" htmlFor="restaurant-name">اسم المطعم
              <Input id="restaurant-name" autoFocus value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value, slug: current.slug || event.target.value.toLowerCase().replace(/\s+/g, "-") }))} placeholder="مثال: مطعم نكهة" className="mt-2 h-12 rounded-2xl bg-slate-50 px-4 focus:bg-white" />
            </label>
            <label className="block text-sm font-bold text-slate-700" htmlFor="restaurant-slug">المعرّف العام
              <Input id="restaurant-slug" value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} placeholder="restaurant-name" dir="ltr" className="mt-2 h-12 rounded-2xl bg-slate-50 px-4 text-left focus:bg-white" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-bold text-slate-700" htmlFor="restaurant-email">البريد الإلكتروني
              <Input id="restaurant-email" type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} placeholder="manager@restaurant.com" dir="ltr" className="mt-2 h-12 rounded-2xl bg-slate-50 px-4 text-left focus:bg-white" />
            </label>
            <label className="block text-sm font-bold text-slate-700" htmlFor="restaurant-phone">رقم الجوال
              <Input id="restaurant-phone" type="tel" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} placeholder="+966 5X XXX XXXX" dir="ltr" className="mt-2 h-12 rounded-2xl bg-slate-50 px-4 text-left focus:bg-white" />
            </label>
            <label className="block text-sm font-bold text-slate-700" htmlFor="restaurant-password">كلمة المرور
              <Input id="restaurant-password" type="password" value={draft.password} onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))} placeholder="6 أحرف أو أرقام على الأقل" dir="ltr" className="mt-2 h-12 rounded-2xl bg-slate-50 px-4 text-left focus:bg-white" />
            </label>
          </div>
          <label className="block text-sm font-bold text-slate-700" htmlFor="restaurant-plan">الباقة
            <select id="restaurant-plan" value={draft.plan} onChange={(event) => setDraft((current) => ({ ...current, plan: event.target.value }))} className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-[#e76f3c] focus:bg-white">
              <option value="Growth">Growth</option><option value="Starter">Starter</option><option value="Enterprise">Enterprise</option>
            </select>
          </label>
          <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
            <div className="mb-3"><p className="text-sm font-black text-slate-800">الإعدادات الأساسية المطلوبة</p><p className="mt-1 text-[11px] leading-5 text-slate-500">تُحفظ هذه الإعدادات مع الحساب وتصبح اللغة الأولى هي اللغة الأساسية للمنيو والإشعارات.</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-bold text-slate-700" htmlFor="restaurant-country">الدولة
                <select id="restaurant-country" value={draft.countryCode} onChange={(event) => updateCountry(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-orange-100 bg-white px-3 text-sm outline-none focus:border-orange-400">
                  {COUNTRIES.map((item) => <option key={item.code} value={item.code}>{item.nameAr} · {item.name}</option>)}
                </select>
              </label>
              <label className="block text-xs font-bold text-slate-700" htmlFor="restaurant-language">اللغة الأساسية <span className="text-orange-600">*</span>
                <select id="restaurant-language" required value={draft.primaryLanguage} onChange={(event) => setDraft((current) => ({ ...current, primaryLanguage: event.target.value as CreateRestaurantInput["primaryLanguage"] }))} className="mt-1.5 h-11 w-full rounded-xl border border-orange-100 bg-white px-3 text-sm outline-none focus:border-orange-400">
                  {languages.map((item) => <option key={item.code} value={item.code}>{item.label} · {item.note}</option>)}
                </select>
              </label>
              <label className="block text-xs font-bold text-slate-700" htmlFor="restaurant-timezone">المنطقة الزمنية <span className="text-orange-600">*</span>
                <select id="restaurant-timezone" required value={draft.timezone} onChange={(event) => setDraft((current) => ({ ...current, timezone: event.target.value }))} className="mt-1.5 h-11 w-full rounded-xl border border-orange-100 bg-white px-3 text-sm outline-none focus:border-orange-400">
                  {timezoneOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <div className="rounded-xl border border-orange-100 bg-white px-3 py-2.5 text-xs text-slate-700"><span className="block font-bold">العملة التلقائية</span><span className="mt-1 block text-sm font-black text-orange-700">{currency.nameAr} · {currency.code} ({currency.symbol})</span><span className="mt-1 block text-[10px] text-slate-400">تُحسب من الدولة ويمكن تعديلها لاحقًا من إعدادات التسعير.</span></div>
            </div>
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-[11px] text-slate-600">سيبدأ المنيو باللغة: <strong>{languages.find((item) => item.code === draft.primaryLanguage)?.label}</strong> · الدولة: <strong>{country.nameAr}</strong> · المنطقة: <strong dir="ltr">{draft.timezone}</strong></p>
          </div>
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2">
            <div><p className="mb-2 text-xs font-black text-slate-700">أنواع الطلبات</p><div className="grid grid-cols-2 gap-2">{orderTypes.map((item) => <label key={item} className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-[11px] text-slate-600"><input type="checkbox" checked={selectedOrderTypes.includes(item)} onChange={(event) => setSelectedOrderTypes((current) => event.target.checked ? [...current, item] : current.filter((value) => value !== item))} className="accent-[#e76f3c]" />{item}</label>)}</div></div>
            <div><p className="mb-2 text-xs font-black text-slate-700">صفحات النشاط</p><div className="grid grid-cols-2 gap-2">{pages.map((item) => <label key={item} className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-[11px] text-slate-600"><input type="checkbox" checked={selectedPages.includes(item)} onChange={(event) => setSelectedPages((current) => event.target.checked ? [...current, item] : current.filter((value) => value !== item))} className="accent-[#e76f3c]" />{item}</label>)}</div></div>
          </div>
          <p className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[11px] leading-5 text-sky-800">يُنشأ QR المنيو تلقائيًا بعد الحفظ، بينما تحتاج رموز الطاولات ونداء النادل والروابط المخصصة إلى إنشاء من مركز QR حسب صلاحيات مدير المطعم.</p>
          {validationMessage && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">{validationMessage}</p>}
        </div>
        <DialogFooter className="mt-2 flex-col-reverse sm:flex-row sm:justify-start">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-2xl px-6">إلغاء</Button>
          <Button type="button" disabled={!canSubmit} onClick={() => canSubmit && onSubmit({ ...draft, name: draft.name.trim(), slug: draft.slug.trim(), plan: draft.plan.trim(), email: draft.email.trim().toLowerCase(), phone: draft.phone.trim() })} className="rounded-2xl bg-[#e76f3c] px-6 hover:bg-[#d85f2e]">{pending ? "جارٍ الحفظ..." : "حفظ المطعم وإنشاء QR"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
