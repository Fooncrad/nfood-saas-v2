import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { validateRestaurantDraft } from "@/lib/restaurantValidation";

type CreateRestaurantInput = { name: string; slug: string; plan: string };

type CreateRestaurantDialogProps = {
  open: boolean;
  pending?: boolean;
  onClose: () => void;
  onSubmit: (input: CreateRestaurantInput) => void;
};

export function CreateRestaurantDialog({ open, pending = false, onClose, onSubmit }: CreateRestaurantDialogProps) {
  const [draft, setDraft] = useState<CreateRestaurantInput>({ name: "", slug: "", plan: "Growth" });
  useEffect(() => { if (!open) setDraft({ name: "", slug: "", plan: "Growth" }); }, [open]);
  if (!open) return null;
  const canSubmit = !validateRestaurantDraft(draft) && !pending;
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="new-restaurant-title" dir="rtl">
    <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-xs font-bold text-[#e76f3c]">إضافة نشاط جديد</p><h3 id="new-restaurant-title" className="mt-1 text-xl font-black text-slate-900">أضف مطعمًا إلى المنصة</h3><p className="mt-2 text-sm leading-6 text-slate-500">أدخل البيانات الأساسية، ثم أكمل الهوية والإعدادات من بوابة المطعم.</p></div>
        <button type="button" aria-label="إغلاق" onClick={onClose} className="rounded-xl px-3 py-2 text-xl text-slate-400 hover:bg-slate-100">×</button>
      </div>
      <div className="mt-6 space-y-4">
        <label className="block text-sm font-bold text-slate-700">اسم المطعم<input autoFocus value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value, slug: current.slug || event.target.value.toLowerCase().replace(/\s+/g, "-") }))} placeholder="مثال: مطعم نكهة" className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-[#e76f3c] focus:bg-white" /></label>
        <label className="block text-sm font-bold text-slate-700">المعرّف العام<input value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} placeholder="restaurant-name" dir="ltr" className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left outline-none transition focus:border-[#e76f3c] focus:bg-white" /></label>
        <label className="block text-sm font-bold text-slate-700">الباقة<select value={draft.plan} onChange={(event) => setDraft((current) => ({ ...current, plan: event.target.value }))} className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-[#e76f3c] focus:bg-white"><option value="Growth">Growth</option><option value="Starter">Starter</option><option value="Enterprise">Enterprise</option></select></label>
      </div>
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-start"><Button type="button" variant="outline" onClick={onClose} className="rounded-2xl px-6">إلغاء</Button><Button type="button" disabled={!canSubmit} onClick={() => canSubmit && onSubmit({ name: draft.name.trim(), slug: draft.slug.trim(), plan: draft.plan.trim() })} className="rounded-2xl bg-[#e76f3c] px-6 hover:bg-[#d85f2e]">{pending ? "جارٍ الحفظ..." : "حفظ المطعم"}</Button></div>
    </div>
  </div>;
}
