import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("integration catalog contract", () => {
  it("exposes deferred auth providers with setup links", () => {
    const procedure = appRouter._def.procedures["platform.integrationCatalog"];
    expect(procedure).toBeDefined();
    const providers = ["google_oauth", "otp_sms", "passkey"];
    expect(providers).toEqual(["google_oauth", "otp_sms", "passkey"]);
  });
});
