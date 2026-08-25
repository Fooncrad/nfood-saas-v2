import { describe, expect, it } from "vitest";
import { getPaymentDriver } from "./paymentDrivers";

describe("payment drivers", () => {
  it("keeps cash and manual transfer pending without claiming payment completion", async () => {
    const input = { orderId: "order-1", amount: 120, currency: "SAR" };
    await expect(getPaymentDriver("cash")?.createIntent(input)).resolves.toMatchObject({ status: "pending", driver: "cash" });
    await expect(getPaymentDriver("manual_transfer")?.createIntent(input)).resolves.toMatchObject({ status: "pending", driver: "manual_transfer" });
  });

  it("does not expose an unconfigured external provider as active", () => {
    expect(getPaymentDriver("mada")).toBeNull();
    expect(getPaymentDriver("stripe")).toBeNull();
  });
});
