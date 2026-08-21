import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

  useEffect(() => {
    if (!open) setDraft({ name: "", slug: "", plan: "Growth" });
  }, [open]);

  const validationMessage = validateRestaurantDraft(draft);
  const canSubmit = !validationMessage && !pending;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto rounded-3xl border-slate-200 bg-white p-5 shadow-2xl sm:max-w-lg sm:p-7">
        <DialogHeader className="text-right">
          <p className="text-xs font-bold text-[#e76f3c]">إضافة نشاط جديد</p>
          <DialogTitle className="mt-1 text-xl font-black text-slate-900">أضف مطعمًا إلى المنصة</DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-6 text-slate-500">أدخل البيانات الأساسية، ثم أكمل الهوية والإعدادات من بوابة المطعم.</DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-4">
          <label className="block text-sm font-bold text-slate-700" htmlFor="restaurant-name">اسم المطعم
            <Input id="restaurant-name" autoFocus value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value, slug: current.slug || event.target.value.toLowerCase().replace(/\s+/g, "-") }))} placeholder="مثال: مطعم نكهة" className="mt-2 h-12 rounded-2xl bg-slate-50 px-4 focus:bg-white" />
          </label>
          <label className="block text-sm font-bold text-slate-700" htmlFor="restaurant-slug">المعرّف العام
            <Input id="restaurant-slug" value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} placeholder="restaurant-name" dir="ltr" className="mt-2 h-12 rounded-2xl bg-slate-50 px-4 text-left focus:bg-white" />
          </label>
          <label className="block text-sm font-bold text-slate-700" htmlFor="restaurant-plan">الباقة
            <select id="restaurant-plan" value={draft.plan} onChange={(event) => setDraft((current) => ({ ...current, plan: event.target.value }))} className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-[#e76f3c] focus:bg-white">
              <option value="Growth">Growth</option>
              <option value="Starter">Starter</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </label>
          {validationMessage && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">{validationMessage}</p>}
        </div>
        <DialogFooter className="mt-2 flex-col-reverse sm:flex-row sm:justify-start">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-2xl px-6">إلغاء</Button>
          <Button type="button" disabled={!canSubmit} onClick={() => canSubmit && onSubmit({ name: draft.name.trim(), slug: draft.slug.trim(), plan: draft.plan.trim() })} className="rounded-2xl bg-[#e76f3c] px-6 hover:bg-[#d85f2e]">{pending ? "جارٍ الحفظ..." : "حفظ المطعم"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
