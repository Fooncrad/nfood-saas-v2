import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLanguage, type Language } from "@/contexts/LanguageContext";

const themePresetOptions = [
  ["nfood-sunset", "Sunset"],
  ["olive-cream", "Olive cream"],
  ["midnight-berry", "Midnight berry"],
  ["ocean-mint", "Ocean mint"],
] as const;
const normalizeThemePreset = (preset: string) => ({ olive: "olive-cream", berry: "midnight-berry", ocean: "ocean-mint" } as Record<string, string>)[preset] ?? preset;

export function AccountPreferencesPanel({ onClose }: { onClose?: () => void }) {
  const { language, setLanguage } = useLanguage();
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("system");
  const [themePreset, setThemePreset] = useState("nfood-sunset");
  const preferences = trpc.platform.myPreferences.useQuery(undefined, { retry: false });
  const save = trpc.platform.saveMyPreferences.useMutation({ onSuccess: (data) => { setLanguage(data.language as Language); applyTheme(data.themeMode); localStorage.setItem("nfood-theme-preset", data.themePreset); toast.success("تم حفظ تفضيلاتك"); onClose?.(); }, onError: (error) => toast.error(`تعذر حفظ التفضيلات: ${error.message}`) });
  useEffect(() => { if (!preferences.data) return; setThemeMode(preferences.data.themeMode); setThemePreset(normalizeThemePreset(preferences.data.themePreset)); }, [preferences.data]);
  const applyTheme = (mode: "light" | "dark" | "system") => { const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches); document.documentElement.classList.toggle("dark", dark); localStorage.setItem("theme", dark ? "dark" : "light"); };
  return <Card className="rounded-3xl border-0 bg-white shadow-xl" dir="rtl"><CardHeader><CardTitle className="text-xl font-black">تفضيلات الحساب</CardTitle></CardHeader><CardContent className="space-y-5"><div><p className="mb-2 text-sm font-bold">لغة لوحة التحكم</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{([['ar','العربية'],['en','English'],['fr','Français'],['ur','اردو'],['es','Español'],['de','Deutsch'],['tr','Türkçe']] as const).map(([value,label]) => <button key={value} type="button" onClick={() => setLanguage(value)} className={`rounded-xl border px-2 py-2 text-xs font-bold ${language === value ? "border-[#e76f3c] bg-orange-50 text-[#d85f2e]" : "border-slate-200 text-slate-600"}`}>{label}</button>)}</div></div><div><p className="mb-2 text-sm font-bold">المظهر</p><div className="grid grid-cols-3 gap-2">{([['light','فاتح'],['dark','داكن'],['system','حسب الجهاز']] as const).map(([value,label]) => <button key={value} type="button" onClick={() => { setThemeMode(value); applyTheme(value); }} className={`rounded-xl border px-2 py-2 text-xs font-bold ${themeMode === value ? "border-[#e76f3c] bg-orange-50 text-[#d85f2e]" : "border-slate-200 text-slate-600"}`}>{label}</button>)}</div></div><div><p className="mb-2 text-sm font-bold">قالب اللون</p><select value={themePreset} onChange={(event) => setThemePreset(event.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">{themePresetOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="flex gap-2"><Button onClick={() => save.mutate({ language, themeMode, themePreset })} disabled={save.isPending} className="rounded-xl bg-[#e76f3c] text-white">{save.isPending ? "جارٍ الحفظ..." : "حفظ التفضيلات"}</Button>{onClose && <Button variant="outline" onClick={onClose} className="rounded-xl">إلغاء</Button>}</div></CardContent></Card>;
}
