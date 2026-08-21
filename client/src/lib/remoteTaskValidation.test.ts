import { describe, expect, it } from "vitest";
import { validateRemoteTaskDraft } from "./remoteTaskValidation";

describe("validateRemoteTaskDraft", () => {
  it("accepts a valid task draft", () => {
    expect(validateRemoteTaskDraft({ title: "متابعة الطلبات", amount: "125.50", description: "تحديث الحالة يوميًا", dueAt: "2026-08-22T12:00" })).toBeNull();
  });

  it("rejects an empty or too-short title", () => {
    expect(validateRemoteTaskDraft({ title: " ", amount: "10" })).toContain("عنوان");
  });

  it("rejects malformed amounts and invalid dates", () => {
    expect(validateRemoteTaskDraft({ title: "مهمة", amount: "10.999" })).toContain("مالية");
    expect(validateRemoteTaskDraft({ title: "مهمة", amount: "10", dueAt: "not-a-date" })).toContain("الموعد");
  });
});
