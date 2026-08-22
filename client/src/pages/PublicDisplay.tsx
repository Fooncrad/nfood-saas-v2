import { useEffect, useMemo, useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { MonitorPlay, Wifi, WifiOff } from "lucide-react";

export default function PublicDisplay() {
  const { token } = useParams<{ token: string }>();
  const playback = trpc.restaurantContent.publicPlayback.useQuery({ token: token ?? "" }, { enabled: Boolean(token), retry: 1, refetchInterval: (query) => (query.state.data?.screen.refreshSeconds ?? 30) * 1000 });
  const slides = playback.data?.slides ?? [];
  const [index, setIndex] = useState(0);
  const slide = slides[index % Math.max(slides.length, 1)];
  const seconds = slide?.durationSeconds ?? 8;
  const locale = typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("ar") ? "ar" : "en";
  const title = useMemo(() => slide?.title ?? slide?.menuItem?.name ?? "", [slide]);
  const subtitle = slide?.subtitle ?? slide?.menuItem?.description ?? "";

  useEffect(() => { setIndex(0); }, [playback.data?.screen.id, slides.length]);
  useEffect(() => { if (slides.length < 2) return; const timer = window.setTimeout(() => setIndex((current) => (current + 1) % slides.length), seconds * 1000); return () => window.clearTimeout(timer); }, [index, seconds, slides.length]);
  useEffect(() => { document.title = playback.data?.screen.name ? `${playback.data.screen.name} · NFOOD` : "شاشة المطعم · NFOOD"; }, [playback.data?.screen.name]);

  if (playback.isLoading) return <main className="grid min-h-screen place-items-center bg-[#07111f] text-white"><div className="text-center"><MonitorPlay className="mx-auto h-12 w-12 animate-pulse text-orange-400" /><p className="mt-4 text-sm font-bold text-slate-300">جاري تحميل شاشة المطعم…</p></div></main>;
  if (playback.isError) return <main dir="rtl" className="grid min-h-screen place-items-center bg-[#07111f] p-6 text-white"><div className="max-w-md text-center"><WifiOff className="mx-auto h-12 w-12 text-red-400" /><h1 className="mt-5 text-2xl font-black">تعذر تشغيل الشاشة</h1><p className="mt-3 text-sm leading-7 text-slate-400">الرابط غير صالح أو تم إيقاف الشاشة مؤقتًا. اطلب من مدير المطعم إنشاء رابط جديد أو تفعيل الشاشة.</p><p className="mt-4 font-mono text-xs text-slate-600">Request ID: display-{token}</p></div></main>;
  if (!slides.length) return <main dir="rtl" className="grid min-h-screen place-items-center bg-[#07111f] p-6 text-white"><div className="text-center"><MonitorPlay className="mx-auto h-12 w-12 text-orange-400" /><h1 className="mt-5 text-3xl font-black">{playback.data?.screen.name}</h1><p className="mt-3 text-sm text-slate-400">لا توجد شرائح مؤهلة للعرض حاليًا. ستتم المزامنة تلقائيًا.</p><div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-300"><Wifi className="h-4 w-4" /> متصل بالمزامنة</div></div></main>;

  return <main dir={locale === "ar" ? "rtl" : "ltr"} className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
    {slide?.mediaFile?.publicUrl ? <img src={slide.mediaFile.publicUrl} alt={title} className="absolute inset-0 h-full w-full object-cover opacity-60" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,#e76f3c55,transparent_40%),radial-gradient(circle_at_80%_75%,#2dd4bf33,transparent_35%)]" />}
    <div className="absolute inset-0 bg-gradient-to-br from-[#07111f]/90 via-[#07111f]/55 to-[#07111f]/95" />
    <div className="relative flex min-h-screen flex-col justify-between p-8 md:p-14">
      <header className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.28em] text-orange-300">NFOOD DISPLAY</p><p className="mt-2 text-sm font-bold text-slate-300">{playback.data?.screen.name}</p></div><div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-emerald-200"><Wifi className="h-4 w-4" /> مباشر</div></header>
      <section className="max-w-4xl"><div className="mb-6 h-1.5 w-20 rounded-full bg-orange-400" /><h1 className="text-5xl font-black leading-[1.08] tracking-tight drop-shadow-2xl md:text-8xl">{title}</h1>{subtitle && <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-200 md:text-3xl">{subtitle}</p>}</section>
      <footer className="flex items-end justify-between gap-4 text-xs font-bold text-slate-400"><span>{index + 1} / {slides.length}</span><span>تحديث تلقائي · NFOOD</span></footer>
    </div>
  </main>;
}
