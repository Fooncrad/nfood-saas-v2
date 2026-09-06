export type DriverCompensation = {
  compensationType?: "commission" | "salary" | null;
  commissionRate?: string | number | null;
  salaryAmount?: string | number | null;
};

export function calculateDeliveryAccounting(input: {
  paymentMethod?: string | null;
  orderTotal: string | number | null | undefined;
  deliveryFee: string | number | null | undefined;
  worker?: DriverCompensation;
}) {
  const cashDebtAmount = input.paymentMethod === "cash" ? Number(input.orderTotal ?? 0) : 0;
  const driverEarningAmount = input.worker?.compensationType === "commission"
    ? Number(input.deliveryFee ?? 0) * Number(input.worker.commissionRate ?? 0) / 100
    : input.worker?.compensationType === "salary"
      ? Number(input.worker.salaryAmount ?? 0)
      : 0;
  return {
    cashDebtAmount: cashDebtAmount.toFixed(2),
    driverEarningAmount: driverEarningAmount.toFixed(2),
    driverEarningType: input.worker?.compensationType ?? "none",
  } as const;
}
