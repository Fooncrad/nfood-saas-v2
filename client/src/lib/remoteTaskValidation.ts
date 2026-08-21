export type RemoteTaskDraft = {
  title: string;
  amount: string;
  description?: string;
  dueAt?: string;
};

export function validateRemoteTaskDraft(draft: RemoteTaskDraft): string | null {
  if (draft.title.trim().length < 2) return "يجب أن يحتوي عنوان المهمة على حرفين على الأقل.";
  if (!/^\d+(\.\d{1,2})?$/.test(draft.amount.trim())) return "أدخل قيمة مالية صحيحة للمهمة.";
  if (draft.description && draft.description.length > 5000) return "تفاصيل المهمة طويلة جدًا.";
  if (draft.dueAt && Number.isNaN(new Date(draft.dueAt).getTime())) return "الموعد النهائي غير صالح.";
  return null;
}
