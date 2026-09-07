import { describe, expect, it } from "vitest";
import { displayVideoAttributes, getDisplayLayoutCount, isDisplayVideoUrl, isSupportedDisplayVideoType, isSplitDisplayLayout } from "./displayVideoSupport";

describe("display video support", () => {
  it("accepts only safe external or NFOOD storage URLs", () => {
    expect(isDisplayVideoUrl("https://cdn.example.com/spot.mp4")).toBe(true);
    expect(isDisplayVideoUrl("/manus-storage/spot.webm")).toBe(true);
    expect(isDisplayVideoUrl("javascript:alert(1)")).toBe(false);
  });

  it("supports common browser video types", () => {
    expect(isSupportedDisplayVideoType("video/mp4")).toBe(true);
    expect(isSupportedDisplayVideoType("video/webm")).toBe(true);
    expect(isSupportedDisplayVideoType("video/quicktime")).toBe(true);
    expect(isSupportedDisplayVideoType("application/octet-stream")).toBe(true);
    expect(isSupportedDisplayVideoType("image/png")).toBe(false);
  });

  it("maps synchronized display layouts to one through four slots", () => {
    expect(getDisplayLayoutCount("single")).toBe(1);
    expect(getDisplayLayoutCount("double")).toBe(2);
    expect(getDisplayLayoutCount("triple")).toBe(3);
    expect(getDisplayLayoutCount("quad")).toBe(4);
    expect(getDisplayLayoutCount("split")).toBe(1);
    expect(isSplitDisplayLayout("split")).toBe(true);
    expect(isSplitDisplayLayout("quad")).toBe(false);
  });

  it("keeps video playback autoplay-safe for signage", () => {
    expect(displayVideoAttributes()).toEqual({ autoPlay: true, muted: true, loop: true, playsInline: true });
  });
});

