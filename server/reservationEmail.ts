import nodemailer from "nodemailer";
import { sendTemplatedEmail } from "./emailTemplates";
import { getEffectiveIntegrationSecret } from "./db";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

function formatWhen(date: Date) { return date.toLocaleString("ar-SA-u-ca-gregory-nu-latn", { dateStyle: "full", timeStyle: "short" }); }

export async function sendPasswordResetEmail(input: { to: string; customerName: string; resetUrl: string; restaurantId?: number | null }) { return sendTemplatedEmail({ to: input.to, restaurantId: input.restaurantId, eventKey: "account.password_reset", data: { name: input.customerName, resetUrl: input.resetUrl, siteName: "NFOOD" } }); }
export async function sendGuestClaimOtpEmail(input: { to: string; customerName: string; code: string; restaurantId?: number | null }) { return sendTemplatedEmail({ to: input.to, restaurantId: input.restaurantId, eventKey: "account.otp", data: { name: input.customerName, code: input.code, expiresMinutes: 10, siteName: "NFOOD" } }); }
export async function sendReservationAcceptedEmail(input: { to?: string | null; customerName: string; restaurantName: string; tableName: string; reservedFor: Date; partySize: number; restaurantId?: number | null }) { return sendTemplatedEmail({ to: input.to, restaurantId: input.restaurantId, eventKey: "reservation.accepted", data: { name: input.customerName, restaurantName: input.restaurantName, tableName: input.tableName, reservedFor: formatWhen(input.reservedFor), partySize: input.partySize } }); }
export async function sendReservationRejectedEmail(input: { to?: string | null; customerName: string; restaurantName: string; reservedFor: Date; reason: string; restaurantId?: number | null }) { return sendTemplatedEmail({ to: input.to, restaurantId: input.restaurantId, eventKey: "reservation.rejected", data: { name: input.customerName, restaurantName: input.restaurantName, reservedFor: formatWhen(input.reservedFor), reason: input.reason } }); }
export async function sendReservationUpdatedEmail(input: { to?: string | null; customerName: string; restaurantName: string; reservedFor: Date; partySize: number; restaurantId?: number | null }) { return sendTemplatedEmail({ to: input.to, restaurantId: input.restaurantId, eventKey: "reservation.updated", data: { name: input.customerName, restaurantName: input.restaurantName, reservedFor: formatWhen(input.reservedFor), partySize: input.partySize } }); }
export async function sendReservationCancelledEmail(input: { to?: string | null; customerName: string; restaurantName: string; reservedFor: Date; reason: string; restaurantId?: number | null }) { return sendTemplatedEmail({ to: input.to, restaurantId: input.restaurantId, eventKey: "reservation.cancelled", data: { name: input.customerName, restaurantName: input.restaurantName, reservedFor: formatWhen(input.reservedFor), reason: input.reason } }); }
export async function sendReservationNoShowEmail(input: { to?: string | null; customerName: string; restaurantName: string; reservedFor: Date; graceMinutes: number; restaurantId?: number | null }) { return sendReservationCancelledEmail({ to: input.to, customerName: input.customerName, restaurantName: input.restaurantName, reservedFor: input.reservedFor, reason: `عدم الحضور خلال ${input.graceMinutes} دقائق`, restaurantId: input.restaurantId }); }

function parseWhatsAppConfig(raw: string | null) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { phoneNumberId?: string; accessToken?: string };
    if (!parsed.phoneNumberId || !parsed.accessToken) return null;
    return parsed;
  } catch { return null; }
}

export async function sendReservationWhatsApp(input: { restaurantId: number; to?: string | null; body: string }) {
  if (!input.to) return { sent: false as const, skipped: "no-recipient" as const };
  const config = parseWhatsAppConfig(await getEffectiveIntegrationSecret(input.restaurantId, "whatsapp_business"));
  if (!config) return { sent: false as const, skipped: "whatsapp-not-configured" as const };
  const recipient = input.to.replace(/[^\d]/g, "");
  if (recipient.length < 8) return { sent: false as const, skipped: "invalid-recipient" as const };
  const response = await fetch(`https://graph.facebook.com/v20.0/${encodeURIComponent(config.phoneNumberId!)}/messages`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${config.accessToken}` }, body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: recipient, type: "text", text: { preview_url: false, body: input.body.slice(0, 4096) } }) });
  if (!response.ok) { const detail = await response.text().catch(() => ""); throw new Error(`WhatsApp provider rejected the request (${response.status})${detail ? `: ${detail.slice(0, 180)}` : ""}`); }
  return { sent: true as const };
}

export function reservationNotificationText(input: { status: string; customerName: string; restaurantName: string; reservedFor: Date; tableName?: string | null; partySize: number; reason?: string | null }) {
  const status = input.status === "confirmed" ? "تم قبول الحجز" : input.status === "rejected" ? "لم يتم قبول الحجز" : input.status === "cancelled" ? "تم إلغاء الحجز" : "تم تحديث الحجز";
  return `${status} في ${input.restaurantName}\nالعميل: ${input.customerName}\nالموعد: ${formatWhen(input.reservedFor)}\nعدد الأشخاص: ${input.partySize}${input.tableName ? `\nالطاولة: ${input.tableName}` : ""}${input.reason ? `\nالسبب: ${input.reason}` : ""}`;
}

export function getReservationTransporter() { return getTransporter(); }
