import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Language } from "@/contexts/LanguageContext";

type BlackoutDate = { blackoutDate: string; reason: string };
type CalendarLanguage = Extract<Language, "ar" | "en" | "fr" | "ur">;

const copy: Record<CalendarLanguage, { previous: string; next: string; available: string; closed: string; choose: string; time: string; noDate: string; today: string }> = {
  ar: { previous: "الشهر السابق", next: "الشهر التالي", available: "متاح للحجز", closed: "مغلق للحجز", choose: "اختر يوم الحجز ثم الوقت", time: "وقت الحجز", noDate: "اختر يومًا متاحًا من التقويم", today: "اليوم" },
  en: { previous: "Previous month", next: "Next month", available: "Available for booking", closed: "Closed for booking", choose: "Choose a booking day and time", time: "Booking time", noDate: "Choose an available day from the calendar", today: "Today" },
  fr: { previous: "Mois précédent", next: "Mois suivant", available: "Disponible", closed: "Fermé", choose: "Choisissez un jour et une heure", time: "Heure", noDate: "Choisissez un jour disponible", today: "Aujourd’hui" },
  ur: { previous: "پچھلا مہینہ", next: "اگلا مہینہ", available: "بکنگ کے لیے دستیاب", closed: "بکنگ بند", choose: "دن اور وقت منتخب کریں", time: "وقت", noDate: "کیلنڈر سے دستیاب دن منتخب کریں", today: "آج" },
};

const weekdayLabels: Record<CalendarLanguage, string[]> = {
  ar: ["أحد", "اثن", "ثلا", "أرب", "خمي", "جمع", "سبت"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
  ur: ["اتوار", "پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ"],
};

const localeByLanguage: Record<CalendarLanguage, string> = { ar: "ar-SA-u-ca-gregory-nu-latn", en: "en-US-u-ca-gregory-nu-latn", fr: "fr-FR-u-ca-gregory-nu-latn", ur: "ur-PK-u-ca-gregory-nu-latn" };

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateKey(value?: string) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function timePart(value?: string) { return value?.match(/T(\d{2}:\d{2})/)?.[1] ?? "19:00"; }

export function MonthlyReservationCalendar({ value, onChange, blackoutDates, language }: { value: string; onChange: (value: string) => void; blackoutDates: BlackoutDate[]; language: CalendarLanguage }) {
  const labels = copy[language] ?? copy.en;
  const locale = localeByLanguage[language] ?? localeByLanguage.en;
  const today = useMemo(() => { const now = new Date(); now.setHours(0, 0, 0, 0); return now; }, []);
  const selectedDate = parseDateKey(value);
  const [visibleMonth, setVisibleMonth] = useState(() => { const base = selectedDate ?? today; return new Date(base.getFullYear(), base.getMonth(), 1); });
  const blackoutMap = useMemo(() => new Map(blackoutDates.map((item) => [item.blackoutDate, item.reason])), [blackoutDates]);
  const firstDay = visibleMonth.getDay();
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: firstDay + daysInMonth }, (_, index) => index < firstDay ? null : new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index - firstDay + 1));
  const selectedKey = selectedDate ? toDateKey(selectedDate) : "";
  const selectedReason = selectedKey ? blackoutMap.get(selectedKey) : undefined;
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(visibleMonth);
  const chooseDate = (date: Date) => { const key = toDateKey(date); if (date < today || blackoutMap.has(key)) return; onChange(`${key}T${timePart(value)}`); };
  const changeMonth = (offset: number) => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  return <div className="rounded-2xl border border-slate-200 bg-white p-3" data-monthly-reservation-calendar>
    <div className="mb-3 flex items-center justify-between gap-2"><div><div className="flex items-center gap-2 text-sm font-black text-slate-900"><CalendarDays className="h-4 w-4 text-indigo-600" />{monthLabel}</div><p className="mt-1 text-[10px] font-medium text-slate-500">{labels.choose}</p></div><div className="flex items-center gap-1"><Button type="button" variant="outline" size="icon" onClick={() => changeMonth(-1)} aria-label={labels.previous} title={labels.previous} className="h-8 w-8 rounded-lg"><ChevronLeft className="h-4 w-4" /></Button><Button type="button" variant="outline" size="icon" onClick={() => changeMonth(1)} aria-label={labels.next} title={labels.next} className="h-8 w-8 rounded-lg"><ChevronRight className="h-4 w-4" /></Button></div></div>
    <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400">{weekdayLabels[language].map((day) => <span key={day}>{day}</span>)}</div>
    <div className="grid grid-cols-7 gap-1" role="grid" aria-label={monthLabel}>{days.map((date, index) => { if (!date) return <span key={`empty-${index}`} className="h-9" aria-hidden="true" />; const key = toDateKey(date); const reason = blackoutMap.get(key); const isPast = date < today; const isSelected = key === selectedKey; const isToday = key === toDateKey(today); return <button key={key} type="button" role="gridcell" disabled={isPast || Boolean(reason)} onClick={() => chooseDate(date)} title={reason ? `${labels.closed}: ${reason}` : isPast ? labels.noDate : `${labels.available}${isToday ? ` · ${labels.today}` : ""}`} aria-label={reason ? `${key} — ${labels.closed}: ${reason}` : `${key} — ${labels.available}`} aria-selected={isSelected} className={`relative flex h-9 items-center justify-center rounded-lg text-xs font-black transition ${isPast ? "cursor-not-allowed text-slate-300" : reason ? "cursor-not-allowed bg-rose-100 text-rose-700 line-through" : isSelected ? "bg-orange-500 text-white shadow-sm" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"} ${isToday && !isSelected ? "ring-2 ring-indigo-200" : ""}`}>{date.getDate()}{reason && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-rose-600" aria-hidden="true" />}{!reason && !isPast && !isSelected && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-emerald-500" aria-hidden="true" />}</button>; })}</div>
    <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-2 text-[10px] font-bold text-slate-500"><span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />{labels.available}</span><span className="inline-flex items-center gap-1 text-rose-700"><span className="h-2 w-2 rounded-full bg-rose-600" />{labels.closed}</span></div>
    <div className="mt-3 grid gap-1"><label className="flex items-center gap-2 text-[11px] font-black text-slate-700"><Clock3 className="h-3.5 w-3.5 text-indigo-600" />{labels.time}<Input type="time" value={timePart(value)} onChange={(event) => { const dateKey = selectedKey || toDateKey(today); onChange(`${dateKey}T${event.target.value}`); }} className="h-9 w-32 bg-slate-50 text-xs" dir="ltr" /></label>{selectedReason ? <p className="rounded-lg bg-rose-50 px-2.5 py-2 text-[11px] font-bold leading-5 text-rose-700">{labels.closed}: {selectedReason}</p> : !selectedKey && <p className="text-[10px] text-slate-400">{labels.noDate}</p>}</div>
  </div>;
}
