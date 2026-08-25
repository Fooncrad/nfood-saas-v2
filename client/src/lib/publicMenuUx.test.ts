import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { validateCheckoutDetails } from "../pages/RestaurantPublic";

const page = readFileSync(new URL("../pages/RestaurantPublic.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("public menu UX", () => {
  it("uses a responsive product grid with consistent lazy-loaded media", () => {
    expect(page).toContain("lg:grid-cols-3 xl:grid-cols-4");
    expect(page).toContain("nfood-menu-shell flex flex-col");
    expect(page).toContain("<main className=\"min-w-0 px-3 sm:px-6\">");
    expect(page).toContain("ar-SA-u-nu-latn");
    expect(page).toContain("aspect-[4/3]");
    expect(page).toContain('loading="lazy"');
    expect(page).toContain('decoding="async"');
    expect(page).toContain("h-11 w-11 rounded-xl text-white");
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
    expect(page).toContain('aria-pressed={menuTemplate === "editorial"}');
    expect(page).toContain('aria-pressed={menuTemplate === "bistro"}');
    expect(page).toContain('aria-pressed={menuTemplate === "glass"}');
    expect(page).toContain("page.data?.restaurant.menuTemplate");
  });

  it("provides translated order type selection and mobile navigation", () => {
    expect(page).toContain("orderType");
    expect(page).toContain("copy.dineIn");
    expect(page).toContain("copy.takeaway");
    expect(page).toContain("copy.delivery");
    expect(page).toContain("fixed inset-x-3 bottom-3");
    expect(page).toContain("channel: orderType === \"dineIn\" ? \"dine_in\" : orderType");
  });

  it("keeps QR outside the primary menu content", () => {
    const mainMenu = page.slice(page.indexOf('<div id="menu"'), page.indexOf('<section id="contact"'));
    expect(mainMenu).not.toContain("QRCodeSVG");
  });

  it("explains missing order-specific checkout data before submission", () => {
    expect(validateCheckoutDetails({ channel: "dineIn" })).toContain("الطاولة");
    expect(validateCheckoutDetails({ channel: "takeaway", pickupPointRequired: true })).toContain("الاستلام");
    expect(validateCheckoutDetails({ channel: "takeaway" })).toBeNull();
    expect(validateCheckoutDetails({ channel: "delivery", deliveryAddress: "شارع رئيسي" })).toContain("الخريطة");
    expect(validateCheckoutDetails({ channel: "reservation" })).toContain("موعد");
    expect(validateCheckoutDetails({ channel: "hotel", hotelName: "فندق" })).toContain("الغرفة");
    expect(validateCheckoutDetails({ channel: "delivery", deliveryAddress: "شارع رئيسي", deliveryLatitude: 24.7, deliveryLongitude: 46.7 })).toBeNull();
  });
});
