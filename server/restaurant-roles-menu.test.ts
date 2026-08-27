import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("restaurant menu account and operational role entry points", () => {
  it("exposes a desktop account action in the public menu header", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/RestaurantPublic.tsx"), "utf8");
    expect(source).toContain('className="hidden h-10 items-center gap-1.5 rounded-full bg-orange-50');
    expect(source).toContain('"تسجيل الدخول"');
    expect(source).toContain('navigate("/customer-portal")');
    expect(source).toContain('if (!user) { toast.info("سجّل الدخول أولًا لإتمام الطلب"); startLogin(); return; }');
    expect(source).toContain('selfOrderEnabled');
    expect(source).toContain('setSelectedMenuItem(item); }} aria-label={`عرض تفاصيل ${item.name}`}');
    expect(source).not.toContain('updateCart(item.id, 1); }} aria-label={`إضافة ${item.name} إلى السلة`}');
  });

  it("exposes dedicated driver and waiter modules backed by the team workflow", () => {
    const navigation = readFileSync(resolve(process.cwd(), "client/src/components/homeNavigation.ts"), "utf8");
    const modules = readFileSync(resolve(process.cwd(), "client/src/components/HomeModules.tsx"), "utf8");
    expect(navigation).toContain('"drivers"');
    expect(navigation).toContain('"waiters"');
    expect(modules).toContain('focusRole="driver"');
    expect(modules).toContain('focusRole="waiter"');
    expect(modules).toContain("DeliveryOperationsPanel");
    expect(modules).toContain('TablesView restaurantId={restaurantId} branchId={branchId}');
    expect(readFileSync(resolve(process.cwd(), "client/src/components/BrandingEditorPanel.tsx"), "utf8")).toContain("الطلب الذاتي للطاولات");
  });
});
