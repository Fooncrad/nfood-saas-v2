import nodemailer from "nodemailer";

export type ReceiptDeliveryItem = {
  name: string;
  quantity: number;
  unitPrice: string | number;
};

export type ReceiptDeliveryPayload = {
  orderId: number;
  restaurantName: string;
  currency: string;
  items: ReceiptDeliveryItem[];
  subtotal: string | number;
  discountAmount: string | number;
  discountPercent: string | number;
  taxAmount: string | number;
  taxPercent: string | number;
  total: string | number;
  headerText?: string | null;
  footerText?: string | null;
  logoUrl?: string | null;
};

export function formatReceiptDeliveryText(input: ReceiptDeliveryPayload) {
  const lines = [
    input.headerText?.trim() || input.restaurantName,
    `إيصال الطلب #${input.orderId}`,
    "------------------------------",
    ...input.items.map((item) => `${item.name} × ${item.quantity}  ${Number(item.unitPrice) * item.quantity} ${input.currency}`),
    "------------------------------",
    `المجموع قبل الخصم: ${input.subtotal} ${input.currency}`,
    `الخصم (${input.discountPercent}%): -${input.discountAmount} ${input.currency}`,
    `الضريبة (${input.taxPercent}%): ${input.taxAmount} ${input.currency}`,
    `الإجمالي النهائي: ${input.total} ${input.currency}`,
    input.footerText?.trim() || "شكراً لزيارتكم",
  ];
  return lines.join("\n");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

export function formatReceiptDeliveryHtml(input: ReceiptDeliveryPayload) {
  const logo = input.logoUrl && /^https?:\/\//i.test(input.logoUrl) ? `<img src="${escapeHtml(input.logoUrl)}" alt="شعار ${escapeHtml(input.restaurantName)}" style="max-width:140px;max-height:80px;object-fit:contain;margin-bottom:12px" />` : "";
  const rows = input.items.map((item) => `<tr><td style="padding:7px 0;border-bottom:1px solid #eee">${escapeHtml(item.name)} × ${item.quantity}</td><td style="padding:7px 0;border-bottom:1px solid #eee;text-align:left">${escapeHtml(String(Number(item.unitPrice) * item.quantity))} ${escapeHtml(input.currency)}</td></tr>`).join("");
  return `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#172033;line-height:1.7">${logo}<h2 style="margin:0 0 4px">${escapeHtml(input.headerText?.trim() || input.restaurantName)}</h2><p style="margin:0 0 16px;color:#64748b">إيصال الطلب #${input.orderId}</p><table style="width:100%;border-collapse:collapse">${rows}</table><div style="margin-top:16px;border-top:1px solid #e2e8f0;padding-top:12px"><p>المجموع قبل الخصم: <strong>${escapeHtml(String(input.subtotal))} ${escapeHtml(input.currency)}</strong></p><p style="color:#b45309">الخصم (${escapeHtml(String(input.discountPercent))}%): <strong>-${escapeHtml(String(input.discountAmount))} ${escapeHtml(input.currency)}</strong></p><p>الضريبة (${escapeHtml(String(input.taxPercent))}%): <strong>${escapeHtml(String(input.taxAmount))} ${escapeHtml(input.currency)}</strong></p><p style="font-size:18px;border-top:1px solid #e2e8f0;padding-top:10px"><strong>الإجمالي النهائي: ${escapeHtml(String(input.total))} ${escapeHtml(input.currency)}</strong></p></div><p style="margin-top:22px;color:#64748b">${escapeHtml(input.footerText?.trim() || "شكراً لزيارتكم")}</p></div>`;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

export async function sendReceiptEmail(input: { to: string; receipt: ReceiptDeliveryPayload }) {
  const transporter = getTransporter();
  if (!transporter) return { sent: false as const, skipped: "smtp-not-configured" as const };
  await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
    to: input.to,
    subject: `إيصال طلبك #${input.receipt.orderId} من ${input.receipt.restaurantName}`,
    text: formatReceiptDeliveryText(input.receipt),
    html: formatReceiptDeliveryHtml(input.receipt),
  });
  return { sent: true as const };
}

type SmsConfig = { accountSid: string; authToken: string; from: string; apiUrl?: string };

export function parseTwilioSmsConfig(secret?: string | null, fallbackFrom?: string | null): SmsConfig | null {
  if (!secret) return null;
  try {
    const parsed = JSON.parse(secret) as Partial<SmsConfig>;
    if (parsed.accountSid && parsed.authToken && (parsed.from || fallbackFrom)) return { accountSid: parsed.accountSid, authToken: parsed.authToken, from: parsed.from || fallbackFrom!, apiUrl: parsed.apiUrl };
  } catch {
    return null;
  }
  return null;
}

export function buildTwilioSmsRequest(input: { to: string; body: string; config: SmsConfig }) {
  const apiUrl = input.config.apiUrl || `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(input.config.accountSid)}/Messages.json`;
  const body = new URLSearchParams({ To: input.to, From: input.config.from, Body: input.body });
  const authorization = Buffer.from(`${input.config.accountSid}:${input.config.authToken}`).toString("base64");
  return { apiUrl, body, headers: { Authorization: `Basic ${authorization}`, "Content-Type": "application/x-www-form-urlencoded" } };
}

export async function sendReceiptSms(input: { to: string; receipt: ReceiptDeliveryPayload; secret?: string | null; from?: string | null }) {
  const config = parseTwilioSmsConfig(input.secret, input.from);
  if (!config) return { sent: false as const, skipped: "sms-not-configured" as const };
  const request = buildTwilioSmsRequest({ to: input.to, body: formatReceiptDeliveryText(input.receipt), config });
  const response = await fetch(request.apiUrl, { method: "POST", headers: request.headers, body: request.body });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`SMS provider rejected the request (${response.status})${detail ? `: ${detail.slice(0, 180)}` : ""}`);
  }
  return { sent: true as const };
}
