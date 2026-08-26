import { useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, ShieldCheck, Utensils } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function CustomerRegister() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const register = trpc.auth.registerCustomer.useMutation({
    onSuccess: () => { toast.success("تم إنشاء حساب العميل بنجاح"); navigate("/customer-portal"); },
    onError: (error) => toast.error(error.message || "تعذر إنشاء الحساب")
  });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) return toast.error("أدخل اسمًا واضحًا");
    if (!email.includes("@")) return toast.error("أدخل بريدًا إلكترونيًا صحيحًا");
    if (password.length < 8) return toast.error("كلمة المرور يجب أن تتكون من 8 أحرف أو أرقام على الأقل");
    if (password !== confirm) return toast.error("تأكيد كلمة المرور غير مطابق");
    register.mutate({ name: name.trim(), email: email.trim(), password });
  };
  return <main dir="rtl" className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff1e8,transparent_35%),#f8fafc] px-4 py-6 text-slate-900 sm:px-8"><div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl items-center gap-8 lg:grid-cols-[.9fr_1.1fr]"><section className="hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl lg:block"><p className="text-xs font-black tracking-[.28em] text-orange-300">NFOOD CUSTOMER</p><h1 className="mt-5 text-4xl font-black leading-tight">حساب واحد لكل تجاربك.</h1><p className="mt-4 text-sm leading-7 text-white/65">تابع طلباتك، اجمع مكافآتك، بع محتواك للمطاعم، واحتفظ بكل شيء في مساحة خاصة بك.</p><div className="mt-8 space-y-3">{["طلباتك وحجوزاتك في مكان واحد", "محفظة ومكافآت واضحة", "Studio لبيع الصور والمقاطع بحقوقك"].map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-bold"><CheckCircle2 className="h-5 w-5 text-emerald-300" />{item}</div>)}</div></section><section className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl sm:p-8"><div className="mb-6 flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"><Utensils className="h-5 w-5" /></div><div><p className="text-xs font-black uppercase tracking-[.2em] text-orange-600">NFOOD</p><p className="text-sm font-black">حساب العميل</p></div></div><Link href="/login" className="flex items-center gap-1 text-xs font-black text-slate-500 hover:text-orange-600">لديك حساب؟ دخول <ArrowLeft className="h-4 w-4" /></Link></div><h2 className="text-3xl font-black tracking-tight">أنشئ مساحتك الخاصة</h2><p className="mt-2 text-sm leading-6 text-slate-500">هذا التسجيل للعملاء فقط، ولا يخلط مع حسابات المطاعم أو الإدارة.</p><form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm font-black">الاسم الكامل<Input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-12 rounded-2xl" placeholder="مثال: ناصر أحمد" autoComplete="name" /></label><label className="block text-sm font-black">البريد الإلكتروني<Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" dir="ltr" className="mt-2 h-12 rounded-2xl" placeholder="name@example.com" autoComplete="email" /></label><label className="block text-sm font-black">كلمة المرور<div className="relative mt-2"><Input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} dir="ltr" className="h-12 rounded-2xl pl-12" placeholder="8 أحرف أو أرقام على الأقل" autoComplete="new-password" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400" aria-label="إظهار أو إخفاء كلمة المرور">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label><label className="block text-sm font-black">تأكيد كلمة المرور<div className="relative mt-2"><Input value={confirm} onChange={(event) => setConfirm(event.target.value)} type={showConfirm ? "text" : "password"} dir="ltr" className="h-12 rounded-2xl pl-12" placeholder="أعد كتابة كلمة المرور" autoComplete="new-password" /><button type="button" onClick={() => setShowConfirm((value) => !value)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400" aria-label="إظهار أو إخفاء التأكيد">{showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label><div className="flex items-start gap-2 rounded-2xl bg-orange-50 p-3 text-xs leading-5 text-orange-900"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />بياناتك تخص حساب العميل وتبقى منفصلة عن بيانات المطاعم.</div><Button type="submit" disabled={register.isPending} className="h-12 w-full rounded-2xl bg-orange-500 text-base font-black text-white hover:bg-orange-600">{register.isPending ? "جارٍ إنشاء الحساب..." : "إنشاء حساب العميل"}</Button></form><p className="mt-5 text-center text-xs text-slate-500">بالمتابعة أنت توافق على <Link href="/privacy" className="font-black text-orange-600">سياسة الخصوصية</Link> و<Link href="/terms" className="font-black text-orange-600">الشروط</Link>.</p></section></div></main>;
}
