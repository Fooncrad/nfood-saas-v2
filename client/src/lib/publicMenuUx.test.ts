import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../pages/RestaurantPublic.tsx", import.meta.url), "utf8");

describe("public menu UX", () => {
  it("uses a responsive product grid with consistent lazy-loaded media", () => {
    expect(page).toContain("lg:grid-cols-3 2xl:grid-cols-4");
    expect(page).toContain("aspect-[4/3]");
    expect(page).toContain('loading="lazy"');
    expect(page).toContain('decoding="async"');
    expect(page).toContain("h-11 w-11 rounded-xl text-white");
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
});
