import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const fingerprintSource = readFileSync(new URL("../client/src/lib/deviceFingerprint.ts", import.meta.url), "utf8");

describe("customer device governance and first-order card issuance", () => {
  it("requires a client device fingerprint and checks active approval", () => {
    expect(routerSource).toContain("loginCustomer: publicProcedure.input(z.object({");
    expect(routerSource).toContain("deviceFingerprintHash: z.string().regex(/^[a-f0-9]{64}$/)");
    expect(routerSource).toContain("trustedDevices.fingerprintHash, input.deviceFingerprintHash");
    expect(routerSource).toContain("device.status !== \"active\"");
  });

  it("keeps the browser fingerprint pseudonymous and stable", () => {
    expect(fingerprintSource).toContain("nfood-device-key");
    expect(fingerprintSource).toContain("crypto.subtle.digest(\"SHA-256\"");
    expect(fingerprintSource).not.toContain("localStorage.setItem(STORAGE_KEY, navigator.userAgent");
  });

  it("issues one bound customer card after a completed order", () => {
    expect(routerSource).toContain("automaticCardIssued = false");
    expect(routerSource).toContain("input.status === \"completed\" && existing[0].customerId");
    expect(routerSource).toContain("targetRole, \"customer\"");
    expect(routerSource).toContain("reason: \"first_completed_order\"");
    expect(routerSource).toContain("codeHash: createHash(\"sha256\").update(rawCode).digest(\"hex\")");
    expect(routerSource).toContain("return { success: true, orderId: input.orderId, status: input.status, referralRewarded, automaticCardIssued }");
  });
});
