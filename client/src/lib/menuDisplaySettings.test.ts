import { describe, expect, it } from "vitest";
import { defaultMenuDisplaySettings, normalizeMenuDisplaySettings } from "@shared/menuDisplaySettings";

describe("menu customization settings", () => {
  it("provides safe defaults for image ratio and item-name wrapping", () => {
    expect(defaultMenuDisplaySettings.imageRatio).toBe("square");
    expect(defaultMenuDisplaySettings.oneLineItemName).toBe(false);
  });

  it("normalizes new settings without breaking legacy menu JSON", () => {
    const legacy = normalizeMenuDisplaySettings(JSON.stringify({ gridColumns: 3 }));
    expect(legacy.gridColumns).toBe(3);
    expect(legacy.imageRatio).toBe("square");
    expect(legacy.oneLineItemName).toBe(false);

    const customized = normalizeMenuDisplaySettings(JSON.stringify({ imageRatio: "portrait", oneLineItemName: true }));
    expect(customized.imageRatio).toBe("portrait");
    expect(customized.oneLineItemName).toBe(true);
  });
});
