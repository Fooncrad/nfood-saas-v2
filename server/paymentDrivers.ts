export type PaymentDriverId = "cash" | "manual_transfer" | "mada" | "tamara" | "hyperpay" | "stripe" | "paytix";

export type PaymentIntentInput = {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
};

export type PaymentIntentResult = {
  status: "pending" | "requires_action" | "succeeded";
  driver: PaymentDriverId;
  reference?: string;
  checkoutUrl?: string;
};

export interface PaymentDriver {
  readonly id: PaymentDriverId;
  createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  refund?(reference: string, amount?: number): Promise<{ status: "pending" | "succeeded"; reference: string }>;
}

/**
 * Cash and manual transfer deliberately create a pending intent. External
 * providers are registered only when their verified server credentials and
 * webhook contract are available; no provider is faked here.
 */
export const cashPaymentDriver: PaymentDriver = {
  id: "cash",
  async createIntent(input) {
    return { status: "pending", driver: "cash", reference: `cash:${input.orderId}` };
  },
};

export const manualTransferPaymentDriver: PaymentDriver = {
  id: "manual_transfer",
  async createIntent(input) {
    return { status: "pending", driver: "manual_transfer", reference: `manual:${input.orderId}` };
  },
};

export function getPaymentDriver(id: PaymentDriverId): PaymentDriver | null {
  if (id === "cash") return cashPaymentDriver;
  if (id === "manual_transfer") return manualTransferPaymentDriver;
  return null;
}
