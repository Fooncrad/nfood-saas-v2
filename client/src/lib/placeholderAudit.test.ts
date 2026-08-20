import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("../pages/Home.tsx", import.meta.url), "utf8");

describe("UI placeholder audit", () => {
  it("does not expose the removed generic action fallback", () => {
    expect(homeSource).not.toContain("Feature coming soon");
    expect(homeSource).not.toContain("ميزة قادمة");
  });
});
