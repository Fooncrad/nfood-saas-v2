import { describe, expect, it } from "vitest";
import { calculateDeliveryAccounting } from "./deliveryAccounting";

describe("delivery accounting", () => {
  it("records the full cash order as driver debt and commission from delivery fee", () => {
    expect(calculateDeliveryAccounting({
      paymentMethod: "cash",
      orderTotal: "250.00",
      deliveryFee: "50.00",
      worker: { compensationType: "commission", commissionRate: "10.00" },
    })).toEqual({ cashDebtAmount: "250.00", driverEarningAmount: "5.00", driverEarningType: "commission" });
  });

  it("does not create cash debt for non-cash payments and supports salary compensation", () => {
    expect(calculateDeliveryAccounting({
      paymentMethod: "card",
      orderTotal: 250,
      deliveryFee: 50,
      worker: { compensationType: "salary", salaryAmount: "3000.00" },
    })).toEqual({ cashDebtAmount: "0.00", driverEarningAmount: "3000.00", driverEarningType: "salary" });
  });
});
