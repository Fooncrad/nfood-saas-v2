import { describe, expect, it } from "vitest";
import { createRegistrationCaptcha, verifyRegistrationCaptcha } from "./registrationCaptcha";

describe("registration CAPTCHA", () => {
  it("accepts the signed challenge answer", () => {
    const captcha = createRegistrationCaptcha();
    const match = captcha.prompt.match(/(\d+)\s*\+\s*(\d+)/);
    expect(match).not.toBeNull();
    expect(verifyRegistrationCaptcha(captcha.challenge, String(Number(match?.[1]) + Number(match?.[2])))).toBe(true);
  });

  it("rejects wrong answers and tampered challenges", () => {
    const captcha = createRegistrationCaptcha();
    const match = captcha.prompt.match(/(\d+)\s*\+\s*(\d+)/);
    const correct = String(Number(match?.[1]) + Number(match?.[2]));
    expect(verifyRegistrationCaptcha(captcha.challenge, String(Number(correct) + 1))).toBe(false);
    const decoded = Buffer.from(captcha.challenge, "base64url").toString("utf8");
    const parts = decoded.split(":");
    parts[3] = `${parts[3].slice(0, -1)}${parts[3].at(-1) === "0" ? "1" : "0"}`;
    const tampered = Buffer.from(parts.join(":"), "utf8").toString("base64url");
    expect(verifyRegistrationCaptcha(tampered, correct)).toBe(false);
  });
});
