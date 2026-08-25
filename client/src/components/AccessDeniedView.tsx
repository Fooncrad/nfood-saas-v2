import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type AccessDeniedViewProps = { feature: string };

export function AccessDeniedView({ feature }: AccessDeniedViewProps) {
  return <Card dir="rtl" className="rounded-2xl border-amber-200 bg-amber-50 shadow-sm"><CardContent className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center"><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-amber-600 shadow-sm"><ShieldCheck className="h-8 w-8" /></div><h2 className="text-xl font-bold text-slate-900">403 · الوصول غير مسموح</h2><p className="mt-3 max-w-md text-sm leading-7 text-slate-600">لا تملك صلاحية استخدام هذه الوحدة أو أن الميزة غير مفعّلة ضمن باقة مطعمك.</p><p className="mt-2 font-mono text-[11px] text-slate-400">رمز الوحدة: {feature}</p></CardContent></Card>;
}
