import { describe, expect, it } from "vitest";
import { defaultMenuDisplaySettings, normalizeMenuDisplaySettings } from "@shared/menuDisplaySettings";

describe("menu customization settings", () => {
  it("provides safe defaults for image ratio, item-name wrapping, and layout choice", () => {
    expect(defaultMenuDisplaySettings.imageRatio).toBe("square");
    expect(defaultMenuDisplaySettings.oneLineItemName).toBe(false);
    expect(defaultMenuDisplaySettings.itemLayout).toBe("cardless");
  });

  it("normalizes new settings without breaking legacy menu JSON", () => {
    const legacy = normalizeMenuDisplaySettings(JSON.stringify({ gridColumns: 3 }));
    expect(legacy.gridColumns).toBe(3);
    expect(legacy.imageRatio).toBe("square");
    expect(legacy.oneLineItemName).toBe(false);
    expect(legacy.itemLayout).toBe("cardless");

    const customized = normalizeMenuDisplaySettings(JSON.stringify({ imageRatio: "portrait", oneLineItemName: true, itemLayout: "cards" }));
    expect(customized.imageRatio).toBe("portrait");
    expect(customized.oneLineItemName).toBe(true);
    expect(customized.itemLayout).toBe("cards");
  });
});
