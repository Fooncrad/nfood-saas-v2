import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/RestaurantPublic.tsx"), "utf8");
const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");

describe("RestaurantPublic menu layout", () => {
  it("shows complete dish images without object-cover cropping", () => {
    expect(source).toContain("nfood-menu-item-image relative aspect-square w-[41%] min-w-0");
    expect(source).toContain('role="button" tabIndex={0} aria-label={`عرض تفاصيل ${item.name}`}');
    expect(source).toContain("setSelectedMenuItem(item)");
    expect(source).toContain("object-contain");
    expect(source).toContain('loading="lazy" decoding="async" className="nfood-menu-item-photo aspect-square h-full w-full object-cover');
  });

  it("opens a compact product-detail panel with the required hierarchy and add action", () => {
    expect(source).toContain('open={selectedMenuItem !== null}');
    expect(source).toContain("nfood-product-detail-dialog");
    expect(source).toContain("nfood-product-detail-panel");
    expect(source).toContain("h-[clamp(220px,42vh,320px)]");
    expect(source).toContain("الوصف الكامل");
    expect(source).toContain("selectedMenuItem.description || copy.defaultDescription");
    expect(source).toContain("detailCalories");
    expect(source).toContain("detailData.ingredients");
    expect(source).toContain("detailAddons");
    expect(source).toContain("detailSizeOptions");
    expect(source).toContain("detailQuantity");
    expect(source).toContain("detailTotalPrice");
    expect(source).toContain("setCart((current) => ({ ...current");
    expect(source).toContain('className="min-h-12 flex-1 rounded-xl');
  });

  it("passes stored calories into the public menu without fabricating optional sections", () => {
    expect(dbSource).toContain("calories: menuItems.calories");
    expect(source).toContain("hasBaseCalories");
    expect(source).toContain("hasDetailCalories");
  });

  it("uses only available product data and keeps optional sections hidden when absent", () => {
    expect(source).toContain("parseProductDetailData");
    expect(source).toContain("if (language !== \"ar\")");
    expect(source).toContain("detailData.ingredients?.length ?");
    expect(source).toContain("detailSizeOptions.length > 0 &&");
    expect(source).toContain("detailAddons.length > 0 &&");
    expect(source).toContain("detailData.reviews?.length ?");
  });

  it("keeps restaurant identity in the sticky header and lets it collapse", () => {
    expect(source).toContain("showHeaderBrand");
    expect(source).toContain("nfood-menu-header sticky top-0");
    expect(source).toContain("{restaurantName}");
    expect(source).toContain("إخفاء اسم المطعم");
    expect(source).toContain('rawRestaurantBrand.toLowerCase() === "nssercafa"');
    expect(source).toContain('"Nasser Cafe"');
  });

  it("replaces the primary tools row with a cover", () => {
    expect(source).toContain("nfood-menu-cover");
    expect(source).toContain("page.data.restaurant.coverUrl");
    expect(source).toContain("NFOOD MENU");
    expect(source).toContain("<h1 className=\"text-3xl font-black text-white");
    expect(source).not.toContain("<span>أدوات المنيو</span>");
  });

  it("keeps secondary menu tools available through their existing flows", () => {
    expect(source).toContain("downloadMenuPdf");
    expect(source).toContain("menuQrOpen");
    expect(source).toContain("qrMenuUrl");
  });

  it("does not expose the raw QR URL in the visible dialog", () => {
    expect(source).not.toContain('<p dir="ltr" className="break-all rounded-xl bg-slate-50');
    expect(source).toContain("NFOOD · {restaurantName}");
  });

  it("protects menu cards from the fixed mobile navigation", () => {
    expect(source).toContain("nfood-menu-shell flex flex-col pb-32 sm:pb-0");
    expect(source).toContain("fixed inset-x-3 bottom-3");
  });

  it("exposes a category filter control above the menu on mobile", () => {
    expect(source).toContain("categoryFilterOpen");
    expect(source).toContain("تصفية حسب الفئة");
    expect(source).toContain("aria-expanded={categoryFilterOpen}");
    expect(source).toContain("nfood-menu-category-bar");
    expect(source).toContain("overflow-x-auto");
  });

  it("styles the product detail panel for mobile bottom-sheet and desktop two-column layouts", () => {
    const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
    expect(css).toContain(".nfood-product-detail-dialog");
    expect(css).toContain("bottom: 0 !important");
    expect(css).toContain("max-height: 92dvh !important");
    expect(source).toContain("sm:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]");
    expect(source).toContain("overflow-y-auto p-4 sm:p-7");
    expect(source).toContain("shrink-0 border-t border-slate-100");
  });

  it("supports smooth hover only where a pointer is available", () => {
    const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
    expect(source).toContain("nfood-menu-card-hover");
    expect(css).toContain("@media (hover: hover) and (pointer: fine)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("aspect-ratio: 1.46 / 1 !important");
    expect(css).not.toContain("min-height: 14rem");
  });

  it("supports the attached Nasser Cafe reference treatment", () => {
    const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
    expect(css).toContain("--menu-page: #fbf7f0 !important");
    expect(css).toContain("--menu-primary: #7c4d32 !important");
    expect(css).toContain("--menu-accent: #d99446 !important");
    expect(css).toContain("grid-template-columns: repeat(5, minmax(0, 1fr))");
    expect(css).toContain(".nfood-menu-section .category-results");
    expect(css).toContain("flex-direction: row");
    expect(css).not.toContain(".nfood-menu-template-editorial:not(.nfood-menu-dark) .nfood-menu-item-card {\n  display: flex;\n  flex-direction: column;");
    expect(css).toContain("grid-template-columns: minmax(0, 1fr) !important");
    expect(css).toContain("object-fit: cover !important");
    expect(css).toContain("min-height: 0 !important");
    expect(css).toContain("padding-inline: 1rem !important");
    expect(css).toContain("grid-template-columns: repeat(2, minmax(0, 1fr)) !important");
    expect(css).toContain("min-height: 8.25rem !important");
    expect(css).toContain("width: 41% !important");
  });
});
