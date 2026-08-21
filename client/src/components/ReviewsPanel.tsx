import { useState } from "react";
import { MessageSquareQuote, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

const labels = { restaurant: "المطعم", driver: "السائق", product: "المنتج" } as const;
type TargetType = keyof typeof labels;

export function ReviewsPanel({ restaurantId }: { restaurantId: number }) {
  const [targetType, setTargetType] = useState<TargetType | "all">("all");
  const reviews = trpc.platform.restaurantReviews.useQuery({ restaurantId, targetType: targetType === "all" ? undefined : targetType }, { retry: false });
  return <Card className="mt-5 rounded-2xl border-slate-200 bg-white shadow-sm" dir="rtl">
    <CardHeader className="flex-row items-center justify-between border-b border-slate-100 px-5 py-4"><div><CardTitle className="flex items-center gap-2 text-lg"><MessageSquareQuote className="h-5 w-5 text-[#e76f3c]" /> التقييمات</CardTitle><p className="mt-1 text-sm text-slate-500">تقييمات منفصلة للمطعم والسائق والمنتج. تحليل المشاعر غير مفعل.</p></div><div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">{(["all", "restaurant", "driver", "product"] as const).map((item) => <button key={item} type="button" onClick={() => setTargetType(item)} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${targetType === item ? "bg-white text-[#e76f3c] shadow-sm" : "text-slate-500"}`}>{item === "all" ? "الكل" : labels[item]}</button>)}</div></CardHeader>
    <CardContent className="p-0">{reviews.isError ? <div className="p-6 text-sm text-red-600">تعذر تحميل التقييمات. Request ID: reviews-{restaurantId} <button type="button" onClick={() => void reviews.refetch()} className="mr-1 font-bold underline">إعادة المحاولة</button></div> : reviews.isLoading ? <div className="p-8 text-center text-sm text-slate-500">جارٍ تحميل التقييمات...</div> : !reviews.data?.length ? <div className="p-8 text-center text-sm text-slate-500">لا توجد تقييمات محفوظة بعد.</div> : <div className="divide-y divide-slate-100">{reviews.data.map((review) => <div key={review.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><div className="flex items-center gap-2"><Badge variant="outline" className="rounded-lg">{labels[review.targetType as TargetType]}</Badge><span className="text-xs text-slate-500">طلب #{review.orderId}</span></div>{review.comment && <p className="mt-2 text-sm text-slate-700">{review.comment}</p>}</div><div className="flex items-center gap-1 text-amber-500">{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-current" : "text-slate-200"}`} />)}</div></div>)}</div>}</CardContent>
  </Card>;
}
