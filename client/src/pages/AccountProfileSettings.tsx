import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Camera, CheckCircle2, ImagePlus, Save, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AccountProfileSettings() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const upload = trpc.media.upload.useMutation();
  const updateAvatar = trpc.auth.updateAvatar.useMutation({
    onSuccess: (result) => {
      utils.auth.me.setData(undefined, (current) => current ? { ...current, avatarUrl: result.avatarUrl } : current);
      toast.success("تم حفظ صورة الحساب وستظهر في جميع لوحات الموقع");
    },
    onError: (error) => toast.error(`تعذر حفظ صورة الحساب. السبب: ${error.message} · Request ID: account-avatar`),
  });
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const changePassword = trpc.platform.changeMyTeamPassword.useMutation({
    onSuccess: () => { setCurrentPassword(""); setNewPassword(""); toast.success("تم تغيير كلمة المرور وإبطال الجلسات السابقة"); },
    onError: (error) => toast.error(error.message || "تعذر تغيير كلمة المرور"),
  });
  useEffect(() => setAvatarUrl(user?.avatarUrl ?? ""), [user?.avatarUrl]);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("الملف غير صالح. اختر PNG أو JPG أو WEBP"); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error("حجم الصورة يتجاوز 8 ميجابايت"); return; }
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("تعذر قراءة الصورة"));
        reader.onerror = () => reject(new Error("تعذر قراءة الصورة"));
        reader.readAsDataURL(file);
      });
      const result = await upload.mutateAsync({ fileName: file.name, contentType: file.type, base64, category: "image", scope: "user" });
      setAvatarUrl(result.url);
      await updateAvatar.mutateAsync({ avatarUrl: result.url });
    } catch (error) {
      toast.error(`تعذر رفع صورة الحساب. السبب: ${error instanceof Error ? error.message : "خطأ غير معروف"} · Request ID: account-avatar-upload`);
    } finally { setUploading(false); }
  };

  const roleLabel = user?.role === "admin" ? "Super Admin" : user?.testRole === "restaurant_admin" ? "مدير المطعم" : user?.testRole === "kitchen" ? "المطبخ" : user?.testRole === "waiter" ? "النادل" : user?.testRole === "cashier" ? "الكاشير" : user?.testRole === "driver" ? "السائق" : "العميل";
  const canUseCustomerProfile = user?.testRole === "customer" || (!user?.testRole && user?.role === "user");
  if (user && !canUseCustomerProfile) return <main dir="rtl" className="flex min-h-screen items-center justify-center bg-[#f7f8fb] p-6 text-slate-900"><Card className="w-full max-w-md rounded-3xl border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle>الملف الشخصي غير متاح</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-slate-500">إعدادات الملف الشخصي مخصصة للعملاء فقط. تُدار حسابات المطاعم والفريق من لوحات التشغيل والصلاحيات.</p><Link href="/"><Button className="mt-5 rounded-xl bg-[#111c2e]">العودة للوحة</Button></Link></CardContent></Card></main>;
  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f8fb] p-5 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[.18em] text-[#e76f3c]">NFOOD · Account</p><h1 className="mt-2 text-3xl font-black">إعدادات صورة الحساب</h1><p className="mt-2 text-sm leading-7 text-slate-500">حدّث صورة ملفك الشخصي لتظهر في الرأس، الجلسات، ولوحات التشغيل الخاصة بدورك.</p></div>
          <Link href="/"><Button variant="outline" className="rounded-xl"><ArrowRight className="ml-2 h-4 w-4" />العودة للوحة</Button></Link>
        </div>
        <Card className="overflow-hidden rounded-[2rem] border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,.08)]">
          <div className="relative h-32 bg-[linear-gradient(135deg,#111c2e,#1e3a5f)]"><div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" /><div className="absolute bottom-4 right-5 text-white"><p className="text-xs font-bold text-cyan-200">الحساب الحالي</p><p className="mt-1 text-lg font-black">{user?.name || user?.email || "NFOOD User"}</p></div></div>
          <CardHeader className="flex flex-row items-center justify-between gap-4"><CardTitle className="flex items-center gap-2 text-base"><Camera className="h-5 w-5 text-[#e76f3c]" />الصورة الشخصية</CardTitle><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700">{roleLabel}</span></CardHeader>
          <CardContent className="grid gap-6 p-6 md:grid-cols-[180px_1fr] md:items-center">
            <div className="flex justify-center"><Avatar className="h-40 w-40 border-8 border-slate-50 shadow-xl"><AvatarImage src={avatarUrl || undefined} alt="صورة الحساب" /><AvatarFallback className="bg-orange-100 text-4xl font-black text-[#c75325]">{(user?.name || user?.email || "N").slice(0, 1).toUpperCase()}</AvatarFallback></Avatar></div>
            <div><p className="text-sm font-bold text-slate-800">صورة واضحة لهوية الحساب</p><p className="mt-2 text-sm leading-7 text-slate-500">الصيغ المقبولة PNG وJPG وWEBP، والحجم الأقصى 8 ميجابايت. تُرفع الصورة إلى مكتبة الحساب ثم تُحفظ تلقائيًا.</p><label className="mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center transition hover:border-[#e76f3c] hover:bg-orange-50"><UploadCloud className="h-8 w-8 text-[#e76f3c]" /><span className="mt-2 text-sm font-black text-slate-700">{uploading ? "جارٍ رفع الصورة وحفظها..." : "اختر صورة الحساب"}</span><span className="mt-1 text-xs text-slate-400">اضغط هنا أو اسحب الصورة إلى هذه المساحة</span><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={uploading || updateAvatar.isPending} onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleUpload(file); event.currentTarget.value = ""; }} /></label>{avatarUrl && !uploading && <p className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" />الصورة الحالية محفوظة وتظهر في الحساب</p>}</div>
          </CardContent>
        </Card>
        <Card className="mt-5 rounded-3xl border-cyan-100 bg-cyan-50/60"><CardContent className="flex gap-3 p-5 text-sm leading-7 text-cyan-950"><ImagePlus className="mt-1 h-5 w-5 shrink-0 text-cyan-700" /><p>يمكنك تغيير الصورة في أي وقت. لا تُستخدم الصورة في صفحات المطاعم العامة إلا إذا حفظتها داخل إعدادات هوية المطعم.</p></CardContent></Card>
        <Button type="button" variant="outline" disabled={!avatarUrl || updateAvatar.isPending} onClick={() => updateAvatar.mutate({ avatarUrl: null })} className="mt-5 rounded-xl text-red-600 hover:bg-red-50">حذف صورة الحساب</Button>
        <Card className="mt-5 rounded-3xl border-orange-100 bg-white shadow-sm"><CardHeader><CardTitle className="text-base">تغيير كلمة المرور</CardTitle><p className="text-xs text-slate-500">ينطبق على حسابات الفريق التجريبية مثل النادل والسائق، ويتم إبطال الجلسات السابقة بعد التغيير.</p></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold">كلمة المرور الحالية<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></label><label className="text-xs font-bold">كلمة المرور الجديدة<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" placeholder="8 أحرف على الأقل" /></label><Button type="button" disabled={changePassword.isPending || currentPassword.length < 1 || newPassword.length < 8} onClick={() => changePassword.mutate({ currentPassword, newPassword })} className="rounded-xl bg-[#111c2e] sm:col-span-2">{changePassword.isPending ? "جارٍ تغيير كلمة المرور..." : "حفظ كلمة المرور الجديدة"}</Button></CardContent></Card>
      </div>
    </main>
  );
}
