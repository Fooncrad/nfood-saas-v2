import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("../pages/Home.tsx", import.meta.url), "utf8");
const homeModulesSource = readFileSync(new URL("../components/HomeModules.tsx", import.meta.url), "utf8");
const dashboardSource = `${homeSource}\n${homeModulesSource}`;
const reservationsSource = readFileSync(new URL("../pages/ReservationsView.tsx", import.meta.url), "utf8");
const publicRestaurantSource = readFileSync(new URL("../pages/RestaurantPublic.tsx", import.meta.url), "utf8");
const skeletonSource = readFileSync(new URL("../components/DashboardLayoutSkeleton.tsx", import.meta.url), "utf8");
const accessDeniedSource = readFileSync(new URL("../components/AccessDeniedView.tsx", import.meta.url), "utf8");
const roleManifests = ["restaurant_admin", "waiter", "kitchen", "bar", "cashier", "customer", "driver"].map((role) => readFileSync(new URL(`../../public/manifest.${role}.webmanifest`, import.meta.url), "utf8"));

describe("UI placeholder audit", () => {
  it("keeps role navigation filtering and a 403 fallback in the dashboard shell", () => {
    expect(homeSource).toContain("visibleNavItems.some");
    expect(homeSource).toContain("AccessDeniedView");
    expect(homeSource).toContain("globalForbiddenAction");
    expect(homeSource).toContain('action === "global.search" || action === "dashboard.summary"');
    expect(accessDeniedSource).toContain('dir="rtl"');
    expect(accessDeniedSource).toContain("رمز الوحدة:");
    expect(accessDeniedSource).not.toContain(">feature:");
  });

  it("keeps explicit loading, empty, error, and request-id states in the dashboard shell", () => {
    expect(dashboardSource).toContain("جارٍ تحميل");
    expect(dashboardSource).toContain("لا توجد");
    expect(dashboardSource).toContain("تعذر");
    expect(dashboardSource).toContain("Request ID");
  });

  it("does not expose the removed generic action fallback", () => {
    expect(homeSource).not.toContain("Feature coming soon");
    expect(homeSource).not.toContain("ميزة قادمة");
  });

  it("keeps restaurant branding wired into the PWA shell", () => {
    expect(homeSource).toContain("trpc.platform.branding.useQuery");
    expect(homeSource).toContain("document.title = brand?.brandName");
    expect(homeSource).toContain("meta[name=\"theme-color\"]");
    expect(homeSource).toContain("manifest.${role}.webmanifest");
    expect(homeSource).toContain("themeMeta");
  });

  it("keeps System Health wired into Super Admin", () => {
    expect(dashboardSource).toContain("trpc.admin.systemHealth.useQuery");
    expect(dashboardSource).toContain("صحة النظام");
    expect(dashboardSource).toContain("تحديث كل 30 ثانية");
  });

  it("keeps role-specific PWA manifests wired to authenticated role", () => {
    expect(homeSource).toContain("manifest.${role}.webmanifest");
    expect(homeSource).toContain("/manifest.webmanifest");
    for (const manifest of roleManifests) {
      expect(manifest).toContain('"lang": "ar"');
      expect(manifest).toContain('"dir": "rtl"');
      expect(manifest).toContain("nfood-icon-512");
      expect(manifest).toContain("nfood-icon-192");
    }
  });

  it("keeps reservation creation behind action-level permission", () => {
    expect(reservationsSource).toContain("isRoleActionAllowed");
    expect(reservationsSource).toContain("reservations.create");
    expect(reservationsSource).toContain("canCreateReservation");
  });

  it("keeps loading, empty, error and request-id coverage in core surfaces", () => {
    expect(skeletonSource).toContain("Skeleton");
    for (const source of [dashboardSource, reservationsSource]) {
      expect(source).toContain("isLoading");
      expect(source).toContain("isError");
      expect(source).toContain("Request ID");
      expect(source).toMatch(/لا توجد|لا يوجد/);
    }
  });

  it("keeps explicit states in ReservationsView", () => {
    expect(reservationsSource).toContain("isLoading");
    expect(reservationsSource).toContain("isError");
    expect(reservationsSource).toContain("Request ID");
    expect(reservationsSource).toContain("لا توجد");
  });

  it("keeps checkout wired while removing public guest tracking", () => {
    expect(publicRestaurantSource).toContain("trpc.platform.guestCheckout.useMutation");
    expect(publicRestaurantSource).not.toContain("trpc.platform.trackGuestOrder.useQuery");
    expect(publicRestaurantSource).not.toContain("trpc.platform.reorderGuestOrder.useMutation");
    expect(publicRestaurantSource).not.toContain("trackingQuery");
    expect(publicRestaurantSource).not.toContain("guest-track");
    expect(publicRestaurantSource).not.toContain("تتبع طلب سابق");
    expect(publicRestaurantSource).toContain("setCart({});");
    expect(publicRestaurantSource).toContain("setGuestPhone(\"\")");
    expect(publicRestaurantSource).toContain("setReceipt");
    expect(publicRestaurantSource).toContain("checkout.isError");
    expect(publicRestaurantSource).toContain("checkout.isError");
    expect(publicRestaurantSource).toContain("guestName");
    expect(publicRestaurantSource).toContain("guestPhone");
    expect(publicRestaurantSource).toContain("الدفع نقدي عند الاستلام");
    expect(publicRestaurantSource).toContain("تعذر إرسال الطلب حالياً");
    expect(publicRestaurantSource).not.toContain("guest-checkout-");
  });

  it("keeps operational menu and order lists backend-only", () => {
    expect(homeSource).not.toContain("const menuProducts");
    expect(homeSource).not.toContain("const [products, setProducts]");
    expect(homeSource).not.toContain("const [orders, setOrders]");
    expect(dashboardSource).toContain("trpc.platform.menuItems.useQuery");
    expect(dashboardSource).toContain("trpc.platform.ordersByRestaurant.useQuery");
  });
});
