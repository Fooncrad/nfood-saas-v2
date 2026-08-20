export type DashboardRole = "restaurant_admin" | "waiter" | "kitchen" | "cashier" | "customer" | "driver";

export type DashboardProfile = {
  title: string;
  body: string;
  action: string;
  target: string;
  secondary: Array<{ label: string; target: string }>;
};

export const dashboardProfiles: Record<DashboardRole, DashboardProfile> = {
  restaurant_admin: { title: "مركز إدارة المطعم", body: "راجع صحة النظام والميزات الديناميكية والعمليات اليومية.", action: "فتح إدارة الميزات", target: "admin", secondary: [{ label: "إدارة الفروع", target: "branches" }, { label: "فحص صحة النظام", target: "health" }] },
  waiter: { title: "مركز خدمة الطاولات", body: "تابع الطلبات الجديدة وإشغال الطاولات وتواصل مع فريق المطبخ.", action: "فتح الطلبات", target: "orders", secondary: [{ label: "عرض الطاولات", target: "tables" }, { label: "إنشاء مهمة", target: "remote" }] },
  kitchen: { title: "مركز تشغيل المطبخ", body: "ابدأ بالطلبات الجديدة ثم انقلها إلى التحضير والجاهزية.", action: "فتح KDS", target: "kds", secondary: [{ label: "الطلبات الجديدة", target: "orders" }, { label: "المخزون", target: "inventory" }] },
  cashier: { title: "مركز الكاشير", body: "أنشئ طلبًا جديدًا وتحقق من حالة الدفع والطلبات المكتملة.", action: "فتح POS", target: "pos", secondary: [{ label: "مراجعة الطلبات", target: "orders" }, { label: "الطاولات", target: "tables" }] },
  customer: { title: "مركز العميل", body: "استعرض طلباتك الأخيرة وأعد الطلب من المساحة الموحدة.", action: "عرض الطلبات", target: "orders", secondary: [{ label: "إعادة الطلب", target: "orders" }, { label: "أمان الحساب", target: "security" }] },
  driver: { title: "مركز التوصيل", body: "تابع الطلبات المخصصة لك وتحديثات مهام التوصيل.", action: "فتح الطلبات", target: "orders", secondary: [{ label: "المهام عن بُعد", target: "remote" }, { label: "أمان الحساب", target: "security" }] },
};
