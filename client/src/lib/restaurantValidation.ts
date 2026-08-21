export type RestaurantDraft = { name: string; slug: string; plan: string };

export function validateRestaurantDraft(draft: RestaurantDraft): string | null {
  if (draft.name.trim().length < 2) return "اسم المطعم قصير جدًا";
  if (!/^[a-z0-9-]{2,}$/.test(draft.slug.trim())) return "المعرّف العام يجب أن يكون بالإنجليزية والأرقام والشرطة فقط";
  if (!draft.plan.trim()) return "اختر الباقة";
  return null;
}
