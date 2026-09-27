import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { CentralAdminCommandCenter, type CentralAdminNavKey } from "@/components/CentralAdminCommandCenter";
import AccountManagementPanel from "@/components/AccountManagementPanel";
import { PlatformSettingsPanel } from "@/components/PlatformSettingsPanel";
import { UiTranslationAdminPanel } from "@/components/UiTranslationAdminPanel";
import { MediaLibraryPanel } from "@/components/MediaLibraryPanel";
import MarketplaceStoresView from "@/components/MarketplaceStoresView";
import ContentMarketplace from "@/pages/ContentMarketplace";
import VcardCardsAdmin from "@/pages/VcardCardsAdmin";
import ActivitiesSectorsAdmin from "@/components/ActivitiesSectorsAdmin";
import { SuperAdminRestaurantCatalog } from "@/components/SuperAdminRestaurantCatalog";
import PackagePricingCenter from "@/components/PackagePricingCenter";
import { SecurityView } from "@/components/SecurityView";
import { SystemHealthView } from "@/components/SystemHealthView";
import NfoodDevelopmentAgent from "@/components/NfoodDevelopmentAgent";
import { useAuth } from "@/_core/hooks/useAuth";

export default function SuperAdminApp() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [active, setActive] = useState<CentralAdminNavKey>(() => location === "/admin/account" ? "accounts" : "overview");
  const panel = useMemo(() => {
    switch (active) {
      case "activities": return <ActivitiesSectorsAdmin />;
      case "accounts": return <AccountManagementPanel />;
      case "settings": return <PlatformSettingsPanel initialSection="advanced" />;
      case "site": return <PlatformSettingsPanel initialSection="site" />;
      case "languages": return <UiTranslationAdminPanel />;
      case "files": return <MediaLibraryPanel isCentralAdmin />;
      case "stores": return <MarketplaceStoresView />;
      case "packages": return <PackagePricingCenter />;
      case "trend": return <ContentMarketplace />;
      case "nfc": return <VcardCardsAdmin />;
      case "security": return <SecurityView />;
      case "health": return <SystemHealthView />;
      case "devAgent": return <NfoodDevelopmentAgent />;
      case "overview": return undefined;
    }
  }, [active]);

  return (
    <CentralAdminCommandCenter
      active={active}
      onNavigate={setActive}
      orders={[]}
      userName={user?.name ?? "Super Admin"}
      userEmail={user?.email ?? ""}
      onLogout={() => void logout()}
    >
      {panel}
    </CentralAdminCommandCenter>
  );
}
