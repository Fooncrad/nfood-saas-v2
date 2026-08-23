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
  Store,
  Table2,
  Users,
  Utensils,
  WalletCards,
} from "lucide-react";
import type { TranslationKey } from "@/contexts/LanguageContext";

export type OrderStatus = "new" | "preparing" | "ready" | "completed";
export type NavKey = "overview" | "admin" | "accounts" | "files" | "branches" | "orders" | "pos" | "kds" | "menu" | "tables" | "inventory" | "team" | "marketing" | "reservations" | "remote" | "security" | "health";
export type Order = { id: string; table: string; items: string; total: number; status: OrderStatus; time: string; channel: string; ageMinutes: number };

export const navItems: { key: NavKey; label: string; icon: LucideIcon }[] = [
  { key: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { key: "files", label: "مكتبة الملفات", icon: HardDrive },
  { key: "admin", label: "Super Admin", icon: ShieldCheck },
  { key: "branches", label: "الفروع والإعدادات", icon: Store },
  { key: "orders", label: "الطلبات", icon: ShoppingBag },
  { key: "pos", label: "نقطة البيع POS", icon: WalletCards },
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

export const navTranslationKeys: Record<NavKey, TranslationKey> = { overview: "overview", admin: "platformAdmin", accounts: "platformAdmin", files: "mediaLibrary", branches: "branches", orders: "orders", pos: "pos", kds: "kds", menu: "menu", tables: "tables", inventory: "inventory", team: "team", marketing: "marketing", reservations: "reservations", remote: "remote", security: "security", health: "health" };
export const statusLabels: Record<OrderStatus, string> = { new: "جديد", preparing: "قيد التحضير", ready: "جاهز", completed: "مكتمل" };
export const statusStyles: Record<OrderStatus, string> = { new: "bg-amber-50 text-amber-700 border-amber-200", preparing: "bg-blue-50 text-blue-700 border-blue-200", ready: "bg-emerald-50 text-emerald-700 border-emerald-200", completed: "bg-slate-100 text-slate-600 border-slate-200" };
