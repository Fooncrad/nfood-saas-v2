export type OrderStatusKey = "new" | "preparing" | "ready" | "completed" | "cancelled";
export type PaymentStatusKey = "unpaid" | "paid" | "failed" | "refunded";
export type DeliveryStatusKey = "unassigned" | "assigned" | "picked_up" | "out_for_delivery" | "delivered" | "failed" | "returned";

export const orderStatusPalette: Record<OrderStatusKey, { label: string; className: string; dotClassName: string }> = {
  new: { label: "جديد", className: "border-blue-200 bg-blue-50 text-blue-700", dotClassName: "bg-blue-500" },
  preparing: { label: "قيد التحضير", className: "border-orange-200 bg-orange-50 text-orange-700", dotClassName: "bg-orange-500" },
  ready: { label: "جاهز", className: "border-blue-200 bg-blue-50 text-blue-700", dotClassName: "bg-blue-500" },
  completed: { label: "مكتمل", className: "border-emerald-200 bg-emerald-50 text-emerald-700", dotClassName: "bg-emerald-500" },
  cancelled: { label: "ملغى", className: "border-red-200 bg-red-50 text-red-700", dotClassName: "bg-red-500" },
};

export const paymentStatusPalette: Record<PaymentStatusKey, { label: string; className: string }> = {
  unpaid: { label: "غير مدفوع", className: "border-amber-200 bg-amber-50 text-amber-800" },
  paid: { label: "مدفوع", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  failed: { label: "فشل الدفع", className: "border-red-200 bg-red-50 text-red-700" },
  refunded: { label: "مسترد", className: "border-blue-200 bg-blue-50 text-blue-700" },
};

export const deliveryStatusPalette: Record<DeliveryStatusKey, { label: string; className: string }> = {
  unassigned: { label: "غير معيّن", className: "border-slate-200 bg-slate-50 text-slate-600" },
  assigned: { label: "تم التعيين", className: "border-blue-200 bg-blue-50 text-blue-700" },
  picked_up: { label: "تم الاستلام", className: "border-orange-200 bg-orange-50 text-orange-700" },
  out_for_delivery: { label: "في الطريق", className: "border-blue-200 bg-blue-50 text-blue-700" },
  delivered: { label: "تم التسليم", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  failed: { label: "فشل التوصيل", className: "border-red-200 bg-red-50 text-red-700" },
  returned: { label: "مرتجع", className: "border-red-200 bg-red-50 text-red-700" },
};

export function getDeliveryStatusPalette(status: string) {
  return deliveryStatusPalette[status as DeliveryStatusKey] ?? { label: status, className: "border-slate-200 bg-slate-50 text-slate-600" };
}

export const actionPalette = {
  destructive: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800",
  operational: "bg-[#e76f3c] text-white hover:bg-[#d85f2e]",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
  informational: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  warning: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
} as const;

export function getOrderStatusPalette(status: string) {
  return orderStatusPalette[status as OrderStatusKey] ?? { label: status, className: "border-slate-200 bg-slate-50 text-slate-600", dotClassName: "bg-slate-400" };
}
