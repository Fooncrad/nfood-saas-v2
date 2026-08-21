import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Utensils } from "lucide-react";

const plans = [
  { value: "Free", label: "مجانية", description: "صلاحيات أساسية للبدء" },
  { value: "Starter", label: "Starter", description: "تُحدد لاحقًا من الأدمن" },
  { value: "Growth", label: "Growth", description: "تُحدد لاحقًا من الأدمن" },
  { value: "Enterprise", label: "Enterprise", description: "تُحدد لاحقًا من الأدمن" },
] as const;

export function RegisterScreen({ onBack, onOAuth }: { onBack: () => void; onOAuth: () => void }) {
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<(typeof plans)[number]["value"]>("Free");
  const register = trpc.auth.registerRestaurant.useMutation({ onSuccess: () => { toast.success("تم إنشاء حساب المطعم وتسجيل الدخول"); window.location.href = "/"; }, onError: (error) => toast.error(error.message || "تعذر إنشاء الحساب") });
  const submit = () => register.mutate({ restaurantName, email, phone, password, plan });
  return <div dir="rtl" className="flex min-h-screen items-center justify-center bg-[#f6f7f9] p-5"><Card className="w-full max-w-lg rounded-3xl border-slate-200 bg-white shadow-xl"><CardContent className="p-7 sm:p-9"><div className="mb-6 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e76f3c] text-white"><Utensils className="h-7 w-7" /></div><h1 className="mt-4 text-2xl font-bold">إنشاء حساب مطعم</h1><p className="mt-2 text-sm leading-6 text-slate-500">أدخل بيانات المطعم الأساسية، وسيتم إنشاء الفرع الرئيسي وتسجيل دخولك كمدير للمطعم.</p></div><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-xs font-semibold sm:col-span-2">اسم المطعم<Input value={restaurantName} onChange={(event) => setRestaurantName(event.target.value)} placeholder="مطعم NFOOD" className="mt-1 h-11 rounded-xl" /></label><label className="space-y-2 text-xs font-semibold">البريد الإلكتروني<Input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" dir="ltr" className="mt-1 h-11 rounded-xl" /></label><label className="space-y-2 text-xs font-semibold">رقم الجوال<Input type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+966..." dir="ltr" className="mt-1 h-11 rounded-xl" /></label><label className="space-y-2 text-xs font-semibold sm:col-span-2">كلمة المرور<Input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="6 أحرف على الأقل" dir="ltr" className="mt-1 h-11 rounded-xl" /></label><div className="sm:col-span-2"><p className="mb-2 text-xs font-semibold">اختر الباقة المبدئية</p><div className="grid gap-2 sm:grid-cols-2">{plans.map((item) => <button type="button" key={item.value} onClick={() => setPlan(item.value)} className={`rounded-xl border p-3 text-right transition ${plan === item.value ? "border-[#e76f3c] bg-orange-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}><span className="block text-sm font-bold">{item.label}{item.value === "Free" && <span className="mr-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">الافتراضية</span>}</span><span className="mt-1 block text-[11px] text-slate-500">{item.description} · بدون دفع الآن</span></button>)}</div></div></div><Button type="button" disabled={register.isPending || !restaurantName.trim() || !email.trim() || !phone.trim() || password.length < 6} onClick={submit} className="mt-6 h-12 w-full rounded-xl bg-[#e76f3c] text-base hover:bg-[#d85f2e]">{register.isPending ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب والدخول"}</Button><Button type="button" variant="outline" onClick={onOAuth} className="mt-3 h-11 w-full rounded-xl">الدخول عبر Google / OAuth</Button><Button type="button" variant="ghost" onClick={onBack} className="mt-2 h-10 w-full rounded-xl text-slate-600">العودة إلى تسجيل الدخول</Button><p className="mt-4 text-center text-[11px] leading-5 text-slate-400">الباقة المجانية تعمل مباشرة بصلاحيات محدودة. الباقات الأخرى تُحفظ للاختيار الإداري لاحقًا، ولا يوجد دفع إلكتروني مفعّل حاليًا.</p></CardContent></Card></div>;
}
