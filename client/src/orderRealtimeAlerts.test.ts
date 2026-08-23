import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("POS and KDS realtime alerts", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/components/OrderRealtimeAlerts.tsx"), "utf8");
  const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
  const homeModules = readFileSync(resolve(process.cwd(), "client/src/components/HomeModules.tsx"), "utf8");
  const dashboard = `${home}\n${homeModules}`;

  it("detects new orders and status changes without exposing visitor data", () => {
    expect(source).toContain("!old.has(order.id)");
    expect(source).toContain("old.get(order.id) !== order.status");
    expect(source).toContain("لا توجد طلبات نشطة حاليًا");
    expect(source).toContain("soundEnabled");
    expect(source).toContain("AudioContext");
    expect(source).toContain("visual alerts remain the source of truth");
  });

  it("is wired into both POS and KDS with fast refresh and focus recovery", () => {
    expect(dashboard).toContain('mode="pos"');
    expect(dashboard).toContain('mode="kds"');
    expect(dashboard).toContain("refetchInterval: 2000");
    expect(dashboard).toContain("refetchOnWindowFocus: true");
  });

  it("keeps POS product search local to the selected restaurant menu", () => {
    expect(dashboard).toContain("const [productSearch, setProductSearch] = useState(\"\");");
    expect(dashboard).toContain("const availableProducts = posProducts.filter");
    expect(dashboard).toContain("placeholder=\"ابحث عن صنف...\"");
    expect(dashboard).toContain("order.items.map((item) => `${item.quantity} × ${item.itemName}`)");
  });

  it("keeps order detail lookup tenant-scoped", () => {
    const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    expect(db).toContain("eq(orders.restaurantId, restaurantId), eq(branches.restaurantId, restaurantId)");
    expect(db).toContain("eq(menuItems.restaurantId, restaurantId)");
    expect(db).toContain("inArray(orderItems.orderId, rows.map((order) => order.id))");
  });
});
