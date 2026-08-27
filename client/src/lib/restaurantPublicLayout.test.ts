import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/RestaurantPublic.tsx"), "utf8");
const homeModulesSource = readFileSync(resolve(process.cwd(), "client/src/components/HomeModules.tsx"), "utf8");
const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");

describe("RestaurantPublic menu layout", () => {
  it("shows complete dish images without object-cover cropping", () => {
    expect(source).toContain("nfood-menu-item-image relative col-start-1 row-start-1 aspect-square w-full min-w-0");
    expect(source).toContain('tabIndex={0} aria-label={`عرض تفاصيل ${item.name}`} className="nfood-menu-item-card');
    expect(source).toContain("setSelectedMenuItem(item)");
    expect(source).toContain("object-contain");
    expect(source).toContain('loading="lazy" decoding="async" className="nfood-menu-item-photo aspect-square h-full w-full object-cover');
  });

  it("opens a compact product-detail panel with the required hierarchy and add action", () => {
    expect(source).toContain('open={selectedMenuItem !== null}');
    expect(source).toContain("nfood-product-detail-dialog");
    expect(source).toContain("nfood-product-detail-panel");
    expect(source).toContain("h-[clamp(180px,30vh,260px)");
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
    expect(source).toContain("nfood-menu-shell ${menuItemLayout === \"cardless\" ? \"nfood-menu-cardless\" : \"nfood-menu-cards\"} flex flex-col pb-32 sm:pb-0");
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
    expect(css).toContain("right: 0 !important");
    expect(css).toContain("left: 0 !important");
    expect(css).toContain("width: 100dvw !important");
    expect(css).toContain("transform: none !important");
    expect(css).toContain("overflow-wrap: anywhere");
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

  it("keeps the revised desktop cards readable and horizontally distributed", () => {
    const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
    expect(css).toContain("grid-template-columns: repeat(6, minmax(0, 1fr)) !important");
    expect(css).toContain("grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr) !important");
    expect(css).toContain(".nfood-menu-shell .nfood-menu-item-content h3 {");
    expect(css).toContain("display: -webkit-box !important");
    expect(css).toContain("object-fit: cover !important");
    expect(css).toContain(".nfood-menu-shell .nfood-menu-category-bar");
    expect(css).toContain("scrollbar-width: thin");
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


describe("Product card detail flow refinement", () => {
  it("opens product details from the whole card and keeps the plus action in the same flow", () => {
    expect(source).toContain("onClick={() => setSelectedMenuItem(item)}");
    expect(source).toContain("tabIndex={0} aria-label={`عرض تفاصيل ${item.name}`}");
    expect(source).toContain('aria-label={`عرض تفاصيل ${item.name}`}><Plus');
    expect(source).toContain("nfood-menu-card-summary");
    expect(source).toContain("compareAtPrice");
    expect(source).toContain("nfood-menu-item-title");
  });

  it("renders optional product gallery images without fabricating them", () => {
    expect(source).toContain("additionalImagesJson");
    expect(source).toContain("detailData.additionalImages?.length");
    expect(source).toContain("slice(0, 4)");
    expect(source).toContain("صور إضافية");
    expect(dbSource).toContain("additionalImagesJson: menuItems.additionalImagesJson");
  });

  it("removes the generic share action from product details", () => {
    expect(source).not.toContain("Share2");
    expect(source).not.toContain("shareMenuItem");
    expect(source).not.toContain("detailCopy.share");
  });

  it("limits each category to five items before expanding", () => {
    expect(source).toContain("group.items.length : 5");
    expect(source).toContain("group.items.length > 5");
    expect(source).toContain("عرض المزيد");
  });

  it("keeps the price, currency, discount, and availability readable", () => {
    const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
    expect(source).toContain("nfood-menu-price-block");
    expect(source).toContain("nfood-menu-price-current");
    expect(source).toContain("text-rose-600");
    expect(source).toContain("top-0.5 z-20");
    expect(source).toContain("top-1.5 z-20");
    expect(css).toContain("word-break: keep-all !important");
    expect(css).toContain("color: #dc2626 !important");
    expect(css).toContain(".nfood-menu-item-heading");
    expect(css).toContain("top: 3rem !important");
  });

  it("places the short description in the second card row", () => {
    const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
    expect(css).toContain(".nfood-menu-shell .nfood-menu-card-summary");
    expect(css).toContain("grid-column: 1 / -1 !important");
    expect(css).toContain("grid-row: 2 !important");
  });

  it("forces the mobile product details body to scroll inside a full-height sheet", () => {
    const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
    expect(css).toContain("height: min(92dvh, 780px) !important");
    expect(css).toContain(".nfood-product-detail-panel > div:nth-child(2)");
    expect(css).toContain("-webkit-overflow-scrolling: touch");
  });
});


describe("Product title visibility regression", () => {
  it("prevents the legacy first-child grid rule from collapsing the product title", () => {
    const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
    expect(css).toContain(".nfood-menu-shell .nfood-menu-item-content > .nfood-menu-item-heading {");
    expect(css).toContain("display: flex !important;");
    expect(css).toContain(".nfood-menu-shell .nfood-menu-item-content > .nfood-menu-item-heading .nfood-menu-item-title {");
    expect(css).toContain("width: 100% !important;");
    expect(source).toContain("<h3 className=\"nfood-menu-item-title");
  });
});


describe("Mobile menu navigation actions", () => {
  it("moves reservation into the hero work-hours action and replaces the bottom reservation tab", () => {
    expect(source).toContain("copy.workingHours");
    expect(source).toContain("bg-orange-500 px-3 text-[10px] font-black");
    expect(source).toContain("setReservationOpen(true)");
    expect(source).toContain("<UserRound className=\"h-4 w-4\"");
    expect(source).toContain("navigate(\"/customer-portal\")");
    expect(source).toContain("setAccountMode(\"register\")");
    expect(source).toContain("{user ? \"حسابي\" : \"تسجيل\"}");
  });

  it("keeps the food menu and cart actions in the mobile bottom navigation", () => {
    expect(source).toContain("document.getElementById(\"menu\")?.scrollIntoView");
    expect(source).toContain("setCartOpen(true)");
    expect(source).toContain("<ShoppingBag className=\"h-4 w-4\"");
    expect(source).not.toContain("<CalendarDays className=\"h-4 w-4\" style={{ color: brandColor }} />{copy.reservation}</button></nav>");
  });
});


describe("Mobile product title visibility", () => {
  it("defeats the legacy grid title collapse with a full-width flex heading", () => {
    expect(css).toContain(".nfood-menu-shell .nfood-menu-item-card .nfood-menu-item-content > .nfood-menu-item-heading");
    expect(css).toContain("display: flex !important;");
    expect(css).toContain("grid-template-columns: none !important;");
    expect(css).toContain(".nfood-menu-shell .nfood-menu-item-card .nfood-menu-item-content > .nfood-menu-item-heading > .nfood-menu-item-title");
    expect(css).toContain("width: 100% !important;");
  });
});


describe("Cardless menu experiment", () => {
  it("removes card chrome only for the selected cardless layout", () => {
    expect(css).toContain(".nfood-menu-shell.nfood-menu-cardless .nfood-menu-item-card {");
    expect(css).toContain("background: transparent !important;");
    expect(css).toContain("border: 0 !important;");
    expect(css).toContain("box-shadow: none !important;");
    expect(source).toContain('menuItemLayout === "cardless" ? "nfood-menu-cardless" : "nfood-menu-cards"');
    expect(source).toContain("item.name");
    expect(source).toContain("nfood-menu-price-current");
    expect(source).toContain("nfood-menu-price-compare");
    expect(source).toContain("nfood-menu-card-summary");
    expect(source).toContain("setSelectedMenuItem(item)");
  });

  it("keeps the image, price, discount, add button, and detail click target in both layouts", () => {
    expect(source).toContain("nfood-menu-item-image");
    expect(source).toContain("nfood-menu-discount");
    expect(source).toContain("nfood-menu-cart-row");
    expect(source).toContain("aria-label={`عرض تفاصيل ${item.name}`}");
    expect(css).toContain(".nfood-menu-shell.nfood-menu-cardless .nfood-menu-item-image");
  });

  it("exposes cards and cardless as selectable saved menu layouts", () => {
    expect(source).toContain("data-menu-item-layout={menuItemLayout}");
    expect(homeModulesSource).toContain("data-menu-item-layout-controls");
    expect(homeModulesSource).toContain('setMenuItemLayout("cards")');
    expect(homeModulesSource).toContain('setMenuItemLayout("cardless")');
    expect(homeModulesSource).toContain('menuDisplayDraft.itemLayout === "cards"');
    expect(homeModulesSource).toContain('menuDisplayDraft.itemLayout === "cardless"');
  });

  it("pins the mobile detail sheet to the viewport and contains the primary image", () => {
    expect(css).toContain("inset-inline: 0 !important;");
    expect(css).toContain("width: 100dvw !important;");
    expect(css).toContain("translate: none !important;");
    expect(css).toContain("object-fit: contain !important;");
    expect(css).toContain("object-position: center !important;");
    expect(css).toContain('[data-slot="dialog-content"].nfood-product-detail-dialog');
    expect(css).toContain("min-width: 100dvw !important;");
    expect(css).toContain("inset: auto 0 0 0 !important;");
    expect(source).toContain('className="nfood-product-detail-image h-[clamp(180px,30vh,260px)]');
  });
});
