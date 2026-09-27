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

const PREFIX = "nfood-pos-customer-facing";

function safeSessionId(value: string) {
  return /^[a-zA-Z0-9_-]{16,80}$/.test(value) ? value : null;
}

export function createCustomerDisplaySessionId() {
  return crypto.randomUUID().replaceAll("-", "");
}

function key(sessionId: string) { return `${PREFIX}:${sessionId}`; }
function channelName(sessionId: string) { return `${PREFIX}:${sessionId}`; }

export function publishCustomerFacingState(sessionId: string, state: CustomerFacingState) {
  if (typeof window === "undefined" || !safeSessionId(sessionId)) return;
  localStorage.setItem(key(sessionId), JSON.stringify(state));
  try {
    const channel = new BroadcastChannel(channelName(sessionId));
    channel.postMessage(state);
    channel.close();
  } catch {
    // localStorage event remains the compatibility fallback.
  }
}

export function clearCustomerFacingState(sessionId: string) {
  if (typeof window === "undefined" || !safeSessionId(sessionId)) return;
  localStorage.removeItem(key(sessionId));
}

export function readCustomerFacingState(sessionId: string): CustomerFacingState | null {
  if (typeof window === "undefined" || !safeSessionId(sessionId)) return null;
  try {
    const raw = localStorage.getItem(key(sessionId));
    return raw ? JSON.parse(raw) as CustomerFacingState : null;
  } catch {
    return null;
  }
}

export function subscribeCustomerFacingState(sessionId: string, onState: (state: CustomerFacingState) => void) {
  if (typeof window === "undefined" || !safeSessionId(sessionId)) return () => undefined;
  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel(channelName(sessionId));
    channel.onmessage = (event) => onState(event.data as CustomerFacingState);
  } catch {
    channel = null;
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key !== key(sessionId) || !event.newValue) return;
    try { onState(JSON.parse(event.newValue) as CustomerFacingState); } catch { /* ignore invalid local state */ }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("storage", onStorage);
    channel?.close();
  };
}
