export type DashboardRole = "admin" | "restaurant_admin" | "waiter" | "kitchen" | "cashier" | "customer" | "driver";

export type DashboardProfile = {
  title: string;
  body: string;
  action: string;
  target: string;
  secondary: Array<{ label: string; target: string }>;
};

export const dashboardProfiles: Record<DashboardRole, DashboardProfile> = {
  admin: { title: "مركز إدارة المنصة", body: "أدر المطاعم والباقات والإعدادات المركزية دون وحدات تشغيل المطاعم.", action: "فتح إدارة المنصة", target: "admin", secondary: [{ label: "صحة النظام", target: "health" }, { label: "أمان الحساب", target: "security" }] },
  restaurant_admin: { title: "مركز إدارة المطعم", body: "تابع الطلبات والفروع والعمليات اليومية من مساحة المطعم.", action: "فتح الطلبات", target: "orders", secondary: [{ label: "إدارة الفروع", target: "branches" }, { label: "فتح المنيو", target: "menu" }] },
  waiter: { title: "مركز خدمة الطاولات", body: "تابع الطلبات الجديدة وإشغال الطاولات وتواصل مع فريق المطبخ.", action: "فتح الطلبات", target: "orders", secondary: [{ label: "عرض الطاولات", target: "tables" }, { label: "إنشاء مهمة", target: "remote" }] },
  kitchen: { title: "مركز تشغيل المطبخ", body: "ابدأ بالطلبات الجديدة ثم انقلها إلى التحضير والجاهزية.", action: "فتح KDS", target: "kds", secondary: [{ label: "الطلبات الجديدة", target: "orders" }, { label: "المخزون", target: "inventory" }] },
  cashier: { title: "مركز الكاشير", body: "أنشئ طلبًا جديدًا وتحقق من حالة الدفع والطلبات المكتملة.", action: "فتح POS", target: "pos", secondary: [{ label: "مراجعة الطلبات", target: "orders" }, { label: "الطاولات", target: "tables" }] },
  customer: { title: "مركز العميل", body: "استعرض طلباتك الأخيرة وأعد الطلب من المساحة الموحدة.", action: "عرض الطلبات", target: "orders", secondary: [{ label: "إعادة الطلب", target: "orders" }, { label: "أمان الحساب", target: "security" }] },
  driver: { title: "مركز التوصيل", body: "تابع الطلبات المخصصة لك وتحديثات مهام التوصيل.", action: "فتح الطلبات", target: "orders", secondary: [{ label: "المهام عن بُعد", target: "remote" }, { label: "أمان الحساب", target: "security" }] },
};
