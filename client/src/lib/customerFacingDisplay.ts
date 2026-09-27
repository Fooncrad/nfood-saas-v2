export type CustomerFacingCartLine = {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type CustomerFacingState = {
  restaurantId: number;
  updatedAt: string;
  status: "idle" | "shopping" | "payment" | "complete";
  lines: CustomerFacingCartLine[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currencyCode: string;
  receiptNumber?: string;
};

const KEY = "nfood-pos-customer-facing";
const CHANNEL = "nfood-pos-customer-facing";

export function publishCustomerFacingState(state: CustomerFacingState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
  try {
    const channel = new BroadcastChannel(CHANNEL);
    channel.postMessage(state);
    channel.close();
  } catch {
    // localStorage event remains the compatibility fallback.
  }
}

export function readCustomerFacingState(): CustomerFacingState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as CustomerFacingState : null;
  } catch {
    return null;
  }
}

export function subscribeCustomerFacingState(onState: (state: CustomerFacingState) => void) {
  if (typeof window === "undefined") return () => undefined;
  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (event) => onState(event.data as CustomerFacingState);
  } catch {
    channel = null;
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY || !event.newValue) return;
    try { onState(JSON.parse(event.newValue) as CustomerFacingState); } catch { /* ignore invalid local state */ }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("storage", onStorage);
    channel?.close();
  };
}
