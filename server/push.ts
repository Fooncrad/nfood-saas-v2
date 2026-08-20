import webpush from "web-push";
import { and, eq } from "drizzle-orm";
import { pushSubscriptions } from "../drizzle/schema";
import { getDb } from "./db";

let configured = false;

function configureVapid() {
  if (configured) return true;
  const subject = process.env.WEB_PUSH_SUBJECT;
  const publicKey = process.env.WEB_PUSH_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export type PushPayload = { title: string; body: string; url?: string; tag?: string };

export async function sendPushToUser(userId: number, payload: PushPayload) {
  if (!configureVapid()) return { sent: 0, skipped: true, removed: 0 };
  const db = await getDb();
  if (!db) return { sent: 0, skipped: true, removed: 0 };
  const subscriptions = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  let sent = 0;
  let removed = 0;
  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, JSON.stringify(payload));
      sent += 1;
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await db.delete(pushSubscriptions).where(and(eq(pushSubscriptions.id, subscription.id), eq(pushSubscriptions.userId, userId)));
        removed += 1;
      } else {
        console.warn(`[Push] delivery failed for subscription ${subscription.id}`);
      }
    }
  }
  return { sent, skipped: false, removed };
}

export function isPushConfigured() {
  return Boolean(process.env.WEB_PUSH_SUBJECT && process.env.WEB_PUSH_PUBLIC_KEY && process.env.WEB_PUSH_PRIVATE_KEY);
}
