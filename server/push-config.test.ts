import { describe, expect, it } from "vitest";

describe("web push configuration", () => {
  it("accepts the configured VAPID credentials", () => {
    expect(process.env.WEB_PUSH_PUBLIC_KEY).toBeTruthy();
    expect(process.env.WEB_PUSH_PRIVATE_KEY).toBeTruthy();
    expect(process.env.WEB_PUSH_SUBJECT).toMatch(/^(mailto:|https?:\/\/)/);
  });
});
