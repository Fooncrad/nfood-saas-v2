import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DASHBOARD_LANGUAGE_STORAGE_KEY, LANGUAGE_STORAGE_KEY, MENU_LANGUAGE_STORAGE_KEY, LanguageProvider, languageStorageKey, useLanguage, type Language } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import RestaurantPublic from "./pages/RestaurantPublic";
import CustomerDisplay from "./pages/CustomerDisplay";
import PublicDisplay from "./pages/PublicDisplay";
import CustomerPublic from "./pages/CustomerPublic";
import CustomerProfileSettings from "./pages/CustomerProfileSettings";
import AccountProfileSettings from "./pages/AccountProfileSettings";
import IntegrationsSettings from "./pages/IntegrationsSettings";
import CustomerPortal from "./pages/CustomerPortal";
import SupportManagement from "./pages/SupportManagement";
import VcardCardsAdmin from "./pages/VcardCardsAdmin";
import FavoritesPage from "./pages/FavoritesPage";
import { PricingPage, FeaturesPage, HowItWorksPage, LandingPage } from "./pages/PublicInfoPages";
import { useAuth } from "./_core/hooks/useAuth";

function AppContent() {
  const { direction, language, setLanguage } = useLanguage();
  const [location] = useLocation();
  useEffect(() => {
    const key = languageStorageKey(location);
    const stored = window.localStorage.getItem(key) as Language | null;
    const valid = stored === "ar" || stored === "en" || stored === "fr" || stored === "ur";
    if (valid && stored !== language) setLanguage(stored);
    else if (!valid && key === DASHBOARD_LANGUAGE_STORAGE_KEY && language !== "ar") setLanguage("ar");
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, key === MENU_LANGUAGE_STORAGE_KEY ? (valid ? stored! : language) : "ar");
  }, [location]);
  return <div dir={direction} className="min-h-screen"><Toaster position={direction === "rtl" ? "top-left" : "top-right"} dir={direction} /><Router /></div>;
}

function RootRoute() { const { user, loading } = useAuth(); if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#f7f8fb] text-sm font-bold text-slate-500">NFOOD</div>; return user ? <Home /> : <LandingPage />; }

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRoute} />
      <Route path="/login" component={Home} />
      <Route path="/register" component={Home} />
      <Route path="/restaurant/register" component={Home} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/features" component={FeaturesPage} />
      <Route path="/how-it-works" component={HowItWorksPage} />
      <Route path="/display/:token" component={PublicDisplay} />
      <Route path="/restaurant/:slug/display" component={CustomerDisplay} />
      <Route path="/restaurant/:slug" component={RestaurantPublic} />
      <Route path="/menu/:slug" component={RestaurantPublic} />
      <Route path="/customer/:slug" component={CustomerPublic} />
      <Route path="/vcard/:slug" component={CustomerPublic} />
      <Route path="/customer-profile" component={() => <CustomerProfileSettings />} />
      <Route path="/account-profile" component={() => <AccountProfileSettings />} />
      <Route path="/integrations" component={IntegrationsSettings} />
      <Route path="/customer-portal" component={CustomerPortal} />
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
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
