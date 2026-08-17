import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import UpgradeModal from "./components/billing/UpgradeModal";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import CreateDatasetPage from "./pages/CreateDatasetPage";
import MyDatasetsPage from "./pages/MyDatasetsPage";
import DatasetDetailPage from "./pages/DatasetDetailPage";
import TemplatesPage from "./pages/TemplatesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import BillingSettingsPage from "./pages/BillingSettingsPage";
import PricingPage from "./pages/PricingPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import CheckoutCancelledPage from "./pages/CheckoutCancelledPage";
import AgentMonitorPage from "./pages/AgentMonitorPage";
import ValidationReportPage from "./pages/ValidationReportPage";
import BiasAnalysisPage from "./pages/BiasAnalysisPage";
import ExportPage from "./pages/ExportPage";
import NotFound from "./pages/NotFound";

import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <SubscriptionProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-right" />
            <UpgradeModal />
            <ErrorBoundary>
              <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/signup" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              <Route path="/billing/success" element={<CheckoutSuccessPage />} />
              <Route path="/billing/cancelled" element={<CheckoutCancelledPage />} />
              <Route path="/settings/billing" element={<DashboardLayout />}>
                <Route index element={<BillingSettingsPage />} />
              </Route>

              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="generate" element={<CreateDatasetPage />} />
                <Route path="datasets" element={<MyDatasetsPage />} />
                <Route path="datasets/:id" element={<DatasetDetailPage />} />
                <Route path="templates" element={<TemplatesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="agents" element={<AgentMonitorPage />} />
                <Route path="validation" element={<ValidationReportPage />} />
                <Route path="bias" element={<BiasAnalysisPage />} />
                <Route path="export" element={<ExportPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="billing" element={<BillingSettingsPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
          </TooltipProvider>
        </SubscriptionProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
