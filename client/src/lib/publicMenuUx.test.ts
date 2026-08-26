import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { validateCheckoutDetails } from "../pages/RestaurantPublic";

const page = readFileSync(new URL("../pages/RestaurantPublic.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const operations = readFileSync(new URL("../components/DeliveryOperationsPanel.tsx", import.meta.url), "utf8");
const tracking = readFileSync(new URL("../components/CustomerDeliveryTrackingCard.tsx", import.meta.url), "utf8");
const driverView = readFileSync(new URL("../components/DriverDeliveryView.tsx", import.meta.url), "utf8");

describe("public menu UX", () => {
  it("uses a manager-controlled responsive product grid with consistent lazy-loaded media", () => {
    expect(page).toContain("menuGridClass");
    expect(page).toContain('"grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"');
    expect(page).toContain("nfood-menu-shell flex flex-col");
    expect(page).toContain("<main className=\"min-w-0 px-3 sm:px-6\">");
    expect(page).toContain("ar-SA-u-nu-latn");
    expect(page).toContain("aspect-[4/3] shrink-0");
    expect(page).toContain("min-h-[340px]");
    expect(page).toContain("min-h-[185px]");
    expect(page).toContain('loading="lazy"');
    expect(page).toContain('decoding="async"');
    expect(page).toContain("h-9 w-9 rounded-xl text-white");
  });

  it("exposes three distinct menu templates with a persisted switch", () => {
    expect(page).toContain('type PublicMenuTemplate = "editorial" | "bistro" | "glass";');
    expect(page).toContain('useState<PublicMenuTemplate>("editorial")');
    expect(page).toContain("nfood-menu-template-${menuTemplate}");
    expect(styles).toContain(".nfood-menu-template-editorial");
    expect(styles).toContain(".nfood-menu-template-bistro");
    expect(styles).toContain(".nfood-menu-template-glass");
    expect(page).toContain('requested === "glass"');
    expect(page).toContain("localStorage.setItem(`nfood-menu-template-${slug}`, template)");
    expect(page).toContain('selectMenuTemplate(menuTemplate === "editorial" ? "bistro" : menuTemplate === "bistro" ? "glass" : "editorial")');
    expect(page).toContain('secondaryToolsOpen');
    expect(page).toContain('أدوات المنيو');
    expect(page).toContain("page.data?.restaurant.menuTemplate");
    expect(page).toContain("page.data?.restaurant.glassGlowColor");
    expect(page).toContain("page.data?.restaurant.glassCardOpacity");
    expect(page).toContain("glassGlow");
    expect(page).toContain("glassOpacity");
  });

  it("keeps manager Glass settings configurable through CSS variables", () => {
    expect(page).toContain('"--menu-glass-glow": glassGlowColor');
    expect(page).toContain('"--menu-glass-opacity":');
    expect(styles).toContain("var(--menu-glass-glow)");
    expect(styles).toContain("var(--menu-glass-opacity)");
  });

  it("opens a real menu preview in a new tab from branding settings", () => {
    const settings = readFileSync(new URL("../components/HomeModules.tsx", import.meta.url), "utf8");
    expect(settings).toContain("window.open(publicPreviewUrl");
    expect(settings).toContain('url.searchParams.set("preview", "1")');
    expect(settings).toContain('url.searchParams.set("template", draft.menuTemplate)');
    expect(settings).toContain("updateMenuTemplateSchedule");
    expect(settings).toContain("data-menu-template-schedule");
    expect(settings).toContain("data-glass-customization");
  });

  it("provides translated order type selection and mobile navigation", () => {
    expect(page).toContain("orderType");
    expect(page).toContain("copy.dineIn");
    expect(page).toContain("copy.takeaway");
    expect(page).toContain("copy.delivery");
    expect(page).toContain("fixed inset-x-3 bottom-3");
    expect(page).toContain("channel: orderType === \"dineIn\" ? \"dine_in\" : orderType");
  });

  it("keeps the header focused and exposes menu tools plus account below it", () => {
    expect(page).toContain("setMenuQrOpen(true)");
    expect(page).toContain("<QrCode className=\"h-4 w-4 text-[var(--menu-primary)]\" />{copy.qrTitle}");
    expect(page).toContain("تسجيل / دخول");
    expect(page).not.toContain("مشاركة المنيو");
    expect(page).not.toContain('showMenuTool("share")');
    expect(page).not.toContain('showMenuTool("orderType")');
    expect(page).toContain("registerCustomer");
    expect(page).toContain("requestCustomerOtp");
    expect(page).toContain("<footer className=\"mt-14");
    expect(page).toContain("{copy.workingHours}");
    expect(page).not.toContain("<a href=\"#contact\" className=\"transition hover:text-[var(--menu-primary)]\">");
  });

  it("keeps QR outside the primary menu content and removes the drawer helper copy", () => {
    const mainMenu = page.slice(page.indexOf('<div id="menu"'), page.indexOf('<section id="contact"'));
    expect(mainMenu).not.toContain("QRCodeSVG");
    expect(page).toContain("<div className=\"rounded-xl bg-slate-900 p-4 text-white\"><p className=\"text-sm font-black\">{copy.qrTitle}</p></div>");
    expect(page).toContain("{copy.qrHelp}");
    expect(page).not.toContain('<p dir="ltr" className="break-all rounded-xl bg-slate-50');
    expect(page).toContain("grid grid-cols-2 gap-2");
    expect(page).not.toContain("shareMenuLink");
  });

  it("supports the four manager-selected density modes", () => {
    expect(page).toContain('1: "grid-cols-1"');
    expect(page).toContain('2: "grid-cols-1 sm:grid-cols-2"');
    expect(page).toContain('3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"');
    expect(page).toContain('4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"');
  });

  it("previews grid density before saving and keeps menu navigation smooth", () => {
    const settings = readFileSync(new URL("../components/HomeModules.tsx", import.meta.url), "utf8");
    expect(settings).toContain("data-menu-grid-live-preview");
    expect(settings).toContain("style={{ gridTemplateColumns: `repeat(${menuDisplayDraft.gridColumns}");
    expect(settings).toContain("معاينة مباشرة للتخطيط");
    expect(page).toContain("showFloatingSupport");
    expect(page).toContain("selectCategoryAndScroll");
    expect(page).toContain('scrollIntoView({ behavior: "smooth"');
  });

  it("filters synchronized hotel rooms and connects delivery tracking", () => {
    expect(page).toContain("hotelRoomSearch");
    expect(page).toContain("filteredHotelRooms");
    expect(page).toContain("ابحث برقم الغرفة أو الدور");
    expect(page).toContain("trpc.platform.deliveryCapability");
    expect(page).toContain("showFloatingSupport && socialLinks.length > 0");
    expect(tracking).toContain("trpc.platform.deliveryTracking.useQuery");
    expect(tracking).toContain("refetchInterval: 5000");
    expect(tracking).toContain("تحديث التوصيل:");
    expect(driverView).toContain("updateDriverLocation");
    expect(driverView).toContain("watchPosition");
  });

  it("refreshes active-driver map locations in the restaurant operations panel", () => {
    expect(operations).toContain("trpc.platform.activeDriverLocations.useQuery");
    expect(operations).toContain("refetchInterval: 10000");
    expect(operations).toContain("خريطة السائقين النشطين");
    expect(operations).toContain("AdvancedMarkerElement");
  });

  it("explains missing order-specific checkout data before submission", () => {
    expect(validateCheckoutDetails({ channel: "dineIn" })).toContain("الطاولة");
    expect(validateCheckoutDetails({ channel: "takeaway", pickupPointRequired: true })).toContain("الاستلام");
    expect(validateCheckoutDetails({ channel: "takeaway" })).toBeNull();
    expect(validateCheckoutDetails({ channel: "delivery", deliveryAddress: "شارع رئيسي" })).toContain("الخريطة");
    expect(validateCheckoutDetails({ channel: "reservation" })).toContain("موعد");
    expect(validateCheckoutDetails({ channel: "hotel", hotelId: 10 })).toContain("الغرفة");
    expect(validateCheckoutDetails({ channel: "delivery", deliveryAddress: "شارع رئيسي", deliveryLatitude: 24.7, deliveryLongitude: 46.7 })).toBeNull();
  });
});
