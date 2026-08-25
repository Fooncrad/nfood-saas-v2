import { X } from "lucide-react";

type PendingTransferBannerProps = {
  count: number;
  language: "ar" | "en" | "fr" | "ur";
  onOpen: () => void;
  onClose: () => void;
};

export function PendingTransferBanner({ count, language, onOpen, onClose }: PendingTransferBannerProps) {
  const label = language === "ar"
    ? "إيصالات تحويل جديدة تحتاج المراجعة"
    : language === "fr"
      ? "De nouveaux reçus de virement nécessitent une vérification"
      : language === "ur"
        ? "نئی منتقلی کی رسیدیں جائزے کی منتظر ہیں"
        : "New transfer receipts need review";
  return (
    <div className="mx-3 mt-2 flex min-h-10 w-[calc(100%-1.5rem)] items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-right text-xs font-bold text-amber-900 shadow-sm">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-right">
        <span>{label}</span>
        <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs text-white">{count}</span>
      </button>
      <button type="button" aria-label={language === "ar" ? "إغلاق إشعار إيصالات التحويل" : "Close transfer receipt notice"} title={language === "ar" ? "إغلاق" : "Close"} onClick={onClose} className="rounded-lg p-1.5 text-amber-700 transition hover:bg-amber-100 hover:text-amber-950">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
