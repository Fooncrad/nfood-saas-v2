import { describe, expect, it } from "vitest";
import { executeLogoutFlow, executeSwitchAccountFlow, getProfileActionLabel, shouldRedirectAfterLogout } from "./profileActions";

describe("profile menu actions", () => {
  it("exposes explicit logout and account-switch labels", () => {
    expect(getProfileActionLabel("logout")).toBe("تسجيل الخروج");
    expect(getProfileActionLabel("switch-account")).toBe("تبديل الحساب");
  });

  it("redirects only after a successful logout", () => {
    expect(shouldRedirectAfterLogout(true)).toBe(true);
    expect(shouldRedirectAfterLogout(false)).toBe(false);
  });

  it("closes, redirects, and notifies after successful logout", async () => {
    const calls: string[] = [];
    const result = await executeLogoutFlow({ logout: async () => { calls.push("logout"); }, closeMenu: () => calls.push("close"), redirect: () => calls.push("redirect"), notifySuccess: () => calls.push("success"), notifyError: (message) => calls.push(`error:${message}`) });
    expect(result).toEqual({ success: true });
    expect(calls).toEqual(["logout", "close", "success", "redirect"]);
  });

  it("switches account only after logout and reports failures without redirecting", async () => {
    const calls: string[] = [];
    const result = await executeSwitchAccountFlow({ logout: async () => { calls.push("logout"); }, closeMenu: () => calls.push("close"), startLogin: () => calls.push("login"), redirect: () => calls.push("redirect"), notifyError: (message) => calls.push(`error:${message}`) });
    expect(result).toEqual({ success: true });
    expect(calls).toEqual(["logout", "close", "login"]);
    const failedCalls: string[] = [];
    const failed = await executeLogoutFlow({ logout: async () => { throw new Error("network"); }, closeMenu: () => failedCalls.push("close"), redirect: () => failedCalls.push("redirect"), notifyError: (message) => failedCalls.push(`error:${message}`) });
    expect(failed).toEqual({ success: false });
    expect(failedCalls).toEqual(["error:network"]);
  });
});
