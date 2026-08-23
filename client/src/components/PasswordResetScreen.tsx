import { useState } from "react";
import { ArrowRight, CheckCircle2, KeyRound, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function PasswordResetScreen({ token, onComplete, onBack }: { token: string; onComplete: () => void; onBack: () => void }) {
  const { direction, t } = useLanguage();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const reset = trpc.auth.resetPassword.useMutation({ onSuccess: () => { toast.success("تم تحديث كلمة المرور. يمكنك تسجيل الدخول الآن."); onComplete(); }, onError: (error) => toast.error(error.message || "تعذر تحديث كلمة المرور") });
  const submit = () => { if (password.length < 8) return toast.error("يجب أن تتكون كلمة المرور من 8 أحرف على الأقل"); if (password !== confirmation) return toast.error("كلمتا المرور غير متطابقتين"); reset.mutate({ token, password }); };
  return <div dir={direction} className="min-h-screen bg-[#f7f8fb] text-slate-900"><div className="fixed right-5 top-5 z-20"><LanguageSwitcher compact /></div><main className="flex min-h-screen items-center justify-center p-5 sm:p-8"><Card className="w-full max-w-md rounded-[2rem] border-white/70 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.10)]"><CardContent className="p-6 sm:p-10"><div className="mb-8 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#e76f3c]"><KeyRound className="h-6 w-6" /></div><div><p className="text-xs font-bold text-[#e76f3c]">NFOOD</p><h1 className="text-2xl font-black">إعادة تعيين كلمة المرور</h1></div></div><p className="mb-6 text-sm leading-6 text-slate-500">أنشئ كلمة مرور جديدة لحسابك. يجب ألا تقل عن 8 أحرف.</p><div className="space-y-4"><label className="block text-xs font-bold">كلمة المرور الجديدة<Input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 rounded-2xl border-slate-200 bg-slate-50/70 px-4" /></label><label className="block text-xs font-bold">تأكيد كلمة المرور<Input type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} onKeyDown={(event) => event.key === "Enter" && submit()} className="mt-2 h-12 rounded-2xl border-slate-200 bg-slate-50/70 px-4" /></label><Button type="button" onClick={submit} disabled={reset.isPending || !password || !confirmation} className="h-12 w-full rounded-2xl bg-[#e76f3c] font-bold hover:bg-[#d85f2e]">{reset.isPending ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}<CheckCircle2 className="mr-2 h-4 w-4" /></Button><Button type="button" variant="ghost" onClick={onBack} className="h-11 w-full rounded-2xl text-slate-600"><ArrowRight className="ml-2 h-4 w-4" />العودة لتسجيل الدخول</Button></div></CardContent></Card></main></div>;
}
