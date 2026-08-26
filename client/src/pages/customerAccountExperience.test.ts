import { describe, expect, it } from "vitest";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const register = fs.readFileSync(new URL("./CustomerRegister.tsx", import.meta.url), "utf8");
const portal = fs.readFileSync(new URL("./CustomerPortal.tsx", import.meta.url), "utf8");
const notices = fs.readFileSync(new URL("../components/CustomerNotificationsCenter.tsx", import.meta.url), "utf8");
const studio = fs.readFileSync(new URL("./CustomerStudio.tsx", import.meta.url), "utf8");

describe("customer account experience", () => {
  it("keeps customer registration separate from restaurant registration", () => {
    expect(app).toContain("/customer-register");
    expect(app).toContain("CustomerRegister");
    expect(register).toContain("trpc.auth.registerCustomer");
    expect(register).toContain("هذا التسجيل للعملاء فقط");
    expect(register).not.toContain("registerRestaurant");
  });

  it("shows interactive notifications for rewards and content sales", () => {
    expect(portal).toContain("CustomerNotificationsCenter");
    expect(notices).toContain("trpc.notifications.mine");
    expect(notices).toContain("markAllRead");
    expect(notices).toContain("markRead");
    expect(notices).toContain("المكافآت");
  });

  it("publishes public food images without a restaurant selector", () => {
    expect(studio).toContain('accept="image/jpeg,image/png,image/webp"');
    expect(studio).not.toContain("اختر المطعم");
    expect(studio).toContain("يوجد مطاعم نشطة");
    expect(studio).toContain("NFOOD · معاينة محمية");
    expect(studio).toContain("سعر الصورة: 5.00 SAR");
  });
});
