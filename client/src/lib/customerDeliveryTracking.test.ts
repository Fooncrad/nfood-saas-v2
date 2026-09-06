import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../components/CustomerDeliveryTrackingCard.tsx", import.meta.url), "utf8");

describe("customer delivery driver call", () => {
  it("renders a phone link from the assigned driver's approved phone", () => {
    expect(source).toContain("href={`tel:${tracking.data.driver.phone}`}");
    expect(source).toContain("tracking.data.driver?.phone");
  });

  it("limits the call action to active assigned delivery states", () => {
    expect(source).toContain('["assigned", "picked_up", "out_for_delivery"].includes(status)');
  });
});
