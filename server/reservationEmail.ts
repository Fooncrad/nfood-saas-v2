import nodemailer from "nodemailer";
import { sendTemplatedEmail } from "./emailTemplates";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

export async function sendPasswordResetEmail(input: { to: string; customerName: string; resetUrl: string; restaurantId?: number | null }) {
  return sendTemplatedEmail({ to: input.to, restaurantId: input.restaurantId, eventKey: "account.password_reset", data: { name: input.customerName, resetUrl: input.resetUrl, siteName: "NFOOD" } });
}

export async function sendGuestClaimOtpEmail(input: { to: string; customerName: string; code: string; restaurantId?: number | null }) {
  return sendTemplatedEmail({ to: input.to, restaurantId: input.restaurantId, eventKey: "account.otp", data: { name: input.customerName, code: input.code, expiresMinutes: 10, siteName: "NFOOD" } });
}

export async function sendReservationAcceptedEmail(input: { to?: string | null; customerName: string; restaurantName: string; tableName: string; reservedFor: Date; partySize: number; restaurantId?: number | null }) {
  const when = input.reservedFor.toLocaleString("ar-SA", { dateStyle: "full", timeStyle: "short" });
  return sendTemplatedEmail({ to: input.to, restaurantId: input.restaurantId, eventKey: "reservation.accepted", data: { name: input.customerName, restaurantName: input.restaurantName, tableName: input.tableName, reservedFor: when, partySize: input.partySize } });
}

export async function sendReservationNoShowEmail(input: { to?: string | null; customerName: string; restaurantName: string; reservedFor: Date; graceMinutes: number; restaurantId?: number | null }) {
  const when = input.reservedFor.toLocaleString("ar-SA", { dateStyle: "full", timeStyle: "short" });
  return sendTemplatedEmail({ to: input.to, restaurantId: input.restaurantId, eventKey: "reservation.cancelled", data: { name: input.customerName, restaurantName: input.restaurantName, reservedFor: when, reason: `عدم الحضور خلال ${input.graceMinutes} دقائق` } });
}
