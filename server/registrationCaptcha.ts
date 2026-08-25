import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { ENV } from "./_core/env";

const TTL_MS = 10 * 60 * 1000;
const secret = () => ENV.cookieSecret || "nfood-registration-captcha-development";

export function createRegistrationCaptcha() {
  const a = randomInt(2, 10);
  const b = randomInt(2, 10);
  const expiresAt = Date.now() + TTL_MS;
  const answer = String(a + b);
  const payload = `${a}:${b}:${expiresAt}`;
  const signature = createHmac("sha256", secret()).update(payload).digest("hex");
  return { challenge: Buffer.from(`${payload}:${signature}`).toString("base64url"), prompt: `${a} + ${b} = ؟`, expiresAt };
}

export function verifyRegistrationCaptcha(challenge: string, answer: string) {
  try {
    const decoded = Buffer.from(challenge, "base64url").toString("utf8");
    const [a, b, expiresAtText, signature] = decoded.split(":");
    const expiresAt = Number(expiresAtText);
    if (!a || !b || !signature || !Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
    const payload = `${a}:${b}:${expiresAt}`;
    const expected = createHmac("sha256", secret()).update(payload).digest("hex");
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    return String(Number(a) + Number(b)) === answer.trim();
  } catch {
    return false;
  }
}
