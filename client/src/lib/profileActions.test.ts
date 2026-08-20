import { describe, expect, it } from "vitest";
import { getProfileActionLabel, shouldRedirectAfterLogout } from "./profileActions";

describe("profile menu actions", () => {
  it("exposes explicit logout and account-switch labels", () => {
    expect(getProfileActionLabel("logout")).toBe("تسجيل الخروج");
    expect(getProfileActionLabel("switch-account")).toBe("تبديل الحساب");
  });

  it("redirects only after a successful logout", () => {
    expect(shouldRedirectAfterLogout(true)).toBe(true);
    expect(shouldRedirectAfterLogout(false)).toBe(false);
  });
});
