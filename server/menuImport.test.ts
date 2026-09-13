import { describe, expect, it, vi } from "vitest";
import { previewMenuFromUrl } from "./menuImport";

describe("menu import preview", () => {
  it("extracts sections, items, prices, and images from public JSON-LD", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(`<!doctype html><title>Demo Menu</title><script type="application/ld+json">${JSON.stringify({ "@type": "Menu", hasMenuSection: [{ "@type": "MenuSection", name: "برجر", hasMenuItem: [{ "@type": "MenuItem", name: "برجر كلاسيك", description: "وصف", image: "/burger.jpg", offers: { price: "35" } }] }] })}</script>`, { status: 200, headers: { "content-type": "text/html" } })));
    const result = await previewMenuFromUrl("https://example.com/menu");
    expect(result.categories).toContain("برجر");
    expect(result.items).toEqual([{ category: "برجر", name: "برجر كلاسيك", description: "وصف", price: "35.00", imageUrl: "https://example.com/burger.jpg" }]);
  });

  it("extracts QR Foon Menu HTML cards when JSON-LD is absent", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(`<div class="singleCategoryHeader"><h4>قسم البق والفطائر</h4></div><div class="modern_item_card"><div class="item_img" data-src="/uploads/thumb/burger.jpeg"></div><h4 class="item_title">البق العالمي بالخبز</h4><div class="item_desc">البق العالمي بالشاورما لحم</div><div class="priceGroup"><span>150.00&nbsp;Fr</span><span class="previous_price">200.00&nbsp;Fr</span></div></div>`, { status: 200, headers: { "content-type": "text/html" } })));
    const result = await previewMenuFromUrl("https://qrfoonmenu.com/AlBaqAlZhahabi?lang=ar");
    expect(result.categories).toContain("قسم البق والفطائر");
    expect(result.items[0]).toMatchObject({ category: "قسم البق والفطائر", name: "البق العالمي بالخبز", price: "150.00", imageUrl: "https://qrfoonmenu.com/uploads/thumb/burger.jpeg" });
  });

  it("rejects localhost and private network sources", async () => {
    await expect(previewMenuFromUrl("http://127.0.0.1/menu")).rejects.toThrow("موقعًا عامًا");
    await expect(previewMenuFromUrl("http://192.168.1.10/menu")).rejects.toThrow("موقعًا عامًا");
  });

  it("extracts layout_1 menu-card HTML when modern_item_card is absent", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(`<div class="singleCategoryHeader"><h4>مشروبات</h4></div><div class="menu-card"><img class="menu-card-img" data-src="/uploads/thumb/cola.jpeg"><h4 class="menu-card-title">كولا</h4><div class="menu-card-sub">مشروب غازي</div><span class="menu-card-price">12.00&nbsp;Fr</span></div>`, { status: 200, headers: { "content-type": "text/html" } })));
    const result = await previewMenuFromUrl("https://qrfoonmenu.com/some-restaurant?lang=ar");
    expect(result.categories).toContain("مشروبات");
    expect(result.items[0]).toMatchObject({ category: "مشروبات", name: "كولا", price: "12.00", imageUrl: "https://qrfoonmenu.com/uploads/thumb/cola.jpeg" });
  });
});
