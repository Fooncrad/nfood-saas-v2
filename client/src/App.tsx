import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation, useParams } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { DatabaseTranslationBridge } from "./components/DatabaseTranslationBridge";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LANGUAGE_STORAGE_KEY, LanguageProvider, isUiLanguage, useLanguage, type Language } from "./contexts/LanguageContext";
const routeLoaders = {
  Home: () => import("./pages/Home"),
  SuperAdminApp: () => import("./pages/SuperAdminApp"),
  RestaurantMenu: () => import("./pages/RestaurantMenu"),
  CustomerDisplay: () => import("./pages/CustomerDisplay"),
  PosCustomerDisplay: () => import("./pages/PosCustomerDisplay"),
  PublicDisplay: () => import("./pages/PublicDisplay"),
  CustomerPublic: () => import("./pages/CustomerPublic"),
  CustomerProfileSettings: () => import("./pages/CustomerProfileSettings"),
  AccountProfileSettings: () => import("./pages/AccountProfileSettings"),
  IntegrationsSettings: () => import("./pages/IntegrationsSettings"),
  CustomerPortal: () => import("./pages/CustomerPortal"),
  CustomerContentOrders: () => import("./pages/CustomerContentOrders"),
  CustomerContentLibrary: () => import("./pages/CustomerContentLibrary"),
  CustomerOrders: () => import("./pages/CustomerOrders"),

  CustomerRewards: () => import("./pages/CustomerRewards"),
  CustomerStudio: () => import("./pages/CustomerStudio"),
  CustomerStudioPlans: () => import("./pages/CustomerStudioPlans"),
  CustomerBenefits: () => import("./pages/CustomerBenefits"),
  CustomerRegister: () => import("./pages/CustomerRegister"),
  PlatformContentModeration: () => import("./pages/PlatformContentModeration"),
  SupportManagement: () => import("./pages/SupportManagement"),
  VcardCardsAdmin: () => import("./pages/VcardCardsAdmin"),
  FavoritesPage: () => import("./pages/FavoritesPage"),
  SubscriptionReceiptsAdminPage: () => import("./pages/SubscriptionReceiptsAdminPage"),
  TranslationEditorPage: () => import("./pages/TranslationEditorPage"),
  MarketplaceLanding: () => import("./pages/MarketplaceLanding"),
  MarketplaceSector: () => import("./pages/MarketplaceSector"),
  MarketplaceStore: () => import("./pages/MarketplaceStore"),
  StoreRewards: () => import("./pages/StoreRewards"),
  StoreMarketing: () => import("./pages/StoreMarketing"),
  AffiliateView: () => import("./pages/AffiliateView"),
};
const Home = lazy(routeLoaders.Home);
const SuperAdminApp = lazy(routeLoaders.SuperAdminApp);
const RestaurantMenu = lazy(routeLoaders.RestaurantMenu);
const CustomerDisplay = lazy(routeLoaders.CustomerDisplay);
const PosCustomerDisplay = lazy(routeLoaders.PosCustomerDisplay);
const PublicDisplay = lazy(routeLoaders.PublicDisplay);
const CustomerPublic = lazy(routeLoaders.CustomerPublic);
const CustomerProfileSettings = lazy(routeLoaders.CustomerProfileSettings);
const AccountProfileSettings = lazy(routeLoaders.AccountProfileSettings);
const IntegrationsSettings = lazy(routeLoaders.IntegrationsSettings);
const CustomerPortal = lazy(routeLoaders.CustomerPortal);
const CustomerContentOrders = lazy(routeLoaders.CustomerContentOrders);
const CustomerContentLibrary = lazy(routeLoaders.CustomerContentLibrary);
const CustomerOrders = lazy(routeLoaders.CustomerOrders);
import CustomerReservations from "./pages/CustomerReservations";
const CustomerRewards = lazy(routeLoaders.CustomerRewards);
const CustomerStudio = lazy(routeLoaders.CustomerStudio);
const CustomerStudioPlans = lazy(routeLoaders.CustomerStudioPlans);
const CustomerBenefits = lazy(routeLoaders.CustomerBenefits);
const CustomerRegister = lazy(routeLoaders.CustomerRegister);
const PlatformContentModeration = lazy(routeLoaders.PlatformContentModeration);
const SupportManagement = lazy(routeLoaders.SupportManagement);
const VcardCardsAdmin = lazy(routeLoaders.VcardCardsAdmin);
const FavoritesPage = lazy(routeLoaders.FavoritesPage);
const SubscriptionReceiptsAdminPage = lazy(routeLoaders.SubscriptionReceiptsAdminPage);
const TranslationEditorPage = lazy(routeLoaders.TranslationEditorPage);
const MarketplaceLanding = lazy(routeLoaders.MarketplaceLanding);
const MarketplaceSector = lazy(routeLoaders.MarketplaceSector);
const MarketplaceStore = lazy(routeLoaders.MarketplaceStore);
const StoreRewards = lazy(routeLoaders.StoreRewards);
const StoreMarketing = lazy(routeLoaders.StoreMarketing);
const AffiliateView = lazy(routeLoaders.AffiliateView);
const CustomerProfileSettingsRoute = () => <CustomerProfileSettings />;
import PublicHome from "./pages/PublicHome";
import LoginPage from "./pages/LoginPage";
import RegisterScreen from "./pages/RegisterScreen";
import { LegalPage, ContactPage, SubscriptionStatusPage } from "./pages/PublicInfoPages";
import { useAuth } from "./_core/hooks/useAuth";

function PageLoading() {
  return <div className="min-h-screen bg-background px-4 py-4 text-foreground" aria-live="polite"><div className="mx-auto max-w-7xl space-y-3 opacity-80"><div className="h-10 w-48 animate-pulse rounded-2xl bg-muted" /><div className="grid gap-3 sm:grid-cols-3"><div className="h-24 animate-pulse rounded-2xl bg-muted" /><div className="h-24 animate-pulse rounded-2xl bg-muted" /><div className="h-24 animate-pulse rounded-2xl bg-muted" /></div></div></div>;
}

function LegacyMenuLink() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  useEffect(() => { if (slug) navigate(`/menu/${encodeURIComponent(slug)}${window.location.search}`, { replace: true }); }, [slug, navigate]);
  return <PageLoading />;
}

function AppContent() {
  const { direction, language, setLanguage } = useLanguage();
  const [location] = useLocation();
  useEffect(() => {
    const timer = window.setTimeout(() => { void Promise.all([routeLoaders.Home(), routeLoaders.RestaurantMenu(), routeLoaders.CustomerPortal(), routeLoaders.CustomerOrders()]); }, 1800);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("lang");
    if (isUiLanguage(requested)) { setLanguage(requested); return; }
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
    if (isUiLanguage(stored) && stored !== language) setLanguage(stored, false);
  }, [location]);
  return <div dir={direction} className="min-h-screen"><Toaster position={direction === "rtl" ? "top-left" : "top-right"} dir={direction} /><Suspense fallback={<PageLoading />}><Router /></Suspense></div>;
}

function SessionIdleGuard() {
  const { user, logout } = useAuth();
  useEffect(() => {
    if (!user) return;
    const MAX_IDLE_MS = 5 * 60 * 1000;
    let timer = window.setTimeout(() => void logout(), MAX_IDLE_MS);
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void logout(), MAX_IDLE_MS);
    };
    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "touchstart", "scroll"];
    events.forEach((event) => window.addEventListener(event, refresh, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, refresh));
    };
  }, [user, logout]);
  return null;
}

function CustomerAreaGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();
  const teamRole = user?.testRole;
  const isRestaurantTeam = Boolean(teamRole && ["restaurant_admin", "waiter", "kitchen", "bar", "cashier", "driver"].includes(teamRole));
  useEffect(() => {
    if (loading) return;
    if (!user) { navigate(`/login?next=${encodeURIComponent(location)}`); return; }
    // Restaurant staff accounts must never enter customer surfaces. Their
    // explicitly assigned restaurant role owns routing for the whole session.
    if (isRestaurantTeam) navigate("/restaurant/dashboard", { replace: true });
  }, [loading, user, location, navigate, isRestaurantTeam]);
  if (loading || !user || isRestaurantTeam) return <PageLoading />;
  return <>{children}</>;
}
function PricingRoute() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/#plans", { replace: true });
    window.setTimeout(() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }, [navigate]);
  return <PageLoading />;
}
function CustomerRegisterRoute() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  useEffect(() => {
    if (!loading && user) navigate("/customer-portal");
  }, [loading, user, navigate]);
  if (loading || user) return <PageLoading />;
  return <CustomerRegister />;
}
const RESTAURANT_AREA_ROLES = new Set(["restaurant_admin", "waiter", "kitchen", "bar", "cashier", "driver", "accountant"]);
function RootRoute() { const { user, loading } = useAuth(); const [, navigate] = useLocation(); const isAdmin = user?.role === "admin" || user?.testRole === "admin" || user?.accountRole === "admin"; const role = String(user?.testRole ?? user?.accountRole ?? user?.role ?? ""); const isRestaurantAccount = Boolean(user && RESTAURANT_AREA_ROLES.has(role)); useEffect(() => { if (loading || !user) return; if (isAdmin) { navigate("/admin", { replace: true }); return; } if (isRestaurantAccount && window.location.pathname === "/") navigate("/restaurant/dashboard", { replace: true }); }, [loading, user, isAdmin, isRestaurantAccount, navigate]); if (loading || isAdmin || isRestaurantAccount) return <PageLoading />; return user ? <Home /> : <PublicHome />; }
function RestaurantRoute() {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();
  const isAdmin = user?.role === "admin" || user?.testRole === "admin" || user?.accountRole === "admin";
  const role = String(user?.testRole ?? user?.accountRole ?? user?.role ?? "");
  const allowed = RESTAURANT_AREA_ROLES.has(role);
  useEffect(() => {
    if (loading) return;
    if (!user) navigate(`/login?next=${encodeURIComponent(location)}`, { replace: true });
    else if (isAdmin) navigate("/admin", { replace: true });
    else if (!allowed) navigate("/customer-portal", { replace: true });
  }, [loading, user, isAdmin, allowed, location, navigate]);
  if (loading || !user || isAdmin || !allowed) return <PageLoading />;
  return <Home />;
}
function SuperAdminRoute() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const isAdmin = user?.role === "admin" || user?.testRole === "admin" || user?.accountRole === "admin";
  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login?next=/admin"); return; }
    if (!isAdmin) navigate("/");
  }, [loading, user, isAdmin, navigate]);
  if (loading || !user || !isAdmin) return <PageLoading />;
  return <SuperAdminApp />;
}

function Router() {
  return (
    <Switch>
      <Route path="/admin/account" component={SuperAdminRoute} />
      <Route path="/admin" component={SuperAdminRoute} />
      <Route path="/restaurant/dashboard" component={RestaurantRoute} />
      <Route path="/restaurant/account" component={RestaurantRoute} />
      <Route path="/" component={RootRoute} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterScreen} />
      <Route path="/pricing" component={PricingRoute} />
      <Route path="/customer-register" component={CustomerRegisterRoute} />
      <Route path="/admin/content-moderation" component={PlatformContentModeration} />
      <Route path="/restaurant/register" component={RegisterScreen} />
      <Route path="/terms" component={() => <LegalPage kind="terms" />} />
      <Route path="/privacy" component={() => <LegalPage kind="privacy" />} />
      <Route path="/refund" component={() => <LegalPage kind="refund" />} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/subscription-status" component={SubscriptionStatusPage} />
      <Route path="/marketplace" component={MarketplaceLanding} />
      <Route path="/marketplace/sector/:slug" component={MarketplaceSector} />
      <Route path="/store/:entityId/rewards" component={StoreRewards} />
      <Route path="/store/:entityId" component={MarketplaceStore} />
      <Route path="/store-marketing" component={StoreMarketing} />
      <Route path="/affiliate" component={AffiliateView} />
      <Route path="/admin/subscription-receipts" component={SubscriptionReceiptsAdminPage} />
      <Route path="/display/:token" component={PublicDisplay} />
      <Route path="/tv/:token" component={PublicDisplay} />
      <Route path="/restaurant/:slug/display" component={CustomerDisplay} />
      <Route path="/pos/customer-display" component={PosCustomerDisplay} />
      <Route path="/restaurant/:slug" component={LegacyMenuLink} />
      <Route path="/menu/:slug" component={RestaurantMenu} />
      <Route path="/customer/:slug" component={() => <CustomerAreaGuard><CustomerPublic /></CustomerAreaGuard>} />
      <Route path="/vcard/:slug" component={() => <CustomerAreaGuard><CustomerPublic /></CustomerAreaGuard>} />
      <Route path="/customer-profile" component={() => <CustomerAreaGuard><CustomerProfileSettingsRoute /></CustomerAreaGuard>} />
      <Route path="/account-profile" component={() => <CustomerAreaGuard><AccountProfileSettings /></CustomerAreaGuard>} />
      <Route path="/integrations" component={IntegrationsSettings} />
      <Route path="/customer-portal" component={() => <CustomerAreaGuard><CustomerPortal /></CustomerAreaGuard>} />
      <Route path="/customer-content-orders" component={() => <CustomerAreaGuard><CustomerContentOrders /></CustomerAreaGuard>} />
      <Route path="/customer-content-library" component={() => <CustomerAreaGuard><CustomerContentLibrary /></CustomerAreaGuard>} />
      <Route path="/customer-orders" component={() => <CustomerAreaGuard><CustomerOrders /></CustomerAreaGuard>} />
      <Route path="/customer-reservations" component={() => <CustomerAreaGuard><CustomerReservations /></CustomerAreaGuard>} />
      <Route path="/customer-rewards" component={() => <CustomerAreaGuard><CustomerRewards /></CustomerAreaGuard>} />
      <Route path="/customer-studio" component={() => <CustomerAreaGuard><CustomerStudio /></CustomerAreaGuard>} />
      <Route path="/customer-studio-plans" component={() => <CustomerAreaGuard><CustomerStudioPlans /></CustomerAreaGuard>} />
      <Route path="/customer-benefits" component={() => <CustomerAreaGuard><CustomerBenefits /></CustomerAreaGuard>} />
      <Route path="/favorites" component={() => <CustomerAreaGuard><FavoritesPage /></CustomerAreaGuard>} />
      <Route path="/support" component={SupportManagement} />
      <Route path="/vcard-cards" component={VcardCardsAdmin} />
      <Route path="/translation-editor" component={TranslationEditorPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <LanguageProvider>
            <DatabaseTranslationBridge />
            <SessionIdleGuard />
            <AppContent />
          </LanguageProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
