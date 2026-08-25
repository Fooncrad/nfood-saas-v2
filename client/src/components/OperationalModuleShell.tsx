import { useEffect, useRef, useState, type ReactNode } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type OperationalModuleShellProps = { title: string; children: ReactNode; compact?: boolean };

export function OperationalModuleShell({ title, children, compact = false }: OperationalModuleShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === containerRef.current) await document.exitFullscreen();
      else if (containerRef.current?.requestFullscreen) await containerRef.current.requestFullscreen();
      else setIsFullscreen((value) => !value);
    } catch {
      setIsFullscreen((value) => !value);
    }
  };

  return <section ref={containerRef} className={isFullscreen ? "min-h-screen overflow-y-auto bg-slate-50 p-4 md:p-6" : compact ? "flex h-full min-h-0 flex-col overflow-hidden" : "space-y-3"} aria-label={title}>
    <div className={`flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 ${compact ? "py-1.5" : "py-2"} shadow-sm`}>
      <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e76f3c]">مساحة تشغيلية</p><p className="text-sm font-black text-[#111c2e]">{title}</p></div>
      <Button type="button" variant="outline" onClick={() => void toggleFullscreen()} aria-pressed={isFullscreen} className="h-9 gap-2 rounded-xl px-3 text-xs font-bold">
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        {isFullscreen ? "خروج من الشاشة الكاملة" : "شاشة كاملة"}
      </Button>
    </div>
    {children}
  </section>;
}
