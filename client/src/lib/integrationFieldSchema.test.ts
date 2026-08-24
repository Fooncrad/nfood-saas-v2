import { describe, expect, it } from "vitest";
import { gatewayFieldMap } from "@/components/PlatformSettingsPanel";

describe("integration credential field schema", () => {
  it("covers the required fields for core payment gateways", () => {
    expect(gatewayFieldMap.Moyasar.map(field => field.key)).toEqual(["publishableKey", "secretKey", "environment"]);
    expect(gatewayFieldMap.Tamara.map(field => field.key)).toEqual(["apiToken", "notificationToken", "publicKey", "environment"]);
    expect(gatewayFieldMap.HyperPay.map(field => field.key)).toContain("entityId");
    expect(gatewayFieldMap.PayTabs.map(field => field.key)).toContain("serverKey");
    expect(gatewayFieldMap.Stripe.map(field => field.key)).toEqual(["publishableKey", "secretKey", "webhookSecret", "mode"]);
  });

  it("does not collapse messaging, identity, email, and maps into one field", () => {
    expect(gatewayFieldMap["WhatsApp Cloud API"].map(field => field.key)).toEqual(["businessAccountId", "phoneNumberId", "accessToken", "verifyToken"]);
    expect(gatewayFieldMap.SMTP.map(field => field.key)).toEqual(["host", "port", "username", "password", "fromEmail", "secure"]);
    expect(gatewayFieldMap["Google OAuth"].map(field => field.key)).toContain("clientId");
    expect(gatewayFieldMap["Google Maps"].map(field => field.key)).toContain("apiKey");
    expect(gatewayFieldMap.SMTP.some(field => field.secret)).toBe(true);
  });
});
