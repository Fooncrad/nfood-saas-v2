import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import RestaurantPublic from "./pages/RestaurantPublic";
import CustomerDisplay from "./pages/CustomerDisplay";
import CustomerPublic from "./pages/CustomerPublic";
import CustomerProfileSettings from "./pages/CustomerProfileSettings";
import IntegrationsSettings from "./pages/IntegrationsSettings";
import CustomerPortal from "./pages/CustomerPortal";
import SupportManagement from "./pages/SupportManagement";
import VcardCardsAdmin from "./pages/VcardCardsAdmin";

function AppContent() {
  const { direction } = useLanguage();
  return <div dir={direction} className="min-h-screen"><Toaster position={direction === "rtl" ? "top-left" : "top-right"} dir={direction} /><Router /></div>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/restaurant/:slug/display" component={CustomerDisplay} />
      <Route path="/restaurant/:slug" component={RestaurantPublic} />
      <Route path="/menu/:slug" component={RestaurantPublic} />
      <Route path="/customer/:slug" component={CustomerPublic} />
      <Route path="/vcard/:slug" component={CustomerPublic} />
      <Route path="/customer-profile" component={() => <CustomerProfileSettings />} />
      <Route path="/integrations" component={IntegrationsSettings} />
      <Route path="/customer-portal" component={CustomerPortal} />
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
