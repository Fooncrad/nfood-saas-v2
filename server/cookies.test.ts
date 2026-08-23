import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "./_core/cookies";

const request = (protocol: string, headers: Record<string, string> = {}) => ({ protocol, headers } as never);

describe("session cookie transport", () => {
  it("uses Lax without Secure for local HTTP", () => {
    expect(getSessionCookieOptions(request("http"))).toMatchObject({ sameSite: "lax", secure: false });
  });

  it("uses None with Secure behind HTTPS", () => {
    expect(getSessionCookieOptions(request("https"))).toMatchObject({ sameSite: "none", secure: true });
  });

  it("honors forwarded HTTPS in a proxy", () => {
    expect(getSessionCookieOptions(request("http", { "x-forwarded-proto": "https" }))).toMatchObject({ sameSite: "none", secure: true });
  });
});
