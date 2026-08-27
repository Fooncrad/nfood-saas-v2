import { describe, expect, it } from "vitest";
import { defaultMenuDisplaySettings, normalizeMenuDisplaySettings } from "@shared/menuDisplaySettings";

describe("menu customization settings", () => {
  it("provides safe defaults for image ratio, item-name wrapping, and layout choice", () => {
    expect(defaultMenuDisplaySettings.imageRatio).toBe("square");
    expect(defaultMenuDisplaySettings.oneLineItemName).toBe(false);
    expect(defaultMenuDisplaySettings.itemLayout).toBe("cardless");
  });

  it("provides advanced product-detail window defaults and normalizes unsafe values", () => {
    expect(defaultMenuDisplaySettings.detailWindow.direction).toBe("auto");
    expect(defaultMenuDisplaySettings.detailWindow.position).toBe("side");
    expect(defaultMenuDisplaySettings.detailWindow.width).toBe("wide");
    const normalized = normalizeMenuDisplaySettings(JSON.stringify({ detailWindow: { direction: "invalid", position: "bottom", width: "full", overlayOpacity: 80, imageFit: "cover", closeOnEscape: false } }));
    expect(normalized.detailWindow.direction).toBe("auto");
    expect(normalized.detailWindow.position).toBe("bottom");
    expect(normalized.detailWindow.width).toBe("full");
    expect(normalized.detailWindow.overlayOpacity).toBe(80);
    expect(normalized.detailWindow.imageFit).toBe("cover");
    expect(normalized.detailWindow.closeOnEscape).toBe(false);
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
