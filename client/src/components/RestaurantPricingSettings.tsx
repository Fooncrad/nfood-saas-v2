import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Percent, Save } from "lucide-react";
import { toast } from "sonner";

export function RestaurantPricingSettings({ restaurantId }: { restaurantId: number }) {
  const query = trpc.platform.restaurantById.useQuery({ id: restaurantId });
  const update = trpc.platform.updateRestaurantPricing.useMutation({ onSuccess: () => { toast.success("تم تحديث الخصم والضريبة فورياً"); void query.refetch(); }, onError: (error) => toast.error(`تعذر تحديث إعدادات التسعير: ${error.message}`) });
  const [discount, setDiscount] = useState("0");
  const [tax, setTax] = useState("0");
  useEffect(() => { if (query.data) { setDiscount(String(query.data.defaultDiscountPercent ?? "0")); setTax(String(query.data.taxPercent ?? "0")); } }, [query.data]);
  const valid = [discount, tax].every((value) => /^\d{1,3}(\.\d{1,2})?$/.test(value) && Number(value) >= 0 && Number(value) <= 100);
  return <Card className="mb-6 rounded-2xl border-amber-200 bg-gradient-to-br from-amber-50/70 via-white to-white shadow-sm"><CardHeader className="border-b border-amber-100"><div className="flex items-center justify-between gap-3"><div><CardTitle className="flex items-center gap-2 text-base"><Percent className="h-4 w-4 text-amber-600" />الخصومات والضرائب</CardTitle><p className="mt-1 text-xs text-slate-500">تُحفظ النسب في المطعم ويطبقها الخادم تلقائياً على طلبات POS الجديدة.</p></div><Badge className="rounded-lg bg-emerald-50 text-emerald-700">تحديث فوري</Badge></div></CardHeader><CardContent className="grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="grid gap-2 text-xs font-bold text-slate-700">الخصم الافتراضي (%)<Input inputMode="decimal" min="0" max="100" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} className="rounded-xl bg-white" aria-label="نسبة الخصم الافتراضية" /></label><label className="grid gap-2 text-xs font-bold text-slate-700">الضريبة (%)<Input inputMode="decimal" min="0" max="100" step="0.01" value={tax} onChange={(event) => setTax(event.target.value)} className="rounded-xl bg-white" aria-label="نسبة الضريبة" /></label><Button disabled={!valid || update.isPending || query.isLoading} onClick={() => update.mutate({ restaurantId, defaultDiscountPercent: Number(discount), taxPercent: Number(tax) })} className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]"><Save className="ml-2 h-4 w-4" />{update.isPending ? "جارٍ الحفظ..." : "حفظ الإعدادات"}</Button></CardContent></Card>;
}
