import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DASHBOARD_LANGUAGE_STORAGE_KEY, LANGUAGE_STORAGE_KEY, MENU_LANGUAGE_STORAGE_KEY, LanguageProvider, languageStorageKey, useLanguage, type Language } from "./contexts/LanguageContext";
const Home = lazy(() => import("./pages/Home"));
const RestaurantPublic = lazy(() => import("./pages/RestaurantPublic"));
const CustomerDisplay = lazy(() => import("./pages/CustomerDisplay"));
const PublicDisplay = lazy(() => import("./pages/PublicDisplay"));
const CustomerPublic = lazy(() => import("./pages/CustomerPublic"));
const CustomerProfileSettings = lazy(() => import("./pages/CustomerProfileSettings"));
const AccountProfileSettings = lazy(() => import("./pages/AccountProfileSettings"));
const IntegrationsSettings = lazy(() => import("./pages/IntegrationsSettings"));
const CustomerPortal = lazy(() => import("./pages/CustomerPortal"));
const CustomerContentOrders = lazy(() => import("./pages/CustomerContentOrders"));
const CustomerOrders = lazy(() => import("./pages/CustomerOrders"));
const CustomerReservations = lazy(() => import("./pages/CustomerReservations"));
const CustomerRewards = lazy(() => import("./pages/CustomerRewards"));
const SupportManagement = lazy(() => import("./pages/SupportManagement"));
const VcardCardsAdmin = lazy(() => import("./pages/VcardCardsAdmin"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const SubscriptionReceiptsAdminPage = lazy(() => import("./pages/SubscriptionReceiptsAdminPage"));
const CustomerProfileSettingsRoute = () => <CustomerProfileSettings />;
import { PricingPage, FeaturesPage, HowItWorksPage, LandingPage, LegalPage, ContactPage, SubscriptionStatusPage } from "./pages/PublicInfoPages";
import { useAuth } from "./_core/hooks/useAuth";

function PageLoading() {
  return <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground" aria-live="polite"><div className="rounded-2xl border border-border bg-card px-6 py-5 text-center shadow-sm"><div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /><p className="mt-3 text-sm font-bold">Loading NFOOD…</p></div></main>;
}

function AppContent() {
  const { direction, language, setLanguage } = useLanguage();
  const [location] = useLocation();
  useEffect(() => {
    const key = languageStorageKey(location);
    const stored = window.localStorage.getItem(key) as Language | null;
    const valid = stored === "ar" || stored === "en" || stored === "fr" || stored === "ur";
    if (valid && stored !== language) setLanguage(stored);
    else if (!valid && key === DASHBOARD_LANGUAGE_STORAGE_KEY && language !== "en") setLanguage("en");
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, key === MENU_LANGUAGE_STORAGE_KEY ? (valid ? stored! : language) : "en");
  }, [location]);
  return <div dir={direction} className="min-h-screen"><Toaster position={direction === "rtl" ? "top-left" : "top-right"} dir={direction} /><Suspense fallback={<PageLoading />}><Router /></Suspense></div>;
}

function RootRoute() { const { user, loading } = useAuth(); if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#f7f8fb] text-sm font-bold text-slate-500">NFOOD</div>; return user ? <Home /> : <LandingPage />; }

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
      <Route path="/customer/:slug" component={CustomerPublic} />
      <Route path="/vcard/:slug" component={CustomerPublic} />
      <Route path="/customer-profile" component={CustomerProfileSettingsRoute} />
      <Route path="/account-profile" component={AccountProfileSettings} />
      <Route path="/integrations" component={IntegrationsSettings} />
      <Route path="/customer-portal" component={CustomerPortal} />
      <Route path="/customer-content-orders" component={CustomerContentOrders} />
      <Route path="/customer-orders" component={CustomerOrders} />
      <Route path="/customer-reservations" component={CustomerReservations} />
      <Route path="/customer-rewards" component={CustomerRewards} />
      <Route path="/favorites" component={FavoritesPage} />
      <Route path="/support" component={SupportManagement} />
      <Route path="/vcard-cards" component={VcardCardsAdmin} />
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
            <AppContent />
          </LanguageProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
