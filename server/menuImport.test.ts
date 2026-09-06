import { describe, expect, it, vi } from "vitest";
import { previewMenuFromUrl } from "./menuImport";

describe("menu import preview", () => {
  it("extracts sections, items, prices, and images from public JSON-LD", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(`<!doctype html><title>Demo Menu</title><script type="application/ld+json">${JSON.stringify({ "@type": "Menu", hasMenuSection: [{ "@type": "MenuSection", name: "برجر", hasMenuItem: [{ "@type": "MenuItem", name: "برجر كلاسيك", description: "وصف", image: "/burger.jpg", offers: { price: "35" } }] }] })}</script>`, { status: 200, headers: { "content-type": "text/html" } })));
    const result = await previewMenuFromUrl("https://example.com/menu");
    expect(result.categories).toContain("برجر");
    expect(result.items).toEqual([{ category: "برجر", name: "برجر كلاسيك", description: "وصف", price: "35.00", imageUrl: "https://example.com/burger.jpg" }]);
  });

  it("rejects localhost and private network sources", async () => {
    await expect(previewMenuFromUrl("http://127.0.0.1/menu")).rejects.toThrow("موقعًا عامًا");
    await expect(previewMenuFromUrl("http://192.168.1.10/menu")).rejects.toThrow("موقعًا عامًا");
  });
});
