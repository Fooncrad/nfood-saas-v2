export type DisplayLayout = "single" | "double" | "triple" | "quad" | "split";

export function getDisplayLayoutCount(layout: DisplayLayout | null | undefined): 1 | 2 | 3 | 4 {
  if (layout === "quad") return 4;
  if (layout === "triple") return 3;
  if (layout === "double") return 2;
  return 1;
}

export function isSplitDisplayLayout(layout: DisplayLayout | null | undefined): boolean {
  return layout === "split";
}

export function isDisplayVideoUrl(value: string): boolean {
  return /^(https:\/\/|\/manus-storage\/)/i.test(value.trim());
}

export function isSupportedDisplayVideoType(contentType: string): boolean {
  return ["video/mp4", "video/webm", "video/ogg"].includes(contentType.toLowerCase());
}

export function displayVideoAttributes(loop = true) {
  return { autoPlay: true, muted: true, loop, playsInline: true } as const;
}

