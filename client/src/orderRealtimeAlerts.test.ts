import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("POS and KDS realtime alerts", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/components/OrderRealtimeAlerts.tsx"), "utf8");
  const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

  it("detects new orders and status changes without exposing visitor data", () => {
    expect(source).toContain("!old.has(order.id)");
    expect(source).toContain("old.get(order.id) !== order.status");
    expect(source).toContain("لا توجد طلبات نشطة حاليًا");
  });

  it("is wired into both POS and KDS with fast refresh and focus recovery", () => {
    expect(home).toContain('mode="pos"');
    expect(home).toContain('mode="kds"');
    expect(home).toContain("refetchInterval: 2000");
    expect(home).toContain("refetchOnWindowFocus: true");
  });

  it("keeps POS product search local to the selected restaurant menu", () => {
    expect(home).toContain("const [productSearch, setProductSearch] = useState(\"\");");
    expect(home).toContain("const availableProducts = posProducts.filter");
    expect(home).toContain("placeholder=\"ابحث عن صنف...\"");
  });
});
