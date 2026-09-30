import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("legacy pricing route", () => {
  it("uses a full hash redirect to the current plans section", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    expect(source).toContain('window.location.replace("/#plans")');
    expect(source).not.toContain('document.getElementById("plans")?.scrollIntoView');
  });
});
