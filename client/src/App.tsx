import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { trackGoogleAnalyticsPageView } from "@/lib/googleAnalytics";
import { trpc } from "@/lib/trpc";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Listing from "./pages/Listing";
import Kalkulator from "./pages/Kalkulator";
import Tentang from "./pages/Tentang";
import Favorit from "./pages/Favorit";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import AdminLogin from "@/pages/AdminLogin";
import AdminAnalyticsDashboard from "@/pages/AdminAnalyticsDashboard";
import AdminReviews from "@/pages/AdminReviews";

function GoogleAnalyticsRouteTracker() {
  const [location] = useLocation();

  useEffect(() => {
    trackGoogleAnalyticsPageView(location);
  }, [location]);

  return null;
}

function VisitorTracker() {
  const [location] = useLocation();
  const { mutate } = trpc.analytics.recordVisit.useMutation();

  useEffect(() => {
    const contentTitle = {
      "/": "Beranda",
      "/listing": "Listing Properti",
      "/favorit": "Properti Favorit",
      "/kalkulator": "Kalkulator KPR",
      "/tentang": "Tentang Primedeal",
    }[location];
    mutate({ page: contentTitle ? { contentType: "page", path: location, contentTitle } : undefined });
  }, [location, mutate]);

  return null;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/listing" component={Listing} />
      <Route path="/favorit" component={Favorit} />
      <Route path="/kalkulator" component={Kalkulator} />
      <Route path="/tentang" component={Tentang} />
      <Route path="/privasi" component={Privacy} />
      <Route path="/ketentuan" component={Terms} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminAnalyticsDashboard} />
      <Route path="/admin/reviews" component={AdminReviews} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <GoogleAnalyticsRouteTracker />
          <VisitorTracker />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
