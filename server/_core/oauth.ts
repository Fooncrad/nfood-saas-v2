import { COOKIE_NAME, ONE_YEAR_MS, OAUTH_STATE_COOKIE, decodeOAuthState } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { nanoid } from "nanoid";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

async function googleConfiguration(req: Request) {
  const setting = await db.getIntegrationSetting("platform", "Google OAuth") ?? await db.getIntegrationSetting("platform", "google_oauth");
  if (setting?.status === "configured") {
    let meta: Record<string, string> = {};
    try { const parsed = setting.keyReference ? JSON.parse(setting.keyReference) : {}; if (parsed && typeof parsed === "object") meta = parsed; } catch { if (setting.keyReference) meta.clientId = setting.keyReference; }
    const rawSecret = setting.secretCiphertext ? db.decryptIntegrationSecret(setting.secretCiphertext) : null;
    let secret: Record<string, string> = {};
    try { const parsed = rawSecret ? JSON.parse(rawSecret) : {}; if (parsed && typeof parsed === "object") secret = parsed; } catch { if (rawSecret) secret.clientSecret = rawSecret; }
    if (meta.clientId && secret.clientSecret) return { clientId: meta.clientId, clientSecret: secret.clientSecret, redirectUri: meta.redirectUri || `${req.protocol}://${req.get("host")}/api/oauth/google/callback` };
  }
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) return { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, redirectUri: process.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT || `${req.protocol}://${req.get("host")}/api/oauth/google/callback` };
  return null;
}

function oauthNonce(res: Response) { const nonce = nanoid(32); res.cookie(OAUTH_STATE_COOKIE, nonce, { httpOnly: true, path: "/", maxAge: 600000, sameSite: "lax", secure: true }); return nonce; }
function verifyOauthNonce(req: Request, state: string) { return Boolean(state && state === parseCookieHeader(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE]); }

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/google/start", async (req: Request, res: Response) => {
    const config = await googleConfiguration(req);
    if (!config) return res.redirect(302, "/login?oauth=google_not_configured");
    const state = oauthNonce(res);
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", config.clientId); url.searchParams.set("redirect_uri", config.redirectUri); url.searchParams.set("response_type", "code"); url.searchParams.set("scope", "openid email profile"); url.searchParams.set("state", state); url.searchParams.set("prompt", "select_account");
    return res.redirect(302, url.toString());
  });
  app.get("/api/oauth/google/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code"); const state = getQueryParam(req, "state");
    if (!code || !state || !verifyOauthNonce(req, state)) return res.redirect(302, "/login?oauth=invalid_state");
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/" });
    try {
      const config = await googleConfiguration(req); if (!config) return res.redirect(302, "/login?oauth=google_not_configured");
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: config.redirectUri, grant_type: "authorization_code" }) });
      if (!tokenResponse.ok) throw new Error("google_token_exchange_failed");
      const token = await tokenResponse.json() as { access_token?: string }; if (!token.access_token) throw new Error("google_access_token_missing");
      const infoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${token.access_token}` } }); if (!infoResponse.ok) throw new Error("google_userinfo_failed");
      const info = await infoResponse.json() as { sub?: string; email?: string; name?: string; email_verified?: boolean }; if (!info.sub) throw new Error("google_subject_missing");
      const googleOpenId = `google_${info.sub}`;
      const normalizedEmail = info.email?.trim().toLowerCase();
      const existingGoogleUser = await db.getUserByOpenId(googleOpenId);
      const existingEmailUser = !existingGoogleUser && info.email_verified && normalizedEmail ? await db.getUserByEmail(normalizedEmail) : undefined;
      const sessionOpenId = existingGoogleUser?.openId ?? existingEmailUser?.openId ?? googleOpenId;
      if (!existingGoogleUser && !existingEmailUser) await db.upsertUser({ openId: googleOpenId, name: info.name ?? null, email: normalizedEmail ?? null, loginMethod: "google", lastSignedIn: new Date() });
      else await db.upsertUser({ openId: sessionOpenId, name: info.name ?? undefined, email: normalizedEmail ?? undefined, lastSignedIn: new Date() });
      const user = await db.getUserByOpenId(sessionOpenId);
      const sessionToken = await sdk.createSessionToken(sessionOpenId, { name: info.name || user?.name || "", expiresInMs: ONE_YEAR_MS }); res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      if (user?.role === "admin") return res.redirect(302, "/admin");
      const restaurantId = user ? await db.getMerchantRestaurantId(user.id) : null;
      return res.redirect(302, restaurantId ? "/restaurant/dashboard" : "/register?oauth=google");
    } catch (error) { console.error("[Google OAuth] Callback failed", error); return res.redirect(302, "/login?oauth=google_failed"); }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    // CSRF guard: the nonce in `state` must match the one-time cookie that
    // startLogin set in the browser that began this login. An attacker can
    // forge `state`, but cannot plant this cookie in the victim's browser.
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
