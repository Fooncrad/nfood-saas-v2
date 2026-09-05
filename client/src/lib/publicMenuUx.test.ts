import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { validateCheckoutDetails } from "../pages/RestaurantPublic";

const page = readFileSync(new URL("../pages/RestaurantPublic.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const dialog = readFileSync(new URL("../components/ui/dialog.tsx", import.meta.url), "utf8");
const operations = readFileSync(new URL("../components/DeliveryOperationsPanel.tsx", import.meta.url), "utf8");
const tracking = readFileSync(new URL("../components/CustomerDeliveryTrackingCard.tsx", import.meta.url), "utf8");
const driverView = readFileSync(new URL("../components/DriverDeliveryView.tsx", import.meta.url), "utf8");

describe("public menu UX", () => {
  it("uses a manager-controlled responsive product grid with consistent lazy-loaded media", () => {
    expect(page).toContain("menuGridClass");
    expect(page).toContain('"grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"');
    expect(page).toContain("nfood-menu-shell ${menuItemLayout === \"cardless\" ? \"nfood-menu-cardless\" : \"nfood-menu-cards\"} flex flex-col");
    expect(page).toContain("<main className=\"min-w-0 px-3 sm:px-6\">");
    expect(page).toContain("formatCurrencyAmount");
    expect(page).toContain("aspect-square w-full min-w-0 cursor-pointer");
    expect(page).toContain("grid min-w-0 grid-cols-1");
    expect(page).toContain("setSelectedMenuItem(item)");
    expect(page).toContain('loading="lazy"');
    expect(page).toContain('decoding="async"');
    expect(page).toContain("h-9 w-9 rounded-xl shadow-md");
    expect(page).toContain("setCartOpen(true)");
    expect(page).toContain("openCartItemDetails");
    expect(page).toContain("عرض تفاصيل ${item.name}");
    expect(page).toContain("line-clamp-2");
    expect(page).toContain("object-cover");
    expect(page).toContain('"--menu-card-text":');
    expect(page).toContain('"--menu-cart-button":');
    expect(styles).toContain("var(--menu-page)");
    expect(styles).toContain("padding-inline: 1rem !important");
    expect(styles).toContain("min-height: 0 !important");
    expect(styles).toContain("grid-template-columns: minmax(0, 1fr) !important;");
    expect(styles).toContain("grid-column: 1 / -1 !important;");
    expect(styles).toContain(".nfood-customer-redesign.nfood-menu-shell .nfood-menu-grid.category-results");
    expect(styles).toContain("grid-auto-flow: row !important;");
  });

  it("shows real menu recommendations and confirms direct cart additions", () => {
    expect(page).toContain("nfood-menu-recommendations");
    expect(page).toContain("اختيارات مقترحة");
    expect(page).toContain("items.slice(0, 6)");
    expect(page).toContain("toast.success(language === \"ar\"");
    expect(page).toContain("lastAddedItemId");
    expect(styles).toContain("nfood-reservation-pulse");
    expect(styles).toContain("prefers-reduced-motion: reduce");
  });

  it("exposes four distinct menu templates with a persisted switch", () => {
    expect(page).toContain('type PublicMenuTemplate = "editorial" | "bistro" | "glass" | "customer";');
    expect(page).toContain('useState<PublicMenuTemplate>("editorial")');
    expect(page).toContain("nfood-menu-template-${menuTemplate}");
    expect(styles).toContain(".nfood-menu-template-editorial");
    expect(styles).toContain(".nfood-menu-template-bistro");
    expect(styles).toContain(".nfood-menu-template-glass");
    expect(styles).toContain(".nfood-menu-template-customer");
    expect(page).toContain('requested === "glass"');
    expect(page).toContain("localStorage.setItem(`nfood-menu-template-${slug}`, template)");
    expect(page).toContain("selectMenuTemplate");
    expect(page).toContain('type PublicMenuTemplate = "editorial" | "bistro" | "glass"');
    expect(page).toContain("menuTemplate");
    expect(page).toContain('nfood-menu-cover');
    expect(page).toContain('page.data.restaurant.coverUrl');
    expect(page).toContain("page.data?.restaurant.menuTemplate");
    expect(page).toContain("page.data?.restaurant.glassGlowColor");
    expect(page).toContain("page.data?.restaurant.glassCardOpacity");
    expect(page).toContain("glassGlow");
    expect(page).toContain("glassOpacity");
  });

  it("forces every shared dialog to stay centered in RTL and LTR", () => {
    expect(dialog).toContain("!left-[50%]");
    expect(dialog).toContain("!top-[50%]");
    expect(dialog).toContain("!translate-none");
    expect(dialog).not.toContain("!translate-x-[-50%]");
    expect(dialog).not.toContain("!translate-y-[-50%]");
    expect(dialog).toContain("!right-auto");
  });

  it("keeps manager Glass settings configurable through CSS variables", () => {
    expect(page).toContain('"--menu-glass-glow": glassGlowColor');
    expect(page).toContain('"--menu-glass-opacity":');
    expect(styles).toContain("var(--menu-glass-glow)");
    expect(styles).toContain("var(--menu-glass-opacity)");
  });

  it("opens a real menu preview in a new tab from branding settings", () => {
    const settings = readFileSync(new URL("../components/HomeModules.tsx", import.meta.url), "utf8");
    expect(settings).toContain("20MB");
    expect(settings).toContain("قص وضغط تلقائي إلى مربع");
    expect(settings).not.toContain("image.naturalWidth > 1000 || image.naturalHeight > 900");
    expect(settings).toContain("window.open(publicPreviewUrl");
    expect(settings).toContain('url.searchParams.set("preview", "1")');
    expect(settings).toContain('url.searchParams.set("template", draft.menuTemplate)');
    expect(settings).toContain("updateMenuTemplateSchedule");
    expect(settings).toContain("data-menu-template-schedule");
    expect(settings).toContain("data-glass-customization");
    expect(settings).toContain("إعادة ضبط الافتراضي");
    expect(settings).toContain("menuBackgroundColor");
    expect(settings).toContain("cartButtonStyle");
    expect(settings).toContain("نصوص البطاقات");
    expect(settings).toContain('data-menu-layouts-card');
    expect(settings).toContain('data-menu-layouts-content');
    expect(settings).toContain('data-menu-template-controls');
    expect(settings).toContain('data-restaurant-identity-card');
    expect(settings).toContain('section="layouts"');
    expect(settings).not.toContain('data-legacy-menu-template-controls');
  });

  it("provides translated order type selection and mobile navigation", () => {
    expect(page).toContain("orderType");
    expect(page).toContain("طلب داخلي · داخل المطعم");
    expect(page).toContain("copy.takeaway");
    expect(page).toContain("copy.delivery");
    expect(page).toContain("fixed inset-x-3 bottom-3");
    expect(page).toContain("onClick={() => setReservationOpen(true)}");
    expect(page).toContain("channel: orderType === \"dineIn\" ? \"dine_in\" : orderType");
  });

  it("keeps the header focused and moves the visual identity into a cover", () => {
    expect(page).toContain("nfood-menu-cover");
    expect(page).toContain("page.data.restaurant.coverUrl");
    expect(page).toContain("<RestaurantLogo src={page.data.restaurant.brandLogoUrl}");
    expect(page).toContain("NFOOD MENU");
    expect(page).not.toContain("<span>أدوات المنيو</span>");
    expect(page).not.toContain("مشاركة المنيو");
    expect(page).not.toContain('showMenuTool("share")');
    expect(page).not.toContain('showMenuTool("orderType")');
    expect(page).toContain("registerCustomer");
    expect(page).toContain("requestCustomerOtp");
    expect(page).toContain("<footer className=\"mt-8");
    expect(page).toContain('aria-label="QR المنيو"');
    expect(page).toContain("<QRCodeSVG");
    expect(page).toContain("{copy.workingHours}");
    expect(page).toContain("min-h-[19rem]");
    expect(page).toContain("LanguageSwitcher compact minimal");
    expect(page).toContain("nfood-menu-category-bar relative z-10");
    expect(page).not.toContain("nfood-menu-category-bar sticky top-16");
    expect(page).toContain("category.imageUrl");
    expect(page).toContain("page.data.restaurant.tiktokUrl");
    expect(styles).toContain("background: #fff !important");
    expect(page).not.toContain("<a href=\"#contact\" className=\"transition hover:text-[var(--menu-primary)]\">");
  });

  it("removes QR controls from the public menu while keeping PDF fallback", () => {
    const mainMenu = page.slice(page.indexOf('<div id="menu"'), page.indexOf('<section id="reservation"'));
    expect(mainMenu).not.toContain("QRCodeSVG");
    expect(page).not.toContain("menuQrOpen");
    expect(page).not.toContain("qrMenuUrl");
    expect(page).not.toContain("عرض QR");
    expect(page).not.toContain("باركود منيو المطعم");
    expect(page).toContain("downloadMenuPdf");
    expect(page).not.toContain("shareMenuLink");
  });

  it("keeps desktop menu visible beside a compact drawer and simplifies reservation access", () => {
    expect(page).toContain("nfood-menu-drawer-open");
    expect(page).toContain("const callWaiter");
    expect(page).toContain('aria-label="نداء النادل"');
    expect(page).toContain('className={reservationOpen ?');
    expect(page).toContain("showReservationPolicy");
    expect(page).not.toContain('<section id="contact"');
    expect(page).not.toContain('aria-label={copy.cart} onClick={() => setCartOpen(true)}');
    expect(styles).toContain("padding-inline-end: min(78vw, 300px) !important");
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
