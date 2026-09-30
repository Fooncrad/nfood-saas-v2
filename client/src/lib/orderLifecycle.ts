import type { OrderStatus } from "@/components/homeNavigation";

export function nextOrderStatus(status: OrderStatus): OrderStatus | null {
  if (status === "new") return "preparing";
  if (status === "preparing") return "ready";
  if (status === "ready") return "completed";
  return null;
}
