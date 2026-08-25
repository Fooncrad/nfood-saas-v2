import nodemailer from "nodemailer";
import { and, eq } from "drizzle-orm";
import { emailTemplates } from "../drizzle/schema";
import { getDb } from "./db";

export type EmailLocale = "ar" | "en" | "fr";
export type EmailEventKey = "account.welcome" | "account.password_reset" | "account.otp" | "order.received" | "order.status" | "reservation.accepted" | "reservation.cancelled" | "payment.receipt" | "driver.assignment";

type EmailTemplateSeed = { eventKey: EmailEventKey; locale: EmailLocale; subject: string; htmlBody: string; textBody: string };

const seeds: EmailTemplateSeed[] = [
  { eventKey: "account.welcome", locale: "ar", subject: "مرحبًا بك في {{siteName}}", htmlBody: "<div dir=\"rtl\" style=\"font-family:Arial;line-height:1.8\"><h2>مرحبًا {{name}}</h2><p>تم إنشاء حسابك بنجاح في {{siteName}}.</p><p>المطعم المرتبط: {{restaurantName}}</p></div>", textBody: "مرحبًا {{name}}، تم إنشاء حسابك في {{siteName}}. المطعم المرتبط: {{restaurantName}}." },
  { eventKey: "account.password_reset", locale: "ar", subject: "إعادة تعيين كلمة مرور {{siteName}}", htmlBody: "<div dir=\"rtl\" style=\"font-family:Arial;line-height:1.8\"><h2>إعادة تعيين كلمة المرور</h2><p>مرحبًا {{name}}،</p><p><a href=\"{{resetUrl}}\">اضغط هنا لإنشاء كلمة مرور جديدة</a></p><p>ينتهي الرابط خلال ساعة واحدة.</p></div>", textBody: "مرحبًا {{name}}، افتح الرابط التالي لإعادة تعيين كلمة المرور: {{resetUrl}}. ينتهي خلال ساعة واحدة." },
  { eventKey: "account.otp", locale: "ar", subject: "رمز التحقق من {{siteName}}", htmlBody: "<div dir=\"rtl\" style=\"font-family:Arial;line-height:1.8\"><h2>رمز التحقق</h2><p>رمزك هو <strong style=\"font-size:28px;letter-spacing:6px\">{{code}}</strong></p><p>ينتهي خلال {{expiresMinutes}} دقائق.</p></div>", textBody: "رمز التحقق: {{code}}. ينتهي خلال {{expiresMinutes}} دقائق." },
  { eventKey: "order.received", locale: "ar", subject: "تم استلام طلبك #{{orderNumber}}", htmlBody: "<div dir=\"rtl\" style=\"font-family:Arial;line-height:1.8\"><h2>تم استلام الطلب</h2><p>مرحبًا {{name}}، استلم {{restaurantName}} طلبك رقم {{orderNumber}} بقيمة {{total}}.</p></div>", textBody: "مرحبًا {{name}}، تم استلام طلبك رقم {{orderNumber}} لدى {{restaurantName}} بقيمة {{total}}." },
  { eventKey: "order.status", locale: "ar", subject: "تحديث حالة الطلب #{{orderNumber}}", htmlBody: "<div dir=\"rtl\" style=\"font-family:Arial;line-height:1.8\"><h2>تحديث الطلب</h2><p>حالة طلبك رقم {{orderNumber}} الآن: <strong>{{status}}</strong>.</p></div>", textBody: "حالة طلبك رقم {{orderNumber}} الآن: {{status}}." },
  { eventKey: "reservation.accepted", locale: "ar", subject: "تم قبول حجزك في {{restaurantName}}", htmlBody: "<div dir=\"rtl\" style=\"font-family:Arial;line-height:1.8\"><h2>تم تأكيد الحجز</h2><p>مرحبًا {{name}}، موعدك {{reservedFor}} والطاولة {{tableName}} لعدد {{partySize}} أشخاص.</p></div>", textBody: "مرحبًا {{name}}، تم تأكيد حجزك في {{restaurantName}} بتاريخ {{reservedFor}}، الطاولة {{tableName}} لعدد {{partySize}}." },
  { eventKey: "reservation.cancelled", locale: "ar", subject: "تم إلغاء حجزك في {{restaurantName}}", htmlBody: "<div dir=\"rtl\" style=\"font-family:Arial;line-height:1.8\"><h2>تم إلغاء الحجز</h2><p>مرحبًا {{name}}، تم إلغاء حجزك للموعد {{reservedFor}}. السبب: {{reason}}.</p></div>", textBody: "مرحبًا {{name}}، تم إلغاء حجزك للموعد {{reservedFor}}. السبب: {{reason}}." },
  { eventKey: "payment.receipt", locale: "ar", subject: "إيصال الدفع للطلب #{{orderNumber}}", htmlBody: "<div dir=\"rtl\" style=\"font-family:Arial;line-height:1.8\"><h2>إيصال الدفع</h2><p>تم تسجيل دفعتك بقيمة {{total}} للطلب رقم {{orderNumber}}.</p></div>", textBody: "تم تسجيل دفعتك بقيمة {{total}} للطلب رقم {{orderNumber}}." },
  { eventKey: "driver.assignment", locale: "ar", subject: "تم إسناد طلب توصيل جديد #{{orderNumber}}", htmlBody: "<div dir=\"rtl\" style=\"font-family:Arial;line-height:1.8\"><h2>طلب توصيل جديد</h2><p>تم إسناد الطلب {{orderNumber}} إليك من {{restaurantName}}. العنوان: {{deliveryAddress}}.</p></div>", textBody: "تم إسناد الطلب {{orderNumber}} إليك من {{restaurantName}}. العنوان: {{deliveryAddress}}." },
];

function transporter() { const host = process.env.SMTP_HOST; const user = process.env.SMTP_USER; const pass = process.env.SMTP_PASSWORD; if (!host || !user || !pass) return null; const port = Number(process.env.SMTP_PORT || 587); return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } }); }
function escape(value: unknown) { return String(value ?? "").replace(/[&<>\"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" })[character] ?? character); }
export function renderEmailTemplate(template: string, data: Record<string, unknown>) { return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => escape(data[key])); }

export function getDefaultEmailTemplates() { return seeds.map((seed) => ({ ...seed, isEnabled: true, source: "default" as const })); }
export async function listEffectiveEmailTemplates(restaurantId: number) {
  const db = await getDb();
  if (!db) return getDefaultEmailTemplates();
  const rows = await db.select().from(emailTemplates).where(and(eq(emailTemplates.restaurantId, restaurantId), eq(emailTemplates.scope, "restaurant")));
  const byKey = new Map(rows.map((row) => [`${row.eventKey}:${row.locale}`, row]));
  return seeds.map((seed) => byKey.get(`${seed.eventKey}:${seed.locale}`) ?? { ...seed, isEnabled: true, source: "default" as const });
}
export async function getEffectiveEmailTemplate(input: { restaurantId?: number | null; eventKey: EmailEventKey; locale?: EmailLocale }) {
  const locale = input.locale ?? "ar";
  const db = await getDb();
  if (db && input.restaurantId) {
    const row = (await db.select().from(emailTemplates).where(and(eq(emailTemplates.restaurantId, input.restaurantId), eq(emailTemplates.scope, "restaurant"), eq(emailTemplates.eventKey, input.eventKey), eq(emailTemplates.locale, locale), eq(emailTemplates.isEnabled, true))).limit(1))[0];
    if (row) return row;
  }
  return seeds.find((seed) => seed.eventKey === input.eventKey && seed.locale === locale) ?? seeds.find((seed) => seed.eventKey === input.eventKey && seed.locale === "ar") ?? null;
}
export async function sendTemplatedEmail(input: { to?: string | null; restaurantId?: number | null; eventKey: EmailEventKey; locale?: EmailLocale; data: Record<string, unknown> }) {
  if (!input.to) return { sent: false as const, skipped: "no-recipient" as const };
  const mailer = transporter();
  if (!mailer) return { sent: false as const, skipped: "smtp-not-configured" as const };
  const template = await getEffectiveEmailTemplate(input);
  if (!template || ("isEnabled" in template && template.isEnabled === false)) return { sent: false as const, skipped: "template-disabled" as const };
  await mailer.sendMail({ from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER, to: input.to, subject: renderEmailTemplate(template.subject, input.data), text: renderEmailTemplate(template.textBody, input.data), html: renderEmailTemplate(template.htmlBody, input.data) });
  return { sent: true as const };
}
export { seeds as emailTemplateSeeds };
