import { describe, expect, it } from "vitest";
import { formatAdminReturnReport } from "./adminReturnReport";

describe("admin return report", () => {
  it("formats an immediate termination report with duration", () => {
    expect(formatAdminReturnReport({ durationMinutes: 12 })).toContain("12 دقيقة");
    expect(formatAdminReturnReport({ durationMinutes: null })).toBe("تم إنهاء جلسة العميل وتسجيل التقرير");
  });
});
