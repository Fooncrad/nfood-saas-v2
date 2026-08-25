import { describe, expect, it } from "vitest";
import { defaultMenuDisplaySettings, normalizeMenuDisplaySettings } from "./menuDisplaySettings";

describe("menu display settings", () => {
  it("keeps supported menu tools enabled for legacy restaurants", () => {
    const settings = normalizeMenuDisplaySettings(null);
    expect(settings.showCustomerAccount).toBe(true);
    expect(settings.tools.search).toBe(true);
    expect(settings.tools.qr).toBe(true);
    expect(settings.toolOrder).toHaveLength(defaultMenuDisplaySettings.toolOrder.length);
  });

  it("normalizes a manager payload and appends missing tools", () => {
    const settings = normalizeMenuDisplaySettings(JSON.stringify({ tools: { pdf: false }, toolOrder: ["pdf", "pdf", "unknown"] }));
    expect(settings.tools.pdf).toBe(false);
    expect(settings.tools).not.toHaveProperty("share");
    expect(settings.tools).not.toHaveProperty("orderType");
    expect(settings.toolOrder[0]).toBe("pdf");
    expect(settings.toolOrder).not.toContain("unknown");
    expect(new Set(settings.toolOrder).size).toBe(defaultMenuDisplaySettings.toolOrder.length);
  });

  it("falls back safely when stored JSON is malformed", () => {
    expect(normalizeMenuDisplaySettings("{broken")).toEqual(defaultMenuDisplaySettings);
  });
});
