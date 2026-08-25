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
    expect(verifyRegistrationCaptcha(`${captcha.challenge.slice(0, -1)}x`, correct)).toBe(false);
  });
});
