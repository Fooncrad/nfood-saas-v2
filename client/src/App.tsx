import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { DatabaseTranslationBridge } from "./components/DatabaseTranslationBridge";
import NfoodsLoadingScreen from "./components/NfoodsLoadingScreen";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DASHBOARD_LANGUAGE_STORAGE_KEY, LANGUAGE_STORAGE_KEY, MENU_LANGUAGE_STORAGE_KEY, LanguageProvider, languageStorageKey, isUiLanguage, useLanguage, type Language } from "./contexts/LanguageContext";
const routeLoaders = {
  Home: () => import("./pages/Home"),
  RestaurantPublic: () => import("./pages/RestaurantPublic"),
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
};
const Home = lazy(routeLoaders.Home);
const RestaurantPublic = lazy(routeLoaders.RestaurantPublic);
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
const CustomerProfileSettingsRoute = () => <CustomerProfileSettings />;
import { PricingPage, FeaturesPage, HowItWorksPage, LandingPage, LegalPage, ContactPage, SubscriptionStatusPage } from "./pages/PublicInfoPages";
import { useAuth } from "./_core/hooks/useAuth";

function PageLoading() {
  return <div className="min-h-screen bg-background px-4 py-4 text-foreground" aria-live="polite"><div className="mx-auto max-w-7xl space-y-3 opacity-80"><div className="h-10 w-48 animate-pulse rounded-2xl bg-muted" /><div className="grid gap-3 sm:grid-cols-3"><div className="h-24 animate-pulse rounded-2xl bg-muted" /><div className="h-24 animate-pulse rounded-2xl bg-muted" /><div className="h-24 animate-pulse rounded-2xl bg-muted" /></div></div></div>;
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
    const timer = window.setTimeout(() => { void Promise.all([routeLoaders.Home(), routeLoaders.RestaurantPublic(), routeLoaders.CustomerPortal(), routeLoaders.CustomerOrders()]); }, 1800);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (previousLocation.current === location) return;
    previousLocation.current = location;
    setLoaderKey((current) => current + 1);
    setShowGlobalLoader(true);
  }, [location]);
  useEffect(() => {
    const key = languageStorageKey(location);
    const requested = new URLSearchParams(window.location.search).get("lang");
    if (isUiLanguage(requested)) { setLanguage(requested); window.localStorage.setItem(key, requested); return; }
    const stored = window.localStorage.getItem(key) as Language | null;
    const valid = isUiLanguage(stored);
    const nextLanguage: Language = valid ? stored! : key === DASHBOARD_LANGUAGE_STORAGE_KEY ? "en" : language;
    if (nextLanguage !== language) setLanguage(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, [location]);
  return <div dir={direction} className="min-h-screen"><Toaster position={direction === "rtl" ? "top-left" : "top-right"} dir={direction} /><Suspense fallback={<PageLoading />}><Router /></Suspense>{showGlobalLoader && <NfoodsLoadingScreen key={loaderKey} onComplete={completeGlobalLoader} />}</div>;
}

const RESTAURANT_AREA_ROLES = new Set(["restaurant_admin", "waiter", "driver", "cashier", "kitchen", "bar", "restaurant"]);
function CustomerAreaGuard({ children }: { children: ReactNode }) { const { user, loading } = useAuth(); const [, navigate] = useLocation(); const role = String(user?.testRole ?? user?.role ?? ""); const blocked = Boolean(user && RESTAURANT_AREA_ROLES.has(role)); useEffect(() => { if (blocked) navigate("/restaurant/dashboard"); }, [blocked, navigate]); if (loading || blocked) return <PageLoading />; return <>{children}</>; }
function RootRoute() { const { user, loading } = useAuth(); if (loading) return <PageLoading />; return user ? <Home /> : <LandingPage />; }

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRoute} />
      <Route path="/admin" component={RootRoute} />
      <Route path="/admin/account" component={RootRoute} />
      <Route path="/dashboard" component={RootRoute} />
      <Route path="/restaurant/dashboard" component={RootRoute} />
      <Route path="/restaurant/account" component={RootRoute} />
      <Route path="/login" component={Home} />
      <Route path="/register" component={Home} />
      <Route path="/customer-register" component={CustomerRegister} />
      <Route path="/content-market" component={ContentMarketplace} />
      <Route path="/creator-content" component={CreatorContentStatus} />
      <Route path="/admin/content-moderation" component={PlatformContentModeration} />
      <Route path="/restaurant/register" component={Home} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/features" component={FeaturesPage} />
      <Route path="/how-it-works" component={HowItWorksPage} />
      <Route path="/terms" component={() => <LegalPage kind="terms" />} />
      <Route path="/privacy" component={() => <LegalPage kind="privacy" />} />
      <Route path="/refund-policy" component={() => <LegalPage kind="refund" />} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/subscription-status" component={SubscriptionStatusPage} />
      <Route path="/admin/subscription-receipts" component={SubscriptionReceiptsAdminPage} />
      <Route path="/display/:token" component={PublicDisplay} />
      <Route path="/tv/:token" component={PublicDisplay} />
      <Route path="/restaurant/:slug/display" component={CustomerDisplay} />
      <Route path="/restaurant/:slug" component={RestaurantPublic} />
      <Route path="/menu/:slug" component={RestaurantPublic} />
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
