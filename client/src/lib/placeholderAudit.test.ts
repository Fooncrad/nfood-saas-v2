import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("../pages/Home.tsx", import.meta.url), "utf8");
const reservationsSource = readFileSync(new URL("../pages/ReservationsView.tsx", import.meta.url), "utf8");

describe("UI placeholder audit", () => {
  it("keeps role navigation filtering and a 403 fallback in the dashboard shell", () => {
    expect(homeSource).toContain("visibleNavItems.some");
    expect(homeSource).toContain("AccessDeniedView");
    expect(homeSource).toContain("globalForbiddenAction");
  });

  it("keeps explicit loading, empty, error, and request-id states in the dashboard shell", () => {
    expect(homeSource).toContain("جارٍ تحميل");
    expect(homeSource).toContain("لا توجد");
    expect(homeSource).toContain("تعذر");
    expect(homeSource).toContain("Request ID");
  });

  it("does not expose the removed generic action fallback", () => {
    expect(homeSource).not.toContain("Feature coming soon");
    expect(homeSource).not.toContain("ميزة قادمة");
  });

  it("keeps explicit states in ReservationsView", () => {
    expect(reservationsSource).toContain("isLoading");
    expect(reservationsSource).toContain("isError");
    expect(reservationsSource).toContain("Request ID");
    expect(reservationsSource).toContain("لا توجد");
  });

  it("keeps operational menu and order lists backend-only", () => {
    expect(homeSource).not.toContain("const menuProducts");
    expect(homeSource).not.toContain("const [products, setProducts]");
    expect(homeSource).not.toContain("const [orders, setOrders]");
    expect(homeSource).toContain("trpc.platform.menuItems.useQuery");
    expect(homeSource).toContain("trpc.platform.ordersByRestaurant.useQuery");
  });
});
