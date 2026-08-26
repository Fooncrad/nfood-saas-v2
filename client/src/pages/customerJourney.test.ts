import { describe, expect, it } from "vitest";
import fs from "node:fs";

const home = fs.readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");
const login = fs.readFileSync(new URL("../components/TestLoginScreen.tsx", import.meta.url), "utf8");
const roadmap = fs.readFileSync(new URL("../../../docs/customer-journey-roadmap.md", import.meta.url), "utf8");

describe("customer journey regression", () => {
  it("routes customer sessions to an independent portal", () => {
    expect(home).toContain('import CustomerPortal from "@/pages/CustomerPortal"');
    expect(home).toContain('user.testRole as string | undefined) === "customer"');
    expect(home).not.toContain('user.testRole === "customer" ? <OverviewAnalyticsPanel');
  });

  it("keeps recovery visible in the compact login flow", () => {
    expect(login).toContain("Forgot password?");
    expect(login).toContain("إرسال رابط الاستعادة");
    expect(login).toContain("onForgotPassword");
  });

  it("documents the return-to-cart and account-switch journey", () => {
    expect(roadmap).toContain("الخروج من حساب الإدارة والمتابعة كعميل");
    expect(roadmap).toContain("يعود تلقائيًا إلى السلة");
    expect(roadmap).toContain("CustomerPortal مستقل");
  });
});
