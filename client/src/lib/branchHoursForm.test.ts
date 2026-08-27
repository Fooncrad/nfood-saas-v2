import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("branch hours form", () => {
  it("keeps compact labeled fields with contextual guidance", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/HomeModules.tsx"), "utf8");
    expect(source).toContain('placeholder="مثال: فرع العليا"');
    expect(source).toContain('placeholder="مثال: الرياض"');
    expect(source).toContain('aria-label="وقت افتتاح الفرع"');
    expect(source).toContain('aria-label="وقت إغلاق الفرع"');
    expect(source).toContain("الاسم الذي سيظهر للعملاء");
    expect(source).toContain("وقت بدء الدوام");
    expect(source).toContain("وقت نهاية الدوام");
    expect(source).toContain("h-9 w-full rounded-xl bg-white text-sm");
  });
});
