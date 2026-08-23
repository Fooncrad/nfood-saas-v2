import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("mobile menu cart preferences and motion", () => {
  const page = () => readFileSync(resolve(process.cwd(), "client/src/pages/RestaurantPublic.tsx"), "utf8");
  const css = () => readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

  it("persists the visitor's preferred order type per menu", () => {
    const source = page();
    expect(source).toContain("nfood-order-type-${slug}");
    expect(source).toContain("localStorage.setItem(`nfood-order-type-${slug}`, orderType)");
  });

  it("provides order notes in the cart and sends them to guest checkout", () => {
    const source = page();
    const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    expect(source).toContain("id=\"order-notes\"");
    expect(source).toContain("setOrderNotes");
    expect(source).toContain("notes: orderNotes.trim() || undefined");
    expect(router).toContain("notes: z.string().trim().max(1000).optional()");
    expect(router).toContain("notes: input.notes?.trim() || null");
  });

  it("animates category results while respecting reduced motion", () => {
    const source = page();
    expect(source).toContain("category-results");
    expect(css()).toContain("nfood-category-enter");
    expect(css()).toContain("prefers-reduced-motion: reduce");
  });
});
