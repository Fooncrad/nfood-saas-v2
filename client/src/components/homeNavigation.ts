import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Boxes,
  ChefHat,
  Clock3,
  HardDrive,
  LayoutDashboard,
  Megaphone,
  ShieldCheck,
  ShoppingBag,
  Settings2,
  Store,
  Table2,
  Users,
  Utensils,
  WalletCards,
  Printer,
} from "lucide-react";
import type { TranslationKey } from "@/contexts/LanguageContext";

export type OrderStatus = "new" | "preparing" | "ready" | "completed";
export type NavKey = "overview" | "admin" | "accounts" | "settings" | "operations" | "files" | "branches" | "orders" | "pos" | "printers" | "kds" | "menu" | "tables" | "qr" | "inventory" | "team" | "marketing" | "reservations" | "remote" | "security" | "health";
export type Order = { id: string; table: string; items: string; total: number; status: OrderStatus; time: string; channel: string; ageMinutes: number; guestName?: string | null; guestPhone?: string | null; customerNote?: string | null; cashierNotes?: string | null; deliveryNote?: string | null; kitchenSectionId?: number | null; reservationDate?: string | Date | null; reservationEventType?: string | null; partySize?: number | null; childrenCount?: number | null; splitBillMode?: string | null };

export const navItems: { key: NavKey; label: string; icon: LucideIcon }[] = [
  { key: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { key: "files", label: "مكتبة الملفات", icon: HardDrive },
  { key: "admin", label: "Super Admin", icon: ShieldCheck },
  { key: "settings", label: "الإعدادات العامة", icon: Settings2 },
  { key: "operations", label: "مركز تشغيل المطعم", icon: Clock3 },
  { key: "branches", label: "الفروع والإعدادات", icon: Store },
  { key: "orders", label: "الطلبات", icon: ShoppingBag },
  { key: "pos", label: "نقطة البيع POS", icon: WalletCards },
  { key: "printers", label: "إعداد الطابعات", icon: Printer },
  { key: "kds", label: "شاشة المطبخ KDS", icon: ChefHat },
  { key: "menu", label: "المنيو والأصناف", icon: Utensils },
  { key: "tables", label: "الطاولات", icon: Table2 },
  { key: "inventory", label: "المخزون والمشتريات", icon: Boxes },
  { key: "team", label: "الموظفون والحضور", icon: Users },
  { key: "marketing", label: "التسويق والحملات", icon: Megaphone },
  { key: "reservations", label: "الحجوزات والانتظار", icon: Clock3 },
  { key: "remote", label: "التوظيف عن بُعد", icon: Users },
  { key: "security", label: "أمان الحساب والجلسات", icon: ShieldCheck },
  { key: "health", label: "صحة النظام", icon: Activity },
];

export const navTranslationKeys: Record<NavKey, TranslationKey> = { overview: "overview", admin: "platformAdmin", accounts: "platformAdmin", settings: "generalSettings", operations: "restaurantManagementCenter", files: "mediaLibrary", branches: "branches", orders: "orders", pos: "pos", printers: "printers", kds: "kds", menu: "menu", tables: "tables", qr: "qrCustomization", inventory: "inventory", team: "team", marketing: "marketing", reservations: "reservations", remote: "remote", security: "security", health: "health" };
