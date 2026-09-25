import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { DatabaseTranslationBridge } from "./components/DatabaseTranslationBridge";
import NfoodsLoadingScreen from "./components/NfoodsLoadingScreen";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LANGUAGE_STORAGE_KEY, LanguageProvider, isUiLanguage, useLanguage, type Language } from "./contexts/LanguageContext";
const routeLoaders = {
  Home: () => import("./pages/Home"),
  SuperAdminApp: () => import("./pages/SuperAdminApp"),
  RestaurantPublic: () => import("./pages/RestaurantPublic"),
  RestaurantsDirectory: () => import("./pages/RestaurantsDirectory"),
  CustomerDisplay: () => import("./pages/CustomerDisplay"),
  PublicDisplay: () => import("./pages/PublicDisplay"),
  CustomerPublic: () => import("./pages/CustomerPublic"),
  CustomerProfileSettings: () => import("./pages/CustomerProfileSettings"),
  AccountProfileSettings: () => import("./pages/AccountProfileSettings"),
  IntegrationsSettings: () => import("./pages/IntegrationsSettings"),
  CustomerPortal: () => import("./pages/CustomerPortal"),
  CustomerContentOrders: () => import("./pages/CustomerContentOrders"),
  CustomerContentLibrary: () => import("./pages/CustomerContentLibrary"),
  CustomerOrders: () => import("./pages/CustomerOrders"),
  CustomerReservations: () => import("./pages/CustomerReservations"),
  CustomerRewards: () => import("./pages/CustomerRewards"),
  CustomerStudio: () => import("./pages/CustomerStudio"),
  CustomerStudioPlans: () => import("./pages/CustomerStudioPlans"),
  CustomerBenefits: () => import("./pages/CustomerBenefits"),
  CustomerRegister: () => import("./pages/CustomerRegister"),
  ContentMarketplace: () => import("./pages/ContentMarketplace"),
  CreatorContentStatus: () => import("./pages/CreatorContentStatus"),
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
const RestaurantPublic = lazy(routeLoaders.RestaurantPublic);
const RestaurantsDirectory = lazy(routeLoaders.RestaurantsDirectory);
const CustomerDisplay = lazy(routeLoaders.CustomerDisplay);
const PublicDisplay = lazy(routeLoaders.PublicDisplay);
const CustomerPublic = lazy(routeLoaders.CustomerPublic);
const CustomerProfileSettings = lazy(routeLoaders.CustomerProfileSettings);
const AccountProfileSettings = lazy(routeLoaders.AccountProfileSettings);
const IntegrationsSettings = lazy(routeLoaders.IntegrationsSettings);
const CustomerPortal = lazy(routeLoaders.CustomerPortal);
const CustomerContentOrders = lazy(routeLoaders.CustomerContentOrders);
const CustomerContentLibrary = lazy(routeLoaders.CustomerContentLibrary);
const CustomerOrders = lazy(routeLoaders.CustomerOrders);
const CustomerReservations = lazy(routeLoaders.CustomerReservations);
const CustomerRewards = lazy(routeLoaders.CustomerRewards);
const CustomerStudio = lazy(routeLoaders.CustomerStudio);
const CustomerStudioPlans = lazy(routeLoaders.CustomerStudioPlans);
const CustomerBenefits = lazy(routeLoaders.CustomerBenefits);
const CustomerRegister = lazy(routeLoaders.CustomerRegister);
const ContentMarketplace = lazy(routeLoaders.ContentMarketplace);
const CreatorContentStatus = lazy(routeLoaders.CreatorContentStatus);
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
import { PricingPage, FeaturesPage, HowItWorksPage, LegalPage, ContactPage, SubscriptionStatusPage } from "./pages/PublicInfoPages";
import { useAuth } from "./_core/hooks/useAuth";

function PageLoading() {
  return <div className="min-h-screen bg-background px-4 py-4 text-foreground" aria-live="polite"><div className="mx-auto max-w-7xl space-y-3 opacity-80"><div className="h-10 w-48 animate-pulse rounded-2xl bg-muted" /><div className="grid gap-3 sm:grid-cols-3"><div className="h-24 animate-pulse rounded-2xl bg-muted" /><div className="h-24 animate-pulse rounded-2xl bg-muted" /><div className="h-24 animate-pulse rounded-2xl bg-muted" /></div></div></div>;
}

function RouteLoading() {
  return <div className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-1 overflow-hidden bg-[#17212b]/80" aria-live="polite"><div className="h-full w-1/3 animate-pulse rounded-full bg-[#f4a340] shadow-[0_0_10px_rgba(244,163,64,0.9)]" /></div>;
}

const NFOODS_LOADER_SESSION_KEY = "nfood-global-loader-seen";

function AppContent() {
  const { direction, language, setLanguage } = useLanguage();
  const [location] = useLocation();
  const previousLocation = useRef(location);
  const [loaderKey, setLoaderKey] = useState(0);
  const [showGlobalLoader, setShowGlobalLoader] = useState(() => typeof window === "undefined" || !window.sessionStorage.getItem(NFOODS_LOADER_SESSION_KEY));
  const completeGlobalLoader = useCallback(() => {
    window.sessionStorage.setItem(NFOODS_LOADER_SESSION_KEY, "1");
    setShowGlobalLoader(false);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => { void Promise.all([routeLoaders.Home(), routeLoaders.RestaurantPublic(), routeLoaders.RestaurantsDirectory(), routeLoaders.CustomerPortal(), routeLoaders.CustomerOrders()]); }, 1800);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (previousLocation.current === location) return;
    previousLocation.current = location;
    // Keep the branded loader for the first session load only; route changes use Suspense's lightweight bar.
  }, [location]);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("lang");
    if (isUiLanguage(requested)) { setLanguage(requested); return; }
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
    if (isUiLanguage(stored) && stored !== language) setLanguage(stored, false);
  }, [location]);
  return <div dir={direction} className="min-h-screen"><Toaster position={direction === "rtl" ? "top-left" : "top-right"} dir={direction} /><Suspense fallback={<RouteLoading />}><Router /></Suspense>{showGlobalLoader && <NfoodsLoadingScreen key={loaderKey} onComplete={completeGlobalLoader} />}</div>;
}

function CustomerAreaGuard({ children }: { children: ReactNode }) { const { loading } = useAuth(); if (loading) return <PageLoading />; return <>{children}</>; }
function RootRoute() { const { user, loading } = useAuth(); if (loading) return <PageLoading />; return user ? <Home /> : <PublicHome />; }
function SuperAdminRoute() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const isAdmin = user?.role === "admin" || user?.testRole === "admin";
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
      <Route path="/" component={RootRoute} />
      <Route path="/admin" component={SuperAdminRoute} />
      <Route path="/admin/account" component={SuperAdminRoute} />
      <Route path="/dashboard" component={RootRoute} />
      <Route path="/restaurant/dashboard" component={RootRoute} />
      <Route path="/restaurant/account" component={RootRoute} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterScreen} />
      <Route path="/customer-register" component={CustomerRegister} />
      <Route path="/content-market" component={ContentMarketplace} />
      <Route path="/creator-content" component={CreatorContentStatus} />
      <Route path="/admin/content-moderation" component={PlatformContentModeration} />
      <Route path="/restaurant/register" component={RegisterScreen} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/features" component={FeaturesPage} />
      <Route path="/how-it-works" component={HowItWorksPage} />
      <Route path="/terms" component={() => <LegalPage kind="terms" />} />
      <Route path="/privacy" component={() => <LegalPage kind="privacy" />} />
      <Route path="/refund-policy" component={() => <LegalPage kind="refund" />} />
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
      <Route path="/restaurant/:slug" component={RestaurantPublic} />
      <Route path="/menu/:slug" component={RestaurantPublic} />
      <Route path="/restaurants" component={RestaurantsDirectory} />
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
            <AppContent />
          </LanguageProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
