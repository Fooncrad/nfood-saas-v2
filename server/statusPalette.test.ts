import { describe, expect, it } from "vitest";
import { actionPalette, getDeliveryStatusPalette, getOrderStatusPalette, paymentStatusPalette } from "../client/src/lib/statusPalette";

describe("status palette semantics", () => {
  it("keeps order status colors semantically consistent", () => {
    expect(getOrderStatusPalette("cancelled").className).toContain("text-red-700");
    expect(getOrderStatusPalette("preparing").className).toContain("text-orange-700");
    expect(getOrderStatusPalette("completed").className).toContain("text-emerald-700");
    expect(getOrderStatusPalette("ready").className).toContain("text-blue-700");
  });

  it("maps delivery failure and success to explicit tones", () => {
    expect(getDeliveryStatusPalette("failed").className).toContain("text-red-700");
    expect(getDeliveryStatusPalette("returned").className).toContain("text-red-700");
    expect(getDeliveryStatusPalette("delivered").className).toContain("text-emerald-700");
  });

  it("provides safe fallback values for unknown states", () => {
    expect(getOrderStatusPalette("unexpected").label).toBe("unexpected");
    expect(getDeliveryStatusPalette("unexpected").label).toBe("unexpected");
    expect(paymentStatusPalette.failed.className).toContain("text-red-700");
  });

  it("keeps action colors distinct from destructive colors", () => {
    expect(actionPalette.operational).toContain("bg-[#e76f3c]");
    expect(actionPalette.destructive).toContain("bg-red-50");
    expect(actionPalette.success).toContain("bg-emerald-600");
  });
});
