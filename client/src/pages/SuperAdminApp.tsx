import { useMemo, useState } from "react";
import { CentralAdminCommandCenter, type CentralAdminNavKey } from "@/components/CentralAdminCommandCenter";
import { PlatformOverview } from "@/components/PlatformOverview";
import AccountManagementPanel from "@/components/AccountManagementPanel";
import { PlatformSettingsPanel } from "@/components/PlatformSettingsPanel";
import { UiTranslationAdminPanel } from "@/components/UiTranslationAdminPanel";
import { MediaLibraryPanel } from "@/components/MediaLibraryPanel";
import MarketplaceStoresView from "@/components/MarketplaceStoresView";
import ContentMarketplace from "@/pages/ContentMarketplace";
import VcardCardsAdmin from "@/pages/VcardCardsAdmin";
import ActivitiesSectorsAdmin from "@/components/ActivitiesSectorsAdmin";
import { SecurityView } from "@/components/SecurityView";
import { SystemHealthView } from "@/components/SystemHealthView";
import { useAuth } from "@/_core/hooks/useAuth";

export default function SuperAdminApp() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState<CentralAdminNavKey>("activities");
  const panel = useMemo(() => {
    switch (active) {
      case "admin": return <PlatformOverview onNavigate={() => setActive("activities")} />;
      case "activities": return <ActivitiesSectorsAdmin />;
      case "accounts": return <AccountManagementPanel />;
      case "settings":
      case "site": return <PlatformSettingsPanel />;
      case "languages": return <UiTranslationAdminPanel />;
      case "files": return <MediaLibraryPanel isCentralAdmin />;
      case "stores": return <MarketplaceStoresView />;
      case "trend": return <ContentMarketplace />;
      case "nfc": return <VcardCardsAdmin />;
      case "security": return <SecurityView />;
      case "health": return <SystemHealthView />;
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
