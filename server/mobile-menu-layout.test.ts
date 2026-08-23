import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("mobile menu order preferences and notes", () => {
  const page = () => readFileSync(resolve(process.cwd(), "client/src/pages/RestaurantPublic.tsx"), "utf8");
  const css = () => readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

  it("persists the preferred order type independently per branch", () => {
    const source = page();
    expect(source).toContain("nfood-order-type-${slug}-branch-${selectedBranchId}");
    expect(source).toContain("localStorage.setItem(orderTypePreferenceKey, orderType)");
    expect(source).toContain("setOrderTypePreferenceReady(true)");
  });

  it("provides remaining-character feedback and quick note templates", () => {
    const source = page();
    expect(source).toContain('id="order-notes"');
    expect(source).toContain("1000 - orderNotes.length");
    expect(source).toContain("noteTemplates.map");
    expect(source).toContain("saveNoteTemplate");
    expect(source).toContain("nfood-note-templates-${slug}");
    expect(source).toContain("notes: orderNotes.trim() || undefined");
  });

  it("keeps the mobile cart full-width without horizontal distortion", () => {
    const source = page();
    expect(source).toContain("w-screen items-end");
    expect(source).toContain("overflow-x-hidden");
    expect(source).toContain("w-[100dvw]");
    expect(source).toContain("backdrop-blur-[2px]");
  });

  it("keeps category motion accessible", () => {
    const source = page();
    expect(source).toContain("category-results");
    expect(css()).toContain("nfood-category-enter");
    expect(css()).toContain("prefers-reduced-motion: reduce");
  });
});
