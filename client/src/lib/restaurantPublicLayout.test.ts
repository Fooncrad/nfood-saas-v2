import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/RestaurantPublic.tsx"), "utf8");

describe("RestaurantPublic menu layout", () => {
  it("shows complete dish images without object-cover cropping", () => {
    expect(source).toContain("nfood-menu-item-image relative aspect-[4/3]");
    expect(source).toContain('loading="lazy" decoding="async" className="h-full w-full object-contain');
  });

  it("keeps restaurant identity in the sticky header and lets it collapse", () => {
    expect(source).toContain("showHeaderBrand");
    expect(source).toContain("nfood-menu-header sticky top-0");
    expect(source).toContain("{restaurantName}");
    expect(source).toContain("إخفاء اسم المطعم");
  });

  it("moves account and menu tools into the secondary row", () => {
    expect(source).toContain("border-t border-slate-100 bg-slate-50/80");
    expect(source).toContain("تسجيل / دخول");
    expect(source).toContain("downloadMenuPdf");
    expect(source).toContain("setMenuQrOpen(true)");
  });

  it("does not expose the raw QR URL in the visible dialog", () => {
    expect(source).not.toContain('<p dir="ltr" className="break-all rounded-xl bg-slate-50');
    expect(source).toContain("NFOOD · {restaurantName}");
  });
});
