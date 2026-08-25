import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { validateRemoteTaskDraft } from "@/lib/remoteTaskValidation";

type RemoteTaskType = "orders" | "reservations" | "social" | "support" | "marketing" | "other";

type WorkerOption = { id: number; role: string };

type RemoteTaskDraft = { type: RemoteTaskType; title: string; description: string; amount: string; dueAt: string; assignedWorkerId: string };

type Props = { open: boolean; pending?: boolean; workers: WorkerOption[]; onClose: () => void; onSubmit: (draft: RemoteTaskDraft) => void };

const types: Array<[RemoteTaskType, string]> = [["orders", "متابعة الطلبات"], ["reservations", "الحجوزات"], ["social", "حسابات التواصل"], ["support", "الدعم"], ["marketing", "التسويق"], ["other", "أخرى"]];
const initialDraft: RemoteTaskDraft = { type: "orders", title: "", description: "", amount: "0", dueAt: "", assignedWorkerId: "" };

export function RemoteTaskDialog({ open, pending = false, workers, onClose, onSubmit }: Props) {
  const [draft, setDraft] = useState<RemoteTaskDraft>(initialDraft);
  useEffect(() => { if (!open) setDraft(initialDraft); }, [open]);
  const validationMessage = validateRemoteTaskDraft(draft);
  const set = <K extends keyof RemoteTaskDraft>(key: K, value: RemoteTaskDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  return <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
    <DialogContent dir="rtl" className="max-h-[92vh] overflow-y-auto rounded-3xl border-slate-200 bg-white p-5 shadow-2xl sm:max-w-2xl sm:p-7">
      <DialogHeader className="text-right"><p className="text-xs font-bold text-[#e76f3c]">التوظيف عن بُعد</p><DialogTitle className="text-xl font-black">إنشاء مهمة جديدة</DialogTitle><DialogDescription className="text-sm leading-6 text-slate-500">حدد المطلوب والقيمة والموعد، ثم انشرها للفريق أو عيّنها لموظف محدد.</DialogDescription></DialogHeader>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-bold sm:col-span-2">نوع المهمة<select value={draft.type} onChange={(event) => set("type", event.target.value as RemoteTaskType)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-orange-300">{types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-xs font-bold sm:col-span-2">عنوان المهمة<Input autoFocus value={draft.title} onChange={(event) => set("title", event.target.value)} placeholder="مثال: متابعة رسائل Instagram" className="mt-2 h-11 rounded-xl bg-slate-50" /></label>
        <label className="text-xs font-bold sm:col-span-2">التفاصيل وطريقة التواصل<textarea value={draft.description} onChange={(event) => set("description", event.target.value)} placeholder="اذكر المطلوب، الحساب أو القناة، وطريقة التسليم..." className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-orange-300" /></label>
        <label className="text-xs font-bold">قيمة المهمة (SAR)<Input value={draft.amount} onChange={(event) => set("amount", event.target.value)} inputMode="decimal" className="mt-2 h-11 rounded-xl bg-slate-50" /></label>
        <label className="text-xs font-bold">الموعد النهائي<Input type="datetime-local" value={draft.dueAt} onChange={(event) => set("dueAt", event.target.value)} className="mt-2 h-11 rounded-xl bg-slate-50" /></label>
        <label className="text-xs font-bold sm:col-span-2">تعيين موظف<select value={draft.assignedWorkerId} onChange={(event) => set("assignedWorkerId", event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-orange-300"><option value="">نشر للفريق</option>{workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.role} #{worker.id}</option>)}</select></label>
        {validationMessage && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800 sm:col-span-2">{validationMessage}</p>}
      </div>
      <DialogFooter className="mt-3 flex-col-reverse sm:flex-row sm:justify-start"><Button type="button" variant="outline" onClick={onClose} className="rounded-xl">إلغاء</Button><Button type="button" disabled={Boolean(validationMessage) || pending} onClick={() => !validationMessage && onSubmit(draft)} className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]">{pending ? "جارٍ النشر..." : "نشر المهمة"}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}

export type { RemoteTaskDraft };
