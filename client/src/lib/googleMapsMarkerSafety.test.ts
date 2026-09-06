import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const mapSource = readFileSync(new URL("../components/Map.tsx", import.meta.url), "utf8");
const trackingSource = readFileSync(new URL("../components/CustomerDeliveryTrackingCard.tsx", import.meta.url), "utf8");

describe("Google Maps marker safety", () => {
  it("reuses a single Maps script promise", () => {
    expect(mapSource).toContain("let mapScriptPromise: Promise<void> | null = null");
    expect(mapSource).toContain("if (mapScriptPromise) return mapScriptPromise;");
    expect(mapSource).toContain('data-nfood-google-maps="true"');
  });

  it("detaches stale markers without allowing a MapsApiMap mismatch to crash the page", () => {
    expect(trackingSource).toContain("const detachMarkers = () =>");
    expect(trackingSource).toContain("try {");
    expect(trackingSource).toContain("marker.map = null;");
    expect(trackingSource).toContain("catch {");
  });
});
