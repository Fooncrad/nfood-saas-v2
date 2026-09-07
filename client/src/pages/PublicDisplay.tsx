import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { QRCodeSVG } from "qrcode.react";
import { MonitorPlay, Volume2, VolumeX, Wifi, WifiOff } from "lucide-react";

function readKioskPreference(token: string) {
  if (typeof window === "undefined" || !token) return false;
  try { return window.localStorage.getItem(`nfood-display-kiosk:${token}`) === "1"; } catch { return false; }
}

function writeKioskPreference(token: string) {
  if (typeof window === "undefined" || !token) return;
  try { window.localStorage.setItem(`nfood-display-kiosk:${token}`, "1"); } catch { /* بعض متصفحات التلفاز تمنع التخزين المحلي */ }
}

type CachedDisplayPayload = { screen: any; slides: any[]; match: any };
const displayCacheKey = (token: string) => `nfood-display-playback:${token}`;
function readCachedDisplay(token: string): CachedDisplayPayload | null {
  if (typeof window === "undefined" || !token) return null;
  try { const raw = window.localStorage.getItem(displayCacheKey(token)); return raw ? JSON.parse(raw) as CachedDisplayPayload : null; } catch { return null; }
}

export default function PublicDisplay() {
  const { token } = useParams<{ token: string }>();
  const kioskMode = typeof window !== "undefined" && (new URLSearchParams(window.location.search).get("kiosk") === "1" || readKioskPreference(token ?? ""));
  const [fullscreen, setFullscreen] = useState(false);
  const [supportsFullscreen, setSupportsFullscreen] = useState(false);
  const [connectionState, setConnectionState] = useState<"connecting" | "connected" | "offline">("connecting");
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const playback = trpc.restaurantContent.publicPlayback.useQuery({ token: token ?? "" }, { enabled: Boolean(token), retry: 1, refetchInterval: (query) => (query.state.data?.screen.refreshSeconds ?? 30) * 1000 });
  const [cachedPlayback, setCachedPlayback] = useState<CachedDisplayPayload | null>(() => readCachedDisplay(token ?? ""));
  const isPausedByAdmin = playback.isError && playback.error?.message.includes("متوقفة");
  const activePlayback = isPausedByAdmin ? null : (playback.data ?? cachedPlayback);
  const playbackToken = activePlayback?.screen.publicToken ?? "";
  const verifyPin = trpc.restaurantContent.verifyKioskPin.useMutation();
  const slides = activePlayback?.slides ?? [];
  const [index, setIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const slide = slides[index % Math.max(slides.length, 1)];
  const match = activePlayback?.match;
  const [matchNow, setMatchNow] = useState(() => Date.now());
  const [clockNow, setClockNow] = useState(() => Date.now());
  const seconds = slide?.durationSeconds ?? 8;
  const locale = typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("ar") ? "ar" : "en";
  const title = useMemo(() => slide?.title ?? slide?.menuItem?.name ?? "", [slide]);
  const subtitle = slide?.subtitle ?? slide?.menuItem?.description ?? "";
  const titleEn = slide?.titleEn ?? "";
  const subtitleEn = slide?.subtitleEn ?? "";
  const displayTitle = match?.headline ?? title;
  const displaySubtitle = match?.body ?? subtitle;
  const displayTitleEn = match ? "Live offer" : titleEn;
  const displaySubtitleEn = match ? "Discover the moment at Nasser Cafe" : subtitleEn;
  const displayImage = match?.mediaFile?.publicUrl ?? slide?.externalImageUrl ?? slide?.mediaFile?.publicUrl ?? slide?.menuItem?.imageUrl ?? "";
  const displayName = activePlayback?.screen.name?.trim() || "Nasser Cafe · شاشة النكهات";
  const menuUrl = activePlayback?.screen.restaurantSlug ? `${window.location.origin}/menu/${activePlayback.screen.restaurantSlug}` : "";
  const matchSeconds = match?.countdownEndsAt ? Math.max(0, Math.ceil((new Date(match.countdownEndsAt).getTime() - matchNow) / 1000)) : null;
  const displayQrUrl = match?.qrTargetUrl || menuUrl;
  const timedOffer = useMemo(() => {
    const hour = new Date(clockNow).getHours();
    if (hour < 12) return { label: "صباح ناصر", message: "ابدأ يومك بقهوة طازجة واختيار يليق بصباحك" };
    if (hour < 17) return { label: "اختيار الظهيرة", message: "استراحة خفيفة بنكهة تستحق التجربة" };
    if (hour < 22) return { label: "أمسية ناصر", message: "اجعل مساءك ألذ مع اختياراتنا اليوم" };
    return { label: "ليلة ناصر", message: "نكهة هادئة لختام يومك" };
  }, [clockNow]);
  const qrPositionClass = "right-6 bottom-24 md:right-10 md:bottom-28";

  useEffect(() => { setIndex(0); }, [activePlayback?.screen.id, slides.length]);
  useEffect(() => { if (!playback.data || !token || typeof window === "undefined") return; try { window.localStorage.setItem(displayCacheKey(token), JSON.stringify(playback.data)); setCachedPlayback(playback.data as CachedDisplayPayload); } catch { /* التخزين المؤقت اختياري */ } }, [playback.data, token]);
  useEffect(() => { slides.forEach((item) => { const url = item?.externalImageUrl ?? item?.mediaFile?.publicUrl ?? item?.menuItem?.imageUrl; if (url && typeof window !== "undefined") { const image = new Image(); image.decoding = "async"; image.src = url; } }); }, [slides]);
  useEffect(() => { if (!playbackToken || typeof window === "undefined" || !window.WebSocket) { setConnectionState("offline"); return; } let socket: WebSocket | null = null; let retryTimer: number | undefined; let heartbeatTimer: number | undefined; let retryAttempt = 0; let disposed = false; const connect = () => { if (disposed) return; setConnectionState("connecting"); const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"; socket = new WebSocket(`${protocol}//${window.location.host}/api/display-ws?token=${encodeURIComponent(playbackToken)}`); socket.onopen = () => { retryAttempt = 0; setConnectionState("connected"); }; socket.onmessage = (event) => { try { const message = JSON.parse(event.data) as { type?: string }; if (message.type === "display.updated") void playback.refetch(); } catch { /* تجاهل رسالة غير معروفة */ } }; socket.onclose = () => { if (disposed) return; setConnectionState("offline"); const delay = Math.min(30_000, 1_000 * 2 ** Math.min(retryAttempt, 5)); retryAttempt += 1; retryTimer = window.setTimeout(connect, delay); }; socket.onerror = () => socket?.close(); }; const onOnline = () => { retryAttempt = 0; if (socket?.readyState !== WebSocket.OPEN) { socket?.close(); connect(); } }; const onOffline = () => setConnectionState("offline"); window.addEventListener("online", onOnline); window.addEventListener("offline", onOffline); connect(); heartbeatTimer = window.setInterval(() => { if (socket?.readyState === WebSocket.OPEN) socket.send("ping"); }, 15_000); return () => { disposed = true; if (retryTimer) window.clearTimeout(retryTimer); if (heartbeatTimer) window.clearInterval(heartbeatTimer); window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); socket?.close(); }; }, [playbackToken, playback.refetch]);
  useEffect(() => { if (typeof document === "undefined") return; setSupportsFullscreen(typeof document.documentElement.requestFullscreen === "function"); }, []);
  useEffect(() => { if (!kioskMode || typeof document === "undefined") return; const onFullscreen = () => { const active = Boolean(document.fullscreenElement); setFullscreen(active); if (!active) setShowPinPrompt(true); }; document.addEventListener("fullscreenchange", onFullscreen); return () => document.removeEventListener("fullscreenchange", onFullscreen); }, [kioskMode]);
  useEffect(() => { if (!kioskMode || typeof window === "undefined") return; const onKeyDown = (event: KeyboardEvent) => { if (event.key.toLowerCase() === "f" && !event.ctrlKey && !event.metaKey && !event.altKey && supportsFullscreen) enterFullscreen(); }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, [kioskMode, supportsFullscreen]);
  useEffect(() => { setImageFailed(false); }, [displayImage, index]);
  useEffect(() => { if (!match?.countdownEndsAt) return; const timer = window.setInterval(() => setMatchNow(Date.now()), 1000); return () => window.clearInterval(timer); }, [match?.countdownEndsAt]);
  useEffect(() => { const timer = window.setInterval(() => setClockNow(Date.now()), 60_000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { if (slides.length < 2) return; const timer = window.setTimeout(() => setIndex((current) => (current + 1) % slides.length), seconds * 1000); return () => window.clearTimeout(timer); }, [index, seconds, slides.length]);
  const playTransitionChime = () => { if (typeof window === "undefined") return; const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext; if (!AudioContextCtor) return; const context = audioContextRef.current ?? new AudioContextCtor(); audioContextRef.current = context; void context.resume(); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.type = "sine"; oscillator.frequency.setValueAtTime(660, context.currentTime); oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.1); gain.gain.setValueAtTime(0.0001, context.currentTime); gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.02); gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18); oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.2); };
  useEffect(() => {
    if (typeof window === "undefined") return;
    const enableAudioAfterInteraction = () => { setSoundEnabled(true); playTransitionChime(); };
    window.addEventListener("pointerdown", enableAudioAfterInteraction, { once: true });
    window.addEventListener("keydown", enableAudioAfterInteraction, { once: true });
    return () => { window.removeEventListener("pointerdown", enableAudioAfterInteraction); window.removeEventListener("keydown", enableAudioAfterInteraction); };
  }, []);
  useEffect(() => { if (soundEnabled && index > 0) playTransitionChime(); }, [index, soundEnabled]);
  useEffect(() => () => { if (audioContextRef.current) void audioContextRef.current.close(); }, []);
  useEffect(() => { document.title = playback.data?.screen.name ? `${playback.data.screen.name} · NFOOD` : "شاشة المطعم · NFOOD"; }, [playback.data?.screen.name]);
  useEffect(() => { if (!kioskMode || !token) return; writeKioskPreference(token); const request = () => { const requestFullscreen = document.documentElement.requestFullscreen; if (typeof requestFullscreen !== "function") return; void requestFullscreen.call(document.documentElement).then(() => setFullscreen(true)).catch(() => undefined); }; request(); const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement)); document.addEventListener("fullscreenchange", onFullscreen); return () => document.removeEventListener("fullscreenchange", onFullscreen); }, [kioskMode, token]);
  const enterFullscreen = () => { if (typeof document === "undefined" || !supportsFullscreen) return; document.documentElement.requestFullscreen?.().then(() => { setFullscreen(true); setShowPinPrompt(false); }).catch(() => undefined); };
  const submitPin = () => { setPinError(""); verifyPin.mutate({ token: playbackToken || token || "", pin }, { onSuccess: () => { setPin(""); setShowPinPrompt(false); void document.exitFullscreen?.(); }, onError: (error) => setPinError(error.message) }); };

  if (playback.isLoading && !cachedPlayback) return <main className="grid min-h-screen min-h-[100dvh] place-items-center bg-[#07111f] text-white"><div className="text-center"><MonitorPlay className="mx-auto h-12 w-12 animate-pulse text-orange-400" /><p className="mt-4 text-sm font-bold text-slate-300">العرض يستعد للحظتك…</p></div></main>;
  if (isPausedByAdmin) return <main dir="rtl" className="grid min-h-screen min-h-[100dvh] place-items-center bg-[#07111f] p-6 text-white"><div className="max-w-lg text-center"><MonitorPlay className="mx-auto h-14 w-14 text-orange-300" /><h1 className="mt-5 text-3xl font-black">العرض متوقف مؤقتًا</h1><p className="mt-3 text-sm leading-8 text-slate-300">نجهّز الشاشة من جديد. سيعود العرض تلقائيًا عندما يعيد المسؤول تشغيله.</p><div className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-400/10 px-4 py-2 text-xs font-bold text-orange-200"><WifiOff className="h-4 w-4" /> في انتظار المزامنة</div></div></main>;
  if (playback.isError && !cachedPlayback) return <main dir="rtl" className="grid min-h-screen min-h-[100dvh] place-items-center bg-[#07111f] p-6 text-white"><div className="max-w-lg text-center"><WifiOff className="mx-auto h-14 w-14 text-orange-300" /><h1 className="mt-5 text-3xl font-black">نعود إليك بعد لحظات</h1><p className="mt-3 text-sm leading-8 text-slate-300">الشاشة تحاول مزامنة العرض تلقائيًا. لا حاجة لأي إجراء من المشاهد.</p><div className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-300/10 px-4 py-2 text-xs font-bold text-amber-200">آخر تحديث سيظهر تلقائيًا</div></div></main>;
  if (!slides.length && !match) return <main dir="rtl" className="grid min-h-screen min-h-[100dvh] place-items-center bg-[#07111f] p-6 text-white"><div className="text-center"><MonitorPlay className="mx-auto h-12 w-12 text-orange-400" /><h1 className="mt-5 text-3xl font-black">{displayName}</h1><p className="mt-3 text-sm leading-8 text-slate-300">العرض يستعد للانطلاق. ستظهر الشرائح تلقائيًا بعد المزامنة.</p><div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-300"><Wifi className="h-4 w-4" /> جاهز للمزامنة</div></div></main>;

  return <main dir={locale === "ar" ? "rtl" : "ltr"} className="relative min-h-screen min-h-[100dvh] select-none overflow-hidden bg-[#07111f] text-white [touch-action:manipulation]">
    {kioskMode && showPinPrompt && <div className="fixed inset-0 z-50 grid place-items-center bg-[#020817]/90 p-6 backdrop-blur-sm"><form onSubmit={(event) => { event.preventDefault(); submitPin(); }} className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0d1a2d] p-6 text-right shadow-2xl"><h2 className="text-xl font-black">الخروج من وضع Kiosk</h2><p className="mt-2 text-sm leading-6 text-slate-300">أدخل رمز PIN المعتمد للخروج من وضع العرض.</p><input autoFocus inputMode="numeric" pattern="[0-9]{4,8}" maxLength={8} value={pin} onChange={(event) => setPin(event.target.value.replace(/\\D/g, ""))} className="mt-5 h-12 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-center text-xl tracking-[0.5em] text-white outline-none focus:border-orange-400" placeholder="••••" /><p className="mt-2 min-h-5 text-xs text-rose-300">{pinError}</p><button type="submit" disabled={verifyPin.isPending || pin.length < 4} className="mt-3 w-full rounded-2xl bg-orange-500 py-3 text-sm font-black text-white disabled:opacity-50">{verifyPin.isPending ? "جارٍ التحقق…" : "تحقق واخرج"}</button></form></div>}
    {displayImage && !imageFailed ? <><div className="absolute inset-0 scale-105 bg-cover bg-center opacity-65 blur-2xl" style={{ backgroundImage: `url(${displayImage})` }} /><div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,#e76f3c66,transparent_40%),radial-gradient(circle_at_80%_75%,#2dd4bf44,transparent_35%)]" /><img key={`${slide?.id ?? index}-image`} src={displayImage} alt={displayTitle} onError={() => setImageFailed(true)} className="nfood-display-media-enter nfood-display-media-fade absolute inset-0 h-full w-full object-contain p-8 brightness-110 contrast-110 saturate-125 drop-shadow-2xl sm:p-12" /></> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,#e76f3c66,transparent_40%),radial-gradient(circle_at_80%_75%,#2dd4bf44,transparent_35%)]"><div className="absolute inset-0 grid place-items-center"><div className="max-w-xl px-8 text-center"><div className="mx-auto h-1.5 w-24 rounded-full bg-orange-300" /><p className="mt-8 text-xs font-black tracking-[0.3em] text-orange-200">NASSER CAFE · شاشة النكهات</p><h2 className="mt-5 text-4xl font-black text-white drop-shadow-2xl sm:text-6xl">{displayTitle || "اختيارك يستحق الظهور"}</h2><p className="mt-4 text-base text-slate-200 sm:text-xl">صورة الصنف قيد الاعتماد · العرض مستمر بجودة واضحة</p></div></div></div>}
    <div className="absolute inset-0 bg-gradient-to-br from-[#07111f]/60 via-[#07111f]/15 to-[#07111f]/80" />
    {activePlayback?.screen.qrEnabled && displayQrUrl && <div className={`nfood-display-qr absolute z-20 rounded-2xl p-3 shadow-2xl ring-1 ring-white/20 ${qrPositionClass}`} style={{ backgroundColor: activePlayback.screen.qrBackground }}><QRCodeSVG value={displayQrUrl} size={activePlayback.screen.qrSize} level="H" includeMargin fgColor={activePlayback.screen.qrForeground} bgColor={activePlayback.screen.qrBackground} /><p className="mt-2 text-center text-[10px] font-black text-white/80">{match ? "امسح للاستفادة من عرض المباراة" : "امسح لفتح المنيو"}</p><div className="nfood-display-promo-ribbon mt-3 min-w-[180px] max-w-[230px] rounded-xl border border-orange-200/30 bg-[#e76f3c]/90 px-3 py-2 text-center text-white shadow-lg"><p className="text-[9px] font-black uppercase tracking-[0.12em] text-orange-100">عروض وخصومات ناصر</p><p className="mt-1 truncate text-[11px] font-black">{slide?.badgeText || "اختيارات اليوم"}</p><p className="mt-1 truncate text-[10px] font-bold text-orange-50">{displayTitle || "أصناف تستحق التجربة"}</p></div></div>}
    <div className="relative flex min-h-screen min-h-[100dvh] flex-col justify-between p-4 sm:p-8 md:p-14">
      <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.28em] text-orange-300">NFOOD DISPLAY</p><p className="mt-2 text-sm font-bold text-slate-100">{displayName}</p></div><div className="flex flex-wrap items-center justify-end gap-2"><div className="flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/15 px-3 py-2 text-xs font-bold text-emerald-100" aria-label="الصوت مفعّل تلقائيًا"><Volume2 className="h-4 w-4 text-emerald-200" /> الصوت مفعّل تلقائيًا</div>{match && <div className="rounded-full bg-rose-500 px-4 py-2 text-xs font-black text-white">● وضع المباراة</div>}{matchSeconds !== null && <div className="rounded-full border border-amber-300/40 bg-amber-300/15 px-4 py-2 text-xs font-black text-amber-200">ينتهي خلال {Math.floor(matchSeconds / 60)}:{String(matchSeconds % 60).padStart(2, "0")}</div>}<div className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${connectionState === "connected" ? "border-emerald-300/20 bg-emerald-400/15 text-emerald-200" : connectionState === "connecting" ? "border-amber-300/20 bg-amber-300/15 text-amber-200" : "border-rose-300/20 bg-rose-400/15 text-rose-200"}`}>{connectionState === "connected" ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />} {connectionState === "connected" ? "متصل" : connectionState === "connecting" ? "جارٍ إعادة الاتصال" : "غير متصل · المحاولة مستمرة"}</div>{kioskMode && !fullscreen && <button type="button" onClick={enterFullscreen} disabled={!supportsFullscreen} className="rounded-full border border-orange-300/30 bg-orange-400/15 px-4 py-2 text-xs font-black text-orange-200 disabled:cursor-default disabled:opacity-80">{supportsFullscreen ? "تفعيل Kiosk / ملء الشاشة" : "Kiosk يعمل عبر متصفح الجهاز"}</button>}</div></header>
      <section key={`${slide?.id ?? "empty"}-${index}`} className="nfood-display-slide-enter nfood-display-copy-panel w-full max-w-4xl self-center overflow-y-auto rounded-[2rem] border border-white/15 bg-[#07111f]/72 p-6 text-right shadow-2xl backdrop-blur-md sm:p-10 md:max-w-[52rem] md:p-14"><div className={`mb-5 h-1.5 w-20 rounded-full ${match ? "bg-rose-400" : "bg-orange-400"}`} />{slide?.badgeText && <span className="mb-5 inline-flex max-w-full rounded-full border border-orange-200/30 bg-orange-400/20 px-4 py-2 text-sm font-black text-orange-100">{slide.badgeText}</span>}<h1 className="max-w-full break-words text-4xl font-black leading-tight tracking-tight drop-shadow-2xl sm:text-5xl md:text-7xl">{displayTitle}</h1>{displaySubtitle && <p className="mt-5 max-w-full break-words text-lg font-bold leading-8 text-slate-100 sm:text-xl md:text-3xl md:leading-[1.7]">{displaySubtitle}</p>}{displayTitleEn && <div className="mt-6 border-t border-white/15 pt-4 text-left" dir="ltr"><h2 className="max-w-full break-words text-2xl font-black leading-tight text-orange-100 sm:text-3xl md:text-4xl">{displayTitleEn}</h2>{displaySubtitleEn && <p className="mt-2 max-w-full break-words text-sm font-semibold leading-7 text-slate-200 sm:text-base md:text-xl">{displaySubtitleEn}</p>}</div>}{match?.callToAction && <span className="mt-7 inline-flex max-w-full break-words rounded-2xl bg-rose-500 px-6 py-3 text-lg font-black text-white shadow-xl">{match.callToAction}</span>}</section>
      <div key={`ad-${slide?.id ?? "empty"}-${index}`} className="nfood-display-ad-bar absolute inset-x-4 bottom-16 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-200/25 bg-[#111c2e]/90 px-4 py-3 text-right shadow-2xl backdrop-blur-md sm:inset-x-8 md:inset-x-14"><div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-300">NASSER CAFE · {timedOffer.label}</p><p className="mt-1 text-sm font-black text-white sm:text-base">{slide?.badgeText || timedOffer.label}</p></div><p className="max-w-[60%] text-xs font-bold leading-5 text-orange-50 sm:text-sm">{displayTitle || timedOffer.message} <span className="text-orange-300">· {timedOffer.message}</span></p></div><footer className="flex flex-wrap items-end justify-between gap-3 text-[10px] font-bold text-slate-400 sm:text-xs"><span>{match ? "عرض خاطف مباشر" : `${index + 1} / ${slides.length}`}</span><span>{match ? "سيعود للعرض الطبيعي بعد الإيقاف" : kioskMode ? "وضع Kiosk · تشغيل تلقائي بعد فتح الرابط" : "تحديث تلقائي · NFOOD"}</span></footer>
    </div>
  </main>;
}
