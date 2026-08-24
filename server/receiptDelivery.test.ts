import { describe, expect, it } from "vitest";
import { buildTwilioSmsRequest, formatReceiptDeliveryHtml, formatReceiptDeliveryText, formatReceiptSubject, parseReceiptMessageTemplates, parseSmtpConfig, parseTwilioSmsConfig, resolveReceiptLocale } from "./receiptDelivery";

describe("receipt delivery", () => {
  const receipt = {
    orderId: 42,
    restaurantName: "Nasser Cafe",
    currency: "SAR",
    items: [{ name: "برجر", quantity: 2, unitPrice: "10.00" }],
    subtotal: "20.00",
    discountAmount: "2.00",
    discountPercent: "10.00",
    taxAmount: "2.70",
    taxPercent: "15.00",
    total: "20.70",
    headerText: "Nasser Cafe · أهلاً بكم",
    footerText: "شكراً لزيارتكم",
    logoUrl: "https://cdn.example.test/logo.png",
  };

  it("formats a receipt with pricing details and footer", () => {
    const text = formatReceiptDeliveryText(receipt);
    expect(text).toContain("إيصال الطلب #42");
    expect(text).toContain("المجموع قبل الخصم: 20.00 SAR");
    expect(text).toContain("الإجمالي النهائي: 20.70 SAR");
    expect(text).toContain("شكراً لزيارتكم");
  });

  it("localizes receipt labels and the email subject", () => {
    const templates = parseReceiptMessageTemplates(JSON.stringify({ en: { subject: "Receipt {{orderId}} · {{restaurantName}}", footer: "See you soon" }, fr: { footer: "À bientôt" } }));
    const english = formatReceiptDeliveryText({ ...receipt, locale: "en", messageTemplate: templates.en });
    expect(english).toContain("Order receipt #42");
    expect(english).toContain("Subtotal: 20.00 SAR");
    expect(english).toContain("See you soon");
    expect(formatReceiptSubject({ orderId: 42, restaurantName: "Nasser Cafe", locale: "en", template: templates.en })).toBe("Receipt 42 · Nasser Cafe");
    expect(formatReceiptDeliveryText({ ...receipt, locale: "fr", messageTemplate: templates.fr })).toContain("Reçu de commande #42");
    expect(resolveReceiptLocale("fr-FR")).toBe("fr");
    expect(resolveReceiptLocale("de-DE")).toBe("ar");
  });

  it("escapes customer-facing HTML and includes a remote logo", () => {
    const html = formatReceiptDeliveryHtml({ ...receipt, headerText: "<script>" });
    expect(html).toContain("https://cdn.example.test/logo.png");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("accepts a complete restaurant SMTP JSON configuration without exposing its password", () => {
    const config = parseSmtpConfig(JSON.stringify({ host: "smtp.restaurant.test", port: 465, user: "mail@restaurant.test", pass: "private", from: "Nasser Cafe <mail@restaurant.test>" }));
    expect(config).toMatchObject({ host: "smtp.restaurant.test", port: 465, user: "mail@restaurant.test", from: "Nasser Cafe <mail@restaurant.test>" });
    expect(config).not.toHaveProperty("password");
    expect(parseSmtpConfig(JSON.stringify({ host: "smtp.restaurant.test", user: "mail@restaurant.test" }))).toBeNull();
  });

  it("accepts only complete Twilio JSON configuration", () => {
    expect(parseTwilioSmsConfig(JSON.stringify({ accountSid: "AC123", authToken: "secret", from: "+1000" }))).toMatchObject({ accountSid: "AC123", from: "+1000" });
    expect(parseTwilioSmsConfig(JSON.stringify({ accountSid: "AC123", from: "+1000" }))).toBeNull();
    expect(parseTwilioSmsConfig("not-json")).toBeNull();
  });

  it("builds an authenticated form request without exposing the token in the body", () => {
    const request = buildTwilioSmsRequest({ to: "+966500000000", body: "Receipt #42", config: { accountSid: "AC123", authToken: "secret", from: "+1000" } });
    expect(request.apiUrl).toContain("AC123");
    expect(request.headers.Authorization).toMatch(/^Basic /);
    expect(request.body.get("To")).toBe("+966500000000");
    expect(request.body.get("Body")).toBe("Receipt #42");
    expect(request.body.toString()).not.toContain("secret");
  });
});
