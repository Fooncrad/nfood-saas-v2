import { OverviewAnalyticsPanel } from "@/components/OverviewAnalyticsPanel";
import { MerchantCommerceFundingPanel } from "@/components/MerchantCommerceFundingPanel";
import type { NavKey } from "@/components/homeNavigation";

type RestaurantOverviewWorkspaceProps = {
  restaurantId: number;
  orders: Parameters<typeof OverviewAnalyticsPanel>[0]["orders"];
  summary: Parameters<typeof OverviewAnalyticsPanel>[0]["summary"];
  summaryLoading: boolean;
  summaryError: boolean;
  onNavigate: (key: NavKey) => void;
  role?: string | null;
};

export function RestaurantOverviewWorkspace({ restaurantId, orders, summary, summaryLoading, summaryError, onNavigate, role }: RestaurantOverviewWorkspaceProps) {
  return <div className="space-y-3"><OverviewAnalyticsPanel restaurantId={restaurantId} orders={orders} summary={summary} summaryLoading={summaryLoading} summaryError={summaryError} onNavigate={onNavigate} />{["restaurant_admin", "merchant"].includes(String(role ?? "")) && <MerchantCommerceFundingPanel restaurantId={restaurantId} />}</div>;
}
