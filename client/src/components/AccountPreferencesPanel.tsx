import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLanguage, type Language } from "@/contexts/LanguageContext";

const themePresetOptions = [
  ["nfood-sunset", { ar: "Sunset", en: "Sunset", fr: "Sunset" }],
  ["olive-cream", { ar: "Olive cream", en: "Olive cream", fr: "Olive cream" }],
  ["midnight-berry", { ar: "Midnight berry", en: "Midnight berry", fr: "Midnight berry" }],
  ["ocean-mint", { ar: "Ocean mint", en: "Ocean mint", fr: "Ocean mint" }],
] as const;

const normalizeThemePreset = (preset: string) =>
  ({
    olive: "olive-cream",
    berry: "midnight-berry",
    ocean: "ocean-mint",
  } as Record<string, string>)[preset] ?? preset;

const languageOptions = [
  ["ar", { ar: "العربية", en: "Arabic", fr: "Arabe" }],
  ["en", { ar: "الإنجليزية", en: "English", fr: "Anglais" }],
  ["fr", { ar: "الفرنسية", en: "French", fr: "Français" }],
] as const;

const themeModeOptions = [
  ["light", { ar: "فاتح", en: "Light", fr: "Clair" }],
  ["dark", { ar: "داكن", en: "Dark", fr: "Sombre" }],
  ["system", { ar: "حسب الجهاز", en: "System", fr: "Système" }],
] as const;

const copy = {
  ar: { title: "تفضيلات الحساب", dashboardLanguage: "لغة لوحة التحكم", appearance: "المظهر", colorTheme: "قالب اللون", save: "حفظ التفضيلات", saving: "جارٍ الحفظ...", cancel: "إلغاء", saved: "تم حفظ تفضيلاتك", saveError: "تعذر حفظ التفضيلات" },
  en: { title: "Account preferences", dashboardLanguage: "Dashboard language", appearance: "Appearance", colorTheme: "Color theme", save: "Save preferences", saving: "Saving...", cancel: "Cancel", saved: "Preferences saved", saveError: "Could not save preferences" },
  fr: { title: "Préférences du compte", dashboardLanguage: "Langue du tableau de bord", appearance: "Apparence", colorTheme: "Thème de couleur", save: "Enregistrer les préférences", saving: "Enregistrement...", cancel: "Annuler", saved: "Préférences enregistrées", saveError: "Impossible d’enregistrer les préférences" },
} as const;

export function AccountPreferencesPanel({ onClose }: { onClose?: () => void }) {
  const { language, setLanguage } = useLanguage();
  const activeLanguage: "ar" | "en" | "fr" = language === "fr" ? "fr" : language === "en" ? "en" : "ar";
  const t = copy[activeLanguage];
  const direction = activeLanguage === "ar" ? "rtl" : "ltr";
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("system");
  const [themePreset, setThemePreset] = useState("nfood-sunset");
  const preferences = trpc.platform.myPreferences.useQuery(undefined, { retry: false });

  const applyTheme = (mode: "light" | "dark" | "system") => {
    const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  const save = trpc.platform.saveMyPreferences.useMutation({
    onSuccess: data => {
      setLanguage(data.language as Language);
      applyTheme(data.themeMode);
      localStorage.setItem("nfood-theme-preset", data.themePreset);
      toast.success(copy[ data.language === "fr" ? "fr" : data.language === "en" ? "en" : "ar" ].saved);
      onClose?.();
    },
    onError: error => toast.error(`${t.saveError}: ${error.message}`),
  });

  useEffect(() => {
    if (!preferences.data) return;
    setThemeMode(preferences.data.themeMode);
    setThemePreset(normalizeThemePreset(preferences.data.themePreset));
  }, [preferences.data]);

  return (
    <Card className="rounded-3xl border-0 bg-white shadow-xl" dir={direction}>
      <CardHeader>
        <CardTitle className="text-xl font-black">{t.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-bold">{t.dashboardLanguage}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {languageOptions.map(([value, labels]) => (
              <button key={value} type="button" onClick={() => setLanguage(value)} className={`rounded-xl border px-2 py-2 text-xs font-bold ${language === value ? "border-[#e76f3c] bg-orange-50 text-[#d85f2e]" : "border-slate-200 text-slate-600"}`}>
                {labels[activeLanguage]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold">{t.appearance}</p>
          <div className="grid grid-cols-3 gap-2">
            {themeModeOptions.map(([value, labels]) => (
              <button key={value} type="button" onClick={() => { setThemeMode(value); applyTheme(value); }} className={`rounded-xl border px-2 py-2 text-xs font-bold ${themeMode === value ? "border-[#e76f3c] bg-orange-50 text-[#d85f2e]" : "border-slate-200 text-slate-600"}`}>
                {labels[activeLanguage]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold">{t.colorTheme}</p>
          <select value={themePreset} onChange={event => setThemePreset(event.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
            {themePresetOptions.map(([value, labels]) => <option key={value} value={value}>{labels[activeLanguage]}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => save.mutate({ language: activeLanguage, themeMode, themePreset })} disabled={save.isPending} className="rounded-xl bg-[#e76f3c] text-white">
            {save.isPending ? t.saving : t.save}
          </Button>
          {onClose && <Button variant="outline" onClick={onClose} className="rounded-xl">{t.cancel}</Button>}
        </div>
      </CardContent>
    </Card>
  );
}

