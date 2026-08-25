import { describe, expect, it } from "vitest";
import {
  SIDEBAR_WIDTHS,
  formatSidebarCount,
  getSidebarMode,
  getSidebarStatusTone,
  getSidebarWidth,
  isSidebarToggleShortcut,
  toggleSidebarFavorite,
} from "./sidebarModel";

describe("sidebar interaction model", () => {
  it("keeps the enterprise widths at 256px and 80px", () => {
    expect(SIDEBAR_WIDTHS).toEqual({ expanded: 256, collapsed: 80 });
    expect(getSidebarWidth(false)).toBe(256);
    expect(getSidebarWidth(true)).toBe(80);
    expect(getSidebarMode(false)).toBe("expanded");
    expect(getSidebarMode(true)).toBe("collapsed");
  });

  it("accepts both Ctrl+B and Cmd+B but not an unrelated key", () => {
    expect(isSidebarToggleShortcut({ ctrlKey: true, metaKey: false, key: "b" })).toBe(true);
    expect(isSidebarToggleShortcut({ ctrlKey: false, metaKey: true, key: "B" })).toBe(true);
    expect(isSidebarToggleShortcut({ ctrlKey: false, metaKey: false, key: "b" })).toBe(false);
    expect(isSidebarToggleShortcut({ ctrlKey: true, metaKey: false, key: "k" })).toBe(false);
  });

  it("pins new items at the end and removes already pinned items", () => {
    expect(toggleSidebarFavorite(["overview", "orders"], "tables")).toEqual(["overview", "orders", "tables"]);
    expect(toggleSidebarFavorite(["overview", "orders"], "orders")).toEqual(["overview"]);
    expect(toggleSidebarFavorite(["a", "b", "c"], "d", 3)).toEqual(["b", "c", "d"]);
  });

  it("returns explicit health tones from live signals", () => {
    expect(getSidebarStatusTone({ loading: false, error: false })).toBe("healthy");
    expect(getSidebarStatusTone({ loading: true, error: false })).toBe("checking");
    expect(getSidebarStatusTone({ loading: false, error: true })).toBe("attention");
    expect(getSidebarStatusTone({ loading: true, error: true })).toBe("attention");
  });

  it("rounds counts and always formats them with English digits", () => {
    expect(formatSidebarCount(1234.9)).toBe("1,235");
    expect(formatSidebarCount(-10)).toBe("0");
    expect(formatSidebarCount(Number.NaN)).toBe("0");
  });
});
