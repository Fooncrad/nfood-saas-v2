import nodemailer from "nodemailer";

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

export async function sendPasswordResetEmail(input: { to: string; customerName: string; resetUrl: string }) {
  const transporter = getTransporter();
  if (!transporter) return { sent: false, skipped: "smtp-not-configured" as const };
  const safeName = escapeHtml(input.customerName);
  const safeUrl = escapeHtml(input.resetUrl);
  await transporter.sendMail({ from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER, to: input.to, subject: "إعادة تعيين كلمة مرور NFOOD", text: `مرحبًا ${input.customerName}، افتح الرابط التالي لإعادة تعيين كلمة المرور: ${input.resetUrl}. إذا لم تطلب ذلك فتجاهل الرسالة.`, html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8"><h2>إعادة تعيين كلمة المرور</h2><p>مرحبًا ${safeName}،</p><p>تم طلب إعادة تعيين كلمة مرور حسابك في NFOOD.</p><p><a href="${safeUrl}">اضغط هنا لإنشاء كلمة مرور جديدة</a></p><p>ينتهي الرابط خلال ساعة واحدة. إذا لم تطلب ذلك فتجاهل الرسالة.</p></div>` });
  return { sent: true as const };
}

export async function sendGuestClaimOtpEmail(input: { to: string; customerName: string; code: string }) {
  const transporter = getTransporter();
  if (!transporter) return { sent: false, skipped: "smtp-not-configured" as const };
  const safeName = escapeHtml(input.customerName);
  await transporter.sendMail({ from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER, to: input.to, subject: "رمز ربط طلباتك السابقة في NFOOD", text: `مرحباً ${input.customerName}، رمز التحقق لربط طلباتك السابقة هو ${input.code}. ينتهي خلال 10 دقائق.`, html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8"><h2>رمز التحقق</h2><p>مرحباً ${safeName}،</p><p>استخدم الرمز التالي لربط طلباتك السابقة بحسابك:</p><p style="font-size:28px;font-weight:bold;letter-spacing:8px">${input.code}</p><p>ينتهي الرمز خلال 10 دقائق.</p></div>` });
  return { sent: true as const };
}

export async function sendReservationAcceptedEmail(input: { to?: string | null; customerName: string; restaurantName: string; tableName: string; reservedFor: Date; partySize: number }) {
  if (!input.to) return { sent: false, skipped: "no-recipient" as const };
  const transporter = getTransporter();
  if (!transporter) return { sent: false, skipped: "smtp-not-configured" as const };
  const when = input.reservedFor.toLocaleString("ar-SA", { dateStyle: "full", timeStyle: "short" });
  await transporter.sendMail({ from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER, to: input.to, subject: `تم قبول حجزك في ${input.restaurantName}`, text: `مرحبًا ${input.customerName}، تم قبول حجزك في ${input.restaurantName}. الطاولة: ${input.tableName}. الموعد: ${when}. عدد الأشخاص: ${input.partySize}.`, html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8"><h2>تم قبول الحجز</h2><p>مرحبًا ${escapeHtml(input.customerName)}،</p><p>تم تأكيد حجزك في <strong>${escapeHtml(input.restaurantName)}</strong>.</p><p>الطاولة: <strong>${escapeHtml(input.tableName)}</strong><br>الموعد: <strong>${escapeHtml(when)}</strong><br>عدد الأشخاص: <strong>${input.partySize}</strong></p><p>ننتظركم بكل سرور.</p></div>` });
  return { sent: true as const };
}

export async function sendReservationNoShowEmail(input: { to?: string | null; customerName: string; restaurantName: string; reservedFor: Date; graceMinutes: number }) {
  if (!input.to) return { sent: false, skipped: "no-recipient" as const };
  const transporter = getTransporter();
  if (!transporter) return { sent: false, skipped: "smtp-not-configured" as const };
  const when = input.reservedFor.toLocaleString("ar-SA", { dateStyle: "full", timeStyle: "short" });
  await transporter.sendMail({ from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER, to: input.to, subject: `تم إلغاء حجزك في ${input.restaurantName} لعدم الحضور`, text: `مرحبًا ${input.customerName}، تم إلغاء حجزك في ${input.restaurantName} للموعد ${when} لعدم تسجيل الحضور خلال ${input.graceMinutes} دقائق من وقت الحجز.`, html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8"><h2>تم إلغاء الحجز لعدم الحضور</h2><p>مرحبًا ${escapeHtml(input.customerName)}،</p><p>تم إلغاء حجزك في <strong>${escapeHtml(input.restaurantName)}</strong> للموعد <strong>${escapeHtml(when)}</strong> لأن الحضور لم يُسجّل خلال ${input.graceMinutes} دقائق.</p><p>يمكنك إنشاء حجز جديد من صفحة المنيو.</p></div>` });
  return { sent: true as const };
}
