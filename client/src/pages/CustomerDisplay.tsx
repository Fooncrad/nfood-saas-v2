import { useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

const labels: Record<string, string> = { new: "تم استلام الطلب", preparing: "قيد التحضير", ready: "جاهز للاستلام" };

export default function CustomerDisplay() {
  const { slug } = useParams<{ slug: string }>();
  const display = trpc.platform.customerDisplay.useQuery({ slug: slug ?? "" }, { enabled: Boolean(slug), refetchInterval: 5000 });
  const brandColor = display.data?.restaurant.brandColor ?? "#e76f3c";
  const ready = display.data?.orders.filter((order) => order.status === "ready") ?? [];
  const preparing = display.data?.orders.filter((order) => order.status !== "ready") ?? [];
  const announceReady = () => { if (!ready.length || typeof window === "undefined" || !("speechSynthesis" in window)) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(`الطلب رقم ${ready[0].id} جاهز للاستلام`); utterance.lang = "ar-SA"; utterance.rate = 0.9; window.speechSynthesis.speak(utterance); };

  useEffect(() => {
    document.title = display.data?.restaurant.name ? `شاشة الطلبات · ${display.data.restaurant.name}` : "شاشة الطلبات · NFOOD";
  }, [display.data?.restaurant.name]);

  if (display.isLoading) return <main className="min-h-screen bg-slate-950 p-8"><Skeleton className="mx-auto h-[80vh] max-w-6xl rounded-3xl bg-slate-800" /></main>;
  if (display.isError) return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-center text-white"><div><h1 className="text-3xl font-black">تعذر تحميل شاشة الطلبات</h1><p className="mt-3 text-slate-400">Request ID: customer-display-{slug}</p></div></main>;

  return <main className="min-h-screen bg-slate-950 p-5 text-white md:p-10" dir="rtl">
    <header className="mx-auto mb-8 flex max-w-6xl items-center justify-between gap-4">
      <div><p className="text-sm font-bold text-slate-400">شاشة استدعاء العملاء</p><h1 className="mt-2 text-3xl font-black md:text-5xl">{display.data?.restaurant.name}</h1></div>
      <div className="flex items-center gap-3"><button type="button" onClick={announceReady} disabled={!ready.length} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs font-bold text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40">نداء صوتي للطلب الجاهز</button><div className="rounded-2xl px-5 py-3 text-center" style={{ backgroundColor: `${brandColor}22`, color: brandColor }}><p className="text-xs font-bold">التحديث تلقائي</p><p className="mt-1 text-xs text-slate-300">كل 5 ثوانٍ</p></div></div>
    </header>
    <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
      <Card className="border-emerald-500/30 bg-emerald-950/30 text-white"><CardContent className="p-6 md:p-8"><div className="flex items-center justify-between"><h2 className="text-2xl font-black text-emerald-300">جاهز للاستلام</h2><span className="rounded-full bg-emerald-400/20 px-3 py-1 text-sm font-bold">{ready.length}</span></div><div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">{ready.length ? ready.map((order) => <div key={order.id} className="rounded-2xl bg-emerald-400 px-4 py-5 text-center text-emerald-950"><p className="text-xs font-bold">رقم الطلب</p><p className="mt-2 text-4xl font-black">#{order.id}</p></div>) : <p className="col-span-full rounded-2xl border border-dashed border-emerald-500/30 p-8 text-center text-emerald-200/70">لا توجد طلبات جاهزة حاليًا</p>}</div></CardContent></Card>
      <Card className="border-amber-500/30 bg-amber-950/30 text-white"><CardContent className="p-6 md:p-8"><div className="flex items-center justify-between"><h2 className="text-2xl font-black text-amber-300">قيد التحضير</h2><span className="rounded-full bg-amber-400/20 px-3 py-1 text-sm font-bold">{preparing.length}</span></div><div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">{preparing.length ? preparing.map((order) => <div key={order.id} className="rounded-2xl bg-amber-300 px-4 py-5 text-center text-amber-950"><p className="text-xs font-bold">رقم الطلب</p><p className="mt-2 text-4xl font-black">#{order.id}</p><p className="mt-2 text-xs font-bold">{labels[order.status] ?? "قيد المتابعة"}</p></div>) : <p className="col-span-full rounded-2xl border border-dashed border-amber-500/30 p-8 text-center text-amber-200/70">لا توجد طلبات قيد التحضير</p>}</div></CardContent></Card>
    </section>
    <p className="mx-auto mt-10 max-w-6xl text-center text-xs text-slate-500">لا تعرض هذه الشاشة اسم العميل أو رقم هاتفه. النداء الصوتي محلي ويتطلب ضغط المستخدم؛ الإعلانات المتقدمة تحتاج إعدادًا منفصلًا.</p>
  </main>;
}
