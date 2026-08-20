import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("../pages/Home.tsx", import.meta.url), "utf8");

describe("UI placeholder audit", () => {
  it("keeps role navigation filtering and a 403 fallback in the dashboard shell", () => {
    expect(homeSource).toContain("visibleNavItems.some");
    expect(homeSource).toContain("AccessDeniedView");
    expect(homeSource).toContain("globalForbiddenAction");
  });

  it("keeps explicit loading, empty, error, and request-id states in the dashboard shell", () => {
    expect(homeSource).toContain("جارٍ تحميل");
    expect(homeSource).toContain("لا توجد");
    expect(homeSource).toContain("تعذر");
    expect(homeSource).toContain("Request ID");
  });

  it("does not expose the removed generic action fallback", () => {
    expect(homeSource).not.toContain("Feature coming soon");
    expect(homeSource).not.toContain("ميزة قادمة");
  });
});
